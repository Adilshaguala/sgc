"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NovoDocentePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nome_completo: "",
    bi_numero: "",
    nuit: "",
    nivel_academico: "",
    nacionalidade: "mocambicana",
    categoria: "",
    email: "",
    telefone: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/docentes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Falha ao guardar docente.")
      }

      toast.success("Docente guardado com sucesso.")
      router.push("/docentes")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao guardar docente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Docente"
        description="Adicionar um novo docente ao sistema"
      >
        <Button variant="outline" asChild>
          <Link href="/docentes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informacoes do Docente</CardTitle>
            <CardDescription>
              Preencha os dados do docente. Campos marcados com * sao obrigatorios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-6 sm:grid-cols-2">
              <Field className="sm:col-span-2">
                <FieldLabel>Nome Completo *</FieldLabel>
                <Input
                  value={formData.nome_completo}
                  onChange={(e) =>
                    setFormData({ ...formData, nome_completo: e.target.value })
                  }
                  placeholder="Nome completo do docente"
                  required
                />
              </Field>

              <Field>
                <FieldLabel>Numero do BI</FieldLabel>
                <Input
                  value={formData.bi_numero}
                  onChange={(e) =>
                    setFormData({ ...formData, bi_numero: e.target.value })
                  }
                  placeholder="Ex: 123456789M"
                />
                <FieldDescription>
                  Bilhete de Identidade do docente
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>NUIT</FieldLabel>
                <Input
                  value={formData.nuit}
                  onChange={(e) =>
                    setFormData({ ...formData, nuit: e.target.value })
                  }
                  placeholder="Ex: 100234567"
                />
                <FieldDescription>
                  Numero Unico de Identificacao Tributaria
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Nivel Academico *</FieldLabel>
                <Select
                  value={formData.nivel_academico}
                  onValueChange={(value) =>
                    setFormData({ ...formData, nivel_academico: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione o nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="licenciado">Licenciado</SelectItem>
                    <SelectItem value="mestre">Mestre</SelectItem>
                    <SelectItem value="doutorado">Doutorado</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Nacionalidade</FieldLabel>
                <Input
                  value={formData.nacionalidade}
                  onChange={(e) =>
                    setFormData({ ...formData, nacionalidade: e.target.value })
                  }
                  placeholder="Ex: mocambicana"
                />
              </Field>

              <Field>
                <FieldLabel>Categoria</FieldLabel>
                <Input
                  value={formData.categoria}
                  onChange={(e) =>
                    setFormData({ ...formData, categoria: e.target.value })
                  }
                  placeholder="Ex: Assistente Universitario"
                />
                <FieldDescription>
                  Categoria profissional do docente
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="docente@upm.ac.mz"
                />
              </Field>

              <Field>
                <FieldLabel>Telefone</FieldLabel>
                <Input
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: e.target.value })
                  }
                  placeholder="+258 84 000 0000"
                />
              </Field>
            </FieldGroup>

            <div className="mt-8 flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/docentes">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "A guardar..." : "Guardar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
