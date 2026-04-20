"use client"

import type { ContractData } from "@/lib/pdf/contract-template"

export type ContractPdfData = ContractData

export interface GeneratedContractPdf {
  blob: Blob
  fileName: string
  contentType: string | null
}

function buildFallbackFileName(numeroProcesso?: string): string {
  const normalizedProcessNumber =
    numeroProcesso?.trim().replace(/[\\/:*?"<>|]+/g, "_") || "sem-numero"

  return `Contrato_${normalizedProcessNumber}.pdf`
}

function extractFileNameFromContentDisposition(
  contentDisposition: string | null
): string | null {
  if (!contentDisposition) {
    return null
  }

  const encodedMatch = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)
  if (encodedMatch?.[1]) {
    try {
      return decodeURIComponent(encodedMatch[1]).replace(/^["']|["']$/g, "")
    } catch {
      return encodedMatch[1].replace(/^["']|["']$/g, "")
    }
  }

  const plainMatch = contentDisposition.match(/filename\s*=\s*("?)([^";]+)\1/i)
  return plainMatch?.[2] ?? null
}

export async function generateContractPdf(
  data: ContractPdfData
): Promise<GeneratedContractPdf> {
  const response = await fetch("/api/gerar-contrato", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    let errorMessage = `Falha ao gerar PDF (${response.status})`

    try {
      const errorBody = (await response.json()) as { error?: string }
      if (errorBody.error) {
        errorMessage = errorBody.error
      }
    } catch {
      // Ignore invalid error payloads and keep fallback message.
    }

    throw new Error(errorMessage)
  }

  const suggestedFileName =
    extractFileNameFromContentDisposition(response.headers.get("Content-Disposition")) ||
    buildFallbackFileName(data.numeroProcesso)
  const fileName = suggestedFileName.toLowerCase().endsWith(".pdf")
    ? suggestedFileName
    : buildFallbackFileName(data.numeroProcesso)

  return {
    blob: await response.blob(),
    fileName,
    contentType: response.headers.get("Content-Type"),
  }
}
