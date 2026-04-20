import "server-only"

import mongoose, { InferSchemaType, Model, Schema } from "mongoose"

const schemaOptions = {
  timestamps: {
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
}

const instituicaoSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    logo_url: { type: String, trim: true },
    endereco: { type: String, trim: true },
    telefone: { type: String, trim: true },
    fax: { type: String, trim: true },
    numero_despacho: { type: String, trim: true },
  },
  schemaOptions
)

const departamentoSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    sigla: { type: String, trim: true, uppercase: true },
    descricao: { type: String, trim: true },
    logo_url: { type: String, trim: true },
  },
  schemaOptions
)

const assinanteSchema = new Schema(
  {
    nome_completo: { type: String, required: true, trim: true },
    titulo: { type: String, trim: true },
    cargo: { type: String, required: true, trim: true },
    departamento_id: {
      type: Schema.Types.ObjectId,
      ref: "Departamento",
    },
    assinatura_url: { type: String, trim: true },
    activo: { type: Boolean, default: true },
  },
  schemaOptions
)

const centroRecursosSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    is_campus_principal: { type: Boolean, default: false },
  },
  schemaOptions
)

const cursoSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    duracao_anos: { type: Number, required: true, min: 1 },
    centro_recursos_id: {
      type: Schema.Types.ObjectId,
      ref: "CentroRecursos",
      required: true,
    },
  },
  schemaOptions
)

const tabelaSalarioSchema = new Schema(
  {
    nivel_academico: {
      type: String,
      enum: ["licenciado", "mestre", "doutorado"],
      required: true,
      unique: true,
    },
    valor_hora_mt: { type: Number, required: true, min: 0 },
    bonus_conectividade_pct: { type: Number, required: true, min: 0 },
    abono_dia_sem_pernoita: { type: Number, required: true, min: 0 },
    abono_dia_com_pernoita: { type: Number, required: true, min: 0 },
  },
  schemaOptions
)

const cadeiraSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true },
    horas_contacto: { type: Number, required: true, min: 0 },
    curso_id: {
      type: Schema.Types.ObjectId,
      ref: "Curso",
      required: true,
    },
    ano: { type: Number, required: true, min: 1 },
    semestre: {
      type: String,
      enum: ["I", "II", "I e II"],
      required: true,
    },
  },
  schemaOptions
)

const docenteSchema = new Schema(
  {
    nome_completo: { type: String, required: true, trim: true },
    bi_numero: {
      type: String,
      trim: true,
      index: { unique: true, sparse: true },
    },
    nuit: {
      type: String,
      trim: true,
      index: { unique: true, sparse: true },
    },
    nivel_academico: {
      type: String,
      enum: ["licenciado", "mestre", "doutorado"],
      required: true,
    },
    nacionalidade: { type: String, required: true, trim: true },
    categoria: { type: String, trim: true },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: { unique: true, sparse: true },
    },
    telefone: { type: String, trim: true },
  },
  schemaOptions
)

const contratoCadeiraSchema = new Schema(
  {
    cadeira_id: {
      type: Schema.Types.ObjectId,
      ref: "Cadeira",
      required: true,
    },
    centro_recursos_id: {
      type: Schema.Types.ObjectId,
      ref: "CentroRecursos",
      required: true,
    },
    horas_override: { type: Number, min: 0 },
  },
  {
    _id: true,
  }
)

const contratoSchema = new Schema(
  {
    numero_processo: {
      type: String,
      trim: true,
      index: { unique: true, sparse: true },
    },
    docente_id: {
      type: Schema.Types.ObjectId,
      ref: "Docente",
      required: true,
    },
    assinante_id: {
      type: Schema.Types.ObjectId,
      ref: "Assinante",
      required: true,
    },
    departamento_id: {
      type: Schema.Types.ObjectId,
      ref: "Departamento",
    },
    ano_lectivo: { type: String, required: true, trim: true },
    data_contrato: { type: Date, required: true },
    data_inicio: { type: Date },
    data_fim: { type: Date },
    total_horas: { type: Number, min: 0 },
    valor_hora_mt: { type: Number, min: 0 },
    valor_total_bruto: { type: Number, min: 0 },
    bonus_conectividade_pct: { type: Number, min: 0, default: 25 },
    estado: {
      type: String,
      enum: ["rascunho", "gerado", "assinado", "visado", "arquivado"],
      default: "rascunho",
    },
    data_visto_ta: { type: Date },
    numero_visto_ta: { type: String, trim: true },
    observacoes: { type: String, trim: true },
    cadeiras: {
      type: [contratoCadeiraSchema],
      default: [],
      validate: {
        validator: (value: unknown[]) => value.length > 0,
        message: "O contrato deve possuir pelo menos uma cadeira.",
      },
    },
  },
  schemaOptions
)

const clausulaSchema = new Schema(
  {
    numero: { type: Number, required: true, min: 1 },
    titulo: { type: String, required: true, trim: true },
    conteudo: { type: String, required: true, trim: true },
    activa: { type: Boolean, default: true },
    versao: { type: Number, default: 1, min: 1 },
  },
  schemaOptions
)

type InferModel<T extends Schema> = InferSchemaType<T>

export type InstituicaoDocument = InferModel<typeof instituicaoSchema>
export type DepartamentoDocument = InferModel<typeof departamentoSchema>
export type AssinanteDocument = InferModel<typeof assinanteSchema>
export type CentroRecursosDocument = InferModel<typeof centroRecursosSchema>
export type CursoDocument = InferModel<typeof cursoSchema>
export type TabelaSalarioDocument = InferModel<typeof tabelaSalarioSchema>
export type CadeiraDocument = InferModel<typeof cadeiraSchema>
export type DocenteDocument = InferModel<typeof docenteSchema>
export type ContratoDocument = InferModel<typeof contratoSchema>
export type ClausulaDocument = InferModel<typeof clausulaSchema>

function getModel<T>(name: string, schema: Schema): Model<T> {
  return (mongoose.models[name] as Model<T> | undefined) ?? mongoose.model<T>(name, schema)
}

export const InstituicaoModel = getModel<InstituicaoDocument>("Instituicao", instituicaoSchema)
export const DepartamentoModel = getModel<DepartamentoDocument>("Departamento", departamentoSchema)
export const AssinanteModel = getModel<AssinanteDocument>("Assinante", assinanteSchema)
export const CentroRecursosModel = getModel<CentroRecursosDocument>("CentroRecursos", centroRecursosSchema)
export const CursoModel = getModel<CursoDocument>("Curso", cursoSchema)
export const TabelaSalarioModel = getModel<TabelaSalarioDocument>("TabelaSalario", tabelaSalarioSchema)
export const CadeiraModel = getModel<CadeiraDocument>("Cadeira", cadeiraSchema)
export const DocenteModel = getModel<DocenteDocument>("Docente", docenteSchema)
export const ContratoModel = getModel<ContratoDocument>("Contrato", contratoSchema)
export const ClausulaModel = getModel<ClausulaDocument>("Clausula", clausulaSchema)
