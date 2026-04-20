"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge, NivelBadge } from "@/components/shared/status-badge"
import { MoneyDisplay } from "@/components/shared/money-display"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft, ArrowRight, Pencil, FileText, User, BookOpen, Calculator } from "lucide-react"
import Link from "next/link"
import type { Contrato, EstadoContrato, Instituicao } from "@/types"
import { PdfDownloadButton, type ContractPdfData } from "@/components/contracts/pdf-download-button"
import { toast } from "sonner"

const estadoTransicoes: Record<EstadoContrato, EstadoContrato | null> = {
  rascunho: "gerado",
  gerado: "assinado",
  assinado: "visado",
  visado: "arquivado",
  arquivado: null,
}

function formatMoneyForPdf(value: number): string {
  return value.toLocaleString("pt-MZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatAcademicYears(values: string[]): string {
  const years = values.filter((value, index, array) => array.indexOf(value) === index)

  if (years.length === 0) {
    return ""
  }

  if (years.length === 1) {
    return years[0]
  }

  if (years.length === 2) {
    return `${years[0]} e ${years[1]}`
  }

  return `${years.slice(0, -1).join(", ")} e ${years[years.length - 1]}`
}

function getDocenteTitulo(nivel: "licenciado" | "mestre" | "doutorado"): string {
  switch (nivel) {
    case "doutorado":
      return "Prof. Doutor"
    case "mestre":
      return "Prof. Mestre"
    default:
      return "Prof."
  }
}

function getSemestres(contrato: Contrato) {
  const semestres = Array.from(
    new Set((contrato.cadeiras ?? []).map((item) => item.cadeira?.semestre).filter(Boolean))
  )

  if (semestres.length === 0) {
    return "I"
  }

  if (semestres.includes("I e II")) {
    return "I e II"
  }

  return semestres.join(" e ")
}

export default function ContratoDetalhePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [changeStateOpen, setChangeStateOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingState, setIsUpdatingState] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contrato, setContrato] = useState<Contrato | null>(null)
  const [instituicao, setInstituicao] = useState<Instituicao | null>(null)
  const [vistoData, setVistoData] = useState({
    data_visto_ta: "",
    numero_visto_ta: "",
  })

  useEffect(() => {
    let isMounted = true

    async function loadContrato() {
      try {
        const response = await fetch(`/api/contratos/${params.id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Falha ao carregar contrato.")
        }

        if (isMounted) {
          setContrato(data.contrato)
          setInstituicao(data.instituicao)
          setVistoData({
            data_visto_ta: data.contrato.data_visto_ta
              ? data.contrato.data_visto_ta.split("T")[0]
              : "",
            numero_visto_ta: data.contrato.numero_visto_ta || "",
          })
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Falha ao carregar contrato.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadContrato()

    return () => {
      isMounted = false
    }
  }, [params.id])

  const proximoEstado = contrato ? estadoTransicoes[contrato.estado] : null
  const bonusConectividade =
    (contrato?.valor_total_bruto ?? 0) * ((contrato?.bonus_conectividade_pct ?? 0) / 100)

  const academicYears = (contrato?.cadeiras ?? []).map((cc) => `${cc.cadeira?.ano}o`)

  const pdfData: ContractPdfData | null =
    contrato && instituicao && contrato.docente && contrato.assinante
      ? {
          numeroProcesso: contrato.numero_processo,
          nomeInstituicao: instituicao.nome,
          endereco: instituicao.endereco || "",
          numeroDespacho: instituicao.numero_despacho || "",
          contratanteTitulo: contrato.assinante.titulo || "",
          contratanteNome: contrato.assinante.nome_completo,
          contratanteCargo: contrato.assinante.cargo,
          docenteTitulo: getDocenteTitulo(contrato.docente.nivel_academico),
          docenteNome: contrato.docente.nome_completo,
          docenteBI: contrato.docente.bi_numero || "",
          docenteNUIT: contrato.docente.nuit || "",
          docenteNacionalidade: contrato.docente.nacionalidade,
          docenteCategoria: contrato.docente.categoria || "",
          docenteNivelAcademico:
            contrato.docente.nivel_academico === "mestre"
              ? "Mestre"
              : contrato.docente.nivel_academico === "doutorado"
              ? "Doutorado"
              : "Licenciado",
          anoLectivo: contrato.ano_lectivo,
          anosAcademicos: formatAcademicYears(academicYears),
          semestres: getSemestres(contrato),
          modulos: (contrato.cadeiras ?? []).map((cc) => ({
            nome: cc.cadeira?.nome || "Modulo",
            horasContacto: String(cc.horas_override || cc.cadeira?.horas_contacto || 0),
            curso: cc.cadeira?.curso || "",
            ano: `${cc.cadeira?.ano || ""}o`,
            anoAcademico: `${cc.cadeira?.ano || ""}o`,
            semestre: cc.cadeira?.semestre || "",
            centroRecursos: cc.centro_recursos?.nome || "",
          })),
          totalHoras: String(contrato.total_horas || 0),
          valorHora: `${formatMoneyForPdf(contrato.valor_hora_mt || 0)} MT`,
          bonusConectividade: String(contrato.bonus_conectividade_pct || 0),
          abonoDiaSemPernoita: `${formatMoneyForPdf(1800)} MT`,
          abonoDiaComPernoita: `${formatMoneyForPdf(6000)} MT`,
        }
      : null

  const handleChangeState = async () => {
    if (!contrato || !proximoEstado) {
      return
    }

    setIsUpdatingState(true)

    try {
      const response = await fetch(`/api/contratos/${contrato.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estado: proximoEstado,
          ...vistoData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Falha ao actualizar estado do contrato.")
      }

      setContrato(data)
      setChangeStateOpen(false)
      toast.success(`Contrato actualizado para ${proximoEstado}.`)
      router.refresh()
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "Falha ao actualizar contrato.")
    } finally {
      setIsUpdatingState(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Contrato"
          description="A carregar detalhes do contrato"
        >
          <Button variant="outline" asChild>
            <Link href="/contratos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </PageHeader>

        <Card>
          <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
            <Spinner className="mr-2" />
            A carregar contrato...
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!contrato) {
    return (
      <div className="space-y-6">
        <PageHeader title="Contrato" description="Nao foi possivel encontrar este contrato" />
        <Card className="border-destructive/30">
          <CardContent className="pt-6 text-sm text-destructive">
            {error || "Contrato nao encontrado."}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Contrato ${contrato.numero_processo || contrato.id}`}
        description={`Contrato de tutoria - ${contrato.docente?.nome_completo || "Docente"}`}
      >
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/contratos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          {contrato.estado === "rascunho" && (
            <Button variant="outline" asChild>
              <Link href={`/contratos/${contrato.id}`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
          )}
          {contrato.estado !== "rascunho" && pdfData && (
            <PdfDownloadButton contractData={pdfData} />
          )}
          {proximoEstado && (
            <Dialog open={changeStateOpen} onOpenChange={setChangeStateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Mudar Estado
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mudar Estado do Contrato</DialogTitle>
                  <DialogDescription>
                    O contrato passara de {contrato.estado} para {proximoEstado}
                  </DialogDescription>
                </DialogHeader>
                {proximoEstado === "visado" && (
                  <FieldGroup className="space-y-4">
                    <Field>
                      <FieldLabel>Data do Visto *</FieldLabel>
                      <Input
                        type="date"
                        value={vistoData.data_visto_ta}
                        onChange={(e) =>
                          setVistoData({ ...vistoData, data_visto_ta: e.target.value })
                        }
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Numero do Visto (TA) *</FieldLabel>
                      <Input
                        value={vistoData.numero_visto_ta}
                        onChange={(e) =>
                          setVistoData({ ...vistoData, numero_visto_ta: e.target.value })
                        }
                        placeholder="Ex: 12345/2026"
                        required
                      />
                    </Field>
                  </FieldGroup>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setChangeStateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleChangeState} disabled={isUpdatingState}>
                    {isUpdatingState ? "A actualizar..." : "Confirmar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </PageHeader>

      {error && (
        <Card className="border-destructive/30">
          <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Dados do Contrato</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <span className="text-sm text-muted-foreground">N Processo</span>
                  <p className="font-medium">{contrato.numero_processo || "-"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Ano Lectivo</span>
                  <p className="font-medium">{contrato.ano_lectivo}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Data do Contrato</span>
                  <p className="font-medium">
                    {new Date(contrato.data_contrato).toLocaleDateString("pt-MZ")}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Departamento</span>
                  <p className="font-medium">{contrato.departamento?.sigla || "-"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Assinante</span>
                  <p className="font-medium">
                    {[contrato.assinante?.titulo, contrato.assinante?.nome_completo].filter(Boolean).join(" ")}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <div className="mt-1">
                    <StatusBadge estado={contrato.estado} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Docente</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <span className="text-sm text-muted-foreground">Nome Completo</span>
                  <p className="font-medium">{contrato.docente?.nome_completo || "-"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Nivel Academico</span>
                  <div className="mt-1">
                    {contrato.docente ? (
                      <NivelBadge nivel={contrato.docente.nivel_academico} />
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">BI</span>
                  <p className="font-medium">{contrato.docente?.bi_numero || "-"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">NUIT</span>
                  <p className="font-medium">{contrato.docente?.nuit || "-"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Nacionalidade</span>
                  <p className="font-medium capitalize">{contrato.docente?.nacionalidade || "-"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Categoria</span>
                  <p className="font-medium">{contrato.docente?.categoria || "-"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Email</span>
                  <p className="font-medium">{contrato.docente?.email || "-"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Telefone</span>
                  <p className="font-medium">{contrato.docente?.telefone || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Cadeiras ({contrato.cadeiras?.length || 0})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Modulo</TableHead>
                    <TableHead className="text-right">Horas</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead>Semestre</TableHead>
                    <TableHead>Centro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(contrato.cadeiras ?? []).map((cc) => (
                    <TableRow key={cc.id}>
                      <TableCell className="font-medium">{cc.cadeira?.nome}</TableCell>
                      <TableCell className="text-right">
                        {cc.horas_override || cc.cadeira?.horas_contacto || 0}h
                      </TableCell>
                      <TableCell className="text-muted-foreground">{cc.cadeira?.curso}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{cc.cadeira?.ano}o</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{cc.cadeira?.semestre}</Badge>
                      </TableCell>
                      <TableCell>{cc.centro_recursos?.nome}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Resumo Financeiro</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total de Horas</span>
                <span className="font-medium">{contrato.total_horas || 0}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor/Hora</span>
                <MoneyDisplay value={contrato.valor_hora_mt || 0} />
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor Bruto</span>
                <MoneyDisplay value={contrato.valor_total_bruto || 0} className="font-medium" />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Bonus Conectividade ({contrato.bonus_conectividade_pct || 0}%)
                </span>
                <MoneyDisplay value={bonusConectividade} />
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <MoneyDisplay
                  value={(contrato.valor_total_bruto || 0) + bonusConectividade}
                  className="text-lg font-bold text-primary"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
