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
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Field,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, MoreHorizontal, Pencil, MapPin, Info, Trash2 } from "lucide-react"
import type { CentroRecursos } from "@/types"

const initialFormData = {
  nome: "",
  is_campus_principal: false,
}

export default function CentrosRecursosPage() {
  const [centros, setCentros] = useState<CentroRecursos[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCentro, setEditingCentro] = useState<CentroRecursos | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadCentros() {
      setIsLoading(true)
      try {
        const response = await fetch("/api/centros-recursos")
        if (!response.ok) {
          throw new Error("Falha ao carregar centros de recursos.")
        }
        const data: CentroRecursos[] = await response.json()
        setCentros(data)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao carregar centros.")
      } finally {
        setIsLoading(false)
      }
    }

    loadCentros()
  }, [])

  const resetForm = () => {
    setEditingCentro(null)
    setFormData(initialFormData)
  }

  const handleOpenNew = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleEdit = (centro: CentroRecursos) => {
    setEditingCentro(centro)
    setFormData({
      nome: centro.nome,
      is_campus_principal: centro.is_campus_principal,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (centro: CentroRecursos) => {
    if (!confirm(`Tem certeza que deseja excluir o centro "${centro.nome}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/centros-recursos/${centro.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Falha ao excluir centro de recursos.")
      }

      setCentros((current) => current.filter((item) => item.id !== centro.id))
      toast.success("Centro excluido com sucesso.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao excluir centro de recursos.")
    }
  }

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast.error("Nome do centro e obrigatorio.")
      return
    }

    setIsSubmitting(true)

    try {
      const url = editingCentro
        ? `/api/centros-recursos/${editingCentro.id}`
        : "/api/centros-recursos"
      const response = await fetch(url, {
        method: editingCentro ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Falha ao guardar centro de recursos.")
      }

      if (editingCentro) {
        setCentros((current) => current.map((item) => (item.id === result.id ? result : item)))
        toast.success("Centro actualizado com sucesso.")
      } else {
        setCentros((current) => [result, ...current])
        toast.success("Centro criado com sucesso.")
      }

      setDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao guardar centro.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centros de Recursos"
        description="Gestao dos centros de recursos da universidade"
      >
        <Button onClick={handleOpenNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Centro
        </Button>
      </PageHeader>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCentro ? "Editar Centro" : "Novo Centro de Recursos"}</DialogTitle>
            <DialogDescription>
              {editingCentro
                ? "Atualize os dados do centro de recursos."
                : "Adicione um novo centro de recursos."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Field>
              <FieldLabel>Nome *</FieldLabel>
              <Input
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: UP-Gaza"
              />
            </Field>
            <Field>
              <div className="flex items-center justify-between">
                <div>
                  <FieldLabel>Campus Principal</FieldLabel>
                  <FieldDescription>
                    Centros no campus principal nao geram direito a abono de deslocacao
                  </FieldDescription>
                </div>
                <Switch
                  checked={formData.is_campus_principal}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_campus_principal: checked })
                  }
                />
              </div>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {editingCentro ? "Atualizar" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Novos centros de recursos tambem podem ser criados automaticamente durante a criacao de contratos,
          quando o utilizador digita um nome que nao existe no sistema.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Abono de Deslocacao</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    A carregar centros...
                  </TableCell>
                </TableRow>
              ) : centros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    Nenhum centro de recursos encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                centros.map((centro) => (
                  <TableRow key={centro.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{centro.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {centro.is_campus_principal ? (
                        <Badge>Campus Principal</Badge>
                      ) : (
                        <Badge variant="outline">Centro Regional</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {centro.is_campus_principal ? (
                        <span className="text-muted-foreground">Nao aplicavel</span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Com direito a abono
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleEdit(centro)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => handleDelete(centro)}
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
