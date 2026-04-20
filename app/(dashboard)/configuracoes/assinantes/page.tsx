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
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { Plus, MoreHorizontal, Pencil, Upload, UserCheck, Trash2 } from "lucide-react"
import type { Assinante, Departamento } from "@/types"

interface AssinanteForm {
  nome_completo: string
  titulo?: string
  cargo: string
  departamento_id?: string
  assinatura_url?: string
  activo: boolean
}

const initialFormData: AssinanteForm = {
  nome_completo: "",
  titulo: "",
  cargo: "",
  departamento_id: "",
  assinatura_url: "",
  activo: true,
}

export default function AssinantesPage() {
  const [assinantes, setAssinantes] = useState<Assinante[]>([])
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAssinante, setEditingAssinante] = useState<Assinante | null>(null)
  const [formData, setFormData] = useState<AssinanteForm>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)

      try {
        const [assinantesRes, departamentosRes] = await Promise.all([
          fetch("/api/assinantes"),
          fetch("/api/departamentos"),
        ])

        if (!assinantesRes.ok || !departamentosRes.ok) {
          throw new Error("Falha ao carregar dados de configuracao.")
        }

        const assinantesData: Assinante[] = await assinantesRes.json()
        const departamentosData: Departamento[] = await departamentosRes.json()

        setAssinantes(assinantesData)
        setDepartamentos(departamentosData)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao carregar dados.")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const resetForm = () => {
    setEditingAssinante(null)
    setFormData(initialFormData)
  }

  const handleOpenNew = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleEdit = (assinante: Assinante) => {
    setEditingAssinante(assinante)
    setFormData({
      nome_completo: assinante.nome_completo,
      titulo: assinante.titulo ?? "",
      cargo: assinante.cargo,
      departamento_id: assinante.departamento_id ?? "",
      assinatura_url: assinante.assinatura_url ?? "",
      activo: assinante.activo,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (assinante: Assinante) => {
    if (!confirm(`Tem certeza que deseja excluir o assinante "${assinante.nome_completo}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/assinantes/${assinante.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Falha ao excluir assinante.")
      }

      setAssinantes((current) => current.filter((item) => item.id !== assinante.id))
      toast.success("Assinante excluido com sucesso.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao excluir assinante.")
    }
  }

  const handleSave = async () => {
    if (!formData.nome_completo.trim() || !formData.cargo.trim()) {
      toast.error("Nome completo e cargo sao obrigatorios.")
      return
    }

    setIsSubmitting(true)

    try {
      const url = editingAssinante
        ? `/api/assinantes/${editingAssinante.id}`
        : "/api/assinantes"
      const response = await fetch(url, {
        method: editingAssinante ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Falha ao guardar assinante.")
      }

      if (editingAssinante) {
        setAssinantes((current) =>
          current.map((item) => (item.id === result.id ? result : item))
        )
        toast.success("Assinante actualizado com sucesso.")
      } else {
        setAssinantes((current) => [result, ...current])
        toast.success("Assinante criado com sucesso.")
      }

      setDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao guardar assinante.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assinantes"
        description="Gestao de assinantes autorizados para contratos"
      >
        <Button onClick={handleOpenNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Assinante
        </Button>
      </PageHeader>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>{editingAssinante ? "Editar Assinante" : "Novo Assinante"}</DialogTitle>
            <DialogDescription>
              {editingAssinante
                ? "Atualize os dados do assinante."
                : "Adicione um novo assinante autorizado para contratos."}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel>Nome Completo *</FieldLabel>
              <Input
                value={formData.nome_completo}
                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                placeholder="Nome completo do assinante"
              />
            </Field>
            <Field>
              <FieldLabel>Titulo</FieldLabel>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ex: Prof. Doutor, Profa. Doutora"
              />
              <FieldDescription>Titulo academico ou honorario</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Cargo *</FieldLabel>
              <Input
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                placeholder="Ex: Vice-Reitora de Administracao"
              />
            </Field>
            <Field>
              <FieldLabel>Departamento</FieldLabel>
              <Select
                value={formData.departamento_id}
                onValueChange={(value) => setFormData({ ...formData, departamento_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione o departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departamentos.length === 0 ? (
                    <SelectItem value="">Sem departamentos</SelectItem>
                  ) : (
                    departamentos.map((departamento) => (
                      <SelectItem key={departamento.id} value={departamento.id}>
                        {departamento.nome}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Imagem da Assinatura</FieldLabel>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-32 items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                  <UserCheck className="h-6 w-6 text-muted-foreground" />
                </div>
                <Button type="button" variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Carregar
                </Button>
              </div>
              <FieldDescription className="mt-2">
                Imagem digitalizada da assinatura (PNG transparente recomendado)
              </FieldDescription>
            </Field>
            <Field>
              <div className="flex items-center justify-between">
                <div>
                  <FieldLabel>Activo</FieldLabel>
                  <FieldDescription>
                    Assinantes inactivos nao aparecem na lista de seleccao
                  </FieldDescription>
                </div>
                <Switch
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                />
              </div>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {editingAssinante ? "Atualizar" : "Guardar"}
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
                <TableHead>Titulo</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-12.5"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    A carregar assinantes...
                  </TableCell>
                </TableRow>
              ) : assinantes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Nenhum assinante encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                assinantes.map((assinante) => (
                  <TableRow key={assinante.id}>
                    <TableCell className="font-medium">{assinante.nome_completo}</TableCell>
                    <TableCell className="text-muted-foreground">{assinante.titulo}</TableCell>
                    <TableCell>{assinante.cargo}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {assinante.departamento_nome ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={assinante.activo ? "default" : "secondary"}>
                        {assinante.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => handleEdit(assinante)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => handleDelete(assinante)}
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
