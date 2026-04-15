"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { MoneyDisplay } from "@/components/shared/money-display"
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
import { FileText, Users, BookOpen, Clock, MoreHorizontal, Eye, Download } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import type { Contrato, EstadoContrato } from "@/types"
import Link from "next/link"

// Mock data for demonstration
const mockStats = {
  totalContratos: 156,
  contratosPendentes: 23,
  docentesActivos: 89,
  cadeirasCadastradas: 245,
}

const mockContratos: Partial<Contrato>[] = [
  {
    id: "1",
    numero_processo: "PRC/SC/PS/2026/298",
    docente: { id: "1", nome_completo: "Joao Manuel Silva", nivel_academico: "mestre", nacionalidade: "mocambicana", created_at: "" },
    estado: "visado",
    data_contrato: "2026-01-15",
    valor_total_bruto: 45000,
  },
  {
    id: "2",
    numero_processo: "PRC/SC/PS/2026/299",
    docente: { id: "2", nome_completo: "Maria Helena Costa", nivel_academico: "doutorado", nacionalidade: "mocambicana", created_at: "" },
    estado: "assinado",
    data_contrato: "2026-01-14",
    valor_total_bruto: 62000,
  },
  {
    id: "3",
    numero_processo: "PRC/SC/PS/2026/300",
    docente: { id: "3", nome_completo: "Pedro Antonio Nunes", nivel_academico: "licenciado", nacionalidade: "mocambicana", created_at: "" },
    estado: "gerado",
    data_contrato: "2026-01-13",
    valor_total_bruto: 38500,
  },
  {
    id: "4",
    numero_processo: "PRC/SC/PS/2026/301",
    docente: { id: "4", nome_completo: "Ana Cristina Fernandes", nivel_academico: "mestre", nacionalidade: "mocambicana", created_at: "" },
    estado: "rascunho",
    data_contrato: "2026-01-12",
    valor_total_bruto: 41200,
  },
  {
    id: "5",
    numero_processo: "PRC/SC/PS/2026/302",
    docente: { id: "5", nome_completo: "Carlos Eduardo Reis", nivel_academico: "doutorado", nacionalidade: "mocambicana", created_at: "" },
    estado: "visado",
    data_contrato: "2026-01-11",
    valor_total_bruto: 58900,
  },
]

const chartData = [
  { estado: "Rascunho", count: 12 },
  { estado: "Gerado", count: 8 },
  { estado: "Assinado", count: 15 },
  { estado: "Visado", count: 98 },
  { estado: "Arquivado", count: 23 },
]

const statCards = [
  {
    title: "Total de Contratos",
    value: mockStats.totalContratos,
    description: "Este ano lectivo",
    icon: FileText,
    color: "text-primary",
  },
  {
    title: "Pendentes de Visto",
    value: mockStats.contratosPendentes,
    description: "Aguardam validacao",
    icon: Clock,
    color: "text-amber-600",
  },
  {
    title: "Docentes Activos",
    value: mockStats.docentesActivos,
    description: "Com contratos activos",
    icon: Users,
    color: "text-emerald-600",
  },
  {
    title: "Cadeiras Cadastradas",
    value: mockStats.cadeirasCadastradas,
    description: "Total no sistema",
    icon: BookOpen,
    color: "text-blue-600",
  },
]

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-MZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visao geral do sistema de gestao de contratos"
      />

      {/* Stats Cards */}
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
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Contracts Table */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Contratos Recentes</CardTitle>
                <CardDescription>Ultimos 10 contratos registados no sistema</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/contratos">Ver todos</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
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
                {mockContratos.map((contrato) => (
                  <TableRow key={contrato.id}>
                    <TableCell className="font-medium">
                      {contrato.numero_processo}
                    </TableCell>
                    <TableCell>{contrato.docente?.nome_completo}</TableCell>
                    <TableCell>
                      <StatusBadge estado={contrato.estado as EstadoContrato} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(contrato.data_contrato!)}
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
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Gerar PDF
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

        {/* Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Contratos por Estado</CardTitle>
            <CardDescription>Distribuicao dos contratos por estado actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
