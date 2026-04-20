"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/shared/page-header"
import { NivelBadge } from "@/components/shared/status-badge"
import { MoneyDisplay } from "@/components/shared/money-display"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, Info, DollarSign, Trash2 } from "lucide-react"
import type { TabelaSalario } from "@/types"

export default function TabelaSalarialPage() {
  const [data, setData] = useState<TabelaSalario[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadTabela() {
      setIsLoading(true)
      try {
        const response = await fetch("/api/tabela-salarial")
        if (!response.ok) {
          throw new Error("Falha ao carregar a tabela salarial.")
        }
        const result: TabelaSalario[] = await response.json()
        setData(result)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao carregar a tabela salarial.")
      } finally {
        setIsLoading(false)
      }
    }

    loadTabela()
  }, [])

  const handleChange = (id: string, field: keyof TabelaSalario, value: string) => {
    setData((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: Number.isNaN(Number(value)) ? 0 : Number(value),
            }
          : item
      )
    )
  }

  const handleSave = async () => {
    if (data.length === 0) {
      toast.error("Nenhuma entrada para guardar.")
      return
    }

    setIsSubmitting(true)

    try {
      const updatedData = await Promise.all(
        data.map(async (item) => {
          const response = await fetch(`/api/tabela-salarial/${item.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              valor_hora_mt: item.valor_hora_mt,
              bonus_conectividade_pct: item.bonus_conectividade_pct,
              abono_dia_sem_pernoita: item.abono_dia_sem_pernoita,
              abono_dia_com_pernoita: item.abono_dia_com_pernoita,
            }),
          })

          const result = await response.json()
          if (!response.ok) {
            throw new Error(result.error || "Falha ao guardar valor salarial.")
          }

          return result as TabelaSalario
        })
      )

      setData(updatedData)
      toast.success("Tabela salarial actualizada com sucesso.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao guardar tabela salarial.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (item: TabelaSalario) => {
    if (!confirm(`Tem certeza que deseja excluir a entrada "${item.nivel_academico}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/tabela-salarial/${item.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Falha ao excluir entrada da tabela salarial.")
      }

      setData((current) => current.filter((entry) => entry.id !== item.id))
      toast.success("Entrada excluida com sucesso.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao excluir entrada da tabela salarial.")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tabela Salarial"
        description="Configuracao dos valores de remuneracao por nivel academico"
      >
        <Button onClick={handleSave} disabled={isSubmitting || isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "A guardar..." : "Guardar Alteracoes"}
        </Button>
      </PageHeader>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Alteracoes aplicam-se apenas a novos contratos. Contratos existentes mantem os valores
          registados no momento da criacao.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Valores por Nivel Academico</CardTitle>
              <CardDescription>
                Defina os valores de remuneracao para cada nivel academico
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nivel Academico</TableHead>
                <TableHead className="text-right">Valor/Hora (MT)</TableHead>
                <TableHead className="text-right">Bonus Conectividade (%)</TableHead>
                <TableHead className="text-right">Abono Dia s/ Pernoita (MT)</TableHead>
                <TableHead className="text-right">Abono Dia c/ Pernoita (MT)</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    A carregar tabela salarial...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Nenhuma entrada encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <NivelBadge nivel={item.nivel_academico} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={item.valor_hora_mt}
                        onChange={(e) => handleChange(item.id, "valor_hora_mt", e.target.value)}
                        className="w-32 text-right ml-auto"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={item.bonus_conectividade_pct}
                        onChange={(e) => handleChange(item.id, "bonus_conectividade_pct", e.target.value)}
                        className="w-24 text-right ml-auto"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={item.abono_dia_sem_pernoita}
                        onChange={(e) => handleChange(item.id, "abono_dia_sem_pernoita", e.target.value)}
                        className="w-32 text-right ml-auto"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={item.abono_dia_com_pernoita}
                        onChange={(e) => handleChange(item.id, "abono_dia_com_pernoita", e.target.value)}
                        className="w-32 text-right ml-auto"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo dos Valores Actuais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {data.map((item) => (
              <div key={item.id} className="rounded-lg border p-4">
                <div className="mb-2">
                  <NivelBadge nivel={item.nivel_academico} />
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor/Hora:</span>
                    <MoneyDisplay value={item.valor_hora_mt} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bonus:</span>
                    <span>{item.bonus_conectividade_pct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exemplo 64h:</span>
                    <MoneyDisplay
                      value={item.valor_hora_mt * 64 * (1 + item.bonus_conectividade_pct / 100)}
                      className="font-medium text-primary"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
