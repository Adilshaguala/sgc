"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import type { Docente, DocenteHistoricoItem, NivelAcademico } from "@/types"
import { toast } from "sonner"

type DocenteFormState = {
  nome_completo: string
  bi_numero: string
  nuit: string
  nivel_academico: NivelAcademico
  nacionalidade: string
  categoria: string
  email: string
  telefone: string
}

function buildFormData(docente: Docente): DocenteFormState {
  return {
    nome_completo: docente.nome_completo,
    bi_numero: docente.bi_numero || "",
    nuit: docente.nuit || "",
    nivel_academico: docente.nivel_academico,
    nacionalidade: docente.nacionalidade,
    categoria: docente.categoria || "",
    email: docente.email || "",
    telefone: docente.telefone || "",
  }
}

export default function EditarDocentePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [docente, setDocente] = useState<Docente | null>(null)
  const [historico, setHistorico] = useState<DocenteHistoricoItem[]>([])
  const [formData, setFormData] = useState<DocenteFormState | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadDocente() {
      try {
        const response = await fetch(`/api/docentes/${params.id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Falha ao carregar docente.")
        }

        if (isMounted) {
          setDocente(data.docente)
          setHistorico(data.historico)
          setFormData(buildFormData(data.docente))
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Falha ao carregar docente.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadDocente()

    return () => {
      isMounted = false
    }
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/docentes/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Falha ao actualizar docente.")
      }

      setDocente(data)
      setFormData(buildFormData(data))
      toast.success("Docente actualizado com sucesso.")
      router.refresh()
    } catch (submitError) {
      toast.error(submitError instanceof Error ? submitError.message : "Falha ao actualizar docente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar Docente"
        description={docente?.nome_completo || "Carregando docente"}
      >
        <Button variant="outline" asChild>
          <Link href="/docentes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </PageHeader>

      {error && (
        <Card className="border-destructive/30">
          <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {isLoading || !formData ? (
        <Card>
          <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
            <Spinner className="mr-2" />
            A carregar docente...
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="dados" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dados">Dados do Docente</TabsTrigger>
            <TabsTrigger value="historico">Historico de Cadeiras</TabsTrigger>
          </TabsList>

          <TabsContent value="dados">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Informacoes do Docente</CardTitle>
                  <CardDescription>
                    Actualize os dados do docente. Campos marcados com * sao obrigatorios.
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
                    </Field>

                    <Field>
                      <FieldLabel>Nivel Academico *</FieldLabel>
                      <Select
                        value={formData.nivel_academico}
                        onValueChange={(value) =>
                          setFormData({ ...formData, nivel_academico: value as NivelAcademico })
                        }
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
                      <FieldDescription>Categoria profissional do docente</FieldDescription>
                    </Field>

                    <Field>
                      <FieldLabel>Email</FieldLabel>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Telefone</FieldLabel>
                      <Input
                        value={formData.telefone}
                        onChange={(e) =>
                          setFormData({ ...formData, telefone: e.target.value })
                        }
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
          </TabsContent>

          <TabsContent value="historico">
            <Card>
              <CardHeader>
                <CardTitle>Historico de Cadeiras</CardTitle>
                <CardDescription>
                  Cadeiras leccionadas pelo docente em contratos anteriores
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cadeira</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Ano Lectivo</TableHead>
                      <TableHead>N Contrato</TableHead>
                      <TableHead className="text-right">Horas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historico.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          Ainda nao existem cadeiras associadas a este docente
                        </TableCell>
                      </TableRow>
                    ) : (
                      historico.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.cadeira}</TableCell>
                          <TableCell className="text-muted-foreground">{item.curso}</TableCell>
                          <TableCell>{item.ano_lectivo}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.numero_contrato}
                          </TableCell>
                          <TableCell className="text-right">{item.horas}h</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
