import "server-only"

import { Types } from "mongoose"
import { connectToDatabase } from "@/lib/db/mongoose"
import {
  AssinanteModel,
  CadeiraModel,
  CentroRecursosModel,
  ClausulaModel,
  ContratoModel,
  CursoModel,
  DepartamentoModel,
  DocenteModel,
  InstituicaoModel,
  TabelaSalarioModel,
} from "@/lib/db/models"

declare global {
  var __contractSeedPromise__: Promise<void> | undefined
}

const seedData = {
  instituicao: {
    nome: "Universidade Pedagogica de Maputo",
    endereco:
      "Rua Joao Carlos Raposo Beirao no 135, Caixa Postal 3276, Tel.: 21320860/2, Fax no 21322113 Maputo-Mocambique",
    telefone: "+258 21 320860",
    fax: "+258 21 322113",
    numero_despacho: "60/GR/UP-MAPUTO/010/2025",
  },
  departamentos: [
    {
      nome: "Centro de Educacao Aberta e a Distancia",
      sigla: "CEAD",
      descricao: "Centro responsavel pela educacao a distancia e programas de extensao.",
    },
    {
      nome: "Faculdade de Ciencias Naturais e Matematica",
      sigla: "FCNM",
      descricao: "Faculdade de ciencias exactas e naturais.",
    },
    {
      nome: "Faculdade de Ciencias Sociais",
      sigla: "FCS",
      descricao: "Faculdade vocacionada para as ciencias humanas e sociais.",
    },
  ],
  assinantes: [
    {
      nome_completo: "Ana Maria Santos",
      titulo: "Profa. Doutora",
      cargo: "Vice-Reitora de Administracao e Recursos",
      departamentoSigla: "CEAD",
      activo: true,
    },
    {
      nome_completo: "Jose Pedro Macamo",
      titulo: "Prof. Doutor",
      cargo: "Director do CEAD",
      departamentoSigla: "CEAD",
      activo: true,
    },
  ],
  centros: [
    { nome: "Lhanguene", is_campus_principal: true },
    { nome: "UP-Sede", is_campus_principal: false },
    { nome: "UP-Beira", is_campus_principal: false },
    { nome: "UP-Nampula", is_campus_principal: false },
    { nome: "UP-Quelimane", is_campus_principal: false },
  ],
  tabelaSalarial: [
    {
      nivel_academico: "licenciado",
      valor_hora_mt: 900,
      bonus_conectividade_pct: 25,
      abono_dia_sem_pernoita: 1800,
      abono_dia_com_pernoita: 6000,
    },
    {
      nivel_academico: "mestre",
      valor_hora_mt: 1100,
      bonus_conectividade_pct: 25,
      abono_dia_sem_pernoita: 1800,
      abono_dia_com_pernoita: 6000,
    },
    {
      nivel_academico: "doutorado",
      valor_hora_mt: 1400,
      bonus_conectividade_pct: 25,
      abono_dia_sem_pernoita: 1800,
      abono_dia_com_pernoita: 6000,
    },
  ] as const,
  cursos: [
    {
      nome: "Licenciatura em Informatica",
      duracao_anos: 3,
      centro: "Lhanguene",
    },
    {
      nome: "Licenciatura em Educacao",
      duracao_anos: 3,
      centro: "Lhanguene",
    },
    {
      nome: "Licenciatura em Psicologia",
      duracao_anos: 3,
      centro: "Lhanguene",
    },
  ] as const,
  cadeiras: [
    {
      nome: "Introducao a Programacao",
      horas_contacto: 64,
      curso: "Licenciatura em Informatica",
      ano: 1,
      semestre: "I",
    },
    {
      nome: "Estruturas de Dados",
      horas_contacto: 48,
      curso: "Licenciatura em Informatica",
      ano: 2,
      semestre: "I",
    },
    {
      nome: "Programacao Web",
      horas_contacto: 64,
      curso: "Licenciatura em Informatica",
      ano: 3,
      semestre: "II",
    },
    {
      nome: "Base de Dados",
      horas_contacto: 48,
      curso: "Licenciatura em Informatica",
      ano: 2,
      semestre: "II",
    },
    {
      nome: "Didactica Geral",
      horas_contacto: 48,
      curso: "Licenciatura em Educacao",
      ano: 1,
      semestre: "I e II",
    },
    {
      nome: "Psicologia do Desenvolvimento",
      horas_contacto: 64,
      curso: "Licenciatura em Psicologia",
      ano: 2,
      semestre: "I",
    },
  ] as const,
  docentes: [
    {
      nome_completo: "Joao Manuel Silva",
      bi_numero: "123456789M",
      nuit: "100234567",
      nivel_academico: "mestre",
      nacionalidade: "mocambicana",
      categoria: "Assistente Universitario",
      email: "joao.silva@upm.ac.mz",
      telefone: "+258 84 123 4567",
    },
    {
      nome_completo: "Maria Helena Costa",
      bi_numero: "987654321M",
      nuit: "100987654",
      nivel_academico: "doutorado",
      nacionalidade: "mocambicana",
      categoria: "Professor Associado",
      email: "maria.costa@upm.ac.mz",
      telefone: "+258 84 987 6543",
    },
    {
      nome_completo: "Pedro Antonio Nunes",
      bi_numero: "456789123M",
      nuit: "100456789",
      nivel_academico: "licenciado",
      nacionalidade: "mocambicana",
      categoria: "Monitor",
      email: "pedro.nunes@upm.ac.mz",
      telefone: "+258 84 456 7890",
    },
    {
      nome_completo: "Ana Cristina Fernandes",
      bi_numero: "789123456M",
      nuit: "100789123",
      nivel_academico: "mestre",
      nacionalidade: "mocambicana",
      categoria: "Assistente Estagiario",
      email: "ana.fernandes@upm.ac.mz",
      telefone: "+258 84 789 1234",
    },
    {
      nome_completo: "Carlos Eduardo Reis",
      bi_numero: "321654987M",
      nuit: "100321654",
      nivel_academico: "doutorado",
      nacionalidade: "mocambicana",
      categoria: "Professor Catedratico",
      email: "carlos.reis@upm.ac.mz",
      telefone: "+258 84 321 6549",
    },
  ] as const,
  clausulas: [
    {
      numero: 1,
      titulo: "Objecto do contrato",
      conteudo: "Prestacao de servicos a tempo parcial como Tutor de Especialidade.",
      activa: true,
      versao: 1,
    },
    {
      numero: 2,
      titulo: "Duracao do contrato",
      conteudo: "Vigencia de um ano lectivo, com efeitos a partir do inicio das actividades.",
      activa: true,
      versao: 1,
    },
    {
      numero: 3,
      titulo: "Remuneracao",
      conteudo: "Pagamento conforme a tabela salarial activa e o total de horas atribuido.",
      activa: true,
      versao: 1,
    },
  ],
}

function toObjectId(value: unknown) {
  return value instanceof Types.ObjectId ? value : new Types.ObjectId(String(value))
}

async function seedReferenceData() {
  await InstituicaoModel.updateOne({}, { $set: seedData.instituicao }, { upsert: true })

  for (const departamento of seedData.departamentos) {
    await DepartamentoModel.updateOne(
      { sigla: departamento.sigla },
      { $set: departamento },
      { upsert: true }
    )
  }

  const departamentos = await DepartamentoModel.find().lean()
  const departamentosBySigla = new Map(
    departamentos.map((item) => [item.sigla, item])
  )

  for (const assinante of seedData.assinantes) {
    const departamento = departamentosBySigla.get(assinante.departamentoSigla)

    await AssinanteModel.updateOne(
      { nome_completo: assinante.nome_completo, cargo: assinante.cargo },
      {
        $set: {
          nome_completo: assinante.nome_completo,
          titulo: assinante.titulo,
          cargo: assinante.cargo,
          departamento_id: departamento?._id,
          activo: assinante.activo,
        },
      },
      { upsert: true }
    )
  }

  for (const centro of seedData.centros) {
    await CentroRecursosModel.updateOne(
      { nome: centro.nome },
      { $set: centro },
      { upsert: true }
    )
  }

  for (const tabela of seedData.tabelaSalarial) {
    await TabelaSalarioModel.updateOne(
      { nivel_academico: tabela.nivel_academico },
      { $set: tabela },
      { upsert: true }
    )
  }

  for (const curso of seedData.cursos) {
    const centro = await CentroRecursosModel.findOne({ nome: curso.centro }).lean()
    if (!centro) {
      throw new Error(`Centro de recursos "${curso.centro}" nao encontrado para o curso "${curso.nome}".`)
    }

    await CursoModel.updateOne(
      { nome: curso.nome },
      {
        $set: {
          nome: curso.nome,
          duracao_anos: curso.duracao_anos,
          centro_recursos_id: centro._id,
        },
      },
      { upsert: true }
    )
  }

  const cursosAtualizados = await CursoModel.find().lean()
  const cursosAtualizadosByNome = new Map(cursosAtualizados.map((item) => [item.nome, item]))

  for (const cadeira of seedData.cadeiras) {
    const curso = cursosAtualizadosByNome.get(cadeira.curso)
    if (!curso) {
      throw new Error(`Curso "${cadeira.curso}" nao encontrado para a cadeira "${cadeira.nome}".`)
    }

    await CadeiraModel.updateOne(
      {
        nome: cadeira.nome,
        curso_id: curso._id,
        ano: cadeira.ano,
        semestre: cadeira.semestre,
      },
      {
        $set: {
          nome: cadeira.nome,
          horas_contacto: cadeira.horas_contacto,
          curso_id: curso._id,
          ano: cadeira.ano,
          semestre: cadeira.semestre,
        },
      },
      { upsert: true }
    )
  }

  for (const docente of seedData.docentes) {
    await DocenteModel.updateOne(
      { email: docente.email },
      { $set: docente },
      { upsert: true }
    )
  }

  for (const clausula of seedData.clausulas) {
    await ClausulaModel.updateOne(
      { numero: clausula.numero, versao: clausula.versao },
      { $set: clausula },
      { upsert: true }
    )
  }
}

async function seedContractsIfNeeded() {
  const existingContracts = await ContratoModel.countDocuments()

  if (existingContracts > 0) {
    return
  }

  const [docentes, assinantes, departamentos, cadeiras, centros, tabelaSalarial] = await Promise.all([
    DocenteModel.find().lean(),
    AssinanteModel.find().lean(),
    DepartamentoModel.find().lean(),
    CadeiraModel.find().lean(),
    CentroRecursosModel.find().lean(),
    TabelaSalarioModel.find().lean(),
  ])

  const docentesByEmail = new Map(docentes.map((item) => [item.email, item]))
  const assinantesByName = new Map(assinantes.map((item) => [item.nome_completo, item]))
  const departamentosBySigla = new Map(departamentos.map((item) => [item.sigla, item]))
  const cadeiraByName = new Map(cadeiras.map((item) => [item.nome, item]))
  const centroByName = new Map(centros.map((item) => [item.nome, item]))
  const salarioByNivel = new Map(
    tabelaSalarial.map((item) => [item.nivel_academico, item])
  )

  const contracts = [
    {
      numero_processo: "PRC/SC/PS/2026/298",
      docente: "joao.silva@upm.ac.mz",
      assinante: "Ana Maria Santos",
      departamento: "CEAD",
      ano_lectivo: "2026",
      data_contrato: "2026-01-15",
      estado: "visado",
      numero_visto_ta: "12345/2026",
      data_visto_ta: "2026-02-03",
      cadeiras: [
        { cadeira: "Introducao a Programacao", centro: "UP-Beira" },
        { cadeira: "Estruturas de Dados", centro: "UP-Beira" },
      ],
    },
    {
      numero_processo: "PRC/SC/PS/2026/299",
      docente: "maria.costa@upm.ac.mz",
      assinante: "Ana Maria Santos",
      departamento: "CEAD",
      ano_lectivo: "2026",
      data_contrato: "2026-01-14",
      estado: "assinado",
      cadeiras: [{ cadeira: "Programacao Web", centro: "UP-Nampula" }],
    },
    {
      numero_processo: "PRC/SC/PS/2026/300",
      docente: "pedro.nunes@upm.ac.mz",
      assinante: "Jose Pedro Macamo",
      departamento: "FCNM",
      ano_lectivo: "2026",
      data_contrato: "2026-01-13",
      estado: "gerado",
      cadeiras: [{ cadeira: "Base de Dados", centro: "UP-Sede" }],
    },
    {
      numero_processo: "PRC/SC/PS/2026/301",
      docente: "ana.fernandes@upm.ac.mz",
      assinante: "Jose Pedro Macamo",
      departamento: "CEAD",
      ano_lectivo: "2026",
      data_contrato: "2026-01-12",
      estado: "rascunho",
      cadeiras: [{ cadeira: "Didactica Geral", centro: "Lhanguene" }],
    },
    {
      numero_processo: "PRC/SC/PS/2025/245",
      docente: "carlos.reis@upm.ac.mz",
      assinante: "Ana Maria Santos",
      departamento: "FCS",
      ano_lectivo: "2025",
      data_contrato: "2025-12-20",
      estado: "arquivado",
      cadeiras: [{ cadeira: "Psicologia do Desenvolvimento", centro: "UP-Quelimane" }],
    },
  ] as const

  for (const contract of contracts) {
    const docente = docentesByEmail.get(contract.docente)
    const assinante = assinantesByName.get(contract.assinante)
    const departamento = departamentosBySigla.get(contract.departamento)

    if (!docente || !assinante || !departamento) {
      continue
    }

    const salario = salarioByNivel.get(docente.nivel_academico)

    if (!salario) {
      continue
    }

    const cadeirasPayload = contract.cadeiras
      .map((item) => {
        const cadeira = cadeiraByName.get(item.cadeira)
        const centro = centroByName.get(item.centro)

        if (!cadeira || !centro) {
          return null
        }

        return {
          _id: new Types.ObjectId(),
          cadeira_id: toObjectId(cadeira._id),
          centro_recursos_id: toObjectId(centro._id),
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)

    const totalHoras = cadeirasPayload.reduce((sum, item) => {
      const cadeira = cadeiras.find(
        (current) => String(current._id) === String(item.cadeira_id)
      )
      return sum + (cadeira?.horas_contacto ?? 0)
    }, 0)

    await ContratoModel.create({
      numero_processo: contract.numero_processo,
      docente_id: toObjectId(docente._id),
      assinante_id: toObjectId(assinante._id),
      departamento_id: toObjectId(departamento._id),
      ano_lectivo: contract.ano_lectivo,
      data_contrato: new Date(contract.data_contrato),
      total_horas: totalHoras,
      valor_hora_mt: salario.valor_hora_mt,
      valor_total_bruto: totalHoras * salario.valor_hora_mt,
      bonus_conectividade_pct: salario.bonus_conectividade_pct,
      estado: contract.estado,
      numero_visto_ta: contract.numero_visto_ta,
      data_visto_ta: contract.data_visto_ta ? new Date(contract.data_visto_ta) : undefined,
      cadeiras: cadeirasPayload,
    })
  }
}

async function seedDatabase() {
  await connectToDatabase()
  await seedReferenceData()
  await seedContractsIfNeeded()
}

export async function ensureDatabaseReady() {
  if (!global.__contractSeedPromise__) {
    global.__contractSeedPromise__ = seedDatabase()
  }

  await global.__contractSeedPromise__
}
