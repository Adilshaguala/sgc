"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge, NivelBadge } from "@/components/shared/status-badge"
import { MoneyDisplay, formatMoney } from "@/components/shared/money-display"
import { Button } from "@/components/ui/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { ArrowLeft, Download, ArrowRight, Pencil, FileText, User, BookOpen, Calculator } from "lucide-react"
import Link from "next/link"
import type { EstadoContrato } from "@/types"

// Mock data
const mockContrato = {
  id: "1",
  numero_processo: "PRC/SC/PS/2026/298",
  docente: {
    id: "1",
    nome_completo: "Joao Manuel Silva",
    bi_numero: "123456789M",
    nuit: "100234567",
    nivel_academico: "mestre" as const,
    nacionalidade: "mocambicana",
    categoria: "Assistente Universitario",
    email: "joao.silva@upm.ac.mz",
    telefone: "+258 84 123 4567",
  },
  assinante: {
    id: "1",
    nome_completo: "Ana Maria Santos",
    titulo: "Profa. Doutora",
    cargo: "Vice-Reitora de Administracao e Recursos",
  },
  departamento: {
    id: "1",
    nome: "Centro de Educacao Aberta e a Distancia",
    sigla: "CEAD",
  },
  ano_lectivo: "2026",
  data_contrato: "2026-01-15",
  total_horas: 112,
  valor_hora_mt: 1100,
  valor_total_bruto: 123200,
  estado: "gerado" as EstadoContrato,
  cadeiras: [
    {
      id: "1",
      cadeira: {
        nome: "Introducao a Programacao",
        horas_contacto: 64,
        curso: "Licenciatura em Informatica",
        ano: 1,
        semestre: "I",
      },
      centro_recursos: { nome: "UP-Beira" },
      horas_override: null,
    },
    {
      id: "2",
      cadeira: {
        nome: "Estruturas de Dados",
        horas_contacto: 48,
        curso: "Licenciatura em Informatica",
        ano: 2,
        semestre: "I",
      },
      centro_recursos: { nome: "UP-Beira" },
      horas_override: null,
    },
  ],
}

const estadoTransicoes: Record<EstadoContrato, EstadoContrato | null> = {
  rascunho: "gerado",
  gerado: "assinado",
  assinado: "visado",
  visado: "arquivado",
  arquivado: null,
}

export default function ContratoDetalhePage() {
  const [changeStateOpen, setChangeStateOpen] = useState(false)
  const [vistoData, setVistoData] = useState({
    data_visto: "",
    numero_visto: "",
  })

  const contrato = mockContrato
  const proximoEstado = estadoTransicoes[contrato.estado]
  const bonusConectividade = contrato.valor_total_bruto * 0.25

  const handleChangeState = () => {
    // Handle state change
    setChangeStateOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Contrato ${contrato.numero_processo}`}
        description={`Contrato de tutoria - ${contrato.docente.nome_completo}`}
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/contratos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          {contrato.estado === "rascunho" && (
            <Button variant="outline" asChild>
              <Link href={`/contratos/${contrato.id}/editar`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
          )}
          {contrato.estado !== "rascunho" && (
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Gerar PDF
            </Button>
          )}
          {proximoEstado && (
            <Dialog open={changeStateOpen} onOpenChange={setChangeStateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Mudar Estado
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mudar Estado do Contrato</DialogTitle>
                  <DialogDescription>
                    O contrato passara de {contrato.estado} para {proximoEstado}
                  </DialogDescription>
                </DialogHeader>
                {proximoEstado === "visado" && (
                  <FieldGroup className="space-y-4">
                    <Field>
                      <FieldLabel>Data do Visto *</FieldLabel>
                      <Input
                        type="date"
                        value={vistoData.data_visto}
                        onChange={(e) =>
                          setVistoData({ ...vistoData, data_visto: e.target.value })
                        }
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Numero do Visto (TA) *</FieldLabel>
                      <Input
                        value={vistoData.numero_visto}
                        onChange={(e) =>
                          setVistoData({ ...vistoData, numero_visto: e.target.value })
                        }
                        placeholder="Ex: 12345/2026"
                        required
                      />
                    </Field>
                  </FieldGroup>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setChangeStateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleChangeState}>Confirmar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Contract Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Dados do Contrato</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <span className="text-sm text-muted-foreground">N Processo</span>
                  <p className="font-medium">{contrato.numero_processo}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Ano Lectivo</span>
                  <p className="font-medium">{contrato.ano_lectivo}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Data do Contrato</span>
                  <p className="font-medium">
                    {new Date(contrato.data_contrato).toLocaleDateString("pt-MZ")}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Departamento</span>
                  <p className="font-medium">{contrato.departamento.sigla}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Assinante</span>
                  <p className="font-medium">{contrato.assinante.titulo} {contrato.assinante.nome_completo}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <div className="mt-1">
                    <StatusBadge estado={contrato.estado} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Docente Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Docente</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <span className="text-sm text-muted-foreground">Nome Completo</span>
                  <p className="font-medium">{contrato.docente.nome_completo}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Nivel Academico</span>
                  <div className="mt-1">
                    <NivelBadge nivel={contrato.docente.nivel_academico} />
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">BI</span>
                  <p className="font-medium">{contrato.docente.bi_numero}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">NUIT</span>
                  <p className="font-medium">{contrato.docente.nuit}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Nacionalidade</span>
                  <p className="font-medium capitalize">{contrato.docente.nacionalidade}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Categoria</span>
                  <p className="font-medium">{contrato.docente.categoria}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Email</span>
                  <p className="font-medium">{contrato.docente.email}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Telefone</span>
                  <p className="font-medium">{contrato.docente.telefone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cadeiras */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Cadeiras ({contrato.cadeiras.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Modulo</TableHead>
                    <TableHead className="text-right">Horas</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead>Semestre</TableHead>
                    <TableHead>Centro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contrato.cadeiras.map((cc) => (
                    <TableRow key={cc.id}>
                      <TableCell className="font-medium">{cc.cadeira.nome}</TableCell>
                      <TableCell className="text-right">
                        {cc.horas_override || cc.cadeira.horas_contacto}h
                      </TableCell>
                      <TableCell className="text-muted-foreground">{cc.cadeira.curso}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{cc.cadeira.ano}o</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{cc.cadeira.semestre}</Badge>
                      </TableCell>
                      <TableCell>{cc.centro_recursos.nome}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Resumo Financeiro</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total de Horas</span>
                <span className="font-medium">{contrato.total_horas}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor/Hora</span>
                <MoneyDisplay value={contrato.valor_hora_mt} />
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor Bruto</span>
                <MoneyDisplay value={contrato.valor_total_bruto} className="font-medium" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bonus Conectividade (25%)</span>
                <MoneyDisplay value={bonusConectividade} />
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <MoneyDisplay
                  value={contrato.valor_total_bruto + bonusConectividade}
                  className="text-lg font-bold text-primary"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
