"use client"

import { useState } from "react"
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
  DropdownMenuSeparator,
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
import { Plus, MoreHorizontal, Pencil, Trash2, Upload, UserCheck } from "lucide-react"

interface Assinante {
  id: string
  nome_completo: string
  titulo: string
  cargo: string
  departamento: string
  activo: boolean
}

const mockAssinantes: Assinante[] = [
  {
    id: "1",
    nome_completo: "Ana Maria Santos",
    titulo: "Profa. Doutora",
    cargo: "Vice-Reitora de Administracao e Recursos",
    departamento: "Reitoria",
    activo: true,
  },
  {
    id: "2",
    nome_completo: "Jose Pedro Macamo",
    titulo: "Prof. Doutor",
    cargo: "Director do CEAD",
    departamento: "CEAD",
    activo: true,
  },
  {
    id: "3",
    nome_completo: "Maria Fernanda Costa",
    titulo: "Profa. Doutora",
    cargo: "Vice-Reitora Academica",
    departamento: "Reitoria",
    activo: false,
  },
]

export default function AssinantesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    nome_completo: "",
    titulo: "",
    cargo: "",
    departamento_id: "",
    activo: true,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assinantes"
        description="Gestao de assinantes autorizados para contratos"
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Assinante
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Assinante</DialogTitle>
              <DialogDescription>
                Adicione um novo assinante autorizado para contratos
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
                <FieldDescription>
                  Titulo academico ou honorario
                </FieldDescription>
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
                    <SelectItem value="1">Reitoria</SelectItem>
                    <SelectItem value="2">CEAD</SelectItem>
                    <SelectItem value="3">FCNM</SelectItem>
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
              <Button onClick={() => setDialogOpen(false)}>Guardar</Button>
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
                <TableHead>Titulo</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAssinantes.map((assinante) => (
                <TableRow key={assinante.id}>
                  <TableCell className="font-medium">{assinante.nome_completo}</TableCell>
                  <TableCell className="text-muted-foreground">{assinante.titulo}</TableCell>
                  <TableCell>{assinante.cargo}</TableCell>
                  <TableCell className="text-muted-foreground">{assinante.departamento}</TableCell>
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
                        <DropdownMenuItem>
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
