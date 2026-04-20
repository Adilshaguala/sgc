import { spawn } from "node:child_process"
import { promises as fs, readFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import Docxtemplater from "docxtemplater"
import PizZip from "pizzip"
import type { ContractData } from "@/lib/pdf/contract-template"

const DOCUMENT_XML_PATH = "word/document.xml"
const TEMPLATE_PATH = path.join(process.cwd(), "lib", "pdf", "docxtemplate.docx")
const POWERSHELL_PATH = path.join(
  process.env.SystemRoot ?? "C:\\Windows",
  "System32",
  "WindowsPowerShell",
  "v1.0",
  "powershell.exe"
)

const WORD_EXPORT_SCRIPT = String.raw`
param(
  [Parameter(Mandatory = $true)][string]$DocxPath,
  [Parameter(Mandatory = $true)][string]$PdfPath
)

$ErrorActionPreference = "Stop"
$word = $null
$document = $null
$wdExportFormatPDF = 17

try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $document = $word.Documents.Open($DocxPath)
  $document.ExportAsFixedFormat($PdfPath, $wdExportFormatPDF)
}
finally {
  if ($document -ne $null) {
    $document.Close(0) | Out-Null
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($document) | Out-Null
  }

  if ($word -ne $null) {
    $word.Quit() | Out-Null
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
  }

  [System.GC]::Collect()
  [System.GC]::WaitForPendingFinalizers()
}

if (-not (Test-Path -LiteralPath $PdfPath)) {
  throw "Microsoft Word não gerou o ficheiro PDF."
}
`

export function buildContractPdfFileName(numeroProcesso?: string): string {
  const normalizedProcessNumber =
    numeroProcesso?.trim().replace(/[\\/:*?"<>|]+/g, "_") || "sem-numero"

  return `Contrato_${normalizedProcessNumber}.pdf`
}

function normalizeTemplateValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeTemplateValue)
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [key, normalizeTemplateValue(entryValue)])
    )
  }

  return value ?? ""
}

function patchTemplateXml(templateXml: string): string {
  // The template closes the module loop with {/modulo}; docxtemplater expects {/modulos}.
  return templateXml.replaceAll("{/modulo}", "{/modulos}")
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;")
}

function getCellText(cellXml: string): string {
  return Array.from(cellXml.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g))
    .map((match) => match[1])
    .join("")
    .replace(/\s+/g, " ")
    .trim()
}

function addVerticalMerge(cellXml: string, type: "restart" | "continue"): string {
  const mergeTag =
    type === "restart" ? '<w:vMerge w:val="restart"/>' : "<w:vMerge/>"

  if (cellXml.includes("<w:vMerge")) {
    return cellXml.replace(/<w:vMerge(?:\s+w:val="[^"]*")?\s*\/>/, mergeTag)
  }

  if (cellXml.includes("<w:tcPr>")) {
    return cellXml.replace("<w:tcPr>", `<w:tcPr>${mergeTag}`)
  }

  return cellXml.replace(/<w:tc\b([^>]*)>/, `<w:tc$1><w:tcPr>${mergeTag}</w:tcPr>`)
}

function cleanupRenderedDocumentXml(
  documentXml: string,
  modulos: ContractData["modulos"]
): string {
  let moduloIndex = 0

  return documentXml.replace(/<w:tr\b(?=[\s\S]*?<\/w:tr>)([\s\S]*?)<\/w:tr>/g, (fullRow) => {
    const cellCount = (fullRow.match(/<w:tc\b/g) ?? []).length
    if (cellCount < 6) {
      return fullRow
    }

    const textValues = Array.from(fullRow.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g))
      .map((match) => match[1])
      .join("")
      .replace(/\s+/g, "")

    if (textValues.length === 0) {
      return ""
    }

    const firstCellMatch = fullRow.match(/<w:tc\b[\s\S]*?<\/w:tc>/)
    if (!firstCellMatch) {
      return fullRow
    }

    const firstCell = firstCellMatch[0]
    const firstCellText = Array.from(firstCell.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g))
      .map((match) => match[1])
      .join("")
      .replace(/\s+/g, "")

    if (firstCellText.length > 0 || moduloIndex >= modulos.length) {
      return fullRow
    }

    const moduleName = escapeXml(modulos[moduloIndex]?.nome ?? "")
    moduloIndex += 1

    const patchedFirstCell = firstCell.match(
      /(<w:p\b[\s\S]*?<w:pPr>[\s\S]*?<\/w:pPr>)(<\/w:p>)/
    )
      ? firstCell.replace(
          /(<w:p\b[\s\S]*?<w:pPr>[\s\S]*?<\/w:pPr>)(<\/w:p>)/,
          `$1<w:r><w:t>${moduleName}</w:t></w:r>$2`
        )
      : firstCell.replace(
          /(<w:p\b[^>]*>)([\s\S]*?)(<\/w:p>)/,
          `$1$2<w:r><w:t>${moduleName}</w:t></w:r>$3`
        )

    return fullRow.replace(firstCell, patchedFirstCell)
  })
}

function applyVerticalMerges(documentXml: string): string {
  const rows = Array.from(documentXml.matchAll(/<w:tr\b[\s\S]*?<\/w:tr>/g)).map(
    (match) => match[0]
  )

  const parsedRows = rows.map((rowXml) => {
    const cells = Array.from(rowXml.matchAll(/<w:tc\b[\s\S]*?<\/w:tc>/g)).map(
      (match) => match[0]
    )

    return {
      originalRowXml: rowXml,
      rowXml,
      cells,
      texts: cells.map(getCellText),
    }
  })

  const dataRowIndexes = parsedRows
    .map((row, index) => ({ row, index }))
    .filter(
      ({ row }) =>
        row.cells.length === 6 &&
        row.texts[0] &&
        row.texts[0] !== "Modulo" &&
        row.texts[0] !== "Módulo"
    )
    .map(({ index }) => index)

  const mergeColumnIndexes = [2, 5]

  for (const columnIndex of mergeColumnIndexes) {
    let groupStart: number | null = null
    let groupValue = ""

    for (let i = 0; i <= dataRowIndexes.length; i += 1) {
      const rowIndex = dataRowIndexes[i]
      const currentValue =
        rowIndex === undefined ? "" : parsedRows[rowIndex].texts[columnIndex]

      if (currentValue && currentValue === groupValue) {
        continue
      }

      if (groupStart !== null && i - groupStart > 1) {
        for (let j = groupStart; j < i; j += 1) {
          const groupedRowIndex = dataRowIndexes[j]
          const groupedRow = parsedRows[groupedRowIndex]
          const originalCell = groupedRow.cells[columnIndex]
          const mergedCell = addVerticalMerge(
            originalCell,
            j === groupStart ? "restart" : "continue"
          )

          groupedRow.cells[columnIndex] = mergedCell
          groupedRow.rowXml = groupedRow.rowXml.replace(originalCell, mergedCell)
        }
      }

      groupStart = currentValue ? i : null
      groupValue = currentValue
    }
  }

  let mergedXml = documentXml
  for (const row of parsedRows) {
    if (row.rowXml !== row.originalRowXml) {
      mergedXml = mergedXml.replace(row.originalRowXml, row.rowXml)
    }
  }

  return mergedXml
}

function createRenderedDocxBuffer(data: ContractData): Buffer {
  const templateBinary = requireDocxTemplateBinary()
  const zip = new PizZip(templateBinary)
  const templateDocumentXml = zip.file(DOCUMENT_XML_PATH)?.asText()

  if (!templateDocumentXml) {
    throw new Error("Não foi possível ler word/document.xml do template DOCX.")
  }

  zip.file(DOCUMENT_XML_PATH, patchTemplateXml(templateDocumentXml))

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => "",
  })

  doc.render(normalizeTemplateValue(data))

  const renderedDocumentXml = doc.getZip().file(DOCUMENT_XML_PATH)?.asText()
  if (!renderedDocumentXml) {
    throw new Error("Não foi possível ler o XML do documento após preencher o template.")
  }

  const cleanedDocumentXml = applyVerticalMerges(
    cleanupRenderedDocumentXml(renderedDocumentXml, data.modulos)
  )

  doc.getZip().file(DOCUMENT_XML_PATH, cleanedDocumentXml)

  return doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  })
}

function requireDocxTemplateBinary(): string {
  const templateBuffer = readFileSync(TEMPLATE_PATH)
  return templateBuffer.toString("binary")
}

async function runPowerShellScript(
  scriptPath: string,
  docxPath: string,
  pdfPath: string
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      POWERSHELL_PATH,
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        scriptPath,
        docxPath,
        pdfPath,
      ],
      {
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      }
    )

    let stdout = ""
    let stderr = ""

    const timeout = setTimeout(() => {
      child.kill()
      reject(new Error("A exportação do DOCX para PDF expirou."))
    }, 90_000)

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString()
    })

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString()
    })

    child.on("error", (error) => {
      clearTimeout(timeout)
      reject(error)
    })

    child.on("close", (code) => {
      clearTimeout(timeout)

      if (code === 0) {
        resolve()
        return
      }

      const details = [stderr.trim(), stdout.trim()].filter(Boolean).join("\n")
      reject(
        new Error(
          details || `Falha ao converter DOCX para PDF com Microsoft Word (código ${code}).`
        )
      )
    })
  })
}

async function convertDocxBufferToPdf(docxBuffer: Buffer): Promise<Buffer> {
  if (process.platform !== "win32") {
    throw new Error("A conversão DOCX para PDF requer Windows com Microsoft Word instalado.")
  }

  const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "contract-pdf-"))
  const docxPath = path.join(tempDirectory, "contrato-renderizado.docx")
  const pdfPath = path.join(tempDirectory, "contrato-renderizado.pdf")
  const scriptPath = path.join(tempDirectory, "export-word-to-pdf.ps1")

  try {
    await fs.writeFile(docxPath, docxBuffer)
    await fs.writeFile(scriptPath, WORD_EXPORT_SCRIPT, "utf8")
    await runPowerShellScript(scriptPath, docxPath, pdfPath)

    return await fs.readFile(pdfPath)
  } finally {
    await fs.rm(tempDirectory, { recursive: true, force: true })
  }
}

export async function generateContractPdfFromTemplate(data: ContractData): Promise<{
  fileName: string
  pdfBuffer: Buffer
}> {
  const docxBuffer = createRenderedDocxBuffer(data)
  const pdfBuffer = await convertDocxBufferToPdf(docxBuffer)

  return {
    fileName: buildContractPdfFileName(data.numeroProcesso),
    pdfBuffer,
  }
}
