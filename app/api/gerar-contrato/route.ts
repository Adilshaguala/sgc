// app/api/gerar-contrato/route.ts
// POST /api/gerar-contrato
// Body: ContractData (JSON)
// Response: PDF binary generated from the Word template

import { NextRequest, NextResponse } from "next/server"
import type { ContractData } from "@/lib/pdf/contract-template"
import { generateContractPdfFromTemplate } from "@/lib/pdf/contract-pdf-from-template"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as ContractData
    const { fileName, pdfBuffer } = await generateContractPdfFromTemplate(data)
    const pdfBlob = new Blob([Uint8Array.from(pdfBuffer)], { type: "application/pdf" })

    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    })
  } catch (err) {
    console.error("PDF generation error:", err)
    const errorMessage =
      err instanceof Error ? err.message : "Falha ao gerar documento PDF"

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
