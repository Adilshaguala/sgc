"use client"

import { useState } from "react"
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
import { ArrowLeft, ArrowRight, Plus, Trash2, Check, Calculator, Lightbulb } from "lucide-react"
import Link from "next/link"
import type { Docente, Cadeira, NivelAcademico } from "@/types"

// Mock data
const mockDocentes: Docente[] = [
  { id: "1", nome_completo: "Joao Manuel Silva", bi_numero: "123456789M", nuit: "100234567", nivel_academico: "mestre", nacionalidade: "mocambicana", categoria: "Assistente Universitario", email: "joao@upm.ac.mz", created_at: "" },
  { id: "2", nome_completo: "Maria Helena Costa", bi_numero: "987654321M", nuit: "100987654", nivel_academico: "doutorado", nacionalidade: "mocambicana", categoria: "Professor Associado", email: "maria@upm.ac.mz", created_at: "" },
  { id: "3", nome_completo: "Pedro Antonio Nunes", bi_numero: "456789123M", nuit: "100456789", nivel_academico: "licenciado", nacionalidade: "mocambicana", categoria: "Monitor", email: "pedro@upm.ac.mz", created_at: "" },
]

const mockCadeiras: Cadeira[] = [
  { id: "1", nome: "Introducao a Programacao", horas_contacto: 64, curso: "Licenciatura em Informatica", ano: 1, semestre: "I", created_at: "" },
  { id: "2", nome: "Estruturas de Dados", horas_contacto: 48, curso: "Licenciatura em Informatica", ano: 2, semestre: "I", created_at: "" },
  { id: "3", nome: "Programacao Web", horas_contacto: 64, curso: "Licenciatura em Informatica", ano: 3, semestre: "II", created_at: "" },
  { id: "4", nome: "Base de Dados", horas_contacto: 48, curso: "Licenciatura em Informatica", ano: 2, semestre: "II", created_at: "" },
  { id: "5", nome: "Didactica Geral", horas_contacto: 48, curso: "Licenciatura em Educacao", ano: 1, semestre: "I e II", created_at: "" },
]

const mockCentros = [
  { id: "1", nome: "Lhanguene", is_campus_principal: true },
  { id: "2", nome: "UP-Sede", is_campus_principal: false },
  { id: "3", nome: "UP-Beira", is_campus_principal: false },
  { id: "4", nome: "UP-Nampula", is_campus_principal: false },
  { id: "5", nome: "UP-Quelimane", is_campus_principal: false },
]

const mockAssinantes = [
  { id: "1", nome_completo: "Ana Maria Santos", titulo: "Profa. Doutora", cargo: "Vice-Reitora de Administracao e Recursos" },
  { id: "2", nome_completo: "Jose Pedro Macamo", titulo: "Prof. Doutor", cargo: "Director do CEAD" },
]

const mockDepartamentos = [
  { id: "1", nome: "Centro de Educacao Aberta e a Distancia", sigla: "CEAD" },
  { id: "2", nome: "Faculdade de Ciencias Naturais e Matematica", sigla: "FCNM" },
]

// Mock historical cadeiras for suggestions
const mockDocenteHistorico: Record<string, string[]> = {
  "1": ["1", "2"], // Joao already taught these cadeiras
  "2": ["3", "4"],
}

const valorPorNivel: Record<NivelAcademico, number> = {
  licenciado: 900,
  mestre: 1100,
  doutorado: 1400,
}

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
  const [addCadeiraOpen, setAddCadeiraOpen] = useState(false)

  // Step 1 data
  const [formData, setFormData] = useState({
    numero_processo: "",
    docente_id: "",
    assinante_id: "",
    departamento_id: "",
    ano_lectivo: "2026",
    data_contrato: new Date().toISOString().split("T")[0],
  })

  // Step 2 data
  const [cadeirasContrato, setCadeirasContrato] = useState<CadeiraContrato[]>([])
  const [novaCadeira, setNovaCadeira] = useState({
    cadeira_id: "",
    centro_recursos_id: "",
    horas_override: "",
  })

  const selectedDocente = mockDocentes.find((d) => d.id === formData.docente_id)
  const docenteSugestoes = selectedDocente
    ? mockDocenteHistorico[selectedDocente.id]?.map((id) =>
        mockCadeiras.find((c) => c.id === id)
      ).filter(Boolean) as Cadeira[]
    : []

  // Calculations
  const totalHoras = cadeirasContrato.reduce((sum, cc) => {
    const horas = cc.horas_override || cc.cadeira.horas_contacto
    return sum + horas
  }, 0)

  const valorHora = selectedDocente ? valorPorNivel[selectedDocente.nivel_academico] : 0
  const valorBruto = totalHoras * valorHora
  const bonusConectividade = valorBruto * 0.25

  const handleAddCadeira = () => {
    const cadeira = mockCadeiras.find((c) => c.id === novaCadeira.cadeira_id)
    const centro = mockCentros.find((c) => c.id === novaCadeira.centro_recursos_id)

    if (cadeira && centro) {
      setCadeirasContrato([
        ...cadeirasContrato,
        {
          cadeira_id: cadeira.id,
          cadeira,
          centro_recursos_id: centro.id,
          centro_recursos_nome: centro.nome,
          horas_override: novaCadeira.horas_override
            ? parseInt(novaCadeira.horas_override)
            : undefined,
        },
      ])
      setNovaCadeira({ cadeira_id: "", centro_recursos_id: "", horas_override: "" })
      setAddCadeiraOpen(false)
    }
  }

  const handleRemoveCadeira = (index: number) => {
    setCadeirasContrato(cadeirasContrato.filter((_, i) => i !== index))
  }

  const handleAddSugestao = (cadeira: Cadeira) => {
    if (!cadeirasContrato.find((cc) => cc.cadeira_id === cadeira.id)) {
      setCadeirasContrato([
        ...cadeirasContrato,
        {
          cadeira_id: cadeira.id,
          cadeira,
          centro_recursos_id: mockCentros[0].id,
          centro_recursos_nome: mockCentros[0].nome,
        },
      ])
    }
  }

  const handleSubmit = async (asSave: boolean = false) => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    router.push("/contratos")
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

      {/* Stepper */}
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

      {/* Step 1: Identification */}
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
                    {mockDocentes.map((docente) => (
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
                          <p className="font-medium">{selectedDocente.bi_numero}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">NUIT:</span>
                          <p className="font-medium">{selectedDocente.nuit}</p>
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
                    {mockAssinantes.map((assinante) => (
                      <SelectItem key={assinante.id} value={assinante.id}>
                        {assinante.titulo} {assinante.nome_completo}
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
                    {mockDepartamentos.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.sigla} - {dept.nome}
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

      {/* Step 2: Cadeiras */}
      {step === 2 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Suggestions */}
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
                      const isAdded = cadeirasContrato.some(
                        (cc) => cc.cadeira_id === cadeira.id
                      )
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

            {/* Added Cadeiras */}
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
                              {mockCadeiras.map((cadeira) => (
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
                              {mockCentros.map((centro) => (
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
                        <TableRow key={index}>
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

          {/* Financial Summary */}
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
                  <span className="text-muted-foreground">Bonus Conectividade (25%)</span>
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
              <Button
                variant="outline"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Anterior
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={cadeirasContrato.length === 0}
              >
                Proximo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
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
              {/* Contract Info */}
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

              {/* Docente Info */}
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
                      <p className="font-medium">{selectedDocente.bi_numero}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">NUIT</span>
                      <p className="font-medium">{selectedDocente.nuit}</p>
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

              {/* Cadeiras */}
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
                        <TableRow key={index}>
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

              {/* Financial Summary */}
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
