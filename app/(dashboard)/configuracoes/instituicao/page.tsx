"use client"

import { useState } from "react"
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

export default function InstituicaoPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nome: "Universidade Pedagogica de Maputo",
    endereco: "Av. do Trabalho, Parcela 14/103, Lhanguene, Maputo",
    telefone: "+258 21 401078/82",
    fax: "+258 21 401082",
    numero_despacho: "105/GR/2023",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instituicao"
        description="Configuracoes gerais da instituicao"
      />

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
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, endereco: e.target.value })
                  }
                  placeholder="Endereco completo da instituicao"
                  rows={2}
                />
              </Field>

              <Field>
                <FieldLabel>Telefone</FieldLabel>
                <Input
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: e.target.value })
                  }
                  placeholder="+258 21 000000"
                />
              </Field>

              <Field>
                <FieldLabel>Fax</FieldLabel>
                <Input
                  value={formData.fax}
                  onChange={(e) =>
                    setFormData({ ...formData, fax: e.target.value })
                  }
                  placeholder="+258 21 000000"
                />
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel>Numero do Despacho</FieldLabel>
                <Input
                  value={formData.numero_despacho}
                  onChange={(e) =>
                    setFormData({ ...formData, numero_despacho: e.target.value })
                  }
                  placeholder="Ex: 105/GR/2023"
                />
                <FieldDescription>
                  Numero do despacho que aparece nos contratos para delegacao de competencias
                </FieldDescription>
              </Field>
            </FieldGroup>

            <div className="mt-8 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
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
