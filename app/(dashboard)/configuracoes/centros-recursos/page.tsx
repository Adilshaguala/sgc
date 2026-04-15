"use client"

import { useState } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Field,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, MoreHorizontal, Pencil, Trash2, MapPin, Info } from "lucide-react"

interface CentroRecursos {
  id: string
  nome: string
  is_campus_principal: boolean
}

const mockCentros: CentroRecursos[] = [
  { id: "1", nome: "Lhanguene", is_campus_principal: true },
  { id: "2", nome: "UP-Sede", is_campus_principal: false },
  { id: "3", nome: "UP-Beira", is_campus_principal: false },
  { id: "4", nome: "UP-Nampula", is_campus_principal: false },
  { id: "5", nome: "UP-Quelimane", is_campus_principal: false },
]

export default function CentrosRecursosPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    is_campus_principal: false,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centros de Recursos"
        description="Gestao dos centros de recursos da universidade"
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Centro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Centro de Recursos</DialogTitle>
              <DialogDescription>
                Adicione um novo centro de recursos
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
              <Button onClick={() => setDialogOpen(false)}>Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

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
              {mockCentros.map((centro) => (
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
