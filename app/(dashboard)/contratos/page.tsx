"use client"

import { useEffect, useState } from "react"
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
import { Spinner } from "@/components/ui/spinner"
import { Plus, Search, MoreHorizontal, Eye, Pencil, Download, ArrowRight } from "lucide-react"
import type { Contrato, EstadoContrato } from "@/types"
import Link from "next/link"

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
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadContratos() {
      try {
        const response = await fetch("/api/contratos")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Falha ao carregar contratos.")
        }

        if (isMounted) {
          setContratos(data)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Falha ao carregar contratos.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadContratos()

    return () => {
      isMounted = false
    }
  }, [])

  const years = Array.from(new Set(contratos.map((contrato) => contrato.ano_lectivo))).sort().reverse()

  const filteredContratos = contratos.filter((contrato) => {
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

      {error && (
        <Card className="border-destructive/30">
          <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

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
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              <Spinner className="mr-2" />
              A carregar contratos...
            </div>
          ) : (
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
                        {contrato.numero_processo || "Sem processo"}
                      </TableCell>
                      <TableCell>{contrato.docente?.nome_completo}</TableCell>
                      <TableCell>
                        {contrato.docente ? (
                          <NivelBadge nivel={contrato.docente.nivel_academico} />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{contrato.ano_lectivo}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">{contrato.total_horas ?? 0}</span>
                        <span className="text-muted-foreground">h</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <MoneyDisplay value={contrato.valor_total_bruto ?? 0} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge estado={contrato.estado as EstadoContrato} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(contrato.data_contrato)}
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
                                <Link href={`/contratos/${contrato.id}`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                            )}
                            {contrato.estado !== "rascunho" && (
                              <DropdownMenuItem asChild>
                                <Link href={`/contratos/${contrato.id}`}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Gerar PDF
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/contratos/${contrato.id}`}>
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Mudar Estado
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
