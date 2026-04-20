"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { Save, Upload, Building2 } from "lucide-react"
import type { Instituicao } from "@/types"

const initialFormData = {
  nome: "",
  endereco: "",
  telefone: "",
  fax: "",
  numero_despacho: "",
}

export default function InstituicaoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadInstituicao() {
      setIsLoading(true)
      try {
        const response = await fetch("/api/instituicao")
        if (!response.ok) {
          throw new Error("Falha ao carregar os dados da instituicao.")
        }
        const data: Instituicao | null = await response.json()
        if (data) {
          setFormData({
            nome: data.nome || "",
            endereco: data.endereco || "",
            telefone: data.telefone || "",
            fax: data.fax || "",
            numero_despacho: data.numero_despacho || "",
          })
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao carregar instituicao.")
      } finally {
        setIsLoading(false)
      }
    }

    loadInstituicao()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/instituicao", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Falha ao guardar instituicao.")
      }

      toast.success("Dados da instituicao actualizados com sucesso.")
      setFormData({
        nome: result.nome || "",
        endereco: result.endereco || "",
        telefone: result.telefone || "",
        fax: result.fax || "",
        numero_despacho: result.numero_despacho || "",
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao guardar instituicao.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Instituicao" description="Configuracoes gerais da instituicao" />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Dados da Instituicao</CardTitle>
                <CardDescription>
                  Informacoes que aparecem nos contratos e documentos oficiais
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-6 sm:grid-cols-2">
              <Field className="sm:col-span-2">
                <FieldLabel>Nome da Instituicao *</FieldLabel>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome completo da instituicao"
                  required
                />
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel>Logo da Instituicao</FieldLabel>
                <div className="flex items-center gap-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Carregar Logo
                    </Button>
                    <p className="mt-2 text-xs text-muted-foreground">
                      PNG ou JPG. Tamanho maximo de 2MB.
                    </p>
                  </div>
                </div>
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel>Endereco</FieldLabel>
                <Textarea
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  placeholder="Endereco completo da instituicao"
                  rows={2}
                />
              </Field>

              <Field>
                <FieldLabel>Telefone</FieldLabel>
                <Input
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="+258 21 000000"
                />
              </Field>

              <Field>
                <FieldLabel>Fax</FieldLabel>
                <Input
                  value={formData.fax}
                  onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                  placeholder="+258 21 000000"
                />
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel>Numero do Despacho</FieldLabel>
                <Input
                  value={formData.numero_despacho}
                  onChange={(e) => setFormData({ ...formData, numero_despacho: e.target.value })}
                  placeholder="Ex: 105/GR/2023"
                />
                <FieldDescription>
                  Numero do despacho que aparece nos contratos para delegacao de competencias
                </FieldDescription>
              </Field>
            </FieldGroup>

            <div className="mt-8 flex justify-end">
              <Button type="submit" disabled={isSubmitting || isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "A guardar..." : "Guardar Alteracoes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
