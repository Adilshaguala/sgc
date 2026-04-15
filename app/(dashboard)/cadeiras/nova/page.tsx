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

export default function NovaCadeiraPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    horas_contacto: "",
    curso: "",
    ano: "",
    semestre: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    router.push("/cadeiras")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova Cadeira"
        description="Adicionar uma nova cadeira ao sistema"
      >
        <Button variant="outline" asChild>
          <Link href="/cadeiras">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informacoes da Cadeira</CardTitle>
            <CardDescription>
              Preencha os dados da cadeira. Campos marcados com * sao obrigatorios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-6 sm:grid-cols-2">
              <Field className="sm:col-span-2">
                <FieldLabel>Nome da Cadeira *</FieldLabel>
                <Input
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  placeholder="Ex: Introducao a Programacao"
                  required
                />
              </Field>

              <Field>
                <FieldLabel>Horas de Contacto *</FieldLabel>
                <Input
                  type="number"
                  value={formData.horas_contacto}
                  onChange={(e) =>
                    setFormData({ ...formData, horas_contacto: e.target.value })
                  }
                  placeholder="Ex: 64"
                  required
                />
                <FieldDescription>
                  Total de horas de contacto da cadeira
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Curso *</FieldLabel>
                <Input
                  value={formData.curso}
                  onChange={(e) =>
                    setFormData({ ...formData, curso: e.target.value })
                  }
                  placeholder="Ex: Licenciatura em Informatica"
                  required
                />
              </Field>

              <Field>
                <FieldLabel>Ano *</FieldLabel>
                <Select
                  value={formData.ano}
                  onValueChange={(value) =>
                    setFormData({ ...formData, ano: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1o Ano</SelectItem>
                    <SelectItem value="2">2o Ano</SelectItem>
                    <SelectItem value="3">3o Ano</SelectItem>
                    <SelectItem value="4">4o Ano</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Semestre *</FieldLabel>
                <Select
                  value={formData.semestre}
                  onValueChange={(value) =>
                    setFormData({ ...formData, semestre: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione o semestre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="I">I Semestre</SelectItem>
                    <SelectItem value="II">II Semestre</SelectItem>
                    <SelectItem value="I e II">I e II Semestres</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <div className="mt-8 flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/cadeiras">Cancelar</Link>
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
