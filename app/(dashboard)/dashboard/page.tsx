"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { FileText, Users, BookOpen, Clock, MoreHorizontal, Eye, Download } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import type { DashboardData, EstadoContrato } from "@/types"
import Link from "next/link"

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-MZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      try {
        const response = await fetch("/api/dashboard")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Falha ao carregar o dashboard.")
        }

        if (isMounted) {
          setDashboardData(data)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Falha ao carregar o dashboard.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const stats = dashboardData?.stats ?? {
    totalContratos: 0,
    contratosPendentes: 0,
    docentesActivos: 0,
    cadeirasCadastradas: 0,
  }

  const statCards = [
    {
      title: "Total de Contratos",
      value: stats.totalContratos,
      description: "Registados na base",
      icon: FileText,
      color: "text-primary",
    },
    {
      title: "Pendentes de Visto",
      value: stats.contratosPendentes,
      description: "Estados gerado e assinado",
      icon: Clock,
      color: "text-amber-600",
    },
    {
      title: "Docentes Activos",
      value: stats.docentesActivos,
      description: "Com contratos activos",
      icon: Users,
      color: "text-emerald-600",
    },
    {
      title: "Cadeiras Cadastradas",
      value: stats.cadeirasCadastradas,
      description: "Disponiveis no sistema",
      icon: BookOpen,
      color: "text-blue-600",
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visao geral do sistema de gestao de contratos"
      />

      {error && (
        <Card className="border-destructive/30">
          <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                {isLoading && <Spinner className="text-muted-foreground" />}
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Contratos Recentes</CardTitle>
                <CardDescription>Ultimos 10 contratos registados na base</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/contratos">Ver todos</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                <Spinner className="mr-2" />
                A carregar contratos...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N Processo</TableHead>
                    <TableHead>Docente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData?.recentContratos.length ? (
                    dashboardData.recentContratos.map((contrato) => (
                      <TableRow key={contrato.id}>
                        <TableCell className="font-medium">
                          {contrato.numero_processo || "Sem processo"}
                        </TableCell>
                        <TableCell>{contrato.docente?.nome_completo}</TableCell>
                        <TableCell>
                          <StatusBadge estado={contrato.estado as EstadoContrato} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {contrato.data_contrato ? formatDate(contrato.data_contrato) : "-"}
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
                                <Link href={`/contratos/${contrato.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver detalhes
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/contratos/${contrato.id}`}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Abrir contrato
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        Nenhum contrato encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Contratos por Estado</CardTitle>
            <CardDescription>Distribuicao actual por estado</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                <Spinner className="mr-2" />
                A carregar grafico...
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData?.chartData ?? []} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="estado" type="category" width={80} fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
