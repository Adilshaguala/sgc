import "server-only"

import { Types } from "mongoose"
import { ensureDatabaseReady } from "@/lib/db/seed"
import {
  AssinanteModel,
  CadeiraModel,
  CentroRecursosModel,
  ContratoModel,
  CursoModel,
  DepartamentoModel,
  DocenteModel,
  InstituicaoModel,
  TabelaSalarioModel,
} from "@/lib/db/models"
import type {
  Assinante,
  Cadeira,
  CentroRecursos,
  Contrato,
  ContratoFormData,
  ContratoFormOptions,
  Curso,
  DashboardData,
  DashboardStats,
  Departamento,
  Docente,
  DocenteHistoricoItem,
  EstadoContrato,
  Instituicao,
  TabelaSalario,
} from "@/types"

export const estadoTransicoes: Record<EstadoContrato, EstadoContrato | null> = {
  rascunho: "gerado",
  gerado: "assinado",
  assinado: "visado",
  visado: "arquivado",
  arquivado: null,
}

function toObjectId(value: string) {
  if (!Types.ObjectId.isValid(value)) {
    throw new Error("Identificador invalido.")
  }

  return new Types.ObjectId(value)
}

function toId(value: unknown): string {
  if (!value) {
    return ""
  }

  if (value instanceof Types.ObjectId) {
    return value.toString()
  }

  if (typeof value === "object" && value !== null && "_id" in value) {
    return toId((value as { _id: unknown })._id)
  }

  return String(value)
}

function toDateString(value: unknown): string | undefined {
  if (!value) {
    return undefined
  }

  const date = value instanceof Date ? value : new Date(String(value))
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

function normalizeOptionalString(value?: string | null) {
  const normalized = value?.trim()
  return normalized ? normalized : undefined
}

function serializeDepartamento(doc: any): Departamento {
  return {
    id: toId(doc._id),
    nome: doc.nome,
    sigla: doc.sigla,
    descricao: doc.descricao,
    logo_url: doc.logo_url,
    created_at: toDateString(doc.created_at) ?? new Date().toISOString(),
  }
}

function serializeAssinante(doc: any): Assinante {
  const departamento =
    doc.departamento_id && typeof doc.departamento_id === "object" && "nome" in doc.departamento_id
      ? serializeDepartamento(doc.departamento_id)
      : undefined

  return {
    id: toId(doc._id),
    nome_completo: doc.nome_completo,
    titulo: doc.titulo,
    cargo: doc.cargo,
    departamento_id: departamento?.id ?? (doc.departamento_id ? toId(doc.departamento_id) : undefined),
    departamento_nome: departamento?.nome,
    departamento,
    assinatura_url: doc.assinatura_url,
    activo: Boolean(doc.activo),
    created_at: toDateString(doc.created_at) ?? new Date().toISOString(),
  }
}

function serializeCentroRecursos(doc: any): CentroRecursos {
  return {
    id: toId(doc._id),
    nome: doc.nome,
    is_campus_principal: Boolean(doc.is_campus_principal),
    created_at: toDateString(doc.created_at) ?? new Date().toISOString(),
  }
}

function serializeCurso(doc: any): Curso {
  const centro =
    doc.centro_recursos_id && typeof doc.centro_recursos_id === "object" && "nome" in doc.centro_recursos_id
      ? serializeCentroRecursos(doc.centro_recursos_id)
      : undefined

  return {
    id: toId(doc._id),
    nome: doc.nome,
    duracao_anos: doc.duracao_anos,
    centro_recursos_id: centro?.id ?? toId(doc.centro_recursos_id),
    centro_recursos: centro,
    created_at: toDateString(doc.created_at) ?? new Date().toISOString(),
  }
}

function serializeTabelaSalario(doc: any): TabelaSalario {
  return {
    id: toId(doc._id),
    nivel_academico: doc.nivel_academico,
    valor_hora_mt: doc.valor_hora_mt,
    bonus_conectividade_pct: doc.bonus_conectividade_pct,
    abono_dia_sem_pernoita: doc.abono_dia_sem_pernoita,
    abono_dia_com_pernoita: doc.abono_dia_com_pernoita,
    updated_at: toDateString(doc.updated_at ?? doc.created_at) ?? new Date().toISOString(),
  }
}

function serializeCadeira(doc: any): Cadeira {
  const curso =
    doc.curso_id && typeof doc.curso_id === "object" && "nome" in doc.curso_id
      ? serializeCurso(doc.curso_id)
      : undefined

  return {
    id: toId(doc._id),
    nome: doc.nome,
    horas_contacto: doc.horas_contacto,
    curso_id: curso?.id ?? toId(doc.curso_id),
    curso,
    ano: doc.ano,
    semestre: doc.semestre,
    created_at: toDateString(doc.created_at) ?? new Date().toISOString(),
  }
}

function serializeDocente(doc: any): Docente {
  return {
    id: toId(doc._id),
    nome_completo: doc.nome_completo,
    bi_numero: doc.bi_numero,
    nuit: doc.nuit,
    nivel_academico: doc.nivel_academico,
    nacionalidade: doc.nacionalidade,
    categoria: doc.categoria,
    email: doc.email,
    telefone: doc.telefone,
    created_at: toDateString(doc.created_at) ?? new Date().toISOString(),
  }
}

function serializeContrato(doc: any): Contrato {
  const docente =
    doc.docente_id && typeof doc.docente_id === "object" && "nome_completo" in doc.docente_id
      ? serializeDocente(doc.docente_id)
      : doc.docente

  const assinante =
    doc.assinante_id && typeof doc.assinante_id === "object" && "nome_completo" in doc.assinante_id
      ? serializeAssinante(doc.assinante_id)
      : doc.assinante

  const departamento =
    doc.departamento_id && typeof doc.departamento_id === "object" && "nome" in doc.departamento_id
      ? serializeDepartamento(doc.departamento_id)
      : doc.departamento

  const cadeiras = Array.isArray(doc.cadeiras)
    ? doc.cadeiras.map((item: any) => {
        const cadeira =
          item.cadeira_id && typeof item.cadeira_id === "object" && "nome" in item.cadeira_id
            ? serializeCadeira(item.cadeira_id)
            : item.cadeira

        const centro =
          item.centro_recursos_id &&
          typeof item.centro_recursos_id === "object" &&
          "nome" in item.centro_recursos_id
            ? serializeCentroRecursos(item.centro_recursos_id)
            : item.centro_recursos

        return {
          id: toId(item._id),
          contrato_id: toId(doc._id),
          cadeira_id: cadeira?.id ?? toId(item.cadeira_id),
          cadeira,
          centro_recursos_id: centro?.id ?? toId(item.centro_recursos_id),
          centro_recursos: centro,
          horas_override: item.horas_override ?? undefined,
          created_at: toDateString(doc.created_at) ?? new Date().toISOString(),
        }
      })
    : undefined

  return {
    id: toId(doc._id),
    numero_processo: doc.numero_processo,
    docente_id: docente?.id ?? toId(doc.docente_id),
    docente,
    assinante_id: assinante?.id ?? toId(doc.assinante_id),
    assinante,
    departamento_id: departamento?.id ?? (doc.departamento_id ? toId(doc.departamento_id) : undefined),
    departamento,
    ano_lectivo: doc.ano_lectivo,
    data_contrato: toDateString(doc.data_contrato) ?? new Date().toISOString(),
    data_inicio: toDateString(doc.data_inicio),
    data_fim: toDateString(doc.data_fim),
    total_horas: doc.total_horas,
    valor_hora_mt: doc.valor_hora_mt,
    valor_total_bruto: doc.valor_total_bruto,
    bonus_conectividade_pct: doc.bonus_conectividade_pct,
    estado: doc.estado,
    data_visto_ta: toDateString(doc.data_visto_ta),
    numero_visto_ta: doc.numero_visto_ta,
    observacoes: doc.observacoes,
    created_at: toDateString(doc.created_at) ?? new Date().toISOString(),
    updated_at: toDateString(doc.updated_at ?? doc.created_at) ?? new Date().toISOString(),
    cadeiras,
  }
}

function serializeInstituicao(doc: any): Instituicao {
  return {
    id: toId(doc._id),
    nome: doc.nome,
    logo_url: doc.logo_url,
    endereco: doc.endereco,
    telefone: doc.telefone,
    fax: doc.fax,
    numero_despacho: doc.numero_despacho,
    created_at: toDateString(doc.created_at) ?? new Date().toISOString(),
  }
}

async function getSalaryTableMap() {
  const rows = await TabelaSalarioModel.find().lean()
  return new Map(rows.map((item) => [item.nivel_academico, item]))
}

export async function listDocentes() {
  await ensureDatabaseReady()
  const docs = await DocenteModel.find().sort({ nome_completo: 1 }).lean()
  return docs.map(serializeDocente)
}

export async function getDocenteById(id: string) {
  await ensureDatabaseReady()
  const docente = await DocenteModel.findById(toObjectId(id)).lean()

  if (!docente) {
    return null
  }

  return serializeDocente(docente)
}

export async function createDocente(input: Partial<Docente>) {
  await ensureDatabaseReady()

  if (!input.nome_completo?.trim()) {
    throw new Error("Nome completo e obrigatorio.")
  }

  if (!input.nivel_academico) {
    throw new Error("Nivel academico e obrigatorio.")
  }

  const docente = await DocenteModel.create({
    nome_completo: input.nome_completo.trim(),
    bi_numero: normalizeOptionalString(input.bi_numero),
    nuit: normalizeOptionalString(input.nuit),
    nivel_academico: input.nivel_academico,
    nacionalidade: normalizeOptionalString(input.nacionalidade) ?? "mocambicana",
    categoria: normalizeOptionalString(input.categoria),
    email: normalizeOptionalString(input.email)?.toLowerCase(),
    telefone: normalizeOptionalString(input.telefone),
  })

  return serializeDocente(docente.toObject())
}

export async function updateDocente(id: string, input: Partial<Docente>) {
  await ensureDatabaseReady()

  const docente = await DocenteModel.findByIdAndUpdate(
    toObjectId(id),
    {
      $set: {
        nome_completo: input.nome_completo?.trim(),
        bi_numero: normalizeOptionalString(input.bi_numero),
        nuit: normalizeOptionalString(input.nuit),
        nivel_academico: input.nivel_academico,
        nacionalidade: normalizeOptionalString(input.nacionalidade),
        categoria: normalizeOptionalString(input.categoria),
        email: normalizeOptionalString(input.email)?.toLowerCase(),
        telefone: normalizeOptionalString(input.telefone),
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).lean()

  if (!docente) {
    throw new Error("Docente nao encontrado.")
  }

  return serializeDocente(docente)
}

export async function listAssinantes() {
  await ensureDatabaseReady()
  const docs = await AssinanteModel.find().populate("departamento_id").sort({ nome_completo: 1 }).lean()
  return docs.map(serializeAssinante)
}

export async function getAssinanteById(id: string) {
  await ensureDatabaseReady()
  const assinante = await AssinanteModel.findById(toObjectId(id)).populate("departamento_id").lean()

  if (!assinante) {
    return null
  }

  return serializeAssinante(assinante)
}

export async function createAssinante(input: Partial<Assinante>) {
  await ensureDatabaseReady()

  if (!input.nome_completo?.trim()) {
    throw new Error("Nome completo e obrigatorio.")
  }

  if (!input.cargo) {
    throw new Error("Cargo e obrigatorio.")
  }

  const assinante = await AssinanteModel.create({
    nome_completo: input.nome_completo.trim(),
    titulo: normalizeOptionalString(input.titulo),
    cargo: input.cargo,
    departamento_id: input.departamento_id ? toObjectId(input.departamento_id) : undefined,
    assinatura_url: normalizeOptionalString(input.assinatura_url),
    activo: input.activo ?? true,
  } as any)

  const populated = await AssinanteModel.findById((assinante as any)._id).populate("departamento_id").lean()
  return populated ? serializeAssinante(populated) : null
}

export async function updateAssinante(id: string, input: Partial<Assinante>) {
  await ensureDatabaseReady()

  const assinante = await AssinanteModel.findByIdAndUpdate(
    toObjectId(id),
    {
      $set: {
        nome_completo: input.nome_completo?.trim(),
        titulo: normalizeOptionalString(input.titulo),
        cargo: input.cargo,
        departamento_id: input.departamento_id ? toObjectId(input.departamento_id) : undefined,
        assinatura_url: normalizeOptionalString(input.assinatura_url),
        activo: input.activo,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate("departamento_id").lean()

  if (!assinante) {
    throw new Error("Assinante nao encontrado.")
  }

  return serializeAssinante(assinante)
}

export async function deleteAssinante(id: string) {
  await ensureDatabaseReady()

  const assinante = await AssinanteModel.findByIdAndDelete(toObjectId(id))

  if (!assinante) {
    throw new Error("Assinante nao encontrado.")
  }

  return serializeAssinante(assinante.toObject())
}

export async function listCentrosRecursos() {
  await ensureDatabaseReady()
  const docs = await CentroRecursosModel.find().sort({ nome: 1 }).lean()
  return docs.map(serializeCentroRecursos)
}

export async function getCentroRecursosById(id: string) {
  await ensureDatabaseReady()
  const centro = await CentroRecursosModel.findById(toObjectId(id)).lean()

  if (!centro) {
    return null
  }

  return serializeCentroRecursos(centro)
}

export async function createCentroRecursos(input: Partial<CentroRecursos>) {
  await ensureDatabaseReady()

  if (!input.nome?.trim()) {
    throw new Error("Nome e obrigatorio.")
  }

  const centro = await CentroRecursosModel.create({
    nome: input.nome.trim(),
    is_campus_principal: input.is_campus_principal ?? false,
  } as any)

  return serializeCentroRecursos((centro as any).toObject())
}

export async function updateCentroRecursos(id: string, input: Partial<CentroRecursos>) {
  await ensureDatabaseReady()

  const centro = await CentroRecursosModel.findByIdAndUpdate(
    toObjectId(id),
    {
      $set: {
        nome: input.nome?.trim(),
        is_campus_principal: input.is_campus_principal,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).lean()

  if (!centro) {
    throw new Error("Centro de recursos nao encontrado.")
  }

  return serializeCentroRecursos(centro)
}

export async function deleteCentroRecursos(id: string) {
  await ensureDatabaseReady()

  const centro = await CentroRecursosModel.findByIdAndDelete(toObjectId(id))

  if (!centro) {
    throw new Error("Centro de recursos nao encontrado.")
  }

  return serializeCentroRecursos(centro.toObject())
}

export async function listCursos() {
  await ensureDatabaseReady()
  const docs = await CursoModel.find().populate("centro_recursos_id").sort({ nome: 1 }).lean()
  return docs.map(serializeCurso)
}

export async function getCursoById(id: string) {
  await ensureDatabaseReady()
  const curso = await CursoModel.findById(toObjectId(id)).populate("centro_recursos_id").lean()

  if (!curso) {
    return null
  }

  return serializeCurso(curso)
}

export async function createCurso(input: Partial<Curso>) {
  await ensureDatabaseReady()

  if (!input.nome?.trim()) {
    throw new Error("Nome e obrigatorio.")
  }

  if (!input.duracao_anos || input.duracao_anos < 1) {
    throw new Error("Duracao em anos e obrigatoria e deve ser maior que 0.")
  }

  if (!input.centro_recursos_id) {
    throw new Error("Centro de recursos e obrigatorio.")
  }

  const curso = await CursoModel.create({
    nome: input.nome.trim(),
    duracao_anos: input.duracao_anos,
    centro_recursos_id: toObjectId(input.centro_recursos_id),
  } as any)

  const populated = await CursoModel.findById((curso as any)._id).populate("centro_recursos_id").lean()
  return populated ? serializeCurso(populated) : null
}

export async function updateCurso(id: string, input: Partial<Curso>) {
  await ensureDatabaseReady()

  const curso = await CursoModel.findByIdAndUpdate(
    toObjectId(id),
    {
      $set: {
        nome: input.nome?.trim(),
        duracao_anos: input.duracao_anos,
        centro_recursos_id: input.centro_recursos_id ? toObjectId(input.centro_recursos_id) : undefined,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate("centro_recursos_id").lean()

  if (!curso) {
    throw new Error("Curso nao encontrado.")
  }

  return serializeCurso(curso)
}

export async function deleteCurso(id: string) {
  await ensureDatabaseReady()

  const curso = await CursoModel.findByIdAndDelete(toObjectId(id))

  if (!curso) {
    throw new Error("Curso nao encontrado.")
  }

  return serializeCurso(curso.toObject())
}

export async function listDepartamentos() {
  await ensureDatabaseReady()
  const docs = await DepartamentoModel.find().sort({ nome: 1 }).lean()
  return docs.map(serializeDepartamento)
}

export async function getDepartamentoById(id: string) {
  await ensureDatabaseReady()
  const departamento = await DepartamentoModel.findById(toObjectId(id)).lean()

  if (!departamento) {
    return null
  }

  return serializeDepartamento(departamento)
}

export async function createDepartamento(input: Partial<Departamento>) {
  await ensureDatabaseReady()

  if (!input.nome?.trim()) {
    throw new Error("Nome e obrigatorio.")
  }

  if (!input.sigla?.trim()) {
    throw new Error("Sigla e obrigatoria.")
  }

  const departamento = await DepartamentoModel.create({
    nome: input.nome.trim(),
    sigla: input.sigla.trim(),
    descricao: normalizeOptionalString(input.descricao),
    logo_url: normalizeOptionalString(input.logo_url),
  })

  return serializeDepartamento(departamento.toObject())
}

export async function updateDepartamento(id: string, input: Partial<Departamento>) {
  await ensureDatabaseReady()

  const departamento = await DepartamentoModel.findByIdAndUpdate(
    toObjectId(id),
    {
      $set: {
        nome: input.nome?.trim(),
        sigla: input.sigla?.trim(),
        descricao: normalizeOptionalString(input.descricao),
        logo_url: normalizeOptionalString(input.logo_url),
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).lean()

  if (!departamento) {
    throw new Error("Departamento nao encontrado.")
  }

  return serializeDepartamento(departamento)
}

export async function deleteDepartamento(id: string) {
  await ensureDatabaseReady()

  const departamento = await DepartamentoModel.findByIdAndDelete(toObjectId(id))

  if (!departamento) {
    throw new Error("Departamento nao encontrado.")
  }

  return serializeDepartamento(departamento.toObject())
}

export async function updateInstituicao(input: Partial<Instituicao>) {
  await ensureDatabaseReady()

  if (!input.nome?.trim()) {
    throw new Error("Nome e obrigatorio.")
  }

  // Find existing or create new
  let instituicao = await InstituicaoModel.findOne().lean()

  if (instituicao) {
    // Update existing
    instituicao = await InstituicaoModel.findByIdAndUpdate(
      instituicao._id,
      {
        $set: {
          nome: input.nome.trim(),
          logo_url: normalizeOptionalString(input.logo_url),
          endereco: normalizeOptionalString(input.endereco),
          telefone: normalizeOptionalString(input.telefone),
          fax: normalizeOptionalString(input.fax),
          numero_despacho: normalizeOptionalString(input.numero_despacho),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean()
  } else {
    // Create new
    instituicao = (await InstituicaoModel.create({
      nome: input.nome.trim(),
      logo_url: normalizeOptionalString(input.logo_url),
      endereco: normalizeOptionalString(input.endereco),
      telefone: normalizeOptionalString(input.telefone),
      fax: normalizeOptionalString(input.fax),
      numero_despacho: normalizeOptionalString(input.numero_despacho),
    })).toObject() as any
  }

  if (!instituicao) {
    throw new Error("Nao foi possivel salvar a instituicao.")
  }

  return serializeInstituicao(instituicao)
}

export async function deleteInstituicao() {
  await ensureDatabaseReady()

  const result = await InstituicaoModel.deleteMany({})

  return result.deletedCount > 0
}

export async function createTabelaSalario(input: Partial<TabelaSalario>) {
  await ensureDatabaseReady()

  if (!input.nivel_academico) {
    throw new Error("Nivel academico e obrigatorio.")
  }

  if (input.valor_hora_mt == null || input.valor_hora_mt < 0) {
    throw new Error("Valor por hora deve ser maior ou igual a zero.")
  }

  // Check if nivel_academico already exists
  const existing = await TabelaSalarioModel.findOne({ nivel_academico: input.nivel_academico }).lean()
  if (existing) {
    throw new Error("Ja existe uma entrada para este nivel academico.")
  }

  const tabela = await TabelaSalarioModel.create({
    nivel_academico: input.nivel_academico,
    valor_hora_mt: input.valor_hora_mt,
    bonus_conectividade_pct: input.bonus_conectividade_pct ?? 0,
    abono_dia_sem_pernoita: input.abono_dia_sem_pernoita ?? 0,
    abono_dia_com_pernoita: input.abono_dia_com_pernoita ?? 0,
  } as any)

  return serializeTabelaSalario(tabela.toObject())
}

export async function updateTabelaSalario(id: string, input: Partial<TabelaSalario>) {
  await ensureDatabaseReady()

  if (input.valor_hora_mt != null && input.valor_hora_mt < 0) {
    throw new Error("Valor por hora deve ser maior ou igual a zero.")
  }

  const tabela = await TabelaSalarioModel.findByIdAndUpdate(
    toObjectId(id),
    {
      $set: {
        valor_hora_mt: input.valor_hora_mt,
        bonus_conectividade_pct: input.bonus_conectividade_pct,
        abono_dia_sem_pernoita: input.abono_dia_sem_pernoita,
        abono_dia_com_pernoita: input.abono_dia_com_pernoita,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).lean()

  if (!tabela) {
    throw new Error("Entrada da tabela salarial nao encontrada.")
  }

  return serializeTabelaSalario(tabela)
}

export async function deleteTabelaSalario(id: string) {
  await ensureDatabaseReady()

  const tabela = await TabelaSalarioModel.findByIdAndDelete(toObjectId(id))

  if (!tabela) {
    throw new Error("Entrada da tabela salarial nao encontrada.")
  }

  return serializeTabelaSalario(tabela.toObject())
}

export async function listDocenteHistorico(docenteId: string): Promise<DocenteHistoricoItem[]> {
  await ensureDatabaseReady()

  const contratos = await ContratoModel.find({
    docente_id: toObjectId(docenteId),
  } as any)
    .populate("cadeiras.cadeira_id")
    .sort({ data_contrato: -1 })
    .lean()

  return contratos.flatMap((contrato: any) =>
    (contrato.cadeiras ?? []).map((item: any) => ({
      id: toId(item._id),
      cadeira: item.cadeira_id?.nome ?? "Cadeira",
      curso: item.cadeira_id?.curso ?? "",
      ano_lectivo: contrato.ano_lectivo,
      numero_contrato: contrato.numero_processo ?? "-",
      horas: item.horas_override ?? item.cadeira_id?.horas_contacto ?? 0,
    }))
  )
}

export async function listCadeiras() {
  await ensureDatabaseReady()
  const docs = await CadeiraModel.find().populate("curso_id").lean()
  return docs
    .map(serializeCadeira)
    .sort((a, b) => {
      const cursoA = a.curso?.nome ?? ""
      const cursoB = b.curso?.nome ?? ""
      if (cursoA !== cursoB) {
        return cursoA.localeCompare(cursoB)
      }
      if (a.ano !== b.ano) {
        return a.ano - b.ano
      }
      return a.nome.localeCompare(b.nome)
    })
}

export async function createCadeira(input: Partial<Cadeira>) {
  await ensureDatabaseReady()

  if (!input.nome?.trim()) {
    throw new Error("Nome e obrigatorio.")
  }

  if (!input.horas_contacto || input.horas_contacto <= 0) {
    throw new Error("Horas de contacto devem ser maior que 0.")
  }

  if (!input.curso_id) {
    throw new Error("Curso e obrigatorio.")
  }

  if (!input.ano || input.ano < 1) {
    throw new Error("Ano e obrigatorio e deve ser maior que 0.")
  }

  if (!input.semestre) {
    throw new Error("Semestre e obrigatorio.")
  }

  const cadeira = await CadeiraModel.create({
    nome: input.nome.trim(),
    horas_contacto: input.horas_contacto,
    curso_id: toObjectId(input.curso_id),
    ano: input.ano,
    semestre: input.semestre,
  } as any)

  const populated = await CadeiraModel.findById((cadeira as any)._id).populate("curso_id").lean()
  return populated ? serializeCadeira(populated) : null
}

export async function listContratos() {
  await ensureDatabaseReady()
  const docs = await ContratoModel.find()
    .populate("docente_id")
    .sort({ data_contrato: -1, created_at: -1 })
    .lean()

  return docs.map(serializeContrato)
}

export async function getContratoById(id: string) {
  await ensureDatabaseReady()
  const contrato = await ContratoModel.findById(toObjectId(id))
    .populate("docente_id")
    .populate("assinante_id")
    .populate("departamento_id")
    .populate("cadeiras.cadeira_id")
    .populate("cadeiras.centro_recursos_id")
    .lean()

  if (!contrato) {
    return null
  }

  return serializeContrato(contrato)
}

export async function getInstituicaoActual() {
  await ensureDatabaseReady()
  const instituicao = await InstituicaoModel.findOne().lean()
  return instituicao ? serializeInstituicao(instituicao) : null
}

export async function getTabelaSalarial() {
  await ensureDatabaseReady()
  const rows = await TabelaSalarioModel.find().sort({ nivel_academico: 1 }).lean()
  return rows.map(serializeTabelaSalario)
}

export async function getContratoFormOptions(): Promise<ContratoFormOptions> {
  await ensureDatabaseReady()

  const [docentes, cadeirasRaw, centros, assinantes, departamentos, tabelaSalarial, contratos] =
    await Promise.all([
      DocenteModel.find().sort({ nome_completo: 1 }).lean(),
      CadeiraModel.find().populate("curso_id").lean(),
      CentroRecursosModel.find().sort({ nome: 1 }).lean(),
      AssinanteModel.find({ activo: true }).populate("departamento_id").sort({ nome_completo: 1 }).lean(),
      DepartamentoModel.find().sort({ nome: 1 }).lean(),
      TabelaSalarioModel.find().sort({ nivel_academico: 1 }).lean(),
      ContratoModel.find({ estado: { $ne: "rascunho" } }).select("docente_id cadeiras.cadeira_id").lean(),
    ])

  const docenteHistorico: Record<string, string[]> = {}

  for (const contrato of contratos as any[]) {
    const docenteId = toId(contrato.docente_id)

    if (!docenteHistorico[docenteId]) {
      docenteHistorico[docenteId] = []
    }

    for (const cadeira of contrato.cadeiras ?? []) {
      const cadeiraId = toId(cadeira.cadeira_id)
      if (cadeiraId && !docenteHistorico[docenteId].includes(cadeiraId)) {
        docenteHistorico[docenteId].push(cadeiraId)
      }
    }
  }

  const cadeiras = cadeirasRaw
    .map(serializeCadeira)
    .sort((a, b) => {
      const cursoA = a.curso?.nome ?? ""
      const cursoB = b.curso?.nome ?? ""
      if (cursoA !== cursoB) {
        return cursoA.localeCompare(cursoB)
      }
      if (a.ano !== b.ano) {
        return a.ano - b.ano
      }
      return a.nome.localeCompare(b.nome)
    })

  return {
    docentes: docentes.map(serializeDocente),
    cadeiras,
    centros: centros.map(serializeCentroRecursos),
    assinantes: assinantes.map(serializeAssinante),
    departamentos: departamentos.map(serializeDepartamento),
    tabelaSalarial: tabelaSalarial.map(serializeTabelaSalario),
    docenteHistorico,
  }
}

export async function createContrato(input: ContratoFormData) {
  await ensureDatabaseReady()

  if (!input.docente_id || !input.assinante_id || !input.ano_lectivo || !input.data_contrato) {
    throw new Error("Preencha os campos obrigatorios do contrato.")
  }

  if (!Array.isArray(input.cadeiras) || input.cadeiras.length === 0) {
    throw new Error("Adicione pelo menos uma cadeira ao contrato.")
  }

  const cadeiraIds = input.cadeiras.map((item) => item.cadeira_id)
  const duplicatedCadeiraIds = cadeiraIds.filter(
    (item, index) => cadeiraIds.indexOf(item) !== index
  )

  if (duplicatedCadeiraIds.length > 0) {
    throw new Error("Nao e permitido repetir a mesma cadeira no mesmo contrato.")
  }

  const [docente, assinante, departamento, cadeiras, salaryTableMap] = await Promise.all([
    DocenteModel.findById(toObjectId(input.docente_id)).lean(),
    AssinanteModel.findById(toObjectId(input.assinante_id)).lean(),
    input.departamento_id
      ? DepartamentoModel.findById(toObjectId(input.departamento_id)).lean()
      : Promise.resolve(null),
    (CadeiraModel as any).find({
      _id: { $in: input.cadeiras.map((item) => toObjectId(item.cadeira_id)) },
    }).populate("curso_id").lean(),
    getSalaryTableMap(),
  ])

  if (!docente) {
    throw new Error("Docente nao encontrado.")
  }

  if (!assinante) {
    throw new Error("Assinante nao encontrado.")
  }

  const tabela = salaryTableMap.get(docente.nivel_academico)

  if (!tabela) {
    throw new Error("Nao existe tabela salarial para o nivel academico seleccionado.")
  }

  const cadeirasById = new Map((cadeiras as any[]).map((item) => [String(item._id), item]))

  const cadeirasPayload = input.cadeiras.map((item) => {
    const cadeira = cadeirasById.get(item.cadeira_id)

    if (!cadeira) {
      throw new Error("Uma das cadeiras seleccionadas nao existe.")
    }

    if (!item.centro_recursos_id) {
      throw new Error("Centro de recursos e obrigatorio para cada cadeira do contrato.")
    }

    return {
      cadeira_id: toObjectId(item.cadeira_id),
      centro_recursos_id: toObjectId(item.centro_recursos_id),
      horas_override: item.horas_override ?? undefined,
    }
  })

  const totalHoras = input.cadeiras.reduce((sum, item) => {
    const cadeira = cadeirasById.get(item.cadeira_id)
    return sum + (item.horas_override ?? (cadeira as any)?.horas_contacto ?? 0)
  }, 0)

  const contrato = await ContratoModel.create({
    numero_processo: normalizeOptionalString(input.numero_processo),
    docente_id: toObjectId(input.docente_id),
    assinante_id: toObjectId(input.assinante_id),
    departamento_id: input.departamento_id ? toObjectId(input.departamento_id) : undefined,
    ano_lectivo: input.ano_lectivo.trim(),
    data_contrato: new Date(input.data_contrato),
    total_horas: totalHoras,
    valor_hora_mt: tabela.valor_hora_mt,
    valor_total_bruto: totalHoras * tabela.valor_hora_mt,
    bonus_conectividade_pct: tabela.bonus_conectividade_pct,
    estado: input.estado ?? "rascunho",
    cadeiras: cadeirasPayload,
  } as any)

  const populatedContrato = await ContratoModel.findById((contrato as any)._id)
    .populate("docente_id")
    .populate("assinante_id")
    .populate("departamento_id")
    .populate("cadeiras.cadeira_id")
    .populate("cadeiras.centro_recursos_id")
    .lean()

  return populatedContrato ? serializeContrato(populatedContrato) : null
}

export async function updateContratoEstado(
  id: string,
  payload: {
    estado: EstadoContrato
    data_visto_ta?: string
    numero_visto_ta?: string
  }
) {
  await ensureDatabaseReady()

  const contrato = await ContratoModel.findById(toObjectId(id)).lean()

  if (!contrato) {
    throw new Error("Contrato nao encontrado.")
  }

  const proximoEstado = estadoTransicoes[contrato.estado as EstadoContrato]

  if (payload.estado !== proximoEstado) {
    throw new Error("Transicao de estado invalida.")
  }

  if (payload.estado === "visado" && (!payload.data_visto_ta || !payload.numero_visto_ta)) {
    throw new Error("Informe a data e o numero do visto para marcar o contrato como visado.")
  }

  const updated = await ContratoModel.findByIdAndUpdate(
    toObjectId(id),
    {
      $set: {
        estado: payload.estado,
        data_visto_ta: payload.data_visto_ta ? new Date(payload.data_visto_ta) : undefined,
        numero_visto_ta: normalizeOptionalString(payload.numero_visto_ta),
      },
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("docente_id")
    .populate("assinante_id")
    .populate("departamento_id")
    .populate("cadeiras.cadeira_id")
    .populate("cadeiras.centro_recursos_id")
    .lean()

  if (!updated) {
    throw new Error("Nao foi possivel actualizar o contrato.")
  }

  return serializeContrato(updated)
}

export async function getDashboardData(): Promise<DashboardData> {
  await ensureDatabaseReady()

  const [totalContratos, contratosPendentes, docentesActivos, cadeirasCadastradas, recentContratosRaw, chartRaw] =
    await Promise.all([
      ContratoModel.countDocuments(),
      ContratoModel.countDocuments({ estado: { $in: ["gerado", "assinado"] } }),
      ContratoModel.distinct("docente_id", {
        estado: { $in: ["gerado", "assinado", "visado"] },
      }).then((items) => items.length),
      CadeiraModel.countDocuments(),
      ContratoModel.find()
        .populate("docente_id")
        .sort({ data_contrato: -1, created_at: -1 })
        .limit(10)
        .lean(),
      ContratoModel.aggregate([
        {
          $group: {
            _id: "$estado",
            count: { $sum: 1 },
          },
        },
      ]),
    ])

  const stats: DashboardStats = {
    totalContratos,
    contratosPendentes,
    docentesActivos,
    cadeirasCadastradas,
  }

  const estadoOrder: EstadoContrato[] = [
    "rascunho",
    "gerado",
    "assinado",
    "visado",
    "arquivado",
  ]

  const chartData = estadoOrder.map((estado) => {
    const entry = chartRaw.find((item) => item._id === estado)
    const label =
      estado === "rascunho"
        ? "Rascunho"
        : estado === "gerado"
        ? "Gerado"
        : estado === "assinado"
        ? "Assinado"
        : estado === "visado"
        ? "Visado"
        : "Arquivado"

    return {
      estado: label,
      count: entry?.count ?? 0,
    }
  })

  return {
    stats,
    recentContratos: recentContratosRaw.map(serializeContrato),
    chartData,
  }
}
