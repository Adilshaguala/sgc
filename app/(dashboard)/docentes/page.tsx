"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { NivelBadge } from "@/components/shared/status-badge"
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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, History } from "lucide-react"
import type { Docente } from "@/types"
import Link from "next/link"

export default function DocentesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [nivelFilter, setNivelFilter] = useState<string>("all")
  const [docentes, setDocentes] = useState<Docente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadDocentes() {
      try {
        const response = await fetch("/api/docentes")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Falha ao carregar docentes.")
        }

        if (isMounted) {
          setDocentes(data)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Falha ao carregar docentes.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadDocentes()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredDocentes = docentes.filter((docente) => {
    const matchesSearch =
      docente.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docente.bi_numero?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesNivel = nivelFilter === "all" || docente.nivel_academico === nivelFilter
    return matchesSearch && matchesNivel
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Docentes"
        description="Gestao de docentes e tutores de especialidade"
      >
        <Button asChild>
          <Link href="/docentes/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Docente
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
                placeholder="Pesquisar por nome ou BI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={nivelFilter} onValueChange={setNivelFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Nivel Academico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os niveis</SelectItem>
                <SelectItem value="licenciado">Licenciado</SelectItem>
                <SelectItem value="mestre">Mestre</SelectItem>
                <SelectItem value="doutorado">Doutorado</SelectItem>
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
              A carregar docentes...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>BI</TableHead>
                  <TableHead>Nivel Academico</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocentes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Nenhum docente encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDocentes.map((docente) => (
                    <TableRow key={docente.id}>
                      <TableCell className="font-medium">
                        {docente.nome_completo}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {docente.bi_numero || "-"}
                      </TableCell>
                      <TableCell>
                        <NivelBadge nivel={docente.nivel_academico} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {docente.categoria || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {docente.email || "-"}
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
                              <Link href={`/docentes/${docente.id}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/docentes/${docente.id}`}>
                                <History className="mr-2 h-4 w-4" />
                                Historico de Cadeiras
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-muted-foreground" disabled>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminacao em breve
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
