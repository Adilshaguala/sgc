// lib/contract-template.ts
// Constrói o HTML do contrato a partir dos dados fornecidos.
// Este HTML é renderizado pelo Puppeteer para gerar o PDF.

export interface ContractData {
  numeroProcesso?: string
  nomeInstituicao: string
  endereco: string
  numeroDespacho: string
  contratanteTitulo: string
  contratanteNome: string
  contratanteCargo: string
  docenteTitulo: string
  docenteNome: string
  docenteBI: string
  docenteNUIT: string
  docenteNacionalidade: string
  docenteCategoria: string    // ex: "Prof. Auxiliar"
  docenteNivelAcademico: string // ex: "Docente Universitário"
  anoLectivo: string
  anosAcademicos?: string
  semestres: string           // ex: "I e II"
  valorHora: string           // ex: "1.100,00 MT"
  totalHoras: string
  bonusConectividade: string  // ex: "25"
  abonoDiaSemPernoita: string // ex: "1.800,00MT"
  abonoDiaComPernoita: string // ex: "6.000,00MT"
  modulos: {
    nome: string
    horasContacto: string
    curso: string
    ano: string
    anoAcademico?: string
    semestre: string
    centroRecursos: string
  }[]
}

function moduleRows(modulos: ContractData["modulos"]): string {
  return modulos
    .map(
      (m) => `
      <tr>
        <td>${m.nome}</td>
        <td class="center">${m.horasContacto}</td>
        <td>${m.curso}</td>
        <td class="center">${m.ano}</td>
        <td class="center">${m.semestre}</td>
        <td>${m.centroRecursos}</td>
      </tr>`
    )
    .join("")
}

export function buildContractHtml(d: ContractData): string {
  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<style>
  /* ── Reset & Base ───────────────────────────────────────────── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 11pt;
    line-height: 1.4;
    color: #000;
    background: #fff;
  }

  /* ── Page layout (Puppeteer usa @page para margens reais) ───── */
  @page {
    size: A4;
    margin: 2.5cm;
  }

  /* ── Quebras de página ──────────────────────────────────────── */
  .page-break { page-break-after: always; }
  h2, h3, .clausula-titulo { page-break-after: avoid; }
  table { page-break-inside: avoid; }
  li { page-break-inside: avoid; }

  /* ── Header do documento ────────────────────────────────────── */
  .doc-header {
    position: relative;
    margin-bottom: 16pt;
  }

  .proc-num {
    font-size: 9pt;
    margin-bottom: 8pt;
  }

  .visto-box {
    position: absolute;
    top: 0;
    right: 0;
    width: 6cm;
    border: 1px solid #000;
    padding: 5pt 8pt;
    font-size: 8pt;
    text-align: center;
    line-height: 1.6;
  }

  .gabinete {
    text-align: center;
    font-weight: bold;
    font-size: 11pt;
    margin-bottom: 4pt;
  }

  .endereco-box {
    border-bottom: 1px solid #000;
    text-align: center;
    font-size: 8pt;
    padding: 4pt 6pt;
    margin-bottom: 14pt;
  }

  /* ── Título principal ───────────────────────────────────────── */
  .titulo-contrato {
    text-align: center;
    font-weight: bold;
    font-size: 12pt;
    text-decoration: underline;
    margin: 14pt 0 12pt;
  }

  /* ── Parágrafos ─────────────────────────────────────────────── */
  p { text-align: justify; margin-bottom: 8pt; }

  /* ── Cláusulas ──────────────────────────────────────────────── */
  .clausula { margin-top: 10pt; }

  .clausula-titulo {
    text-align: center;
    font-weight: bold;
    margin-bottom: 2pt;
  }

  .clausula-subtitulo {
    text-align: center;
    margin-bottom: 8pt;
  }

  /* ── Listas ─────────────────────────────────────────────────── */
  ul {
    list-style: none;
    padding: 0;
    margin: 0 0 8pt 0;
  }

  ul > li {
    padding-left: 1.8em;
    text-indent: -1em;
    margin-bottom: 4pt;
    text-align: justify;
  }

  ul > li::before {
    content: "- ";
  }

  /* Sub-lista (§ descontos) */
  ul.sub {
    margin-left: 1.5em;
  }

  ul.sub > li::before {
    content: "§ ";
  }

  /* Lista numerada manual */
  ol.manual {
    list-style: none;
    padding: 0;
    margin: 0 0 8pt 0;
    counter-reset: manual-counter;
  }

  ol.manual > li {
    counter-increment: manual-counter;
    padding-left: 2em;
    text-indent: -1.5em;
    margin-bottom: 4pt;
    text-align: justify;
  }

  ol.manual > li::before {
    content: counter(manual-counter) ". ";
    font-weight: normal;
  }

  /* ── Tabela de módulos ──────────────────────────────────────── */
  table.modulos {
    width: 100%;
    border-collapse: collapse;
    font-size: 9pt;
    margin-bottom: 10pt;
  }

  table.modulos th,
  table.modulos td {
    border: 1px solid #000;
    padding: 4pt 5pt;
    vertical-align: middle;
  }

  table.modulos th {
    background-color: #eeeeee;
    font-weight: bold;
  }

  table.modulos .center { text-align: center; }

  /* ── Tabela de assinaturas ──────────────────────────────────── */
  table.assinaturas {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20pt;
    font-size: 9pt;
  }

  table.assinaturas td {
    border: 1px solid #000;
    padding: 6pt 8pt;
    text-align: center;
    vertical-align: bottom;
  }

  table.assinaturas td.spacer {
    border: none;
    width: 10%;
  }

  table.assinaturas .sig-space {
    height: 40pt;
  }

  /* ── Data ───────────────────────────────────────────────────── */
  .data-local {
    text-align: center;
    margin: 28pt 0 16pt;
  }

  /* ── Rodapé (notas de rodapé manuais no final do doc) ───────── */
  .footnotes {
    margin-top: 20pt;
    border-top: 1px solid #aaa;
    padding-top: 4pt;
    font-size: 8pt;
  }

  .footnotes p { margin-bottom: 3pt; text-align: left; }

  sup { font-size: 7pt; vertical-align: super; }
</style>
</head>
<body>

<!-- ═══════════════════════════════ CABEÇALHO ══════════════════════════════ -->
<div class="doc-header">

  <div class="gabinete">GABINETE DO REITOR</div>
  <div class="endereco-box">${d.endereco}</div>
</div>

<div class="titulo-contrato">TERMO DE CONTRATO</div>

<!-- ═══════════════════════════ PARÁGRAFO INTRO ════════════════════════════ -->
<p>
  Entre a <strong>${d.nomeInstituicao}</strong>, cidade de Maputo, representado pelo
  <strong>${d.contratanteTitulo} ${d.contratanteNome}</strong>, no âmbito da Delegação
  de competências conforme a alínea g), do nº 1, do Despacho nº
  <strong>${d.numeroDespacho}</strong>, doravante designado por
  <strong>"Contratante"</strong> e o
  <strong>${d.docenteTitulo} ${d.docenteNome}</strong>, titular do BI nº.
  <strong>${d.docenteBI}</strong>, NUIT nº. <strong>${d.docenteNUIT}</strong>, de
  nacionalidade ${d.docenteNacionalidade}, doravante designado(a) por
  "Contratado(a)", é celebrado o presente Contrato, nos termos do Decreto nº 89/99
  de 28 de Dezembro que se regerá pelas seguintes cláusulas:
</p>

<!-- ══════════════════════════ CLÁUSULA PRIMEIRA ══════════════════════════ -->
<div class="clausula">
  <div class="clausula-titulo">Primeira</div>
  <div class="clausula-subtitulo">(Objecto do contrato)</div>
  <p>O presente Contrato tem por objecto a prestação de serviços a tempo parcial como
  Tutor de Especialidade, no âmbito da actividade do Centro de Educação Aberta e à
  Distância (CEAD), nos seguintes módulos:</p>

  <table class="modulos">
    <thead>
      <tr>
        <th>Módulo</th>
        <th class="center">Hora de contacto</th>
        <th>Curso</th>
        <th class="center">Ano</th>
        <th class="center">Semestre</th>
        <th>Centro de Recursos</th>
      </tr>
    </thead>
    <tbody>
      ${moduleRows(d.modulos)}
    </tbody>
  </table>
</div>

<!-- ══════════════════════════ CLÁUSULA SEGUNDA ═══════════════════════════ -->
<div class="clausula">
  <div class="clausula-titulo">Segunda</div>
  <div class="clausula-subtitulo">(Duração do Contrato)</div>
  <p>O presente Contrato é valido por um período de 1 ano lectivo
  (<strong>${d.semestres} semestre de ${d.anoLectivo}</strong>), produzindo seus
  efeitos a partir da data do início das actividades.</p>
</div>

<!-- ══════════════════════════ CLÁUSULA TERCEIRA ══════════════════════════ -->
<div class="clausula">
  <div class="clausula-titulo">Terceira</div>
  <div class="clausula-subtitulo">(Obrigações do/a Contratado/a)</div>
  <p>O Contratado obriga-se a:</p>
  <ul>
    <li>Leccionar os módulos para os quais foi contratado;</li>
    <li>Realizar com zelo e diligência, lealdade e dedicação a sua actividade, dentro dos
      preceitos de ética e deontologia profissional e nos termos dos regulamentos
      internos e das demais normas vigência aplicáveis;</li>
    <li>Utilizar os Ambientes Virtuais de Aprendizagem (AVA) institucionais;</li>
    <li>Disponibilizar o Guia da disciplina no AVA Institucional, do módulo que tutora
      até 15 dias contados a partir da data do início da actividade lectiva;</li>
    <li>Trabalhar em estreita colaboração com outros intervenientes do curso e realizar
      todo o processo de avaliação dos estudantes (testes, exames e trabalhos de
      pesquisa);</li>
    <li>Apresentar ao CEAD os relatórios das actividades realizadas e as respetivas
      pautas devidamente assinadas;</li>
    <li>Realizar pelo menos duas sessões mensais de Vídeo Conferência Institucional de
      acordo com o Calendário do Curso;</li>
    <li>Realizar uma Tutoria Presencial<sup>1</sup> correspondente a 3 horas;</li>
    <li>Cumprir com as demais obrigações de acordo com o Calendário do Curso.</li>
  </ul>
</div>

<!-- ══════════════════════════ CLÁUSULA QUARTA ════════════════════════════ -->
<div class="clausula">
  <div class="clausula-titulo">Quarta</div>
  <div class="clausula-subtitulo">(Obrigações do Contratante)</div>
  <p>A contratante obriga-se a:</p>
  <ul>
    <li>Proceder ao pagamento das remunerações a que o(a) contratado(a) tem direito,
      com observância do exposto na Cláusula Terceira, do presente Contrato;</li>
    <li>Criar condições de trabalho para que o Contratado(a) realize as actividades
      previstas no presente documento (disponibilizar o transporte para a tutoria
      presencial no Centro de Recurso fora do <em>Campus</em> da Lhanguene).</li>
  </ul>
</div>

<!-- ══════════════════════════ CLÁUSULA QUINTA ════════════════════════════ -->
<div class="clausula">
  <div class="clausula-titulo">Quinta</div>
  <div class="clausula-subtitulo">(Remuneração)</div>
  <ul>
    <li>O Contratado tem direito a uma remuneração de
      <strong>${d.valorHora}/hora</strong>, num total de
      <strong>${d.totalHoras} horas</strong>, de acordo com o nível académico e
      experiência profissional (${d.docenteCategoria}), paga após o visto do Tribunal
      Administrativo (TA).</li>
    <li>O bónus de conectividade (Internet) será correspondente a
      ${d.bonusConectividade}% das horas totais do semestre.</li>
    <li>O último pagamento está condicionado à entrega de relatórios das actividades
      realizadas e à respectiva pauta assinada.</li>
    <li>Da remuneração a pagar serão deduzidos os devidos impostos (IRPS e Emolumentos
      do TA) de acordo com a legislação em vigor.</li>
    <li>Em caso de não se verificar a disponibilização mensal de conteúdos no AVA e
      interacção por vídeo conferência, o tutor de especialidade estará sujeito em cada
      módulo aos seguintes descontos:
      <ul class="sub">
        <li><em>Um</em>: Três (3) horas correspondentes ao Guia de Disciplina;</li>
        <li><em>Dois</em>: Três (3) horas correspondentes a Tutoria Presencial;</li>
        <li><em>Três</em>: 50% correspondentes a disponibilização dos conteúdos no AVA;</li>
        <li><em>Quatro</em>: 50% correspondentes a sessões de Vídeo Conferência de
          acordo com o calendário do curso.</li>
      </ul>
    </li>
  </ul>
</div>

<!-- ══════════════════════════ CLÁUSULA SEXTA ═════════════════════════════ -->
<div class="clausula">
  <div class="clausula-titulo">Sexta<sup>2</sup></div>
  <div class="clausula-subtitulo">(Abono de deslocação)</div>
  <ul>
    <li>A deslocação para os Centros de Recursos<sup>3</sup>, no âmbito da Tutoria de
      Especialidade, confere ao Tutor de Especialidade o direito ao abono de ajudas de
      custo.</li>
    <li>A deslocação cuja natureza da missão não exija a pernoita, é abonado o valor de
      <strong>${d.abonoDiaSemPernoita}/dia</strong>.</li>
    <li>Em caso de pernoita, desde que se justifique, o abono é correspondente a
      <strong>${d.abonoDiaComPernoita}/dia</strong>.</li>
  </ul>
</div>

<!-- ══════════════════════════ CLÁUSULA SÉTIMA ════════════════════════════ -->
<div class="clausula">
  <div class="clausula-titulo">Sétima</div>
  <div class="clausula-subtitulo">(Alterações do Contrato)</div>
  <p>O presente Contrato poderá ser alterado quando for conveniente para qualquer das
  partes, ou em consequência de alterações que venham a verificar-se no correspondente
  condicionalismo legal.</p>
</div>

<!-- ══════════════════════════ CLÁUSULA OITAVA ════════════════════════════ -->
<div class="clausula">
  <div class="clausula-titulo">Oitava</div>
  <div class="clausula-subtitulo">(Extinção)</div>
  <ul>
    <li>O presente contrato pode extinguir-se por:
      <ul class="sub" style="list-style:none;">
        <li style="padding-left:1.5em;text-indent:-0.8em;">a) Caducidade, no caso de ter expirado o seu prazo;</li>
        <li style="padding-left:1.5em;text-indent:-0.8em;">b) Morte do Contratado(a);</li>
        <li style="padding-left:1.5em;text-indent:-0.8em;">c) Acordo entre as partes;</li>
        <li style="padding-left:1.5em;text-indent:-0.8em;">d) Rescisão por qualquer das partes contratantes com fundamento em justa causa;</li>
        <li style="padding-left:1.5em;text-indent:-0.8em;">e) Denúncia do Contrato por parte do Contratado ou da Contratante, com aviso prévio
          de 60 dias, relativamente ao termo do contrato.</li>
      </ul>
    </li>
    <li>Constitui justa causa para a contratante:
      <ul class="sub" style="list-style:none;">
        <li style="padding-left:1.5em;text-indent:-0.8em;">a) Não cumprimento dos deveres e obrigações pelo contratado, comprovado em processo
          disciplinar;</li>
        <li style="padding-left:1.5em;text-indent:-0.8em;">b) Detenção ou prisão por comportamento doloso se, devido à natureza das funções do
          contratado, prejudicar o normal desempenho da sua actividade;</li>
        <li style="padding-left:1.5em;text-indent:-0.8em;">c) Manifesta incompetência comprovada;</li>
        <li style="padding-left:1.5em;text-indent:-0.8em;">d) Ter sido aplicada a pena de demissão ou expulsão, quando se trate de funcionário
          do aparelho do Estado.</li>
      </ul>
    </li>
  </ul>
</div>

<!-- ══════════════════════════ CLÁUSULA NONA ══════════════════════════════ -->
<div class="clausula">
  <div class="clausula-titulo">Nona</div>
  <div class="clausula-subtitulo">(Anti-Corrupção)</div>
  <p>As partes e/ou os seus representantes declaram que durante o processo de selecção,
  vigência ou após o termo do presente Contrato, não serão oferecidos, directa ou
  indirectamente, vantagens a terceiros e nem solicitados, prometidos ou aceites para
  benefícios próprios ou de outrem, ofertas com o propósito de obter julgamento
  favorável sobre os serviços a prestar.</p>
</div>

<!-- ══════════════════════════ CLÁUSULA DÉCIMA ════════════════════════════ -->
<div class="clausula">
  <div class="clausula-titulo">Décima</div>
  <div class="clausula-subtitulo">(Resolução de litígio)</div>
  <ol class="manual">
    <li>Os litígios que eventualmente surgirem na interpretação e aplicação do presente
      Contrato, serão resolvidos por comum acordo das partes, segundo as regras de
      boa-fé e equidade.</li>
    <li>Na falta de acordo, o litígio será dirimido pelo Tribunal competente para o
      efeito.</li>
  </ol>
</div>

<!-- ══════════════════════════ DATA & ASSINATURAS ═════════════════════════ -->
<div class="data-local">Maputo, _______ de ______________ de 20___</div>

<table class="assinaturas">
  <tr>
    <td style="width:45%;"><strong>A CONTRATANTE</strong></td>
    <td class="spacer"></td>
    <td style="width:45%;"><strong>O CONTRATADO</strong></td>
  </tr>
  <tr>
    <td>
      <div class="sig-space"></div>
      ${d.contratanteTitulo} ${d.contratanteNome}<br>
      <span style="font-size:8pt;">(${d.contratanteCargo})</span>
    </td>
    <td class="spacer"></td>
    <td>
      <div class="sig-space"></div>
      ${d.docenteTitulo} ${d.docenteNome}<br>
      <span style="font-size:8pt;">(${d.docenteNivelAcademico})</span>
    </td>
  </tr>
</table>

<!-- ══════════════════════════ NOTAS DE RODAPÉ ════════════════════════════ -->
<div class="footnotes">
  <p><sup>1</sup> Aplicável para os cursos com sessões presenciais.</p>
  <p><sup>2</sup> Consiste no pagamento de despesas diárias.</p>
  <p><sup>3</sup> Excepto o Centro de Recursos de Campus da Lhanguene.</p>
</div>

</body>
</html>`
}
