// Admin → Criador de anúncios: transforma os dados do site (visitas, buscas, cliques no WhatsApp,
// carrinhos, catálogo) em estratégia: onde anunciar, que peças, para quem, com quais textos e metas.
// Tudo calculado aqui, sem IA externa: as regras ficam explícitas e o "porquê" vai junto.
import { prisma } from "./prisma";
import { SITE_URL } from "./site";
import { nomeProduto } from "./pecas-es";
import { MARCAS_SEO } from "./seo-paginas";
import { precoVenda } from "./precos";
import { configPrecos } from "./precos.server";
import { desdeDias, local, inc } from "./analises.server";
import { resumosDoPeriodo, type Cont } from "./resumo-diario.server";
import { PERFIL_DEPTO, DEPTOS, semAcento, type Local } from "./locais-anuncio";

// ---------------------------------------------------------------- referências fixas
// Marcas (veículos e fabricantes de peças): nome canônico + como aparecem nas buscas
const MARCAS: Array<[string, RegExp]> = [
  ["Volkswagen", /volkswagen|\bvw\b|\bgol\b|\bfox\b|amarok|saveiro|voyage/i],
  ["Chevrolet", /chevrolet|chevy|\bonix\b|prisma|corsa|celta|\bs10\b|cruze|spin/i],
  ["Fiat", /\bfiat\b|\buno\b|palio|siena|strada|fiorino|cronos|\bmobi\b|\btoro\b/i],
  ["Ford", /\bford\b|fiesta|\bka\b|focus|ranger|ecosport/i],
  ["Renault", /renault|clio|sandero|logan|kangoo|duster/i],
  ["Peugeot", /peugeot|\b20[678]\b|\b30[78]\b|partner/i],
  ["Toyota", /toyota|hilux|corolla|etios|yaris/i],
  ["Citroën", /citro[eë]n|\bc3\b|\bc4\b|berlingo/i],
  ["Hyundai", /hyundai|hb20|accent|tucson|creta/i],
  ["Nissan", /nissan|march|versa|frontier|sentra/i],
  ["Honda", /honda|civic|\bfit\b/i],
  ["Kia", /\bkia\b|picanto|sportage/i],
  ["Mercedes-Benz", /mercedes|sprinter/i],
  ["Bosch", /bosch/i],
  ["Nakata", /nakata/i],
  ["Metal Leve", /metal ?leve/i],
  ["Sabó", /sab[oó]/i],
  ["Mahle", /mahle/i],
  ["SKF", /\bskf\b/i],
  ["Cofap", /cofap/i],
  ["Monroe", /monroe/i],
  ["Fras-le", /fras-?le/i],
];
const marcaCanonica = (m: string | null | undefined) => {
  if (!m) return null;
  for (const [nome, re] of MARCAS) if (re.test(m)) return nome;
  return m.trim() || null;
};
const marcaDaBusca = (t: string) => MARCAS.find(([, re]) => re.test(t))?.[0] ?? null;

// Calendário automotivo do Uruguai: o que acontece com os carros em cada mês
// (campo "safra" = o momento do ano; nome mantido para o código e a tela que já o usam)
const CALENDARIO = [
  {
    mes: 1,
    safra: "Férias de verão: viagens longas para a costa e o interior",
    foco: "Refrigeração (radiador, bomba d'água, termostato), freios, correias",
    ideia: "Viajá tranquilo: revisá frenos y refrigeración",
  },
  {
    mes: 2,
    safra: "Fim das férias e Carnaval; volta das viagens",
    foco: "Freios, suspensão (amortecedores), ar-condicionado",
    ideia: "Volviste de vacaciones: ¿cómo quedaron los frenos?",
  },
  {
    mes: 3,
    safra: "Volta às aulas; uso diário do carro na cidade",
    foco: "Service: filtros, óleo, velas, pastilhas",
    ideia: "Vuelta a clases: el service de tu auto",
  },
  {
    mes: 4,
    safra: "Semana de Turismo: última viagem longa do ano",
    foco: "Kit de distribuição, freios, pneus e suspensão",
    ideia: "Semana de Turismo: tu auto listo para la ruta",
  },
  {
    mes: 5,
    safra: "Outono: começam as chuvas e a neblina",
    foco: "Palhetas, faróis, lâmpadas, freios",
    ideia: "Llegan las lluvias: escobillas y luces",
  },
  {
    mes: 6,
    safra: "Inverno: frio e partidas difíceis",
    foco: "Bateria, motor de arranque, velas, bobinas, alternador",
    ideia: "Que el frío no te deje a pie",
  },
  {
    mes: 7,
    safra: "Férias de julho; carro parado ou viagens curtas",
    foco: "Elétrica, bateria, embreagem, filtros",
    ideia: "Vacaciones de julio: revisión eléctrica",
  },
  {
    mes: 8,
    safra: "Fim do inverno; desgaste de suspensão por pozos",
    foco: "Suspensão: amortecedores, pivôs, buchas, bieletas",
    ideia: "¿Ruidos en la suspensión? Tenemos la pieza",
  },
  {
    mes: 9,
    safra: "Primavera: preparação para o calor",
    foco: "Refrigeração, ar-condicionado, correias",
    ideia: "Primavera: refrigeración a punto",
  },
  {
    mes: 10,
    safra: "Meio de ano: revisão de km e serviço",
    foco: "Kit de distribuição, bomba d'água, embreagem",
    ideia: "Correa de distribución: no esperes a que se corte",
  },
  {
    mes: 11,
    safra: "Black Friday: melhor mês para promoções",
    foco: "Kits (freio, embreagem, distribuição) e peças de alto giro",
    ideia: "Black Friday en repuestos para tu auto",
  },
  {
    mes: 12,
    safra: "Festas e preparação para as férias de verão",
    foco: "Freios, refrigeração, pneus, iluminação",
    ideia: "Antes de las fiestas: tu auto revisado",
  },
];
const MESES = [
  "",
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// ---------------------------------------------------------------- utilidades
const corta = (s: string, max: number) =>
  s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`;
// Título de anúncio sem reticências: corta na última palavra inteira
const cabe = (s: string, max: number) => {
  if (s.length <= max) return s;
  const c = s.slice(0, max + 1);
  return c.slice(0, c.lastIndexOf(" ") > 0 ? c.lastIndexOf(" ") : max).replace(/[,.:;-]+$/, "");
};
const slug = (s: string) =>
  semAcento(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
const utm = (caminho: string, fonte: "facebook" | "google", campanha: string, pt = false) =>
  `${SITE_URL}${pt ? "/pt" : ""}${caminho}${caminho.includes("?") ? "&" : "?"}utm_source=${fonte}&utm_medium=cpc&utm_campaign=${slug(campanha)}`;
const topN = <T>(m: Map<string, T>, por: (v: T) => number, n: number) =>
  [...m.entries()].sort((a, b) => por(b[1]) - por(a[1])).slice(0, n);
const ordenado = (m: Map<string, number>, n: number) =>
  topN(m, (v) => v, n).map(([k, v]) => ({ nome: k, valor: v }));

// ---------------------------------------------------------------- principal
export async function criadorAnuncios(dias: number) {
  const desde = desdeDias(dias);
  const [ds, cfg, carrinhosGanhos, totalCarrinhos, ofertaMarcas, clientesDepto] = await Promise.all(
    [
      resumosDoPeriodo(dias),
      configPrecos().catch(() => null),
      prisma.carrinhos
        .findMany({
          where: { etapa: "GANHO", valor_fechado: { gt: 0 } },
          select: { valor_fechado: true },
          take: 2000,
        })
        .catch(() => []),
      prisma.carrinhos.count({ where: { created_at: { gte: desde } } }).catch(() => 0),
      prisma.pecas
        .groupBy({
          by: ["marca"],
          where: { duplicado_de: null, imagem_principal: { not: null } },
          _count: { _all: true },
        })
        .catch(() => []),
      prisma.users
        .groupBy({
          by: ["departamento"],
          where: { role: { not: "ADMIN" } },
          _count: { _all: true },
        })
        .catch(() => []),
    ],
  );

  // ---- soma dos resumos diários (src/lib/resumo-diario.server.ts)
  type PorLocal = {
    local: Local;
    visitas: number;
    visitantes: number;
    sessoes: number;
    leads: number;
    carrinho: number;
    buscas: number;
    mobile: number;
    cidades: Map<string, number>;
    marcas: Map<string, number>;
    pecas: Map<string, number>;
    termos: Map<string, number>;
  };
  type Seg = {
    n: number;
    mob: number;
    lead: number;
    loc: Map<string, number>;
    can: Map<string, number>;
    horas: number[];
    skus: Map<string, number>;
  };
  const somaMapa = (m: Map<string, number>, c: Cont) => {
    for (const k in c) inc(m, k, c[k]);
  };
  const horas = Array(24).fill(0) as number[];
  const diasSemana = Array(7).fill(0) as number[];
  const locais = new Map<string, PorLocal>();
  const vistasSku = new Map<string, number>();
  const leadsSku = new Map<string, number>();
  const carrinhoSku = new Map<string, number>();
  const termos = new Map<string, { termo: string; vezes: number; resultados: number }>();
  const leadsCanal = new Map<string, number>();
  const canais = new Map<string, number>();
  const segs = new Map<string, Seg>();
  let visitas = 0,
    sessoes = 0,
    mobile = 0,
    pt = 0,
    sessComLead = 0,
    leads = 0;
  for (const d of ds) {
    visitas += d.visitas;
    sessoes += d.sessoes;
    mobile += d.sessMobile;
    pt += d.sessPt;
    sessComLead += d.sessLead;
    leads += d.whatsapp;
    d.horas.forEach((v, h) => {
      horas[h] += v;
      diasSemana[d.dow] += v;
    });
    somaMapa(leadsCanal, d.leadsCanal);
    somaMapa(canais, d.sessCanal);
    for (const [sku, s] of Object.entries(d.skus)) {
      if (s.v) inc(vistasSku, sku, s.v);
      if (s.w) inc(leadsSku, sku, s.w);
      if (s.c) inc(carrinhoSku, sku, s.c);
    }
    for (const [t, x] of Object.entries(d.termos)) {
      const y = termos.get(t) ?? { termo: t, vezes: 0, resultados: x.r };
      y.vezes += x.n;
      y.resultados = x.r;
      termos.set(t, y);
    }
    for (const [chave, L] of Object.entries(d.locais)) {
      const x = locais.get(chave) ?? {
        local: { chave, nome: L.nome, pais: L.pais as Local["pais"] },
        visitas: 0,
        visitantes: 0,
        sessoes: 0,
        leads: 0,
        carrinho: 0,
        buscas: 0,
        mobile: 0,
        cidades: new Map(),
        marcas: new Map(),
        pecas: new Map(),
        termos: new Map(),
      };
      x.visitas += L.v;
      x.visitantes += L.u;
      x.sessoes += L.s;
      x.leads += L.leads;
      x.carrinho += L.car;
      x.buscas += L.bus;
      x.mobile += L.mob;
      somaMapa(x.cidades, L.cid);
      somaMapa(x.pecas, L.skus);
      somaMapa(x.termos, L.termos);
      locais.set(chave, x);
    }
    for (const [id, g] of Object.entries(d.segmentos)) {
      const x = segs.get(id) ?? {
        n: 0,
        mob: 0,
        lead: 0,
        loc: new Map(),
        can: new Map(),
        horas: Array(24).fill(0),
        skus: new Map(),
      };
      x.n += g.n;
      x.mob += g.mob;
      x.lead += g.lead;
      somaMapa(x.loc, g.loc);
      somaMapa(x.can, g.can);
      g.horas.forEach((v, h) => (x.horas[h] += v));
      somaMapa(x.skus, g.skus);
      segs.set(id, x);
    }
  }
  // Marcas citadas nas buscas de cada local (as das peças vistas entram abaixo)
  for (const x of locais.values())
    for (const [t, n] of x.termos) {
      const m = marcaDaBusca(t);
      if (m) inc(x.marcas, m, 2 * n);
    }

  // ---- peças envolvidas: nome, marca, preço, foto
  const skusInteresse = [
    ...new Set([...vistasSku.keys(), ...leadsSku.keys(), ...carrinhoSku.keys()]),
  ].slice(0, 3000);
  const camposPeca = {
    sku: true,
    nome: true,
    nome_es: true,
    marca: true,
    imagem_principal: true,
    preco_brl: true,
    preco_modo: true,
    preco_uyu: true,
    valor_promocional: true,
    category: { select: { nome: true } },
  } as const;
  const pecasDb = skusInteresse.length
    ? await prisma.pecas.findMany({ where: { sku: { in: skusInteresse } }, select: camposPeca })
    : [];
  type PecaDb = (typeof pecasDb)[number];
  const pecaPorSku = new Map<string, PecaDb>(pecasDb.map((p) => [p.sku, p]));
  const resumoPeca = (p: PecaDb) => {
    const pr = precoVenda(p, cfg);
    return {
      sku: p.sku,
      nome: nomeProduto(p),
      marca: marcaCanonica(p.marca),
      categoria: p.category?.nome ?? null,
      imagem: p.imagem_principal,
      uyu: pr?.uyu ?? null,
      brl: pr?.brl ?? null,
      desconto: pr?.desconto ?? 0,
      link: `/produto/${encodeURIComponent(p.sku)}`,
    };
  };
  // Marcas vistas por local (a partir das peças)
  for (const x of locais.values())
    for (const [sku, n] of x.pecas) {
      const m = marcaCanonica(pecaPorSku.get(sku)?.marca);
      if (m) inc(x.marcas, m, n);
    }

  // ---- demanda por marca (site) × oferta (catálogo com foto)
  const demandaMarca = new Map<string, { vistas: number; leads: number; buscas: number }>();
  const pegaMarca = (m: string) =>
    demandaMarca.get(m) ?? demandaMarca.set(m, { vistas: 0, leads: 0, buscas: 0 }).get(m)!;
  for (const [sku, n] of vistasSku) {
    const m = marcaCanonica(pecaPorSku.get(sku)?.marca);
    if (m) pegaMarca(m).vistas += n;
  }
  for (const [sku, n] of leadsSku) {
    const m = marcaCanonica(pecaPorSku.get(sku)?.marca);
    if (m) pegaMarca(m).leads += n;
  }
  for (const t of termos.values()) {
    const m = marcaDaBusca(t.termo);
    if (m) pegaMarca(m).buscas += t.vezes;
  }
  const oferta = new Map<string, number>();
  for (const o of ofertaMarcas) {
    const m = marcaCanonica(o.marca);
    if (m) inc(oferta, m, o._count._all);
  }
  const marcas = [...new Set([...demandaMarca.keys(), ...oferta.keys()])]
    .map((m) => {
      const d = demandaMarca.get(m) ?? { vistas: 0, leads: 0, buscas: 0 };
      return {
        marca: m,
        ...d,
        pecasComFoto: oferta.get(m) ?? 0,
        pontos: d.vistas + d.leads * 8 + d.buscas * 3,
      };
    })
    .sort((a, b) => b.pontos - a.pontos || b.pecasComFoto - a.pecasComFoto)
    .slice(0, 12);
  const marcasTop = marcas
    .filter((m) => m.pecasComFoto > 0)
    .slice(0, 4)
    .map((m) => m.marca);
  while (marcasTop.length < 3) {
    const extra = ["Bosch", "Nakata", "Metal Leve", "Sabó"].find((m) => !marcasTop.includes(m));
    if (!extra) break;
    marcasTop.push(extra);
  }

  // ---- números gerais
  const taxaLead = sessoes ? sessComLead / sessoes : 0;
  const ticketReal = carrinhosGanhos.length
    ? carrinhosGanhos.reduce((a, c) => a + Number(c.valor_fechado ?? 0), 0) / carrinhosGanhos.length
    : null;
  const precosLead = [...leadsSku.keys()]
    .map((s) => pecaPorSku.get(s))
    .filter(Boolean)
    .map((p) => precoVenda(p!, cfg)?.uyu ?? 0)
    .filter((v) => v > 0);
  const ticketEstimado =
    ticketReal ??
    (precosLead.length ? (precosLead.reduce((a, b) => a + b, 0) / precosLead.length) * 1.6 : null);
  const melhoresHoras = horas
    .map((v, h) => ({ h, v }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 6)
    .map((x) => x.h)
    .sort((a, b) => a - b);
  const faixaHoras = faixas(melhoresHoras);
  const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  const melhoresDias = diasSemana
    .map((v, d) => ({ d, v }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 3)
    .map((x) => DIAS[x.d]);

  // ---- onde anunciar: pontuação por local
  const comDados = visitas >= 150;
  const listaLocais = [...locais.values()]
    .filter((x) => x.local.pais === "UY" || x.local.pais === "RS")
    .map((x) => {
      const conv = x.sessoes ? x.leads / x.sessoes : 0;
      const pontos = x.visitas + x.leads * 15 + x.carrinho * 5 + x.buscas * 2;
      const perfil = PERFIL_DEPTO[x.local.nome];
      return {
        chave: x.local.chave,
        nome: x.local.nome,
        pais: x.local.pais,
        visitas: x.visitas,
        visitantes: x.visitantes,
        sessoes: x.sessoes,
        leads: x.leads,
        carrinho: x.carrinho,
        buscas: x.buscas,
        conversao: conv,
        celular: x.sessoes ? x.mobile / x.sessoes : 0,
        pontos,
        perfil:
          perfil?.perfil ?? (x.local.pais === "RS" ? "Fora do Uruguai (não anunciamos)" : "—"),
        maquinas: perfil?.maquinas ?? "—",
        cidades: ordenado(x.cidades, 5),
        marcas: ordenado(x.marcas, 4),
        termos: ordenado(x.termos, 6),
        pecas: topN(x.pecas, (v) => v, 8)
          .map(([sku, n]) =>
            pecaPorSku.get(sku) ? { ...resumoPeca(pecaPorSku.get(sku)!), vistas: n } : null,
          )
          .filter(Boolean) as Array<ReturnType<typeof resumoPeca> & { vistas: number }>,
        clientes:
          clientesDepto.find(
            (c) => c.departamento && semAcento(c.departamento) === semAcento(x.local.nome),
          )?._count._all ?? 0,
      };
    })
    .sort((a, b) => b.pontos - a.pontos);
  // Departamentos sem visitas ainda entram (oportunidade), com pontos 0
  for (const d of DEPTOS)
    if (!listaLocais.some((l) => l.nome === d))
      listaLocais.push({
        chave: `UY:${d}`,
        nome: d,
        pais: "UY",
        visitas: 0,
        visitantes: 0,
        sessoes: 0,
        leads: 0,
        carrinho: 0,
        buscas: 0,
        conversao: 0,
        celular: 0,
        pontos: 0,
        perfil: PERFIL_DEPTO[d].perfil,
        maquinas: PERFIL_DEPTO[d].maquinas,
        cidades: [],
        marcas: [],
        termos: [],
        pecas: [],
        clientes: 0,
      });
  const totalPontosUY = listaLocais
    .filter((l) => l.pais === "UY")
    .reduce((a, l) => a + l.pontos, 0);
  const recomendacao = (l: (typeof listaLocais)[number]) => {
    if (l.pais === "RS")
      return {
        prioridade: "Opcional",
        motivo: "Fora do Uruguai: o site vende e envia só no Uruguai. Não anunciar.",
      };
    if (l.leads >= 3 && l.conversao >= taxaLead)
      return { prioridade: "Alta", motivo: "Já gera pedidos no WhatsApp acima da média: escalar." };
    if (l.visitas >= 30)
      return {
        prioridade: "Alta",
        motivo: "Muitas visitas: anunciar as peças que esse local mais olha.",
      };
    if (l.visitas > 0)
      return { prioridade: "Média", motivo: "Já há interesse; testar com orçamento pequeno." };
    if (/Soriano|Paysandú|Río Negro|Colonia|Rocha|Treinta y Tres|Cerro Largo/.test(l.nome))
      return {
        prioridade: "Média",
        motivo:
          "Ainda sem visitas, mas é polo automotiva (grãos/arroz): bom para descobrir clientes.",
      };
    return {
      prioridade: "Baixa",
      motivo: "Pouca atividade automotiva ou sem dados: deixar no público 'todo o Uruguai'.",
    };
  };
  const ondeAnunciar = listaLocais.map((l) => ({
    ...l,
    ...recomendacao(l),
    fatiaOrcamento: l.pais === "UY" && totalPontosUY ? l.pontos / totalPontosUY : 0,
  }));

  // ---- produtos para anunciar
  const pontuar = (sku: string) =>
    (vistasSku.get(sku) ?? 0) + (leadsSku.get(sku) ?? 0) * 8 + (carrinhoSku.get(sku) ?? 0) * 4;
  const candidatos = skusInteresse
    .map((s) => pecaPorSku.get(s))
    .filter((p): p is PecaDb => !!p && !!p.imagem_principal && !!precoVenda(p, cfg))
    .map((p) => ({ p, pontos: pontuar(p.sku) }))
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, 30)
    .map(({ p, pontos }) => {
      const motivos: string[] = [];
      const v = vistasSku.get(p.sku) ?? 0,
        l = leadsSku.get(p.sku) ?? 0,
        c = carrinhoSku.get(p.sku) ?? 0;
      if (l) motivos.push(`${l} pedido(s) no WhatsApp`);
      if (c) motivos.push(`${c} vez(es) no carrinho`);
      if (v) motivos.push(`${v} visitas`);
      return {
        ...resumoPeca(p),
        pontos,
        vistas: v,
        leads: l,
        carrinho: c,
        motivo: motivos.join(" · "),
        origem: "interesse" as "interesse" | "catalogo",
      };
    });
  // Completa com promoções e peças das marcas mais procuradas (com foto e preço)
  if (candidatos.length < 24) {
    const extra = await prisma.pecas.findMany({
      where: {
        duplicado_de: null,
        imagem_principal: { not: null },
        preco_brl: { gt: 0 },
        sku: { notIn: candidatos.map((c) => c.sku) },
        OR: [{ valor_promocional: { gt: 0 } }, { marca: { in: marcasTop } }],
      },
      select: camposPeca,
      orderBy: [{ valor_promocional: "desc" }, { updated_at: "desc" }],
      take: 24 - candidatos.length,
    });
    for (const p of extra) {
      const r = resumoPeca(p);
      candidatos.push({
        ...r,
        pontos: 0,
        vistas: 0,
        leads: 0,
        carrinho: 0,
        motivo: r.desconto ? `Em promoção (−${r.desconto}%)` : `Marca muito procurada (${r.marca})`,
        origem: "catalogo" as const,
      });
    }
  }

  // ---- perfis de clientes (segmentos das sessões)
  // Quem entra em cada perfil é decidido no resumo diário (SEGMENTOS_IDS em resumo-diario.server.ts)
  const SEGMENTOS: Array<{
    id: string;
    nome: string;
    quem: string;
    dor: string;
    mensagem: string;
    formato: string;
    oferta: string;
    exemplo: string;
    idioma: "es" | "pt";
  }> = [
    {
      id: "produtor",
      nome: "Motorista particular, no celular",
      quem: "Dono do carro, entra pelo celular, quer saber se tem a peça para o modelo dele e quanto custa.",
      dor: "Carro parado ou com barulho; não sabe qual peça comprar; casa de peças longe.",
      mensagem:
        "Escolha seu veículo, veja só as peças que servem, preço claro e envio para todo o Uruguai.",
      formato:
        "Meta (Instagram/Facebook) com botão 'Enviar mensagem' no WhatsApp; vídeo curto ou carrossel de peças.",
      oferta: "Envío a todo el país / respuesta en minutos por WhatsApp",
      exemplo:
        "¿Tu auto necesita un repuesto? Elegí marca, modelo y año y te mostramos solo las piezas que le sirven. Envíos a todo Uruguay.",
      idioma: "es",
    },
    {
      id: "oficina",
      nome: "Oficina, mecânico ou revendedor",
      quem: "Compra com frequência, olha várias peças, usa cotação/pedido rápido.",
      dor: "Precisa de vários códigos rápido e com preço de revenda.",
      mensagem: "Pedido rápido por lista de códigos, preço para distribuidor.",
      formato:
        "Google Pesquisa (termos com código/modelo) + Meta para público de oficinas; levar para /cotizar.",
      oferta: "Precio distribuidor y pedido por lista de códigos",
      exemplo:
        "¿Tenés taller o vendés repuestos? Pasanos tu lista de códigos y te cotizamos todo junto con precio de distribuidor.",
      idioma: "es",
    },
    {
      id: "comparador",
      nome: "Comparador de preços",
      quem: "Vê várias peças, busca, mas não chama no WhatsApp.",
      dor: "Não sabe se o preço é bom ou se a peça serve.",
      mensagem: "Preço visível, compatibilidade explicada e garantia de que serve.",
      formato: "Remarketing (Meta) com as peças que viu + prova social (avaliações do Google).",
      oferta: "Te confirmamos si la pieza sirve antes de comprar",
      exemplo:
        "¿Viste una pieza y no sabés si sirve para tu vehículo? Mandanos el modelo y te lo confirmamos sin costo.",
      idioma: "es",
    },
    {
      id: "decidido",
      nome: "Comprador decidido",
      quem: "Chega, acha a peça e chama no WhatsApp em poucas páginas.",
      dor: "Só quer a peça certa, rápido.",
      mensagem: "Busque pelo código e peça no WhatsApp em 1 clique.",
      formato:
        "Google Pesquisa com o nome/código da peça; anúncio leva direto à página do produto.",
      oferta: "Pedí por WhatsApp en un clic",
      exemplo:
        "Repuesto original y alternativo con precio en pesos. Pedilo por WhatsApp en un clic.",
      idioma: "es",
    },
    {
      id: "catalogo",
      nome: "Leitor de catálogos",
      quem: "Baixa catálogos em PDF para consultar códigos depois.",
      dor: "Precisa do código certo da peça.",
      mensagem: "Catálogos grátis por marca; depois, cotação.",
      formato:
        "Meta com objetivo Cadastros: 'baixe o catálogo da sua marca'. Gera e-mails para as automações.",
      oferta: "Catálogos de piezas gratis por marca",
      exemplo:
        "Descargá gratis el catálogo de piezas de tu vehículo y encontrá el código exacto de la pieza que necesitás.",
      idioma: "es",
    },
    {
      id: "fronteira",
      nome: "Visitante de fora do Uruguai",
      quem: "Visita de outro país (Brasil, Argentina...).",
      dor: "Não é público do site: vendemos e enviamos só no Uruguai.",
      mensagem: "Não anunciar. Se escrever pelo WhatsApp, explicar que o envio é só no Uruguai.",
      formato: "Excluir estes locais nas campanhas (Meta e Google: só Uruguai).",
      oferta: "—",
      exemplo: "Por ahora enviamos solo dentro de Uruguay.",
      idioma: "es",
    },
  ];
  const perfis = SEGMENTOS.map((g) => {
    const x = segs.get(g.id) ?? {
      n: 0,
      mob: 0,
      lead: 0,
      loc: new Map(),
      can: new Map(),
      horas: Array(24).fill(0),
      skus: new Map(),
    };
    const mar = new Map<string, number>();
    for (const [sku, n] of x.skus) {
      const m = marcaCanonica(pecaPorSku.get(sku)?.marca);
      if (m) inc(mar, m, n);
    }
    const hTop = x.horas
      .map((v, h) => ({ h, v }))
      .sort((a, b) => b.v - a.v)
      .slice(0, 4)
      .filter((y) => y.v)
      .map((y) => y.h)
      .sort((a, b) => a - b);
    return {
      ...g,
      sessoes: x.n,
      fatia: sessoes ? x.n / sessoes : 0,
      celular: x.n ? x.mob / x.n : 0,
      conversao: x.n ? x.lead / x.n : 0,
      locais: ordenado(x.loc, 3),
      canais: ordenado(x.can, 3),
      marcas: ordenado(mar, 3),
      horas: faixas(hTop),
    };
  });

  // ---- campanhas prontas
  const mes = local(new Date()).getUTCMonth() + 1;
  const cal = CALENDARIO[mes - 1];
  const prox = CALENDARIO[mes % 12];
  const deptosTop = ondeAnunciar
    .filter((l) => l.pais === "UY" && l.pontos > 0 && l.nome !== "Montevideo")
    .slice(0, 4)
    .map((l) => l.nome);
  const deptosAlvo =
    deptosTop.length >= 2 ? deptosTop : ["Soriano", "Paysandú", "Rocha", "Treinta y Tres"];
  const pecasTop = candidatos.slice(0, 6);
  const termosBons = [...termos.values()]
    .filter((t) => t.resultados > 0)
    .sort((a, b) => b.vezes - a.vezes)
    .slice(0, 15)
    .map((t) => t.termo);
  const semResultado = [...termos.values()]
    .filter((t) => t.resultados === 0)
    .sort((a, b) => b.vezes - a.vezes)
    .slice(0, 25)
    .map(({ termo, vezes }) => ({ termo, vezes }));
  const horario = faixaHoras || "7h–11h e 18h–22h";
  const KPI_META = [
    { nome: "CTR do link", meta: "≥ 1,0%" },
    { nome: "Custo por clique", meta: "≤ US$ 0,25" },
    { nome: "Custo por conversa no WhatsApp", meta: "≤ US$ 2,50" },
    { nome: "Frequência (7 dias)", meta: "≤ 3" },
  ];
  const KPI_GOOGLE = [
    { nome: "CTR", meta: "≥ 5%" },
    { nome: "Custo por clique", meta: "≤ US$ 0,50" },
    { nome: "Taxa de conversão (WhatsApp/visita)", meta: `≥ ${pctTxt(Math.max(0.04, taxaLead))}` },
    { nome: "Parcela de impressões", meta: "≥ 60%" },
  ];

  type Campanha = {
    id: string;
    nome: string;
    plataforma: "Meta" | "Google";
    tipo: string;
    objetivo: string;
    prioridade: "Alta" | "Média" | "Opcional";
    peso: number;
    publico: string[];
    locais: string[];
    horario: string;
    idioma: "es" | "pt";
    produtos: Array<{ sku: string; nome: string; link: string }>;
    titulos: string[];
    textos: string[];
    descricoes: string[];
    palavras?: string[];
    negativas?: string[];
    link: string;
    kpis: Array<{ nome: string; meta: string }>;
    porque: string;
    aviso?: string;
  };
  const NEGATIVAS = [
    "juguete",
    "miniatura",
    "a control remoto",
    "gratis",
    "pdf manual",
    "usado",
    "desarmadero",
    "mercadolibre",
    "trabajo",
    "empleo",
    "curso",
    "venta de autos",
    "alquiler de autos",
    "tractor",
  ];
  const prod = (xs: typeof candidatos) =>
    xs.map((c) => ({ sku: c.sku, nome: c.nome, link: c.link }));
  const campanhas: Campanha[] = [];

  // 1-3. Google: uma campanha por marca mais procurada
  marcasTop.slice(0, 3).forEach((m, i) => {
    const dm = marcas.find((x) => x.marca === m);
    const termosMarca = termosBons.filter((t) => marcaDaBusca(t) === m).slice(0, 5);
    const pm = candidatos.filter((c) => c.marca === m).slice(0, 4);
    const curto = m;
    campanhas.push({
      id: `google-${slug(m)}`,
      nome: `Pesquisa — Repuestos ${m}`,
      plataforma: "Google",
      tipo: "Rede de Pesquisa",
      objetivo: "Cliques no WhatsApp (conversão 'Lead')",
      prioridade: i === 0 ? "Alta" : "Média",
      peso: i === 0 ? 16 : 10,
      publico: ["Pessoas que pesquisam peças da marca no Google"],
      locais: ["Uruguai (presença: pessoas que estão no país)"],
      horario,
      idioma: "es",
      produtos: prod(pm),
      titulos: [
        `Repuestos ${curto} Uruguay`,
        `Repuestos ${curto} Originales`.length <= 30
          ? `Repuestos ${curto} Originales`
          : `${curto} Originales`,
        "Precio en Pesos y Envío",
        "Pedí por WhatsApp Ya",
        `${dm?.pecasComFoto ? `+${milhar(dm.pecasComFoto)} Piezas ${curto}` : `Piezas ${curto} en Stock`}`,
        "Envío a Todo Uruguay",
        "Repuestos para tu Auto",
        "Buscá por tu Vehículo",
        "Te Confirmamos la Pieza",
        "Frenos, Suspensión y Más",
      ].map((t) => cabe(t, 30)),
      textos: [],
      descricoes: [
        cabe(`Repuestos ${m} para autos y camionetas. Precio en pesos. Consultá por WhatsApp.`, 90),
        cabe("Mandanos el código o el modelo y te confirmamos si sirve. Respuesta rápida.", 90),
        cabe(
          "Frenos, suspensión, motor, embrague y eléctrica. Elegí tu vehículo y ves lo que sirve.",
          90,
        ),
      ],
      palavras: [
        `repuestos ${curto.toLowerCase()}`,
        `repuestos ${m.toLowerCase()} uruguay`,
        `autopartes ${curto.toLowerCase()}`,
        `piezas ${curto.toLowerCase()}`,
        `[repuestos ${curto.toLowerCase()}]`,
        ...termosMarca,
      ],
      negativas: NEGATIVAS,
      link: utm(
        MARCAS_SEO.some((x) => x.marca === m)
          ? `/repuestos/${slug(m)}`
          : `/loja?marca=${encodeURIComponent(m)}`,
        "google",
        `pesquisa ${m}`,
      ),
      kpis: KPI_GOOGLE,
      porque:
        dm && dm.pontos
          ? `${m}: ${milhar(dm.vistas)} visitas em peças, ${dm.leads} pedidos no WhatsApp e ${dm.buscas} buscas no período; ${milhar(dm.pecasComFoto)} peças com foto no catálogo.`
          : `${m} é das marcas com mais peças no catálogo (${milhar(dm?.pecasComFoto ?? 0)} com foto).`,
    });
  });

  // 4. Google: termos reais buscados no site
  if (termosBons.length >= 3)
    campanhas.push({
      id: "google-buscas",
      nome: "Pesquisa — o que os clientes buscam no site",
      plataforma: "Google",
      tipo: "Rede de Pesquisa",
      objetivo: "Cliques no WhatsApp",
      prioridade: "Alta",
      peso: 12,
      publico: ["Quem pesquisa no Google as mesmas peças que buscam no nosso site"],
      locais: ["Uruguai"],
      horario,
      idioma: "es",
      produtos: [],
      titulos: [
        "Repuestos para Autos Uruguay",
        "Encontrá tu Pieza en Minutos",
        "Precio en Pesos",
        "Pedí por WhatsApp",
        "Envío a Todo Uruguay",
        "Autos, Camionetas y Camiones",
      ].map((t) => cabe(t, 30)),
      textos: [],
      descricoes: [
        cabe(
          "Buscá por código, marca o modelo. Te respondemos por WhatsApp con precio y envío.",
          90,
        ),
        cabe("Repuestos para Volkswagen, Chevrolet, Fiat, Toyota y más. Consultá ahora.", 90),
      ],
      palavras: termosBons.map((t) => `"${t}"`),
      negativas: NEGATIVAS,
      link: utm("/loja", "google", "pesquisa buscas do site"),
      kpis: KPI_GOOGLE,
      porque: `Termos que os próprios visitantes digitaram na busca do site e que têm resultado: ${termosBons.slice(0, 5).join(", ")}.`,
    });

  // 5. Meta: WhatsApp para os departamentos com mais visitas
  campanhas.push({
    id: "meta-interior",
    nome: `WhatsApp — departamentos (${deptosAlvo.slice(0, 3).join(", ")})`,
    plataforma: "Meta",
    tipo: "Anúncio de mensagem (clique para WhatsApp)",
    objetivo: "Engajamento → Conversas no WhatsApp",
    prioridade: "Alta",
    peso: 18,
    publico: [
      "Pessoas que moram nos departamentos",
      "Idade 22–65",
      "Interesses: automóveis, mecânica automotiva, carros, caminhonetes (Advantage+ pode ampliar)",
    ],
    locais: deptosAlvo.map((d) => `${d}, Uruguai`),
    horario,
    idioma: "es",
    produtos: prod(pecasTop.slice(0, 5)),
    titulos: [
      "Repuestos para tu auto",
      "¿Tu auto necesita un repuesto?",
      "Precio en pesos y envío",
    ],
    textos: [
      `🚗 ¿Tu auto necesita un repuesto? Elegí marca, modelo y año y te mostramos solo las piezas que le sirven, o mandanos el código o una foto por WhatsApp. Envíos a todo Uruguay.`,
      `Repuestos ${marcasTop.slice(0, 3).join(", ")} y más. Frenos, suspensión, motor, embrague y eléctrica. 📲 Escribinos por WhatsApp.`,
    ],
    descricoes: ["Respuesta en minutos por WhatsApp"],
    link: utm("/loja", "facebook", "whatsapp interior"),
    kpis: KPI_META,
    porque:
      deptosTop.length >= 2
        ? `São os departamentos (fora Montevidéu) com mais visitas e pedidos no período.`
        : "Ainda há poucas visitas com localização: começamos pelos departamentos com mais carros (Montevideo, Canelones, Maldonado).",
  });

  // 6. Meta: temporada (calendário automotivo)
  campanhas.push({
    id: "meta-temporada",
    nome: `Temporada — ${cal.ideia}`,
    plataforma: "Meta",
    tipo: "Tráfego / mensagens, criativo de temporada",
    objetivo: "Conversas no WhatsApp",
    prioridade: "Alta",
    peso: 12,
    publico: [
      "Todo o Uruguai (presença)",
      "Interesses: automóveis, viagens de carro, mecânica automotiva",
    ],
    locais: ["Uruguai"],
    horario,
    idioma: "es",
    produtos: prod(pecasTop.slice(0, 4)),
    titulos: [cal.ideia, `Preparate: ${prox.ideia.toLowerCase()}`],
    textos: [
      `${cal.ideia} 🚗 Tené a punto tu auto: ${focoEs(cal.foco)}. Buscá por tu vehículo o consultá por WhatsApp.`,
      `Se viene: ${prox.ideia.toLowerCase()}. Revisá tu auto ahora y evitá quedarte a pie. Te cotizamos en minutos.`,
    ],
    descricoes: ["Cotizá por WhatsApp"],
    link: utm("/loja", "facebook", `temporada ${MESES[mes]}`),
    kpis: KPI_META,
    porque: `${MESES[mes]}: ${cal.safra}. Peças em foco: ${cal.foco}. Próximo mês: ${prox.safra}.`,
  });

  // 7. Meta: remarketing
  campanhas.push({
    id: "meta-remarketing",
    nome: "Remarketing — quem viu peças e não pediu",
    plataforma: "Meta",
    tipo: "Catálogo dinâmico (Advantage+ catálogo) ou carrossel",
    objetivo: "Vendas / conversas",
    prioridade: "Alta",
    peso: 12,
    publico: [
      "Visitantes do site nos últimos 30 dias (Pixel)",
      "Excluir quem já chamou no WhatsApp nos últimos 7 dias",
    ],
    locais: ["Uruguai"],
    horario: "o dia todo",
    idioma: "es",
    produtos: prod(candidatos.filter((c) => c.carrinho || c.vistas).slice(0, 6)),
    titulos: ["¿Todavía buscás esta pieza?", "La pieza que viste sigue disponible"],
    textos: [
      "¿Te quedó alguna duda con la pieza que viste? 🤝 Te confirmamos si sirve para tu vehículo y te pasamos precio con envío. Escribinos por WhatsApp.",
      "Las piezas que estuviste mirando siguen disponibles. Pedilas en un clic por WhatsApp. 🚗",
    ],
    descricoes: ["Te confirmamos si sirve"],
    link: utm("/loja", "facebook", "remarketing"),
    kpis: [
      ...KPI_META.slice(0, 2),
      { nome: "Custo por conversa", meta: "≤ US$ 1,50" },
      { nome: "Frequência (7 dias)", meta: "≤ 5" },
    ],
    porque: `${pctTxt(perfis.find((p) => p.id === "comparador")?.fatia ?? 0)} das sessões viram 2+ peças sem pedir: é o público mais barato de converter.`,
    aviso:
      "Precisa do Pixel do Meta instalado (Admin → Integrações) e de um público personalizado de visitantes do site.",
  });

  // 8. Meta: cadastros com catálogos PDF
  campanhas.push({
    id: "meta-catalogos",
    nome: "Cadastros — catálogos de peças grátis",
    plataforma: "Meta",
    tipo: "Tráfego para /catalogos (cadastro para baixar)",
    objetivo: "Cadastros (evento CompleteRegistration)",
    prioridade: "Média",
    peso: 8,
    publico: ["Todo o Uruguai", "Interesses: mecânica automotiva, carros, oficinas mecânicas"],
    locais: ["Uruguai"],
    horario,
    idioma: "es",
    produtos: [],
    titulos: ["Catálogos de piezas gratis", "Encontrá el código exacto"],
    textos: [
      `📘 Descargá gratis el catálogo de piezas de tu vehículo (${marcasTop.slice(0, 4).join(", ")}). Encontrá el código exacto y pedilo por WhatsApp.`,
    ],
    descricoes: ["Descarga gratis"],
    link: utm("/catalogos", "facebook", "catalogos gratis"),
    kpis: [
      { nome: "Custo por cadastro", meta: "≤ US$ 1,00" },
      { nome: "CTR do link", meta: "≥ 1,2%" },
      { nome: "Cadastros → pedido em 30 dias", meta: "≥ 10%" },
    ],
    porque:
      "Cada cadastro entra nas automações de e-mail (Admin → Automações): gera vendas depois, sem pagar de novo pelo clique.",
  });

  // 9. Google: Shopping / Performance Max com o feed
  campanhas.push({
    id: "google-shopping",
    nome: "Shopping / Performance Max — catálogo",
    plataforma: "Google",
    tipo: "Performance Max com feed do Merchant Center",
    objetivo: "Cliques no WhatsApp / visitas às peças",
    prioridade: "Média",
    peso: 8,
    publico: [
      "Automático do Google (sinal de público: visitantes do site e termos das campanhas de pesquisa)",
    ],
    locais: ["Uruguai"],
    horario: "o dia todo",
    idioma: "es",
    produtos: prod(candidatos.slice(0, 8)),
    titulos: [
      "Repuestos Automotivas Uruguay",
      "Precio en Pesos",
      "Envío a Todo Uruguay",
      "Pedí por WhatsApp",
    ].map((t) => cabe(t, 30)),
    textos: [],
    descricoes: [
      cabe("Repuestos para autos y camionetas con precio en pesos. Consultá por WhatsApp.", 90),
    ],
    link: `${SITE_URL}/feeds/google-merchant.xml`,
    kpis: [
      { nome: "Custo por clique", meta: "≤ US$ 0,30" },
      { nome: "Conversões", meta: "≥ 15/mês" },
      { nome: "ROAS (com vendas marcadas 'Ganho')", meta: "≥ 4" },
    ],
    porque:
      "O feed já existe; com ele o Google mostra a foto e o preço da peça. Comece com as peças desta lista (as de mais interesse).",
    aviso: "Só peças com foto própria entram bem no Merchant Center (logos são rejeitados).",
  });

  // 10. Meta: oficinas e revendas (B2B)
  campanhas.push({
    id: "meta-b2b",
    nome: "Oficinas e revendedores — preço distribuidor",
    plataforma: "Meta",
    tipo: "Cadastro/mensagem para /cotizar",
    objetivo: "Leads (formulário de cotação)",
    prioridade: "Média",
    peso: 8,
    publico: [
      "Montevideo, Canelones e capitais departamentais",
      "Interesses: oficina mecânica, vehículos, repuestos; cargos: mecánico, dueño de taller",
    ],
    locais: ["Uruguai"],
    horario: "seg–sex, 8h–18h",
    idioma: "es",
    produtos: [],
    titulos: ["Precio distribuidor", "¿Tenés taller o repuestera?"],
    textos: [
      "🔧 ¿Tenés taller o vendés repuestos para autos? Pasanos tu lista de códigos y te cotizamos todo junto con precio de distribuidor.",
    ],
    descricoes: ["Cotización por lista"],
    link: utm("/cotizar", "facebook", "b2b distribuidor"),
    kpis: [
      { nome: "Custo por cotação", meta: "≤ US$ 5" },
      { nome: "Cotações → cliente", meta: "≥ 20%" },
    ],
    porque: `${pctTxt(perfis.find((p) => p.id === "oficina")?.fatia ?? 0)} das sessões têm perfil de oficina/revenda (muitas peças vistas, volta várias vezes ou usa cotação).`,
  });

  // ---- métricas e metas
  const margem = cfg?.margemPadrao ?? 0;
  const metricas = {
    taxaLeadAtual: taxaLead,
    ticketReal,
    ticketEstimado,
    margemPadrao: margem,
    vendasGanhas: carrinhosGanhos.length,
    carrinhosNoPeriodo: totalCarrinhos,
    leads,
  };

  // ---- textos para a página inicial
  const m1 = marcasTop[0] ?? "Bosch";
  const textosHome = [
    {
      publico: "Geral (Uruguai)",
      idioma: "es",
      titulo: "Repuestos para tu auto, con envío a todo Uruguay",
      subtitulo: `Más de ${milhar(ofertaMarcas.reduce((a, o) => a + o._count._all, 0))} piezas de ${marcasTop.slice(0, 4).join(", ")} y más. Elegí tu vehículo y te mostramos solo lo que le sirve.`,
      botao: "Buscar por mi vehículo",
    },
    {
      publico: "Motorista particular",
      idioma: "es",
      titulo: "¿Tu auto necesita un repuesto? Te lo mandamos",
      subtitulo:
        "Elegí marca, modelo y año, o mandanos el código o una foto de la pieza por WhatsApp. Precio claro y envío a tu departamento.",
      botao: "Pedir por WhatsApp",
    },
    {
      publico: `Marca mais procurada (${m1})`,
      idioma: "es",
      titulo: `Repuestos ${m1} en Uruguay`,
      subtitulo: `Frenos, suspensión, motor y eléctrica ${m1} con código original. Te confirmamos si sirve antes de comprar.`,
      botao: `Ver repuestos ${m1}`,
    },
    {
      publico: `Temporada (${MESES[mes]})`,
      idioma: "es",
      titulo: `${cal.ideia}`,
      subtitulo: `Tené a punto tu auto: ${focoEs(cal.foco)}.`,
      botao: "Ver repuestos",
    },
    {
      publico: "Oficinas e revendas",
      idioma: "es",
      titulo: "Repuestos para talleres mecánicos en Uruguay",
      subtitulo:
        "¿Tenés taller o repuestera? Pedí por lista de códigos con precio especial para el gremio.",
      botao: "Cotizar mi lista",
    },
    {
      publico: "Frotas e empresas",
      idioma: "es",
      titulo: "Repuestos para flotas, utilitarios y camiones",
      subtitulo:
        "Mantenimiento de flotas de reparto, taxis y camionetas de trabajo. Te armamos la lista por modelo.",
      botao: "Hablar con un asesor",
    },
    {
      publico: "Confiança / prova social",
      idioma: "es",
      titulo: "Repuestos para autos con atención de verdad",
      subtitulo:
        "Te asesoramos por WhatsApp y te confirmamos la pieza antes de comprar. Mirá lo que dicen nuestros clientes.",
      botao: "Hablar con un asesor",
    },
  ];

  // ---- diagnóstico (frases prontas)
  const diag: Array<{ tipo: "bom" | "atencao" | "acao"; texto: string }> = [];
  if (!comDados)
    diag.push({
      tipo: "atencao",
      texto: `Só ${visitas} visitas no período: as sugestões usam também o catálogo e o calendário automotivo. Com mais visitas (e anúncios rodando) elas ficam mais precisas.`,
    });
  if (sessoes)
    diag.push({
      tipo: "bom",
      texto: `${pctTxt(mobile / sessoes)} das sessões são no celular: criativos verticais (9:16) e botão de WhatsApp.`,
    });
  if (melhoresHoras.length)
    diag.push({
      tipo: "acao",
      texto: `Horários com mais visitas: ${faixaHoras}; dias: ${melhoresDias.join(", ")}. Concentre o orçamento aí (programação de anúncios).`,
    });
  diag.push({
    tipo: "acao",
    texto: `Taxa atual de pedido no WhatsApp: ${pctTxt(taxaLead)} das sessões. Meta para os anúncios: ≥ ${pctTxt(Math.max(0.03, taxaLead))}.`,
  });
  if (marcas[0]?.pontos)
    diag.push({
      tipo: "bom",
      texto: `Marca com mais interesse: ${marcas[0].marca} (${milhar(marcas[0].vistas)} visitas em peças, ${marcas[0].leads} pedidos).`,
    });
  if (semResultado.length)
    diag.push({
      tipo: "atencao",
      texto: `${semResultado.length} buscas sem resultado (ex.: ${semResultado
        .slice(0, 3)
        .map((t) => `"${t.termo}"`)
        .join(", ")}). Não anuncie esses termos antes de cadastrar as peças.`,
    });
  if (pt)
    diag.push({
      tipo: "bom",
      texto: `${pctTxt(pt / Math.max(1, sessoes))} das sessões vieram de endereços /pt antigos (redirecionados para o espanhol).`,
    });
  if (!ticketReal)
    diag.push({
      tipo: "atencao",
      texto:
        "Nenhuma venda marcada como 'Ganho' com valor em Carrinhos: marque as vendas fechadas para medir o retorno (ROAS) dos anúncios.",
    });

  return {
    dias,
    comDados,
    geral: {
      visitas,
      sessoes,
      leads,
      taxaLead,
      celular: sessoes ? mobile / sessoes : 0,
      portugues: sessoes ? pt / sessoes : 0,
      horas,
      diasSemana,
      faixaHoras,
      melhoresDias,
      canais: ordenado(canais, 6),
      leadsCanal: ordenado(leadsCanal, 6),
      mes: MESES[mes],
    },
    diagnostico: diag,
    ondeAnunciar,
    marcas,
    produtos: candidatos,
    semResultado,
    buscasReais: [...termos.values()]
      .filter((t) => t.resultados > 0)
      .sort((a, b) => b.vezes - a.vezes)
      .slice(0, 80)
      .map(({ termo, vezes }) => ({ termo, vezes })),
    perfis,
    campanhas,
    metricas,
    textosHome,
    calendario: CALENDARIO.map((c) => ({ ...c, nome: MESES[c.mes], atual: c.mes === mes })),
  };
}

export type CriadorAnuncios = Awaited<ReturnType<typeof criadorAnuncios>>;

// ---------------------------------------------------------------- textos auxiliares
function faixas(hs: number[]) {
  if (!hs.length) return "";
  const out: string[] = [];
  let ini = hs[0],
    ant = hs[0];
  for (const h of [...hs.slice(1), -9]) {
    if (h === ant + 1) {
      ant = h;
      continue;
    }
    out.push(`${ini}h–${ant + 1}h`);
    ini = ant = h;
  }
  return out.join(", ");
}
const pctTxt = (v: number) => `${(v * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
const milhar = (v: number) => v.toLocaleString("es-UY");
// Foco do calendário em espanhol para os textos dos anúncios
function focoEs(f: string) {
  const T: Array<[RegExp, string]> = [
    [/Refrigeração/gi, "refrigeración"],
    [/bomba d'água/gi, "bomba de agua"],
    [/freios/gi, "frenos"],
    [/Freios/g, "frenos"],
    [/correias/gi, "correas"],
    [/Suspensão:?/gi, "suspensión"],
    [/suspensão/gi, "suspensión"],
    [/amortecedores/gi, "amortiguadores"],
    [/ar-condicionado/gi, "aire acondicionado"],
    [/Service:/g, "service:"],
    [/óleo/gi, "aceite"],
    [/velas/gi, "bujías"],
    [/pastilhas/gi, "pastillas"],
    [/Kits? de distribuição/gi, "kit de distribución"],
    [/kits \(freio, embreagem, distribuição\)/gi, "kits (freno, embrague, distribución)"],
    [/Kits \(freio, embreagem, distribuição\)/g, "kits (freno, embrague, distribución)"],
    [/pneus/gi, "neumáticos"],
    [/Palhetas/gi, "escobillas"],
    [/faróis/gi, "faros"],
    [/lâmpadas/gi, "lámparas"],
    [/Bateria/gi, "batería"],
    [/Elétrica/gi, "eléctrica"],
    [/embreagem/gi, "embrague"],
    [/pivôs/gi, "rótulas"],
    [/buchas/gi, "bujes"],
    [/peças de alto giro/gi, "piezas de mayor rotación"],
    [/iluminação/gi, "iluminación"],
    [/ e /g, " y "],
  ];
  let s = f;
  for (const [re, r] of T) s = s.replace(re, r);
  return s
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .trim()
    .replace(/^./, (c) => c.toLowerCase());
}
