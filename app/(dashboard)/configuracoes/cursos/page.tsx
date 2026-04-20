"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { Plus, MoreHorizontal, Pencil, BookOpen, Trash2 } from "lucide-react"
import type { Curso, CentroRecursos } from "@/types"

const initialFormData = {
  nome: "",
  duracao_anos: 3,
  centro_recursos_id: "",
}

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [centros, setCentros] = useState<CentroRecursos[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [cursosRes, centrosRes] = await Promise.all([
        fetch("/api/cursos"),
        fetch("/api/centros-recursos"),
      ])

      if (!cursosRes.ok || !centrosRes.ok) {
        throw new Error("Falha ao carregar dados de configuracao.")
      }

      const cursosData: Curso[] = await cursosRes.json()
      const centrosData: CentroRecursos[] = await centrosRes.json()

      setCursos(cursosData)
      setCentros(centrosData)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao carregar dados.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEditingCurso(null)
    setFormData(initialFormData)
  }

  const handleOpenNew = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleEdit = (curso: Curso) => {
    setEditingCurso(curso)
    setFormData({
      nome: curso.nome,
      duracao_anos: curso.duracao_anos,
      centro_recursos_id: curso.centro_recursos_id,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (curso: Curso) => {
    if (!confirm(`Tem certeza que deseja excluir o curso "${curso.nome}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/cursos/${curso.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Falha ao excluir curso.")
      }

      setCursos((current) => current.filter((item) => item.id !== curso.id))
      toast.success("Curso excluido com sucesso.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao excluir curso.")
    }
  }

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast.error("Nome do curso e obrigatorio.")
      return
    }

    if (!formData.centro_recursos_id) {
      toast.error("Centro de recursos e obrigatorio.")
      return
    }

    if (formData.duracao_anos < 1) {
      toast.error("Duracao deve ser pelo menos 1 ano.")
      return
    }

    setIsSubmitting(true)

    try {
      const url = editingCurso
        ? `/api/cursos/${editingCurso.id}`
        : "/api/cursos"
      const response = await fetch(url, {
        method: editingCurso ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Falha ao guardar curso.")
      }

      if (editingCurso) {
        setCursos((current) => current.map((item) => (item.id === result.id ? result : item)))
        toast.success("Curso actualizado com sucesso.")
      } else {
        setCursos((current) => [result, ...current])
        toast.success("Curso criado com sucesso.")
      }

      setDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao guardar curso.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cursos"
        description="Gestao de cursos academicos"
      >
        <Button onClick={handleOpenNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Curso
        </Button>
      </PageHeader>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCurso ? "Editar Curso" : "Novo Curso"}</DialogTitle>
          </DialogHeader>
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel>Nome do Curso *</FieldLabel>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Engenharia Informatica"
              />
            </Field>
            <Field>
              <FieldLabel>Duracao (anos) *</FieldLabel>
              <Input
                type="number"
                min="1"
                max="10"
                value={formData.duracao_anos}
                onChange={(e) => setFormData({ ...formData, duracao_anos: Number(e.target.value) })}
              />
            </Field>
            <Field>
              <FieldLabel>Centro de Recursos *</FieldLabel>
              <Select
                value={formData.centro_recursos_id}
                onValueChange={(value) => setFormData({ ...formData, centro_recursos_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione um centro" />
                </SelectTrigger>
                <SelectContent>
                  {centros.map((centro) => (
                    <SelectItem key={centro.id} value={centro.id}>
                      {centro.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {editingCurso ? "Atualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Curso</TableHead>
                <TableHead>Duracao</TableHead>
                <TableHead>Centro de Recursos</TableHead>
                <TableHead className="w-12.5"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    A carregar cursos...
                  </TableCell>
                </TableRow>
              ) : cursos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Nenhum curso encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                cursos.map((curso) => (
                  <TableRow key={curso.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        {curso.nome}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {curso.duracao_anos} ano{curso.duracao_anos !== 1 ? 's' : ''}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {curso.centro_recursos?.nome ?? "N/A"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleEdit(curso)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => handleDelete(curso)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
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