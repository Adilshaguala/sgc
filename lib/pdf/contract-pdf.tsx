import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer"

// Register fonts for better typography
Font.register({
  family: "Times",
  fonts: [
    { src: "https://fonts.gstatic.com/s/timesnewroman/v15/rU0T4X2dC4nT0a7mPb5NN7g.ttf" },
    {
      src: "https://fonts.gstatic.com/s/timesnewroman/v15/rU0T4X2dC4nT0a7mPb5NN7g.ttf",
      fontWeight: "bold",
    },
  ],
})

// Styles based on the contract template
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 50,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  processNumber: {
    fontSize: 10,
  },
  vistoBox: {
    border: 1,
    borderColor: "#000",
    padding: 8,
    width: 180,
    alignItems: "center",
  },
  vistoTitle: {
    fontSize: 9,
    fontWeight: "bold",
  },
  vistoText: {
    fontSize: 9,
    marginTop: 2,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  logo: {
    width: 60,
    height: 60,
  },
  gabineteText: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,
  },
  subHeader: {
    fontSize: 8,
    textAlign: "center",
    color: "#444",
    marginBottom: 20,
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    textDecoration: "underline",
  },
  paragraph: {
    textAlign: "justify",
    marginBottom: 12,
  },
  clauseTitle: {
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 15,
    marginBottom: 5,
  },
  clauseSubtitle: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 10,
  },
  table: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableRowLast: {
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
    fontWeight: "bold",
  },
  tableCell: {
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: "#000",
    fontSize: 9,
  },
  tableCellLast: {
    padding: 5,
    fontSize: 9,
  },
  tableCellModule: {
    width: "30%",
  },
  tableCellHours: {
    width: "12%",
    textAlign: "center",
  },
  tableCellCourse: {
    width: "22%",
    textAlign: "center",
  },
  tableCellYear: {
    width: "8%",
    textAlign: "center",
  },
  tableCellSemester: {
    width: "12%",
    textAlign: "center",
  },
  tableCellCenter: {
    width: "16%",
    textAlign: "center",
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 5,
    paddingLeft: 20,
  },
  listLetter: {
    width: 20,
  },
  listText: {
    flex: 1,
    textAlign: "justify",
  },
  numberedItem: {
    flexDirection: "row",
    marginBottom: 5,
  },
  itemNumber: {
    width: 20,
  },
  subItem: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 30,
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    paddingHorizontal: 30,
  },
  signatureBlock: {
    alignItems: "center",
    width: "45%",
  },
  signatureTitle: {
    fontWeight: "bold",
    marginBottom: 30,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    width: "100%",
    marginTop: 5,
  },
  signatureName: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 5,
  },
  signatureCargo: {
    fontSize: 9,
    textAlign: "center",
    color: "#444",
  },
  pageNumber: {
    position: "absolute",
    fontSize: 10,
    bottom: 30,
    right: 50,
  },
  footer: {
    position: "absolute",
    fontSize: 8,
    bottom: 20,
    left: 50,
    right: 50,
  },
  footnote: {
    fontSize: 8,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 5,
  },
  bold: {
    fontWeight: "bold",
  },
  datePlace: {
    textAlign: "center",
    marginTop: 30,
    marginBottom: 20,
  },
})

// Contract data types
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
  // Clauses
  clausulas: {
    numero: string
    titulo: string
    subtitulo: string
    conteudo: string
    items?: string[]
    subItems?: { item: string; subItems: string[] }[]
  }[]
}

function formatMoney(value: number): string {
  return value.toLocaleString("pt-MZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " MT"
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]
  return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`
}

// Page 1 - Header and Object
function PageOne({ data }: { data: ContractPdfData }) {
  return (
    <Page size="A4" style={styles.page}>
      {/* Header with process number and visto box */}
      <View style={styles.header}>
        <Text style={styles.processNumber}>{data.numeroProcesso}</Text>
        <View style={styles.vistoBox}>
          <Text style={styles.vistoTitle}>TRIBUNAL ADMINISTRATIVO</Text>
          <Text style={styles.vistoTitle}>VISTO</Text>
          <Text style={styles.vistoText}>
            Maputo, _____ de _____ de 20__
          </Text>
          <Text style={styles.vistoText}>O JUIZ CONSELHEIRO</Text>
          <Text style={styles.vistoText}>_____________________</Text>
        </View>
      </View>

      {/* Logo and institution */}
      <View style={styles.logoContainer}>
        <View style={{
          width: 50,
          height: 50,
          borderWidth: 1,
          borderColor: "#666",
          borderRadius: 25,
          justifyContent: "center",
          alignItems: "center",
        }}>
          <Text style={{ fontSize: 8 }}>UPM</Text>
        </View>
        <Text style={styles.gabineteText}>GABINETE DO REITOR</Text>
        <Text style={styles.subHeader}>{data.endereco}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>TERMO DE CONTRATO</Text>

      {/* Introduction paragraph */}
      <Text style={styles.paragraph}>
        Entre a <Text style={styles.bold}>{data.nomeInstituicao}</Text>, cidade de Maputo, representada pela{" "}
        <Text style={styles.bold}>{data.contratanteTitulo} {data.contratanteNome}</Text>, no ambito da Delegacao de 
        competencias conforme a alinea g), do no 1, do Despacho no {data.numeroDespacho}, doravante designado por 
        "Contratante" e o(a) <Text style={styles.bold}>{data.docenteNome}</Text>, titular do BI no{" "}
        <Text style={styles.bold}>{data.docenteBI}</Text>, NUIT no <Text style={styles.bold}>{data.docenteNUIT}</Text>, 
        de nacionalidade {data.docenteNacionalidade}, doravante designado(a) por "Contratado(a)", e celebrado o presente 
        Contrato, nos termos do Decreto no 89/99 de 28 de Dezembro que se regera pelas seguintes clausulas:
      </Text>

      {/* Clausula Primeira - Object */}
      <Text style={styles.clauseTitle}>Primeira</Text>
      <Text style={styles.clauseSubtitle}>(Objecto do contrato)</Text>
      <Text style={styles.paragraph}>
        O presente Contrato tem por objecto a prestacao de servicos a tempo parcial como Tutor de 
        Especialidade, no ambito da actividade do Centro de Educacao Aberta e a Distancia (CEAD), nos 
        seguintes modulos:
      </Text>

      {/* Modules table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.tableCellModule]}>Modulo</Text>
          <Text style={[styles.tableCell, styles.tableCellHours]}>Hora de contacto</Text>
          <Text style={[styles.tableCell, styles.tableCellCourse]}>Curso</Text>
          <Text style={[styles.tableCell, styles.tableCellYear]}>Ano</Text>
          <Text style={[styles.tableCell, styles.tableCellSemester]}>Semestre</Text>
          <Text style={[styles.tableCellLast, styles.tableCellCenter]}>Centro de Recursos</Text>
        </View>
        {data.modulos.map((modulo, index) => (
          <View 
            key={index} 
            style={index === data.modulos.length - 1 ? styles.tableRowLast : styles.tableRow}
          >
            <Text style={[styles.tableCell, styles.tableCellModule]}>{modulo.nome}</Text>
            <Text style={[styles.tableCell, styles.tableCellHours]}>{modulo.horasContacto}</Text>
            <Text style={[styles.tableCell, styles.tableCellCourse]}>{modulo.curso}</Text>
            <Text style={[styles.tableCell, styles.tableCellYear]}>{modulo.ano}</Text>
            <Text style={[styles.tableCell, styles.tableCellSemester]}>{modulo.semestre}</Text>
            <Text style={[styles.tableCellLast, styles.tableCellCenter]}>{modulo.centroRecursos}</Text>
          </View>
        ))}
      </View>

      {/* Clausula Segunda - Duration */}
      <Text style={styles.clauseTitle}>Segunda</Text>
      <Text style={styles.clauseSubtitle}>(Duracao do Contrato)</Text>
      <Text style={styles.paragraph}>
        O presente Contrato e valido por um periodo de um ano lectivo ({data.semestre} semestre de {data.anoLectivo}), 
        produzindo seus efeitos a partir da data do inicio das actividades.
      </Text>

      {/* Clausula Terceira - Obligations */}
      <Text style={styles.clauseTitle}>Terceira</Text>
      <Text style={styles.clauseSubtitle}>(Obrigacoes do/a Contratado/a)</Text>
      <Text style={styles.paragraph}>O Contratado obriga-se a:</Text>
      
      {[
        "Leccionar os modulos para os quais foi contratado;",
        "Realizar com zelo e diligencia, lealdade e dedicacao a sua actividade, dentro dos preceitos de etica e deontologia profissional e nos termos dos regulamentos internos e das demais normas vigencia aplicaveis;",
        "Utilizar os Ambientes Virtuais de Aprendizagem (AVA) institucionais;",
        "Disponibilizar o Guia da disciplina no AVA Institucional, do modulo que tutora ate 15 dias contados a partir da data do inicio da actividade lectiva;",
        "Trabalhar em estreita colaboracao com outros intervenientes do curso e realizar todo o processo de avaliacao dos estudantes (testes, exames e trabalhos de pesquisa);",
      ].map((item, index) => (
        <View key={index} style={styles.listItem}>
          <Text style={styles.listLetter}>{String.fromCharCode(97 + index)})</Text>
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}

      <Text style={styles.pageNumber}>1</Text>
    </Page>
  )
}

// Page 2 - More obligations, remuneration
function PageTwo({ data }: { data: ContractPdfData }) {
  const totalBruto = data.totalHoras * data.valorHora
  const bonusConectividade = totalBruto * (data.bonusConectividadePct / 100)

  return (
    <Page size="A4" style={styles.page}>
      {/* Continue obligations */}
      {[
        "Apresentar ao CEAD os relatorios das actividades realizadas e as respectivas pautas devidamente assinadas;",
        "Realizar pelo menos duas sessoes mensais de Video Conferencia Institucional de acordo com o Calendario do Curso;",
        "Realizar uma Tutoria Presencial correspondente a 3 horas",
        "Cumprir com as demais obrigacoes de acordo com o Calendario do Curso.",
      ].map((item, index) => (
        <View key={index} style={styles.listItem}>
          <Text style={styles.listLetter}>{String.fromCharCode(102 + index)})</Text>
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}

      {/* Clausula Quarta */}
      <Text style={styles.clauseTitle}>Quarta</Text>
      <Text style={styles.clauseSubtitle}>(Obrigacoes do Contratante)</Text>
      <Text style={styles.paragraph}>A contratante obriga-se a:</Text>
      
      <View style={styles.listItem}>
        <Text style={styles.listLetter}>a)</Text>
        <Text style={styles.listText}>
          Proceder ao pagamento das remuneracoes a que o(a) contratado(a) tem direito, com observancia do 
          exposto na Clausula Terceira, do presente Contrato;
        </Text>
      </View>
      <View style={styles.listItem}>
        <Text style={styles.listLetter}>b)</Text>
        <Text style={styles.listText}>
          Criar condicoes de trabalho para que o Contratado(a) realize as actividades previstas no presente 
          documento (disponibilizar o transporte para a tutoria presencial no Centro de Recurso fora do{" "}
          <Text style={{ fontStyle: "italic" }}>Campus</Text> da Lhanguene).
        </Text>
      </View>

      {/* Clausula Quinta - Remuneracao */}
      <Text style={styles.clauseTitle}>Quinta</Text>
      <Text style={styles.clauseSubtitle}>(Remuneracao)</Text>
      
      <View style={styles.numberedItem}>
        <Text style={styles.itemNumber}>1.</Text>
        <Text style={[styles.listText, { flex: 1 }]}>
          O Contratado tem direito a uma remuneracao de{" "}
          <Text style={styles.bold}>{formatMoney(data.valorHora)}/hora</Text>, num total de{" "}
          <Text style={styles.bold}>{data.totalHoras} horas A</Text>, de acordo com o nivel academico e 
          experiencia profissional ({data.docenteNivelAcademico}), paga apos o visto do Tribunal 
          Administrativo (TA).
        </Text>
      </View>
      
      <View style={styles.numberedItem}>
        <Text style={styles.itemNumber}>2.</Text>
        <Text style={[styles.listText, { flex: 1 }]}>
          O bonus de conectividade (Internet) sera correspondente a {data.bonusConectividadePct}% das horas 
          totais do semestre.
        </Text>
      </View>
      
      <View style={styles.numberedItem}>
        <Text style={styles.itemNumber}>3.</Text>
        <Text style={[styles.listText, { flex: 1 }]}>
          O ultimo pagamento esta condicionado a entrega de relatorios das actividades realizadas e a 
          respectiva pauta assinada.
        </Text>
      </View>
      
      <View style={styles.numberedItem}>
        <Text style={styles.itemNumber}>4.</Text>
        <Text style={[styles.listText, { flex: 1 }]}>
          Da remuneracao a pagar serao deduzidos os devidos impostos (IRPS e Emolumentos do TA) de acordo 
          com a legislacao em vigor.
        </Text>
      </View>
      
      <View style={styles.numberedItem}>
        <Text style={styles.itemNumber}>5.</Text>
        <Text style={[styles.listText, { flex: 1 }]}>
          Em caso de nao se verificar a disponibilizacao mensal de conteudos no AVA e interaccao por video 
          conferencia, o tutor de especialidade estara sujeito em cada modulo aos seguintes descontos:
        </Text>
      </View>
      
      <View style={styles.subItem}>
        <Text style={styles.listLetter}>S <Text style={{ fontStyle: "italic" }}>Um</Text>:</Text>
        <Text style={[styles.listText, { marginLeft: 5 }]}>
          Tres (3) horas correspondentes ao Guia de Disciplina;
        </Text>
      </View>
      <View style={styles.subItem}>
        <Text style={styles.listLetter}>S <Text style={{ fontStyle: "italic" }}>Dois</Text>:</Text>
        <Text style={[styles.listText, { marginLeft: 5 }]}>
          Tres (3) horas correspondentes a Tutoria Presencial;
        </Text>
      </View>
      <View style={styles.subItem}>
        <Text style={styles.listLetter}>S <Text style={{ fontStyle: "italic" }}>Tres</Text>:</Text>
        <Text style={[styles.listText, { marginLeft: 5 }]}>
          50% correspondentes a disponibilizacao dos conteudos no AVA;
        </Text>
      </View>
      <View style={styles.subItem}>
        <Text style={styles.listLetter}>S <Text style={{ fontStyle: "italic" }}>Quatro</Text>:</Text>
        <Text style={[styles.listText, { marginLeft: 5 }]}>
          50% correspondentes a sessoes de Video Conferencia de acordo com o calendario do curso.
        </Text>
      </View>

      {/* Clausula Sexta */}
      <Text style={styles.clauseTitle}>Sexta</Text>
      <Text style={styles.clauseSubtitle}>(Abono de deslocacao)</Text>
      
      <View style={styles.numberedItem}>
        <Text style={styles.itemNumber}>1.</Text>
        <Text style={[styles.listText, { flex: 1 }]}>
          A deslocacao para os Centros de Recursos, no ambito da Tutoria de Especialidade, confere ao 
          Tutor de Especialidade o direito ao abono de ajudas de custo.
        </Text>
      </View>
      
      <View style={styles.numberedItem}>
        <Text style={styles.itemNumber}>2.</Text>
        <Text style={[styles.listText, { flex: 1 }]}>
          A deslocacao cuja natureza da missao nao exija a pernoita, e abonado o valor de{" "}
          <Text style={styles.bold}>{formatMoney(data.abonoDiaSemPernoita)}/dia</Text>.
        </Text>
      </View>
      
      <View style={styles.numberedItem}>
        <Text style={styles.itemNumber}>3.</Text>
        <Text style={[styles.listText, { flex: 1 }]}>
          Em caso de pernoita, desde que se justifique, o abono e correspondente a{" "}
          <Text style={styles.bold}>{formatMoney(data.abonoDiaComPernoita)}/dia</Text>.
        </Text>
      </View>

      {/* Footnotes */}
      <View style={styles.footnote}>
        <Text>1 Aplicavel para os cursos com sessoes presenciais.</Text>
        <Text>2 Consiste no pagamento de dispesas diarias.</Text>
        <Text>3 Excepto o Centro de Recursos de <Text style={{ fontStyle: "italic" }}>Campus</Text> da Lhanguene.</Text>
      </View>

      <Text style={styles.pageNumber}>2</Text>
    </Page>
  )
}

// Page 3 - Final clauses and signatures
function PageThree({ data }: { data: ContractPdfData }) {
  return (
    <Page size="A4" style={styles.page}>
      {/* Clausula Setima */}
      <Text style={styles.clauseTitle}>Setima</Text>
      <Text style={styles.clauseSubtitle}>(Alteracoes do Contrato)</Text>
      <Text style={styles.paragraph}>
        O presente Contrato podera ser alterado quando for conveniente para qualquer das partes, ou em 
        consequencia de alteracoes que venham a verificar-se no correspondente condicionalismo legal.
      </Text>

      {/* Clausula Oitava */}
      <Text style={styles.clauseTitle}>Oitava</Text>
      <Text style={styles.clauseSubtitle}>(Extincao)</Text>
      
      <View style={styles.numberedItem}>
        <Text style={styles.itemNumber}>1.</Text>
        <Text style={[styles.listText, { flex: 1 }]}>O presente contrato pode extinguir-se por:</Text>
      </View>
      
      {[
        "Caducidade, no caso de ter expirado o seu prazo;",
        "Morte do Contratado(a);",
        "Acordo entre as partes;",
        "Rescisao por qualquer das partes contratantes com fundamento em justa causa;",
        "Denuncia do Contrato por parte do Contratado ou da Contratante, com aviso previo de 60 dias, relativamente ao termo do contrato.",
      ].map((item, index) => (
        <View key={index} style={styles.listItem}>
          <Text style={styles.listLetter}>{String.fromCharCode(97 + index)})</Text>
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}
      
      <View style={styles.numberedItem}>
        <Text style={styles.itemNumber}>2.</Text>
        <Text style={[styles.listText, { flex: 1 }]}>Constitui justa causa para a contratante:</Text>
      </View>
      
      {[
        "Nao cumprimento dos deveres e obrigacoes pelo contratado, comprovado em processo disciplinar;",
        "Detencao ou prisao por comportamento doloso se, devido a natureza das funcoes do contratado, prejudicar o normal desempenho da sua actividade;",
        "Manifesta incompetencia comprovada;",
        "Ter sido aplicada a pena de demissao ou expulsao, quando se trate de funcionario do aparelho do Estado.",
      ].map((item, index) => (
        <View key={index} style={styles.listItem}>
          <Text style={styles.listLetter}>{String.fromCharCode(97 + index)})</Text>
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}

      {/* Clausula Nona */}
      <Text style={styles.clauseTitle}>Nona</Text>
      <Text style={styles.clauseSubtitle}>(Anti-Corrupcao)</Text>
      <Text style={styles.paragraph}>
        As partes e/ou os seus representantes declaram que durante o processo de seleccao, vigencia ou apos 
        o termo do presente Contrato, nao serao oferecidos, directa ou indirectamente, vantagens a terceiros 
        e nem solicitados, prometidos ou aceites para beneficios proprios ou de outrem, ofertas com o 
        proposito de obter julgamento favoravel sobre os servicos a prestar.
      </Text>

      {/* Clausula Decima */}
      <Text style={styles.clauseTitle}>Decima</Text>
      <Text style={styles.clauseSubtitle}>(Resolucao de litigio)</Text>
      
      <View style={styles.numberedItem}>
        <Text style={styles.itemNumber}>1.</Text>
        <Text style={[styles.listText, { flex: 1 }]}>
          Os litigios que eventualmente surgirem na interpretacao e aplicacao do presente Contrato, serao 
          resolvidos por comum acordo das partes, segundo as regras de boa-fe e equidade.
        </Text>
      </View>
      
      <View style={styles.numberedItem}>
        <Text style={styles.itemNumber}>2.</Text>
        <Text style={[styles.listText, { flex: 1 }]}>
          Na falta de acordo, o litigio sera dirimido pelo Tribunal competente para o efeito.
        </Text>
      </View>

      {/* Date and place */}
      <Text style={styles.datePlace}>
        Maputo, {formatDate(data.dataContrato)}
      </Text>

      {/* Signatures */}
      <View style={styles.signatureSection}>
        <View style={styles.signatureBlock}>
          <Text style={styles.signatureTitle}>O CONTRATANTE</Text>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureName}>
            {data.contratanteTitulo} {data.contratanteNome}
          </Text>
          <Text style={styles.signatureCargo}>({data.contratanteCargo})</Text>
        </View>
        
        <View style={styles.signatureBlock}>
          <Text style={styles.signatureTitle}>O CONTRATADO</Text>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureName}>{data.docenteNome}</Text>
          <Text style={styles.signatureCargo}>({data.docenteCategoria})</Text>
        </View>
      </View>

      <Text style={styles.pageNumber}>3</Text>
    </Page>
  )
}

// Main document component
export function ContractPdfDocument({ data }: { data: ContractPdfData }) {
  return (
    <Document>
      <PageOne data={data} />
      <PageTwo data={data} />
      <PageThree data={data} />
    </Document>
  )
}

// Sample data for testing
export const sampleContractData: ContractPdfData = {
  numeroProcesso: "PRC/SC/PS/2026/298",
  nomeInstituicao: "Universidade Pedagogica de Maputo",
  endereco: "Rua Joao Carlos Raposo Beirao no 135, Caixa Postal 3276, Tel.: 21320860/2, Fax no 21322113 Maputo-Mocambique",
  numeroDespacho: "60/GR/UP-MAPUTO/010/2025",
  contratanteTitulo: "Profa. Doutora",
  contratanteNome: "Leonilda Adelino Antonio Sanveca Mutiacale",
  contratanteCargo: "Vice-Reitora de Administracao e Recursos",
  docenteNome: "Joao Manuel Silva",
  docenteBI: "110101149714B",
  docenteNUIT: "109992674",
  docenteNacionalidade: "mocambicana",
  docenteCategoria: "Assistente Universitario",
  docenteNivelAcademico: "Licenciado",
  anoLectivo: "2026",
  dataContrato: "2026-01-05",
  semestre: "I e II",
  modulos: [
    { nome: "Desenho de Paginas Web", horasContacto: 25, curso: "", ano: "2o", semestre: "", centroRecursos: "" },
    { nome: "Introducao a Seguranca Informatica", horasContacto: 31, curso: "Informatica Aplicada", ano: "3o", semestre: "I", centroRecursos: "Lhanguene" },
    { nome: "Introducao a Programacao Orientada a Objectos", horasContacto: 38, curso: "", ano: "2o", semestre: "II", centroRecursos: "" },
    { nome: "Programacao Web", horasContacto: 38, curso: "", ano: "2o", semestre: "", centroRecursos: "" },
  ],
  totalHoras: 132,
  valorHora: 900,
  bonusConectividadePct: 25,
  abonoDiaSemPernoita: 1800,
  abonoDiaComPernoita: 6000,
  clausulas: [],
}
