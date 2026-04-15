"use client"

import { useState } from "react"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Plus, MoreHorizontal, Pencil, Trash2, Upload, GraduationCap } from "lucide-react"

interface Departamento {
  id: string
  nome: string
  sigla: string
  descricao?: string
  logo_url?: string
}

const mockDepartamentos: Departamento[] = [
  {
    id: "1",
    nome: "Centro de Educacao Aberta e a Distancia",
    sigla: "CEAD",
    descricao: "Centro responsavel pela educacao a distancia e programas de extensao",
  },
  {
    id: "2",
    nome: "Faculdade de Ciencias Naturais e Matematica",
    sigla: "FCNM",
    descricao: "Faculdade de ciencias exactas e naturais",
  },
  {
    id: "3",
    nome: "Faculdade de Ciencias de Linguagem, Comunicacao e Artes",
    sigla: "FCLCA",
    descricao: "Faculdade de letras e comunicacao",
  },
  {
    id: "4",
    nome: "Faculdade de Ciencias Sociais",
    sigla: "FCS",
    descricao: "Faculdade de ciencias humanas e sociais",
  },
]

export default function DepartamentosPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDepartamento, setEditingDepartamento] = useState<Departamento | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    sigla: "",
    descricao: "",
  })

  const handleOpenNew = () => {
    setEditingDepartamento(null)
    setFormData({ nome: "", sigla: "", descricao: "" })
    setDialogOpen(true)
  }

  const handleEdit = (dept: Departamento) => {
    setEditingDepartamento(dept)
    setFormData({
      nome: dept.nome,
      sigla: dept.sigla,
      descricao: dept.descricao || "",
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    // Save logic here
    setDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departamentos"
        description="Gestao de departamentos e faculdades"
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenNew}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Departamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingDepartamento ? "Editar Departamento" : "Novo Departamento"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do departamento
              </DialogDescription>
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
              <Button onClick={handleSave}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

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
              {mockDepartamentos.map((dept) => (
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
                        <DropdownMenuItem onClick={() => handleEdit(dept)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
