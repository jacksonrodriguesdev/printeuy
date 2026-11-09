// Estratégia de palavras-chave (SEO + Google Ads) de PRINTE UY, estilo grandes marketplaces:
// cobrir cada combinação que o cliente uruguaio digita (veículo × modelo × peça × local × marca da
// peça × "tienda/online/precio") e ligar cada termo à página do site feita para ele.
// Só Uruguai, só espanhol. Código puro (roda no admin).
import { MARCAS_SEO, CATEGORIAS_SEO, PECAS_SEO } from "./seo-paginas";
import { LOCAIS_SEO, type LocalSeo } from "./locais-seo";
import { VEICULOS_UY, urlVeiculo } from "./veiculos-seo";

export type Grupo =
  | "Autoridade"
  | "Local"
  | "Veículo"
  | "Modelo"
  | "Peça"
  | "Categoria"
  | "Marca"
  | "Marca + categoria"
  | "Buscas reais"
  | "Conteúdo";
export type Palavra = {
  termo: string;
  idioma: "es" | "pt";
  mercado: "UY" | "RS";
  grupo: Grupo;
  prioridade: 1 | 2 | 3;
  correspondencia: "Exata" | "Frase" | "Ampla";
  destino: string; // caminho no site ("" = criar conteúdo)
  campanha: string;
  grupoAnuncio: string;
  uso: "SEO + Ads" | "SEO" | "Ads";
};

// Locais com mais carros (prioridade 1 nas campanhas locais)
const LOCAIS_PRIORIDADE = new Set([
  "montevideo",
  "canelones",
  "ciudad-de-la-costa",
  "las-piedras",
  "maldonado",
  "punta-del-este",
  "salto",
  "paysandu",
  "rivera",
]);

// Peças mais buscadas por modelo (cauda longa, alta intenção de compra)
const PECAS_MODELO = [
  "repuestos",
  "pastillas de freno",
  "amortiguadores",
  "kit de embrague",
  "correa de distribucion",
  "bomba de agua",
  "filtro de aceite",
  "radiador",
  "discos de freno",
  "rotulas",
];

const baixo = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();

export function gerarPalavras(
  opc: { buscasReais?: Array<{ termo: string; vezes: number }> } = {},
): Palavra[] {
  const out: Palavra[] = [];
  const vistos = new Set<string>();
  const add = (p: Omit<Palavra, "idioma" | "mercado">) => {
    const termo = baixo(p.termo);
    if (vistos.has(termo)) return;
    vistos.add(termo);
    out.push({ ...p, termo, idioma: "es", mercado: "UY" });
  };
  const prioLocal = (l: LocalSeo): 1 | 2 | 3 =>
    LOCAIS_PRIORIDADE.has(l.slug) ? 1 : l.tipo === "departamento" ? 2 : 3;

  // ---------------- 1. Autoridade ("tienda online", "casa de repuestos") — país inteiro
  const AUT = [
    "repuestos para autos uruguay",
    "repuestos de autos uruguay",
    "repuestos para autos online",
    "repuestos de autos online uruguay",
    "tienda de repuestos para autos",
    "tienda online de repuestos para autos uruguay",
    "casa de repuestos para autos",
    "casa de repuestos uruguay",
    "repuestera online",
    "repuestera uruguay",
    "autopartes uruguay",
    "autopiezas uruguay",
    "auto piezas uruguay",
    "comprar repuestos de autos online",
    "comprar autopartes online uruguay",
    "repuestos para autos con envio a todo el pais",
    "repuestos para autos precios",
    "repuestos para autos baratos uruguay",
    "repuestos originales y alternativos para autos",
    "repuestos para camionetas uruguay",
    "repuestos para camiones uruguay",
    "repuestos para utilitarios",
    "mayor tienda de repuestos para autos de uruguay",
    "mayor catalogo de repuestos para autos online",
    "distribuidora de repuestos para autos uruguay",
    "repuestos para talleres mecanicos",
    "repuestos al por mayor para talleres",
    "repuestos por codigo",
    "buscar repuesto por codigo original",
    "repuestos por modelo de auto",
  ];
  for (const t of AUT)
    add({
      termo: t,
      grupo: "Autoridade",
      prioridade: /uruguay|online|tienda|casa de repuestos|autopartes|autopiezas/.test(t) ? 1 : 2,
      correspondencia: "Frase",
      destino: /distribuid|mayor|talleres/.test(t)
        ? "/cotizar"
        : /codigo/.test(t)
          ? "/pedido-rapido"
          : "/",
      campanha: "UY | Pesquisa | Institucional",
      grupoAnuncio: /distribuid|mayor|talleres/.test(t)
        ? "Talleres y mayoristas"
        : /camion|utilitario/.test(t)
          ? "Camionetas y camiones"
          : "Tienda online",
      uso: "SEO + Ads",
    });

  // ---------------- 2. Local × termos (cada departamento/cidade tem sua página)
  const LOC = (n: string) => [
    `repuestos para autos ${n}`,
    `repuestos de autos en ${n}`,
    `casa de repuestos ${n}`,
    `repuestera ${n}`,
    `autopartes ${n}`,
    `repuestos para camionetas ${n}`,
    `envio de repuestos a ${n}`,
    `tienda de repuestos para autos en ${n}`,
  ];
  for (const l of LOCAIS_SEO) {
    if (l.tipo === "pais") continue;
    const n = baixo(l.nome);
    LOC(n).forEach((t, i) =>
      add({
        termo: t,
        grupo: "Local",
        prioridade: i < 3 ? prioLocal(l) : (Math.min(3, prioLocal(l) + 1) as 1 | 2 | 3),
        correspondencia: "Frase",
        destino: `/repuestos-autos/${l.slug}`,
        campanha: "UY | Pesquisa | Local",
        grupoAnuncio: l.nome,
        uso: "SEO + Ads",
      }),
    );
  }

  // ---------------- 3. Marca do veículo
  for (const v of VEICULOS_UY) {
    for (const ap of v.apelidos) {
      [
        `repuestos ${ap}`,
        `repuestos ${ap} uruguay`,
        `repuestos para ${ap}`,
        `autopartes ${ap}`,
        `repuestos originales ${ap}`,
        `repuestos ${ap} precios`,
      ].forEach((t, i) =>
        add({
          termo: t,
          grupo: "Veículo",
          prioridade: i < 2 ? 1 : 2,
          correspondencia: i < 2 ? "Exata" : "Frase",
          destino: urlVeiculo(v),
          campanha: "UY | Pesquisa | Vehículos",
          grupoAnuncio: v.nome,
          uso: "SEO + Ads",
        }),
      );
    }
  }

  // ---------------- 4. Modelo × peça (cauda longa: "pastillas de freno gol", "amortiguadores onix")
  for (const v of VEICULOS_UY) {
    const marca = v.apelidos[0];
    v.modelos.forEach((mod, iMod) => {
      const m = baixo(mod);
      PECAS_MODELO.forEach((peca, i) => {
        const prio: 1 | 2 | 3 = i === 0 && iMod < 4 ? 1 : i < 5 ? 2 : 3;
        add({
          termo: `${peca} ${m}`,
          grupo: "Modelo",
          prioridade: prio,
          correspondencia: "Frase",
          destino: urlVeiculo(v, mod),
          campanha: "UY | Pesquisa | Modelos",
          grupoAnuncio: `${v.nome} ${mod}`,
          uso: "SEO + Ads",
        });
        if (i < 3)
          add({
            termo: `${peca} ${marca} ${m}`,
            grupo: "Modelo",
            prioridade: 3,
            correspondencia: "Frase",
            destino: urlVeiculo(v, mod),
            campanha: "UY | Pesquisa | Modelos",
            grupoAnuncio: `${v.nome} ${mod}`,
            uso: "SEO + Ads",
          });
      });
    });
  }

  // ---------------- 5. Tipo de peça (cada uma tem página /repuestos/<peça>)
  for (const p of PECAS_SEO) {
    const n = baixo(p.nome);
    [
      n,
      `${n} uruguay`,
      `${n} precio`,
      `${n} para autos`,
      `comprar ${n}`,
      `${n} online`,
      `${n} originales`,
    ].forEach((t, i) =>
      add({
        termo: t,
        grupo: "Peça",
        prioridade: i < 2 ? 1 : 2,
        correspondencia: i === 0 ? "Exata" : "Frase",
        destino: `/repuestos/${p.slug}`,
        campanha: "UY | Pesquisa | Repuestos",
        grupoAnuncio: p.nome,
        uso: "SEO + Ads",
      }),
    );
  }
  // Peças comuns que não têm página própria: vão para a busca
  const OUTRAS_PECAS = [
    "bujias",
    "bobina de encendido",
    "alternador",
    "motor de arranque",
    "bateria de auto",
    "faros delanteros",
    "opticas",
    "espejo retrovisor",
    "escobillas limpiaparabrisas",
    "termostato",
    "electroventilador",
    "sensor de oxigeno",
    "sonda lambda",
    "inyectores",
    "bomba de nafta",
    "filtro de aire",
    "filtro de combustible",
    "filtro de habitaculo",
    "junta de tapa de cilindros",
    "kit de distribucion",
    "polea tensora",
    "rodamiento de rueda",
    "maza de rueda",
    "homocinetica",
    "semieje",
    "parrilla de suspension",
    "bujes de parrilla",
    "bieletas",
    "espirales",
    "soporte de motor",
    "cazoleta de amortiguador",
    "cilindro de freno",
    "campana de freno",
    "cintas de freno",
    "liquido de frenos",
    "aceite de motor",
    "extremo de direccion",
    "bomba de direccion",
    "caja de direccion",
    "crapodina",
    "placa de embrague",
    "disco de embrague",
    "cable de embrague",
    "cilindro de embrague",
  ];
  for (const t of OUTRAS_PECAS)
    [t, `${t} precio`, `${t} uruguay`].forEach((termo, i) =>
      add({
        termo,
        grupo: "Peça",
        prioridade: i === 0 ? 2 : 3,
        correspondencia: "Frase",
        destino: `/loja?q=${encodeURIComponent(t)}`,
        campanha: "UY | Pesquisa | Repuestos",
        grupoAnuncio: t.charAt(0).toUpperCase() + t.slice(1),
        uso: "Ads",
      }),
    );

  // ---------------- 6. Categoria (sistema do carro)
  for (const c of CATEGORIAS_SEO) {
    const n = baixo(c.nome);
    [`repuestos de ${n}`, `${n} para autos`, `repuestos de ${n} uruguay`].forEach((t) =>
      add({
        termo: t,
        grupo: "Categoria",
        prioridade: 2,
        correspondencia: "Frase",
        destino: `/repuestos/${c.slug}`,
        campanha: "UY | Pesquisa | Categorías",
        grupoAnuncio: c.nome,
        uso: "SEO + Ads",
      }),
    );
  }

  // ---------------- 7. Marca da peça e 8. marca da peça + categoria
  for (const m of MARCAS_SEO) {
    const nm = baixo(m.marca);
    [
      `repuestos ${nm}`,
      `${nm} uruguay`,
      `${nm} repuestos precios`,
      `distribuidor ${nm} uruguay`,
    ].forEach((t, i) =>
      add({
        termo: t,
        grupo: "Marca",
        prioridade: i < 2 ? 1 : 2,
        correspondencia: i === 0 ? "Exata" : "Frase",
        destino: `/repuestos/${m.slug}`,
        campanha: "UY | Pesquisa | Marcas de repuestos",
        grupoAnuncio: m.marca,
        uso: "SEO + Ads",
      }),
    );
    for (const c of CATEGORIAS_SEO.slice(0, 10))
      add({
        termo: `${baixo(c.nome)} ${nm}`,
        grupo: "Marca + categoria",
        prioridade: 3,
        correspondencia: "Frase",
        destino: `/repuestos/${m.slug}/${c.slug}`,
        campanha: "UY | Pesquisa | Marcas de repuestos",
        grupoAnuncio: `${m.marca} · ${c.nome}`,
        uso: "SEO + Ads",
      });
  }

  // ---------------- 9. Conteúdo (perguntas: tráfego orgânico; precisam de guia/FAQ)
  const CONT = [
    "cada cuantos km cambiar pastillas de freno",
    "como saber si los amortiguadores estan gastados",
    "cada cuanto cambiar la correa de distribucion",
    "sintomas de embrague gastado",
    "por que chilla el freno de mi auto",
    "cada cuanto cambiar el aceite del auto",
    "que filtro de aceite lleva mi auto",
    "como saber el codigo de un repuesto",
    "por que se recalienta el motor",
    "sintomas de bomba de agua rota",
    "ruido en la suspension al pasar pozos",
    "como elegir bujias para mi auto",
    "service del auto que incluye",
    "revision del auto antes de viajar",
  ];
  for (const t of CONT)
    add({
      termo: t,
      grupo: "Conteúdo",
      prioridade: 3,
      correspondencia: "Ampla",
      destino: "",
      campanha: "SEO | Guías",
      grupoAnuncio: "Guías",
      uso: "SEO",
    });

  // ---------------- 10. Buscas reais do site (o que os clientes já digitam)
  for (const b of opc.buscasReais ?? []) {
    if (b.termo.length < 3) continue;
    add({
      termo: b.termo,
      grupo: "Buscas reais",
      prioridade: b.vezes >= 3 ? 1 : 2,
      correspondencia: "Frase",
      destino: `/loja?q=${encodeURIComponent(b.termo)}`,
      campanha: "UY | Pesquisa | Búsquedas del sitio",
      grupoAnuncio: "Búsquedas del sitio",
      uso: "Ads",
    });
  }
  return out;
}

// Palavras negativas: buscas que não compram repuestos (brinquedos, jogos, empregos, usados...)
export const NEGATIVAS_PADRAO = {
  es: [
    "juguete",
    "miniatura",
    "escala",
    "a control remoto",
    "gratis",
    "manual pdf",
    "usado",
    "usados",
    "desarmadero",
    "chatarra",
    "mercadolibre",
    "trabajo",
    "empleo",
    "curso",
    "dibujo",
    "lego",
    "juego",
    "simulador",
    "alquiler",
    "alquiler de autos",
    "venta de autos",
    "autos usados",
    "0km",
    "seguro",
    "patente",
    "multa",
    "tractor",
    "agricola",
  ],
  pt: [],
};

// CSV para importar no Google Ads Editor (Conta → Importar → Colar texto/arquivo)
export function csvGoogleAds(lista: Palavra[], site: string) {
  const esc = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const tipo = { Exata: "Exact", Frase: "Phrase", Ampla: "Broad" } as const;
  const linhas = [["Campaign", "Ad Group", "Keyword", "Criterion Type", "Final URL"].join(",")];
  for (const p of lista) {
    if (p.uso === "SEO") continue;
    linhas.push(
      [
        p.campanha,
        p.grupoAnuncio,
        p.termo,
        tipo[p.correspondencia],
        p.destino ? `${site}${p.destino}` : "",
      ]
        .map(esc)
        .join(","),
    );
  }
  return linhas.join("\n");
}
