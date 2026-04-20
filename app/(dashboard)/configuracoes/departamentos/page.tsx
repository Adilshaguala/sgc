"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Plus, MoreHorizontal, Pencil, Upload, GraduationCap, Trash2 } from "lucide-react"
import type { Departamento } from "@/types"

const initialFormData = {
  nome: "",
  sigla: "",
  descricao: "",
}

export default function DepartamentosPage() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDepartamento, setEditingDepartamento] = useState<Departamento | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadDepartamentos() {
      setIsLoading(true)
      try {
        const response = await fetch("/api/departamentos")
        if (!response.ok) {
          throw new Error("Falha ao carregar departamentos.")
        }
        const data: Departamento[] = await response.json()
        setDepartamentos(data)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao carregar departamentos.")
      } finally {
        setIsLoading(false)
      }
    }

    loadDepartamentos()
  }, [])

  const resetForm = () => {
    setEditingDepartamento(null)
    setFormData(initialFormData)
  }

  const handleOpenNew = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleEdit = (dept: Departamento) => {
    setEditingDepartamento(dept)
    setFormData({
      nome: dept.nome,
      sigla: dept.sigla || "",
      descricao: dept.descricao || "",
    })
    setDialogOpen(true)
  }

  const handleDelete = async (dept: Departamento) => {
    if (!confirm(`Tem certeza que deseja excluir o departamento "${dept.nome}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/departamentos/${dept.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Falha ao excluir departamento.")
      }

      setDepartamentos((current) => current.filter((item) => item.id !== dept.id))
      toast.success("Departamento excluido com sucesso.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao excluir departamento.")
    }
  }

  const handleSave = async () => {
    if (!formData.nome.trim() || !formData.sigla.trim()) {
      toast.error("Nome e sigla sao obrigatorios.")
      return
    }

    setIsSubmitting(true)

    try {
      const url = editingDepartamento
        ? `/api/departamentos/${editingDepartamento.id}`
        : "/api/departamentos"
      const response = await fetch(url, {
        method: editingDepartamento ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Falha ao guardar departamento.")
      }

      if (editingDepartamento) {
        setDepartamentos((current) =>
          current.map((item) => (item.id === result.id ? result : item))
        )
        toast.success("Departamento actualizado com sucesso.")
      } else {
        setDepartamentos((current) => [result, ...current])
        toast.success("Departamento criado com sucesso.")
      }

      setDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao guardar departamento.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Departamentos" description="Gestao de departamentos e faculdades">
        <Button onClick={handleOpenNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Departamento
        </Button>
      </PageHeader>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingDepartamento ? "Editar Departamento" : "Novo Departamento"}
            </DialogTitle>
            <DialogDescription>Preencha os dados do departamento</DialogDescription>
          </DialogHeader>
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel>Nome *</FieldLabel>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome do departamento"
              />
            </Field>
            <Field>
              <FieldLabel>Sigla *</FieldLabel>
              <Input
                value={formData.sigla}
                onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
                placeholder="Ex: CEAD"
              />
            </Field>
            <Field>
              <FieldLabel>Descricao</FieldLabel>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descricao do departamento"
                rows={3}
              />
            </Field>
            <Field>
              <FieldLabel>Logo</FieldLabel>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                  <GraduationCap className="h-6 w-6 text-muted-foreground" />
                </div>
                <Button type="button" variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Carregar
                </Button>
              </div>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {editingDepartamento ? "Atualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Sigla</TableHead>
                <TableHead>Descricao</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    A carregar departamentos...
                  </TableCell>
                </TableRow>
              ) : departamentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Nenhum departamento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                departamentos.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.nome}</TableCell>
                    <TableCell>{dept.sigla}</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {dept.descricao}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleEdit(dept)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => handleDelete(dept)}
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
