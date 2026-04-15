"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { PageHeader } from "@/components/shared/page-header"
import { NivelBadge } from "@/components/shared/status-badge"
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
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

// Mock data for docente
const mockDocente = {
  id: "1",
  nome_completo: "Joao Manuel Silva",
  bi_numero: "123456789M",
  nuit: "100234567",
  nivel_academico: "mestre",
  nacionalidade: "mocambicana",
  categoria: "Assistente Universitario",
  email: "joao.silva@upm.ac.mz",
  telefone: "+258 84 123 4567",
  created_at: "2025-06-15",
}

// Mock historical data
const mockHistorico = [
  {
    id: "1",
    cadeira: "Introducao a Programacao",
    curso: "Informatica",
    ano_lectivo: "2025",
    numero_contrato: "PRC/SC/PS/2025/145",
    horas: 64,
  },
  {
    id: "2",
    cadeira: "Estruturas de Dados",
    curso: "Informatica",
    ano_lectivo: "2025",
    numero_contrato: "PRC/SC/PS/2025/145",
    horas: 48,
  },
  {
    id: "3",
    cadeira: "Programacao Web",
    curso: "Informatica",
    ano_lectivo: "2024",
    numero_contrato: "PRC/SC/PS/2024/089",
    horas: 64,
  },
  {
    id: "4",
    cadeira: "Base de Dados",
    curso: "Informatica",
    ano_lectivo: "2024",
    numero_contrato: "PRC/SC/PS/2024/089",
    horas: 48,
  },
]

export default function EditarDocentePage() {
  const router = useRouter()
  const params = useParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nome_completo: mockDocente.nome_completo,
    bi_numero: mockDocente.bi_numero,
    nuit: mockDocente.nuit,
    nivel_academico: mockDocente.nivel_academico,
    nacionalidade: mockDocente.nacionalidade,
    categoria: mockDocente.categoria,
    email: mockDocente.email,
    telefone: mockDocente.telefone,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    router.push("/docentes")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar Docente"
        description={mockDocente.nome_completo}
      >
        <Button variant="outline" asChild>
          <Link href="/docentes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </PageHeader>

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
                        setFormData({ ...formData, nivel_academico: value })
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
                  {mockHistorico.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.cadeira}</TableCell>
                      <TableCell className="text-muted-foreground">{item.curso}</TableCell>
                      <TableCell>{item.ano_lectivo}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.numero_contrato}
                      </TableCell>
                      <TableCell className="text-right">{item.horas}h</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
