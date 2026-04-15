"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge, NivelBadge } from "@/components/shared/status-badge"
import { MoneyDisplay } from "@/components/shared/money-display"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, MoreHorizontal, Eye, Pencil, Download, ArrowRight } from "lucide-react"
import type { Contrato, EstadoContrato } from "@/types"
import Link from "next/link"

// Mock data
const mockContratos: Partial<Contrato>[] = [
  {
    id: "1",
    numero_processo: "PRC/SC/PS/2026/298",
    docente: { id: "1", nome_completo: "Joao Manuel Silva", nivel_academico: "mestre", nacionalidade: "mocambicana", created_at: "" },
    ano_lectivo: "2026",
    total_horas: 112,
    valor_total_bruto: 123200,
    estado: "visado",
    data_contrato: "2026-01-15",
  },
  {
    id: "2",
    numero_processo: "PRC/SC/PS/2026/299",
    docente: { id: "2", nome_completo: "Maria Helena Costa", nivel_academico: "doutorado", nacionalidade: "mocambicana", created_at: "" },
    ano_lectivo: "2026",
    total_horas: 96,
    valor_total_bruto: 134400,
    estado: "assinado",
    data_contrato: "2026-01-14",
  },
  {
    id: "3",
    numero_processo: "PRC/SC/PS/2026/300",
    docente: { id: "3", nome_completo: "Pedro Antonio Nunes", nivel_academico: "licenciado", nacionalidade: "mocambicana", created_at: "" },
    ano_lectivo: "2026",
    total_horas: 64,
    valor_total_bruto: 57600,
    estado: "gerado",
    data_contrato: "2026-01-13",
  },
  {
    id: "4",
    numero_processo: "PRC/SC/PS/2026/301",
    docente: { id: "4", nome_completo: "Ana Cristina Fernandes", nivel_academico: "mestre", nacionalidade: "mocambicana", created_at: "" },
    ano_lectivo: "2026",
    total_horas: 80,
    valor_total_bruto: 88000,
    estado: "rascunho",
    data_contrato: "2026-01-12",
  },
  {
    id: "5",
    numero_processo: "PRC/SC/PS/2026/302",
    docente: { id: "5", nome_completo: "Carlos Eduardo Reis", nivel_academico: "doutorado", nacionalidade: "mocambicana", created_at: "" },
    ano_lectivo: "2026",
    total_horas: 128,
    valor_total_bruto: 179200,
    estado: "visado",
    data_contrato: "2026-01-11",
  },
  {
    id: "6",
    numero_processo: "PRC/SC/PS/2025/245",
    docente: { id: "6", nome_completo: "Fatima Isabel Machado", nivel_academico: "mestre", nacionalidade: "mocambicana", created_at: "" },
    ano_lectivo: "2025",
    total_horas: 96,
    valor_total_bruto: 105600,
    estado: "arquivado",
    data_contrato: "2025-12-20",
  },
]

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-MZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export default function ContratosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("all")
  const [anoFilter, setAnoFilter] = useState<string>("all")

  const filteredContratos = mockContratos.filter((contrato) => {
    const matchesSearch =
      contrato.docente?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.numero_processo?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = estadoFilter === "all" || contrato.estado === estadoFilter
    const matchesAno = anoFilter === "all" || contrato.ano_lectivo === anoFilter
    return matchesSearch && matchesEstado && matchesAno
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contratos"
        description="Gestao de contratos de tutoria"
      >
        <Button asChild>
          <Link href="/contratos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Contrato
          </Link>
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por docente ou processo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os estados</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="gerado">Gerado</SelectItem>
                <SelectItem value="assinado">Assinado</SelectItem>
                <SelectItem value="visado">Visado</SelectItem>
                <SelectItem value="arquivado">Arquivado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={anoFilter} onValueChange={setAnoFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Ano Lectivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os anos</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N Processo</TableHead>
                <TableHead>Docente</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Ano Lectivo</TableHead>
                <TableHead className="text-right">Horas</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContratos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    Nenhum contrato encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredContratos.map((contrato) => (
                  <TableRow key={contrato.id}>
                    <TableCell className="font-medium">
                      {contrato.numero_processo}
                    </TableCell>
                    <TableCell>{contrato.docente?.nome_completo}</TableCell>
                    <TableCell>
                      <NivelBadge nivel={contrato.docente!.nivel_academico} />
                    </TableCell>
                    <TableCell>{contrato.ano_lectivo}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">{contrato.total_horas}</span>
                      <span className="text-muted-foreground">h</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <MoneyDisplay value={contrato.valor_total_bruto!} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge estado={contrato.estado as EstadoContrato} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(contrato.data_contrato!)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/contratos/${contrato.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </Link>
                          </DropdownMenuItem>
                          {contrato.estado === "rascunho" && (
                            <DropdownMenuItem asChild>
                              <Link href={`/contratos/${contrato.id}/editar`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {contrato.estado !== "rascunho" && (
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Gerar PDF
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Mudar Estado
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
