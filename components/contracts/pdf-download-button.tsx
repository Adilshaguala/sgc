"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2, FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { generateContractPdf, type ContractPdfData } from "@/lib/pdf/contract-pdf-generator"

interface PdfDownloadButtonProps {
  contractData: ContractPdfData
  variant?: "default" | "outline" | "ghost"
  showPreviewOption?: boolean
}

export function PdfDownloadButton({
  contractData,
  variant = "outline",
  showPreviewOption = true,
}: PdfDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      const blob = await generateContractPdf(contractData)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `Contrato_${contractData.numeroProcesso.replace(/\//g, "_")}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("[v0] Error generating PDF:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePreview = async () => {
    setIsGenerating(true)
    try {
      const blob = await generateContractPdf(contractData)
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      setPreviewOpen(true)
    } catch (error) {
      console.error("[v0] Error generating PDF preview:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const closePreview = () => {
    setPreviewOpen(false)
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl)
      setPdfUrl(null)
    }
  }

  if (!showPreviewOption) {
    return (
      <Button variant={variant} onClick={handleDownload} disabled={isGenerating}>
        {isGenerating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        {isGenerating ? "A gerar..." : "Gerar PDF"}
      </Button>
    )
  }

  return (
    <Dialog open={previewOpen} onOpenChange={(open) => !open && closePreview()}>
      <div className="flex gap-2">
        <Button variant={variant} onClick={handleDownload} disabled={isGenerating}>
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isGenerating ? "A gerar..." : "Descarregar PDF"}
        </Button>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={handlePreview} disabled={isGenerating}>
            <FileText className="mr-2 h-4 w-4" />
            Pre-visualizar
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>Pre-visualizacao do Contrato</DialogTitle>
          <DialogDescription>
            {contractData.numeroProcesso} - {contractData.docenteNome}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 h-full">
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              className="w-full h-[calc(90vh-100px)] rounded-md border"
              title="PDF Preview"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export type { ContractPdfData }
