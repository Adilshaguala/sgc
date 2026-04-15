"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { Plus, Pencil, Eye, FileSignature } from "lucide-react"

interface Clausula {
  id: string
  numero: number
  titulo: string
  conteudo: string
  activa: boolean
  versao: number
}

const mockClausulas: Clausula[] = [
  {
    id: "1",
    numero: 1,
    titulo: "Objecto do Contrato",
    conteudo: "O presente contrato tem por objecto a prestacao de servicos de tutoria de especialidade pelo CONTRATADO nos modulos constantes da tabela abaixo, num total de {{total_horas}} horas de contacto.",
    activa: true,
    versao: 3,
  },
  {
    id: "2",
    numero: 2,
    titulo: "Duracao",
    conteudo: "O presente contrato tem a duracao de um ano lectivo ({{ano_lectivo}}), contando a partir da data da sua assinatura.",
    activa: true,
    versao: 1,
  },
  {
    id: "3",
    numero: 3,
    titulo: "Remuneracao",
    conteudo: "O CONTRATADO tera direito a uma remuneracao de {{valor_hora}} MT por hora de contacto, totalizando {{valor_total_bruto}} MT brutos, acrescido de bonus de conectividade de 25% ({{bonus_conectividade}} MT).",
    activa: true,
    versao: 2,
  },
  {
    id: "4",
    numero: 4,
    titulo: "Obrigacoes do Contratado",
    conteudo: "O CONTRATADO obriga-se a:\na) Cumprir o programa da disciplina;\nb) Apresentar relatorios de actividades;\nc) Participar nas sessoes presenciais agendadas;\nd) Responder as duvidas dos estudantes em tempo util.",
    activa: true,
    versao: 1,
  },
  {
    id: "5",
    numero: 5,
    titulo: "Deslocacoes",
    conteudo: "Nas deslocacoes para sessoes presenciais fora do campus principal, o CONTRATADO tera direito a abono de {{abono_dia}} MT por dia sem pernoita ou {{abono_pernoita}} MT por dia com pernoita.",
    activa: true,
    versao: 1,
  },
]

const placeholders = [
  { key: "{{nome_docente}}", desc: "Nome completo do docente" },
  { key: "{{titulo_assinante}}", desc: "Titulo do assinante" },
  { key: "{{nome_assinante}}", desc: "Nome do assinante" },
  { key: "{{cargo_assinante}}", desc: "Cargo do assinante" },
  { key: "{{numero_despacho}}", desc: "Numero do despacho" },
  { key: "{{bi_numero}}", desc: "BI do docente" },
  { key: "{{nuit}}", desc: "NUIT do docente" },
  { key: "{{nacionalidade}}", desc: "Nacionalidade do docente" },
  { key: "{{total_horas}}", desc: "Total de horas" },
  { key: "{{valor_hora}}", desc: "Valor por hora" },
  { key: "{{valor_total_bruto}}", desc: "Valor total bruto" },
  { key: "{{bonus_conectividade}}", desc: "Bonus de conectividade" },
  { key: "{{ano_lectivo}}", desc: "Ano lectivo" },
  { key: "{{data_contrato_extenso}}", desc: "Data do contrato" },
  { key: "{{abono_dia}}", desc: "Abono diario" },
  { key: "{{abono_pernoita}}", desc: "Abono com pernoita" },
  { key: "{{nivel_academico}}", desc: "Nivel academico" },
]

export default function ClausulasPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingClausula, setEditingClausula] = useState<Clausula | null>(null)
  const [formData, setFormData] = useState({
    numero: "",
    titulo: "",
    conteudo: "",
    activa: true,
  })

  const handleEdit = (clausula: Clausula) => {
    setEditingClausula(clausula)
    setFormData({
      numero: clausula.numero.toString(),
      titulo: clausula.titulo,
      conteudo: clausula.conteudo,
      activa: clausula.activa,
    })
    setDialogOpen(true)
  }

  const handleNew = () => {
    setEditingClausula(null)
    setFormData({
      numero: (mockClausulas.length + 1).toString(),
      titulo: "",
      conteudo: "",
      activa: true,
    })
    setDialogOpen(true)
  }

  const insertPlaceholder = (placeholder: string) => {
    setFormData({
      ...formData,
      conteudo: formData.conteudo + placeholder,
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clausulas"
        description="Gestao das clausulas dos contratos"
      >
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Clausula
        </Button>
      </PageHeader>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {editingClausula ? "Editar Clausula" : "Nova Clausula"}
            </DialogTitle>
            <DialogDescription>
              Configure o conteudo da clausula. Use os placeholders para dados dinamicos.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Numero *</FieldLabel>
                  <Input
                    type="number"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    placeholder="1"
                  />
                </Field>
                <Field>
                  <FieldLabel>Titulo *</FieldLabel>
                  <Input
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Objecto do Contrato"
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel>Conteudo *</FieldLabel>
                <Textarea
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                  placeholder="Texto da clausula..."
                  rows={10}
                  className="font-mono text-sm"
                />
                <FieldDescription>
                  Clique nos placeholders a direita para os inserir no texto
                </FieldDescription>
              </Field>
              <Field>
                <div className="flex items-center justify-between">
                  <div>
                    <FieldLabel>Activa</FieldLabel>
                    <FieldDescription>
                      Clausulas inactivas nao aparecem nos contratos
                    </FieldDescription>
                  </div>
                  <Switch
                    checked={formData.activa}
                    onCheckedChange={(checked) => setFormData({ ...formData, activa: checked })}
                  />
                </div>
              </Field>
            </div>
            <div>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Placeholders</CardTitle>
                  <CardDescription className="text-xs">
                    Clique para inserir
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[400px] overflow-y-auto">
                  <div className="space-y-1">
                    {placeholders.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => insertPlaceholder(p.key)}
                        className="w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted transition-colors"
                      >
                        <code className="font-mono text-primary">{p.key}</code>
                        <p className="text-muted-foreground mt-0.5">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Pre-visualizar
            </Button>
            <Button onClick={() => setDialogOpen(false)}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">N</TableHead>
                <TableHead>Titulo</TableHead>
                <TableHead className="max-w-md">Conteudo</TableHead>
                <TableHead>Versao</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockClausulas.map((clausula) => (
                <TableRow key={clausula.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {clausula.numero}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{clausula.titulo}</TableCell>
                  <TableCell className="text-muted-foreground max-w-md truncate">
                    {clausula.conteudo}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">v{clausula.versao}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={clausula.activa ? "default" : "secondary"}>
                      {clausula.activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(clausula)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
