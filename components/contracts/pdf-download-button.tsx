"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { generateContractPdf, type ContractPdfData } from "@/lib/pdf/contract-pdf-generator"
import { Button } from "@/components/ui/button"

interface PdfDownloadButtonProps {
  contractData: ContractPdfData
  variant?: "default" | "outline" | "ghost"
  showPreviewOption?: boolean
}

export function PdfDownloadButton({
  contractData,
  variant = "outline",
}: PdfDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      const { blob, fileName } = await generateContractPdf(contractData)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button variant={variant} onClick={handleDownload} disabled={isGenerating}>
      {isGenerating ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {isGenerating ? "A gerar..." : "Descarregar PDF"}
    </Button>
  )
}

export type { ContractPdfData }
