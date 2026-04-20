"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/page-header"
import { NivelBadge } from "@/components/shared/status-badge"
import { MoneyDisplay, formatMoney } from "@/components/shared/money-display"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field"
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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { ArrowLeft, ArrowRight, Plus, Trash2, Check, Calculator, Lightbulb } from "lucide-react"
import Link from "next/link"
import type { Cadeira, ContratoFormOptions, Docente, NivelAcademico } from "@/types"
import { toast } from "sonner"

interface CadeiraContrato {
  cadeira_id: string
  cadeira: Cadeira
  centro_recursos_id: string
  centro_recursos_nome: string
  horas_override?: number
}

export default function NovoContratoPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [addCadeiraOpen, setAddCadeiraOpen] = useState(false)
  const [options, setOptions] = useState<ContratoFormOptions | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    numero_processo: "",
    docente_id: "",
    assinante_id: "",
    departamento_id: "",
    ano_lectivo: String(new Date().getFullYear()),
    data_contrato: new Date().toISOString().split("T")[0],
  })

  const [cadeirasContrato, setCadeirasContrato] = useState<CadeiraContrato[]>([])
  const [novaCadeira, setNovaCadeira] = useState({
    cadeira_id: "",
    centro_recursos_id: "",
    horas_override: "",
  })

  useEffect(() => {
    let isMounted = true

    async function loadOptions() {
      try {
        const response = await fetch("/api/contratos/options")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Falha ao carregar opcoes do contrato.")
        }

        if (isMounted) {
          setOptions(data)
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Falha ao carregar opcoes do contrato.")
        }
      } finally {
        if (isMounted) {
          setIsLoadingOptions(false)
        }
      }
    }

    void loadOptions()

    return () => {
      isMounted = false
    }
  }, [])

  const selectedDocente = options?.docentes.find((docente) => docente.id === formData.docente_id)
  const docenteSugestoes = selectedDocente
    ? (options?.docenteHistorico[selectedDocente.id] ?? [])
        .map((id) => options?.cadeiras.find((cadeira) => cadeira.id === id))
        .filter(Boolean) as Cadeira[]
    : []

  const valorPorNivel = new Map(
    (options?.tabelaSalarial ?? []).map((item) => [item.nivel_academico, item])
  )

  const totalHoras = cadeirasContrato.reduce((sum, cc) => {
    const horas = cc.horas_override || cc.cadeira.horas_contacto
    return sum + horas
  }, 0)

  const tabelaDocente = selectedDocente
    ? valorPorNivel.get(selectedDocente.nivel_academico as NivelAcademico)
    : undefined
  const valorHora = tabelaDocente?.valor_hora_mt ?? 0
  const valorBruto = totalHoras * valorHora
  const bonusConectividade = valorBruto * ((tabelaDocente?.bonus_conectividade_pct ?? 0) / 100)

  const handleAddCadeira = () => {
    const cadeira = options?.cadeiras.find((item) => item.id === novaCadeira.cadeira_id)
    const centro = options?.centros.find((item) => item.id === novaCadeira.centro_recursos_id)

    if (!cadeira || !centro) {
      return
    }

    setCadeirasContrato([
      ...cadeirasContrato,
      {
        cadeira_id: cadeira.id,
        cadeira,
        centro_recursos_id: centro.id,
        centro_recursos_nome: centro.nome,
        horas_override: novaCadeira.horas_override
          ? parseInt(novaCadeira.horas_override, 10)
          : undefined,
      },
    ])
    setNovaCadeira({ cadeira_id: "", centro_recursos_id: "", horas_override: "" })
    setAddCadeiraOpen(false)
  }

  const handleRemoveCadeira = (index: number) => {
    setCadeirasContrato(cadeirasContrato.filter((_, currentIndex) => currentIndex !== index))
  }

  const handleAddSugestao = (cadeira: Cadeira) => {
    const centroPrincipal = options?.centros.find((item) => item.is_campus_principal) ?? options?.centros[0]

    if (!centroPrincipal || cadeirasContrato.find((item) => item.cadeira_id === cadeira.id)) {
      return
    }

    setCadeirasContrato([
      ...cadeirasContrato,
      {
        cadeira_id: cadeira.id,
        cadeira,
        centro_recursos_id: centroPrincipal.id,
        centro_recursos_nome: centroPrincipal.nome,
      },
    ])
  }

  const handleSubmit = async (asSave: boolean = false) => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contratos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          estado: asSave ? "rascunho" : "gerado",
          cadeiras: cadeirasContrato.map((cadeira) => ({
            cadeira_id: cadeira.cadeira_id,
            centro_recursos_id: cadeira.centro_recursos_id,
            horas_override: cadeira.horas_override,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Falha ao guardar contrato.")
      }

      toast.success(asSave ? "Contrato guardado como rascunho." : "Contrato criado com sucesso.")
      router.push(`/contratos/${data.id}`)
      router.refresh()
    } catch (submitError) {
      toast.error(submitError instanceof Error ? submitError.message : "Falha ao guardar contrato.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingOptions) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Novo Contrato"
          description="Criar um novo contrato de tutoria"
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
            A carregar opcoes do contrato...
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Contrato"
        description="Criar um novo contrato de tutoria"
      >
        <Button variant="outline" asChild>
          <Link href="/contratos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </PageHeader>

      {error && (
        <Card className="border-destructive/30">
          <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step === s
                  ? "bg-primary text-primary-foreground"
                  : step > s
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s ? <Check className="h-4 w-4" /> : s}
            </div>
            <span className={`text-sm ${step === s ? "font-medium" : "text-muted-foreground"}`}>
              {s === 1 ? "Identificacao" : s === 2 ? "Cadeiras" : "Revisao"}
            </span>
            {s < 3 && <Separator className="w-12" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Identificacao do Contrato</CardTitle>
            <CardDescription>
              Defina os dados basicos do contrato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid gap-6 sm:grid-cols-2">
              <Field>
                <FieldLabel>Numero de Processo</FieldLabel>
                <Input
                  value={formData.numero_processo}
                  onChange={(e) =>
                    setFormData({ ...formData, numero_processo: e.target.value })
                  }
                  placeholder="Ex: PRC/SC/PS/2026/298"
                />
                <FieldDescription>
                  Numero de identificacao do processo
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Ano Lectivo *</FieldLabel>
                <Input
                  value={formData.ano_lectivo}
                  onChange={(e) =>
                    setFormData({ ...formData, ano_lectivo: e.target.value })
                  }
                  placeholder="2026"
                  required
                />
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel>Docente *</FieldLabel>
                <Select
                  value={formData.docente_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, docente_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione o docente" />
                  </SelectTrigger>
                  <SelectContent>
                    {options?.docentes.map((docente) => (
                      <SelectItem key={docente.id} value={docente.id}>
                        {docente.nome_completo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {selectedDocente && (
                <div className="sm:col-span-2">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="grid gap-2 text-sm sm:grid-cols-4">
                        <div>
                          <span className="text-muted-foreground">Nome:</span>
                          <p className="font-medium">{selectedDocente.nome_completo}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">BI:</span>
                          <p className="font-medium">{selectedDocente.bi_numero || "-"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">NUIT:</span>
                          <p className="font-medium">{selectedDocente.nuit || "-"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Nivel:</span>
                          <div className="mt-1">
                            <NivelBadge nivel={selectedDocente.nivel_academico} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Field>
                <FieldLabel>Assinante *</FieldLabel>
                <Select
                  value={formData.assinante_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, assinante_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione o assinante" />
                  </SelectTrigger>
                  <SelectContent>
                    {options?.assinantes.map((assinante) => (
                      <SelectItem key={assinante.id} value={assinante.id}>
                        {[assinante.titulo, assinante.nome_completo].filter(Boolean).join(" ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Departamento</FieldLabel>
                <Select
                  value={formData.departamento_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, departamento_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {options?.departamentos.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {[dept.sigla, dept.nome].filter(Boolean).join(" - ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Data do Contrato *</FieldLabel>
                <Input
                  type="date"
                  value={formData.data_contrato}
                  onChange={(e) =>
                    setFormData({ ...formData, data_contrato: e.target.value })
                  }
                  required
                />
              </Field>
            </FieldGroup>

            <div className="mt-8 flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!formData.docente_id || !formData.assinante_id}
              >
                Proximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {docenteSugestoes.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <CardTitle className="text-base">Sugestoes</CardTitle>
                  </div>
                  <CardDescription>
                    Cadeiras que o docente ja leccionou anteriormente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {docenteSugestoes.map((cadeira) => {
                      const isAdded = cadeirasContrato.some((cc) => cc.cadeira_id === cadeira.id)
                      return (
                        <Button
                          key={cadeira.id}
                          variant={isAdded ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => handleAddSugestao(cadeira)}
                          disabled={isAdded}
                        >
                          {isAdded && <Check className="mr-1 h-3 w-3" />}
                          {cadeira.nome}
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Cadeiras do Contrato</CardTitle>
                    <CardDescription>
                      Adicione as cadeiras que farao parte deste contrato
                    </CardDescription>
                  </div>
                  <Dialog open={addCadeiraOpen} onOpenChange={setAddCadeiraOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Cadeira
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Cadeira</DialogTitle>
                        <DialogDescription>
                          Seleccione a cadeira e o centro de recursos
                        </DialogDescription>
                      </DialogHeader>
                      <FieldGroup className="space-y-4">
                        <Field>
                          <FieldLabel>Cadeira *</FieldLabel>
                          <Select
                            value={novaCadeira.cadeira_id}
                            onValueChange={(value) =>
                              setNovaCadeira({ ...novaCadeira, cadeira_id: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione a cadeira" />
                            </SelectTrigger>
                            <SelectContent>
                              {options?.cadeiras.map((cadeira) => (
                                <SelectItem key={cadeira.id} value={cadeira.id}>
                                  {cadeira.nome} ({cadeira.horas_contacto}h)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field>
                          <FieldLabel>Centro de Recursos *</FieldLabel>
                          <Select
                            value={novaCadeira.centro_recursos_id}
                            onValueChange={(value) =>
                              setNovaCadeira({ ...novaCadeira, centro_recursos_id: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione o centro" />
                            </SelectTrigger>
                            <SelectContent>
                              {options?.centros.map((centro) => (
                                <SelectItem key={centro.id} value={centro.id}>
                                  {centro.nome}
                                  {centro.is_campus_principal && " (Campus Principal)"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field>
                          <FieldLabel>Horas (Override)</FieldLabel>
                          <Input
                            type="number"
                            value={novaCadeira.horas_override}
                            onChange={(e) =>
                              setNovaCadeira({ ...novaCadeira, horas_override: e.target.value })
                            }
                            placeholder="Deixe vazio para usar o padrao"
                          />
                          <FieldDescription>
                            Opcional: substitui as horas padrao da cadeira
                          </FieldDescription>
                        </Field>
                      </FieldGroup>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setAddCadeiraOpen(false)}>
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleAddCadeira}
                          disabled={!novaCadeira.cadeira_id || !novaCadeira.centro_recursos_id}
                        >
                          Adicionar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {cadeirasContrato.length === 0 ? (
                  <div className="flex h-32 items-center justify-center text-muted-foreground">
                    Nenhuma cadeira adicionada
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Modulo</TableHead>
                        <TableHead className="text-right">Horas</TableHead>
                        <TableHead>Curso</TableHead>
                        <TableHead>Ano</TableHead>
                        <TableHead>Semestre</TableHead>
                        <TableHead>Centro</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cadeirasContrato.map((cc, index) => (
                        <TableRow key={`${cc.cadeira_id}-${index}`}>
                          <TableCell className="font-medium">{cc.cadeira.nome}</TableCell>
                          <TableCell className="text-right">
                            {cc.horas_override || cc.cadeira.horas_contacto}h
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {cc.cadeira.curso}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{cc.cadeira.ano}o</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{cc.cadeira.semestre}</Badge>
                          </TableCell>
                          <TableCell>{cc.centro_recursos_nome}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleRemoveCadeira(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Resumo Financeiro</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de Horas</span>
                  <span className="font-medium">{totalHoras}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor/Hora</span>
                  <MoneyDisplay value={valorHora} />
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor Bruto</span>
                  <MoneyDisplay value={valorBruto} className="font-medium" />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Bonus Conectividade ({tabelaDocente?.bonus_conectividade_pct ?? 0}%)
                  </span>
                  <MoneyDisplay value={bonusConectividade} />
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-medium">Total</span>
                  <MoneyDisplay
                    value={valorBruto + bonusConectividade}
                    className="text-lg font-bold text-primary"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <Button onClick={() => setStep(3)} disabled={cadeirasContrato.length === 0}>
                Proximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revisao do Contrato</CardTitle>
              <CardDescription>
                Verifique os dados antes de guardar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 font-medium">Informacoes do Contrato</h3>
                <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-3">
                  <div>
                    <span className="text-sm text-muted-foreground">N Processo</span>
                    <p className="font-medium">{formData.numero_processo || "Nao definido"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Ano Lectivo</span>
                    <p className="font-medium">{formData.ano_lectivo}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Data do Contrato</span>
                    <p className="font-medium">
                      {new Date(formData.data_contrato).toLocaleDateString("pt-MZ")}
                    </p>
                  </div>
                </div>
              </div>

              {selectedDocente && (
                <div>
                  <h3 className="mb-3 font-medium">Docente</h3>
                  <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Nome</span>
                      <p className="font-medium">{selectedDocente.nome_completo}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">BI</span>
                      <p className="font-medium">{selectedDocente.bi_numero || "-"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">NUIT</span>
                      <p className="font-medium">{selectedDocente.nuit || "-"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Nivel</span>
                      <div className="mt-1">
                        <NivelBadge nivel={selectedDocente.nivel_academico} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-3 font-medium">Cadeiras ({cadeirasContrato.length})</h3>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Modulo</TableHead>
                        <TableHead className="text-right">Horas</TableHead>
                        <TableHead>Curso</TableHead>
                        <TableHead>Centro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cadeirasContrato.map((cc, index) => (
                        <TableRow key={`${cc.cadeira_id}-${index}`}>
                          <TableCell className="font-medium">{cc.cadeira.nome}</TableCell>
                          <TableCell className="text-right">
                            {cc.horas_override || cc.cadeira.horas_contacto}h
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {cc.cadeira.curso}
                          </TableCell>
                          <TableCell>{cc.centro_recursos_nome}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-medium">Resumo Financeiro</h3>
                <div className="grid gap-4 rounded-lg border bg-muted/50 p-4 sm:grid-cols-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Total Horas</span>
                    <p className="text-xl font-bold">{totalHoras}h</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Valor/Hora</span>
                    <p className="text-xl font-bold">{formatMoney(valorHora)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Valor Bruto</span>
                    <p className="text-xl font-bold">{formatMoney(valorBruto)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Total c/ Bonus</span>
                    <p className="text-xl font-bold text-primary">
                      {formatMoney(valorBruto + bonusConectividade)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
              >
                Guardar como Rascunho
              </Button>
              <Button onClick={() => handleSubmit(false)} disabled={isSubmitting}>
                {isSubmitting ? "A guardar..." : "Guardar e Gerar PDF"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
