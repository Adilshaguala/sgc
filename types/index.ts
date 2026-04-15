// Types for CEAD/UPM Contract Management System

export interface Instituicao {
  id: string
  nome: string
  logo_url?: string
  endereco?: string
  telefone?: string
  fax?: string
  numero_despacho?: string
  created_at: string
}

export interface Departamento {
  id: string
  nome: string
  sigla?: string
  descricao?: string
  logo_url?: string
  created_at: string
}

export interface Assinante {
  id: string
  nome_completo: string
  titulo?: string
  cargo: string
  departamento_id?: string
  departamento?: Departamento
  assinatura_url?: string
  activo: boolean
  created_at: string
}

export interface CentroRecursos {
  id: string
  nome: string
  is_campus_principal: boolean
  created_at: string
}

export type NivelAcademico = 'licenciado' | 'mestre' | 'doutorado'

export interface TabelaSalario {
  id: string
  nivel_academico: NivelAcademico
  valor_hora_mt: number
  bonus_conectividade_pct: number
  abono_dia_sem_pernoita: number
  abono_dia_com_pernoita: number
  updated_at: string
}

export type Semestre = 'I' | 'II' | 'I e II'

export interface Cadeira {
  id: string
  nome: string
  horas_contacto: number
  curso: string
  ano: number
  semestre: Semestre
  created_at: string
}

export interface Docente {
  id: string
  nome_completo: string
  bi_numero?: string
  nuit?: string
  nivel_academico: NivelAcademico
  nacionalidade: string
  categoria?: string
  email?: string
  telefone?: string
  created_at: string
}

export type EstadoContrato = 'rascunho' | 'gerado' | 'assinado' | 'visado' | 'arquivado'

export interface Contrato {
  id: string
  numero_processo?: string
  docente_id: string
  docente?: Docente
  assinante_id: string
  assinante?: Assinante
  departamento_id?: string
  departamento?: Departamento
  ano_lectivo: string
  data_contrato: string
  data_inicio?: string
  data_fim?: string
  total_horas?: number
  valor_hora_mt?: number
  valor_total_bruto?: number
  estado: EstadoContrato
  data_visto_ta?: string
  numero_visto_ta?: string
  observacoes?: string
  created_at: string
  updated_at: string
  cadeiras?: ContratoCadeira[]
}

export interface ContratoCadeira {
  id: string
  contrato_id: string
  cadeira_id: string
  cadeira?: Cadeira
  centro_recursos_id?: string
  centro_recursos?: CentroRecursos
  horas_override?: number
  created_at: string
}

export interface Clausula {
  id: string
  numero: number
  titulo: string
  conteudo: string
  activa: boolean
  versao: number
  created_at: string
}

// Helper types for forms
export interface ContratoFormData {
  numero_processo: string
  docente_id: string
  assinante_id: string
  departamento_id: string
  ano_lectivo: string
  data_contrato: string
  cadeiras: {
    cadeira_id: string
    centro_recursos_id: string
    horas_override?: number
  }[]
}

// Stats for dashboard
export interface DashboardStats {
  totalContratos: number
  contratosPendentes: number
  docentesActivos: number
  cadeirasCadastradas: number
}
