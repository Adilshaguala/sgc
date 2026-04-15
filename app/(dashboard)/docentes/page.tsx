"use client"

import { useState } from "react"
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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, History } from "lucide-react"
import type { Docente, NivelAcademico } from "@/types"
import Link from "next/link"

// Mock data
const mockDocentes: Docente[] = [
  {
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
  },
  {
    id: "2",
    nome_completo: "Maria Helena Costa",
    bi_numero: "987654321M",
    nuit: "100987654",
    nivel_academico: "doutorado",
    nacionalidade: "mocambicana",
    categoria: "Professor Associado",
    email: "maria.costa@upm.ac.mz",
    telefone: "+258 84 987 6543",
    created_at: "2025-05-20",
  },
  {
    id: "3",
    nome_completo: "Pedro Antonio Nunes",
    bi_numero: "456789123M",
    nuit: "100456789",
    nivel_academico: "licenciado",
    nacionalidade: "mocambicana",
    categoria: "Monitor",
    email: "pedro.nunes@upm.ac.mz",
    telefone: "+258 84 456 7890",
    created_at: "2025-04-10",
  },
  {
    id: "4",
    nome_completo: "Ana Cristina Fernandes",
    bi_numero: "789123456M",
    nuit: "100789123",
    nivel_academico: "mestre",
    nacionalidade: "mocambicana",
    categoria: "Assistente Estagiario",
    email: "ana.fernandes@upm.ac.mz",
    telefone: "+258 84 789 1234",
    created_at: "2025-03-05",
  },
  {
    id: "5",
    nome_completo: "Carlos Eduardo Reis",
    bi_numero: "321654987M",
    nuit: "100321654",
    nivel_academico: "doutorado",
    nacionalidade: "mocambicana",
    categoria: "Professor Catedratico",
    email: "carlos.reis@upm.ac.mz",
    telefone: "+258 84 321 6549",
    created_at: "2025-02-01",
  },
]

export default function DocentesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [nivelFilter, setNivelFilter] = useState<string>("all")

  const filteredDocentes = mockDocentes.filter((docente) => {
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

      {/* Filters */}
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

      {/* Table */}
      <Card>
        <CardContent className="p-0">
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
                      {docente.bi_numero}
                    </TableCell>
                    <TableCell>
                      <NivelBadge nivel={docente.nivel_academico} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {docente.categoria}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {docente.email}
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
                            <Link href={`/docentes/${docente.id}/historico`}>
                              <History className="mr-2 h-4 w-4" />
                              Historico de Cadeiras
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
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
