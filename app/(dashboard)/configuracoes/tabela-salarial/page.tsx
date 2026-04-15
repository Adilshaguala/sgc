"use client"

import { useState } from "react"
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
import { Save, Info, DollarSign } from "lucide-react"
import type { NivelAcademico } from "@/types"

interface TabelaSalario {
  id: string
  nivel_academico: NivelAcademico
  valor_hora_mt: number
  bonus_conectividade_pct: number
  abono_dia_sem_pernoita: number
  abono_dia_com_pernoita: number
}

const initialData: TabelaSalario[] = [
  {
    id: "1",
    nivel_academico: "licenciado",
    valor_hora_mt: 900,
    bonus_conectividade_pct: 25,
    abono_dia_sem_pernoita: 1800,
    abono_dia_com_pernoita: 6000,
  },
  {
    id: "2",
    nivel_academico: "mestre",
    valor_hora_mt: 1100,
    bonus_conectividade_pct: 25,
    abono_dia_sem_pernoita: 1800,
    abono_dia_com_pernoita: 6000,
  },
  {
    id: "3",
    nivel_academico: "doutorado",
    valor_hora_mt: 1400,
    bonus_conectividade_pct: 25,
    abono_dia_sem_pernoita: 1800,
    abono_dia_com_pernoita: 6000,
  },
]

export default function TabelaSalarialPage() {
  const [data, setData] = useState(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (id: string, field: keyof TabelaSalario, value: string) => {
    setData(
      data.map((item) =>
        item.id === id ? { ...item, [field]: parseFloat(value) || 0 } : item
      )
    )
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tabela Salarial"
        description="Configuracao dos valores de remuneracao por nivel academico"
      >
        <Button onClick={handleSave} disabled={isSubmitting}>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Card */}
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
