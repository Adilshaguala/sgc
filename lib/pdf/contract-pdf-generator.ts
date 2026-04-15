"use client"

import jsPDF from "jspdf"

export interface ContractPdfData {
  numeroProcesso: string
  dataVisto?: string
  numeroVisto?: string
  // Institution
  nomeInstituicao: string
  endereco: string
  numeroDespacho: string
  // Contratante (who signs for institution)
  contratanteTitulo: string
  contratanteNome: string
  contratanteCargo: string
  // Contratado (teacher)
  docenteNome: string
  docenteBI: string
  docenteNUIT: string
  docenteNacionalidade: string
  docenteCategoria: string
  docenteNivelAcademico: string
  // Contract details
  anoLectivo: string
  dataContrato: string
  semestre: string
  // Modules/subjects
  modulos: {
    nome: string
    horasContacto: number
    curso: string
    ano: string
    semestre: string
    centroRecursos: string
  }[]
  // Financial
  totalHoras: number
  valorHora: number
  bonusConectividadePct: number
  abonoDiaSemPernoita: number
  abonoDiaComPernoita: number
  // Optional logo
  logoUrl?: string
}

function formatMoney(value: number): string {
  return (
    value.toLocaleString("pt-MZ", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " MT"
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ]
  return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`
}

export async function generateContractPdf(data: ContractPdfData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin
  let y = margin

  // Helper functions
  const addText = (
    text: string,
    x: number,
    yPos: number,
    options?: {
      fontSize?: number
      fontStyle?: "normal" | "bold" | "italic"
      align?: "left" | "center" | "right" | "justify"
      maxWidth?: number
    }
  ) => {
    const { fontSize = 11, fontStyle = "normal", align = "left", maxWidth } = options || {}
    doc.setFontSize(fontSize)
    doc.setFont("helvetica", fontStyle)

    if (maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth)
      doc.text(lines, x, yPos, { align })
      return lines.length * (fontSize * 0.4)
    }
    doc.text(text, x, yPos, { align })
    return fontSize * 0.4
  }

  const addPageNumber = (pageNum: number) => {
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(String(pageNum), pageWidth - margin, pageHeight - 15, { align: "right" })
  }

  const checkNewPage = (neededSpace: number) => {
    if (y + neededSpace > pageHeight - 30) {
      addPageNumber(doc.getNumberOfPages())
      doc.addPage()
      y = margin
      return true
    }
    return false
  }

  // ============ PAGE 1 ============
  // Process number (top left)
  addText(data.numeroProcesso, margin, y, { fontSize: 10 })

  // Visto box (top right)
  const vistoBoxWidth = 55
  const vistoBoxHeight = 35
  const vistoBoxX = pageWidth - margin - vistoBoxWidth
  doc.setDrawColor(0)
  doc.setLineWidth(0.3)
  doc.rect(vistoBoxX, y - 5, vistoBoxWidth, vistoBoxHeight)

  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("TRIBUNAL ADMINISTRATIVO", vistoBoxX + vistoBoxWidth / 2, y + 2, { align: "center" })
  doc.text("VISTO", vistoBoxX + vistoBoxWidth / 2, y + 7, { align: "center" })
  doc.setFont("helvetica", "normal")
  doc.text("Maputo, _____ de _____ de 20__", vistoBoxX + vistoBoxWidth / 2, y + 14, { align: "center" })
  doc.text("O JUIZ CONSELHEIRO", vistoBoxX + vistoBoxWidth / 2, y + 20, { align: "center" })
  doc.text("_____________________", vistoBoxX + vistoBoxWidth / 2, y + 26, { align: "center" })

  y += vistoBoxHeight + 10

  // Logo placeholder (circle with UPM text)
  const logoSize = 20
  const logoX = pageWidth / 2
  
  // Try to load and add logo image
  if (data.logoUrl) {
    try {
      const img = new Image()
      img.crossOrigin = "anonymous"
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject()
        img.src = data.logoUrl!
      })
      doc.addImage(img, "JPEG", logoX - logoSize / 2, y, logoSize, logoSize)
    } catch {
      // Fallback to circle with text
      doc.setDrawColor(100)
      doc.circle(logoX, y + logoSize / 2, logoSize / 2)
      doc.setFontSize(8)
      doc.text("UPM", logoX, y + logoSize / 2 + 1, { align: "center" })
    }
  } else {
    // Circle with text as placeholder
    doc.setDrawColor(100)
    doc.circle(logoX, y + logoSize / 2, logoSize / 2)
    doc.setFontSize(8)
    doc.text("UPM", logoX, y + logoSize / 2 + 1, { align: "center" })
  }

  y += logoSize + 5

  // GABINETE DO REITOR
  addText("GABINETE DO REITOR", pageWidth / 2, y, { fontSize: 10, fontStyle: "bold", align: "center" })
  y += 5
  addText(data.endereco, pageWidth / 2, y, { fontSize: 8, align: "center", maxWidth: contentWidth })
  y += 15

  // TERMO DE CONTRATO
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("TERMO DE CONTRATO", pageWidth / 2, y, { align: "center" })
  // Underline
  const textWidth = doc.getTextWidth("TERMO DE CONTRATO")
  doc.setLineWidth(0.5)
  doc.line(pageWidth / 2 - textWidth / 2, y + 1, pageWidth / 2 + textWidth / 2, y + 1)
  y += 12

  // Introduction paragraph
  const introText = `Entre a ${data.nomeInstituicao}, cidade de Maputo, representada pela ${data.contratanteTitulo} ${data.contratanteNome}, no ambito da Delegacao de competencias conforme a alinea g), do no 1, do Despacho no ${data.numeroDespacho}, doravante designado por "Contratante" e o(a) ${data.docenteNome}, titular do BI no ${data.docenteBI}, NUIT no ${data.docenteNUIT}, de nacionalidade ${data.docenteNacionalidade}, doravante designado(a) por "Contratado(a)", e celebrado o presente Contrato, nos termos do Decreto no 89/99 de 28 de Dezembro que se regera pelas seguintes clausulas:`

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  const introLines = doc.splitTextToSize(introText, contentWidth)
  doc.text(introLines, margin, y, { align: "justify" })
  y += introLines.length * 5 + 10

  // Clausula Primeira
  doc.setFont("helvetica", "bold")
  doc.text("Primeira", pageWidth / 2, y, { align: "center" })
  y += 5
  doc.setFontSize(10)
  doc.text("(Objecto do contrato)", pageWidth / 2, y, { align: "center" })
  y += 7

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  const objectoText = "O presente Contrato tem por objecto a prestacao de servicos a tempo parcial como Tutor de Especialidade, no ambito da actividade do Centro de Educacao Aberta e a Distancia (CEAD), nos seguintes modulos:"
  const objectoLines = doc.splitTextToSize(objectoText, contentWidth)
  doc.text(objectoLines, margin, y)
  y += objectoLines.length * 5 + 5

  // Table header
  const colWidths = [55, 20, 35, 15, 20, 25]
  const tableX = margin
  let tableY = y

  // Draw table
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setFillColor(245, 245, 245)
  doc.rect(tableX, tableY, contentWidth, 8, "F")
  doc.setDrawColor(0)
  doc.rect(tableX, tableY, contentWidth, 8)

  let cellX = tableX
  const headers = ["Modulo", "Hora de contacto", "Curso", "Ano", "Semestre", "Centro de Recursos"]
  headers.forEach((header, i) => {
    doc.text(header, cellX + 2, tableY + 5, { maxWidth: colWidths[i] - 4 })
    if (i < headers.length - 1) {
      doc.line(cellX + colWidths[i], tableY, cellX + colWidths[i], tableY + 8)
    }
    cellX += colWidths[i]
  })
  tableY += 8

  // Table rows
  doc.setFont("helvetica", "normal")
  data.modulos.forEach((modulo) => {
    const rowHeight = 7
    doc.rect(tableX, tableY, contentWidth, rowHeight)

    cellX = tableX
    const rowData = [
      modulo.nome,
      String(modulo.horasContacto),
      modulo.curso,
      modulo.ano,
      modulo.semestre,
      modulo.centroRecursos,
    ]
    rowData.forEach((cell, i) => {
      const cellText = doc.splitTextToSize(cell, colWidths[i] - 4)
      doc.text(cellText[0] || "", cellX + 2, tableY + 4.5)
      if (i < rowData.length - 1) {
        doc.line(cellX + colWidths[i], tableY, cellX + colWidths[i], tableY + rowHeight)
      }
      cellX += colWidths[i]
    })
    tableY += rowHeight
  })

  y = tableY + 10

  // Clausula Segunda
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Segunda", pageWidth / 2, y, { align: "center" })
  y += 5
  doc.setFontSize(10)
  doc.text("(Duracao do Contrato)", pageWidth / 2, y, { align: "center" })
  y += 7

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  const duracaoText = `O presente Contrato e valido por um periodo de um ano lectivo (${data.semestre} semestre de ${data.anoLectivo}), produzindo seus efeitos a partir da data do inicio das actividades.`
  const duracaoLines = doc.splitTextToSize(duracaoText, contentWidth)
  doc.text(duracaoLines, margin, y)
  y += duracaoLines.length * 5 + 10

  // Clausula Terceira
  doc.setFont("helvetica", "bold")
  doc.text("Terceira", pageWidth / 2, y, { align: "center" })
  y += 5
  doc.setFontSize(10)
  doc.text("(Obrigacoes do/a Contratado/a)", pageWidth / 2, y, { align: "center" })
  y += 7

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text("O Contratado obriga-se a:", margin, y)
  y += 6

  const obrigacoesContratado = [
    "Leccionar os modulos para os quais foi contratado;",
    "Realizar com zelo e diligencia, lealdade e dedicacao a sua actividade, dentro dos preceitos de etica e deontologia profissional e nos termos dos regulamentos internos e das demais normas vigencia aplicaveis;",
    "Utilizar os Ambientes Virtuais de Aprendizagem (AVA) institucionais;",
    "Disponibilizar o Guia da disciplina no AVA Institucional, do modulo que tutora ate 15 dias contados a partir da data do inicio da actividade lectiva;",
    "Trabalhar em estreita colaboracao com outros intervenientes do curso e realizar todo o processo de avaliacao dos estudantes (testes, exames e trabalhos de pesquisa);",
  ]

  obrigacoesContratado.forEach((item, index) => {
    checkNewPage(15)
    const letter = String.fromCharCode(97 + index) + ")"
    doc.text(letter, margin + 5, y)
    const itemLines = doc.splitTextToSize(item, contentWidth - 15)
    doc.text(itemLines, margin + 15, y)
    y += itemLines.length * 5 + 2
  })

  addPageNumber(1)

  // ============ PAGE 2 ============
  doc.addPage()
  y = margin

  const obrigacoesContinuacao = [
    "Apresentar ao CEAD os relatorios das actividades realizadas e as respectivas pautas devidamente assinadas;",
    "Realizar pelo menos duas sessoes mensais de Video Conferencia Institucional de acordo com o Calendario do Curso;",
    "Realizar uma Tutoria Presencial correspondente a 3 horas",
    "Cumprir com as demais obrigacoes de acordo com o Calendario do Curso.",
  ]

  obrigacoesContinuacao.forEach((item, index) => {
    const letter = String.fromCharCode(102 + index) + ")"
    doc.text(letter, margin + 5, y)
    const itemLines = doc.splitTextToSize(item, contentWidth - 15)
    doc.text(itemLines, margin + 15, y)
    y += itemLines.length * 5 + 2
  })

  y += 8

  // Clausula Quarta
  doc.setFont("helvetica", "bold")
  doc.text("Quarta", pageWidth / 2, y, { align: "center" })
  y += 5
  doc.setFontSize(10)
  doc.text("(Obrigacoes do Contratante)", pageWidth / 2, y, { align: "center" })
  y += 7

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text("A contratante obriga-se a:", margin, y)
  y += 6

  const obrigacoesContratante = [
    "Proceder ao pagamento das remuneracoes a que o(a) contratado(a) tem direito, com observancia do exposto na Clausula Terceira, do presente Contrato;",
    "Criar condicoes de trabalho para que o Contratado(a) realize as actividades previstas no presente documento (disponibilizar o transporte para a tutoria presencial no Centro de Recurso fora do Campus da Lhanguene).",
  ]

  obrigacoesContratante.forEach((item, index) => {
    const letter = String.fromCharCode(97 + index) + ")"
    doc.text(letter, margin + 5, y)
    const itemLines = doc.splitTextToSize(item, contentWidth - 15)
    doc.text(itemLines, margin + 15, y)
    y += itemLines.length * 5 + 2
  })

  y += 8

  // Clausula Quinta - Remuneracao
  doc.setFont("helvetica", "bold")
  doc.text("Quinta", pageWidth / 2, y, { align: "center" })
  y += 5
  doc.setFontSize(10)
  doc.text("(Remuneracao)", pageWidth / 2, y, { align: "center" })
  y += 7

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")

  const remuneracaoItems = [
    `1. O Contratado tem direito a uma remuneracao de ${formatMoney(data.valorHora)}/hora, num total de ${data.totalHoras} horas A, de acordo com o nivel academico e experiencia profissional (${data.docenteNivelAcademico}), paga apos o visto do Tribunal Administrativo (TA).`,
    `2. O bonus de conectividade (Internet) sera correspondente a ${data.bonusConectividadePct}% das horas totais do semestre.`,
    `3. O ultimo pagamento esta condicionado a entrega de relatorios das actividades realizadas e a respectiva pauta assinada.`,
    `4. Da remuneracao a pagar serao deduzidos os devidos impostos (IRPS e Emolumentos do TA) de acordo com a legislacao em vigor.`,
    `5. Em caso de nao se verificar a disponibilizacao mensal de conteudos no AVA e interaccao por video conferencia, o tutor de especialidade estara sujeito em cada modulo aos seguintes descontos:`,
  ]

  remuneracaoItems.forEach((item) => {
    checkNewPage(15)
    const itemLines = doc.splitTextToSize(item, contentWidth - 5)
    doc.text(itemLines, margin, y)
    y += itemLines.length * 5 + 2
  })

  // Sub-items for descontos
  const descontos = [
    "S Um: Tres (3) horas correspondentes ao Guia de Disciplina;",
    "S Dois: Tres (3) horas correspondentes a Tutoria Presencial;",
    "S Tres: 50% correspondentes a disponibilizacao dos conteudos no AVA;",
    "S Quatro: 50% correspondentes a sessoes de Video Conferencia de acordo com o calendario do curso.",
  ]

  descontos.forEach((item) => {
    const itemLines = doc.splitTextToSize(item, contentWidth - 20)
    doc.text(itemLines, margin + 15, y)
    y += itemLines.length * 5 + 2
  })

  y += 5

  // Clausula Sexta
  doc.setFont("helvetica", "bold")
  doc.text("Sexta", pageWidth / 2, y, { align: "center" })
  y += 5
  doc.setFontSize(10)
  doc.text("(Abono de deslocacao)", pageWidth / 2, y, { align: "center" })
  y += 7

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")

  const abonoItems = [
    `1. A deslocacao para os Centros de Recursos, no ambito da Tutoria de Especialidade, confere ao Tutor de Especialidade o direito ao abono de ajudas de custo.`,
    `2. A deslocacao cuja natureza da missao nao exija a pernoita, e abonado o valor de ${formatMoney(data.abonoDiaSemPernoita)}/dia.`,
    `3. Em caso de pernoita, desde que se justifique, o abono e correspondente a ${formatMoney(data.abonoDiaComPernoita)}/dia.`,
  ]

  abonoItems.forEach((item) => {
    checkNewPage(12)
    const itemLines = doc.splitTextToSize(item, contentWidth - 5)
    doc.text(itemLines, margin, y)
    y += itemLines.length * 5 + 2
  })

  // Footnotes
  y += 10
  doc.setFontSize(8)
  doc.setDrawColor(200)
  doc.line(margin, y, margin + 60, y)
  y += 3
  doc.text("1 Aplicavel para os cursos com sessoes presenciais.", margin, y)
  y += 3
  doc.text("2 Consiste no pagamento de dispesas diarias.", margin, y)
  y += 3
  doc.text("3 Excepto o Centro de Recursos de Campus da Lhanguene.", margin, y)

  addPageNumber(2)

  // ============ PAGE 3 ============
  doc.addPage()
  y = margin

  // Clausula Setima
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("Setima", pageWidth / 2, y, { align: "center" })
  y += 5
  doc.setFontSize(10)
  doc.text("(Alteracoes do Contrato)", pageWidth / 2, y, { align: "center" })
  y += 7

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  const setimaText = "O presente Contrato podera ser alterado quando for conveniente para qualquer das partes, ou em consequencia de alteracoes que venham a verificar-se no correspondente condicionalismo legal."
  const setimaLines = doc.splitTextToSize(setimaText, contentWidth)
  doc.text(setimaLines, margin, y)
  y += setimaLines.length * 5 + 10

  // Clausula Oitava
  doc.setFont("helvetica", "bold")
  doc.text("Oitava", pageWidth / 2, y, { align: "center" })
  y += 5
  doc.setFontSize(10)
  doc.text("(Extincao)", pageWidth / 2, y, { align: "center" })
  y += 7

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.text("1. O presente contrato pode extinguir-se por:", margin, y)
  y += 6

  const extincaoItems = [
    "Caducidade, no caso de ter expirado o seu prazo;",
    "Morte do Contratado(a);",
    "Acordo entre as partes;",
    "Rescisao por qualquer das partes contratantes com fundamento em justa causa;",
    "Denuncia do Contrato por parte do Contratado ou da Contratante, com aviso previo de 60 dias, relativamente ao termo do contrato.",
  ]

  extincaoItems.forEach((item, index) => {
    const letter = String.fromCharCode(97 + index) + ")"
    doc.text(letter, margin + 5, y)
    const itemLines = doc.splitTextToSize(item, contentWidth - 15)
    doc.text(itemLines, margin + 15, y)
    y += itemLines.length * 5 + 2
  })

  y += 3
  doc.text("2. Constitui justa causa para a contratante:", margin, y)
  y += 6

  const justaCausaItems = [
    "Nao cumprimento dos deveres e obrigacoes pelo contratado, comprovado em processo disciplinar;",
    "Detencao ou prisao por comportamento doloso se, devido a natureza das funcoes do contratado, prejudicar o normal desempenho da sua actividade;",
    "Manifesta incompetencia comprovada;",
    "Ter sido aplicada a pena de demissao ou expulsao, quando se trate de funcionario do aparelho do Estado.",
  ]

  justaCausaItems.forEach((item, index) => {
    const letter = String.fromCharCode(97 + index) + ")"
    doc.text(letter, margin + 5, y)
    const itemLines = doc.splitTextToSize(item, contentWidth - 15)
    doc.text(itemLines, margin + 15, y)
    y += itemLines.length * 5 + 2
  })

  y += 8

  // Clausula Nona
  doc.setFont("helvetica", "bold")
  doc.text("Nona", pageWidth / 2, y, { align: "center" })
  y += 5
  doc.setFontSize(10)
  doc.text("(Anti-Corrupcao)", pageWidth / 2, y, { align: "center" })
  y += 7

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  const nonaText = "As partes e/ou os seus representantes declaram que durante o processo de seleccao, vigencia ou apos o termo do presente Contrato, nao serao oferecidos, directa ou indirectamente, vantagens a terceiros e nem solicitados, prometidos ou aceites para beneficios proprios ou de outrem, ofertas com o proposito de obter julgamento favoravel sobre os servicos a prestar."
  const nonaLines = doc.splitTextToSize(nonaText, contentWidth)
  doc.text(nonaLines, margin, y)
  y += nonaLines.length * 5 + 10

  // Clausula Decima
  doc.setFont("helvetica", "bold")
  doc.text("Decima", pageWidth / 2, y, { align: "center" })
  y += 5
  doc.setFontSize(10)
  doc.text("(Resolucao de litigio)", pageWidth / 2, y, { align: "center" })
  y += 7

  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  const decimaItems = [
    "1. Os litigios que eventualmente surgirem na interpretacao e aplicacao do presente Contrato, serao resolvidos por comum acordo das partes, segundo as regras de boa-fe e equidade.",
    "2. Na falta de acordo, o litigio sera dirimido pelo Tribunal competente para o efeito.",
  ]

  decimaItems.forEach((item) => {
    const itemLines = doc.splitTextToSize(item, contentWidth)
    doc.text(itemLines, margin, y)
    y += itemLines.length * 5 + 2
  })

  y += 15

  // Date and place
  doc.text(`Maputo, ${formatDate(data.dataContrato)}`, pageWidth / 2, y, { align: "center" })
  y += 20

  // Signatures
  const sigWidth = 70
  const sigLeftX = margin + 10
  const sigRightX = pageWidth - margin - sigWidth - 10

  doc.setFont("helvetica", "bold")
  doc.text("O CONTRATANTE", sigLeftX + sigWidth / 2, y, { align: "center" })
  doc.text("O CONTRATADO", sigRightX + sigWidth / 2, y, { align: "center" })
  y += 25

  // Signature lines
  doc.setDrawColor(0)
  doc.line(sigLeftX, y, sigLeftX + sigWidth, y)
  doc.line(sigRightX, y, sigRightX + sigWidth, y)
  y += 5

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(`${data.contratanteTitulo} ${data.contratanteNome}`, sigLeftX + sigWidth / 2, y, { align: "center" })
  doc.text(data.docenteNome, sigRightX + sigWidth / 2, y, { align: "center" })
  y += 4

  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`(${data.contratanteCargo})`, sigLeftX + sigWidth / 2, y, { align: "center" })
  doc.text(`(${data.docenteNivelAcademico})`, sigRightX + sigWidth / 2, y, { align: "center" })

  addPageNumber(3)

  return doc.output("blob")
}
