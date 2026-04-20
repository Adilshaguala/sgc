"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Plus, Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import type { Cadeira } from "@/types"
import Link from "next/link"

export default function CadeirasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [cadeiras, setCadeiras] = useState<Cadeira[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadCadeiras() {
      try {
        const response = await fetch("/api/cadeiras")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Falha ao carregar cadeiras.")
        }

        if (isMounted) {
          setCadeiras(data)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Falha ao carregar cadeiras.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadCadeiras()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredCadeiras = cadeiras.filter(
    (cadeira) =>
      cadeira.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cadeira.curso.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadeiras"
        description="Gestao de modulos e disciplinas"
      >
        <Button asChild>
          <Link href="/cadeiras/nova">
            <Plus className="mr-2 h-4 w-4" />
            Nova Cadeira
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
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome ou curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              <Spinner className="mr-2" />
              A carregar cadeiras...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Horas de Contacto</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead className="text-center">Ano</TableHead>
                  <TableHead className="text-center">Semestre</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCadeiras.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Nenhuma cadeira encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCadeiras.map((cadeira) => (
                    <TableRow key={cadeira.id}>
                      <TableCell className="font-medium">
                        {cadeira.nome}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-medium">{cadeira.horas_contacto}</span>
                        <span className="text-muted-foreground">h</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {cadeira.curso?.nome ?? "N/A"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{cadeira.ano}o</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{cadeira.semestre}</Badge>
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
                            <DropdownMenuItem className="text-muted-foreground" disabled>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edicao em breve
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
