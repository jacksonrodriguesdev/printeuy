// Páginas de entrada para o Google: /repuestos/<marca>, /repuestos/<categoria> e
// /repuestos/<marca>/<categoria>, com título, texto e endereço em espanhol do Uruguai
// ("repuestos Bosch", "amortiguadores Nakata", "pastillas de freno").

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// texto_pt: versão em português (páginas /pt, cliente do Brasil)
export type MarcaSeo = {
  slug: string;
  marca: string;
  modelos: string;
  texto: string;
  texto_pt: string;
};
export type CategoriaSeo = {
  slug: string;
  categoria: string;
  nome: string;
  texto: string;
  texto_pt: string;
  // Tipo de máquina (colheitadeira, plantadeira, pulverizador): não é uma categoria do banco,
  // as peças vêm da busca por este termo (em português; a busca entende o espanhol também)
  busca?: string;
  maquina?: boolean; // tipo de máquina ("peças para caminhão"); sem isso, tipo de peça
};

export const MARCAS_SEO: MarcaSeo[] = [
  {
    marca: "Bosch",
    modelos: "bujías, bombas de combustible, inyectores, sensores, escobillas y piezas eléctricas",
    texto:
      "Bosch es la marca con más piezas en nuestro catálogo: inyección, encendido, sensores, frenos y piezas eléctricas para autos, camionetas y camiones, con el código original de cada pieza.",
    texto_pt:
      "Bosch es la marca con más piezas en nuestro catálogo: inyección, encendido, sensores, frenos y piezas eléctricas para autos, camionetas y camiones, con el código original de cada pieza.",
  },
  {
    marca: "Metal Leve",
    modelos: "pistones, aros, cojinetes, camisas y válvulas",
    texto:
      "Repuestos de motor Metal Leve: pistones, aros, cojinetes de biela y bancada, camisas y válvulas para motores nafteros y diésel.",
    texto_pt:
      "Repuestos de motor Metal Leve: pistones, aros, cojinetes de biela y bancada, camisas y válvulas para motores nafteros y diésel.",
  },
  {
    marca: "Nakata",
    modelos: "amortiguadores, rótulas, terminales, bujes y parrillas",
    texto:
      "Suspensión y dirección Nakata: amortiguadores, rótulas, terminales de dirección, bujes y parrillas para los autos más vendidos de Uruguay.",
    texto_pt:
      "Suspensión y dirección Nakata: amortiguadores, rótulas, terminales de dirección, bujes y parrillas para los autos más vendidos de Uruguay.",
  },
  {
    marca: "Eaton",
    modelos: "cajas de cambio, engranajes, embragues y piezas de transmisión",
    texto:
      "Piezas de transmisión Eaton para camionetas y camiones: engranajes, sincronizadores, ejes, embragues y repuestos de caja de cambios.",
    texto_pt:
      "Piezas de transmisión Eaton para camionetas y camiones: engranajes, sincronizadores, ejes, embragues y repuestos de caja de cambios.",
  },
  {
    marca: "Sabó",
    modelos: "retenes, juntas y sellos",
    texto:
      "Retenes, juntas de motor y sellos Sabó para motores, cajas y diferenciales, con el código original para comprar sin equivocarte.",
    texto_pt:
      "Retenes, juntas de motor y sellos Sabó para motores, cajas y diferenciales, con el código original para comprar sin equivocarte.",
  },
  {
    marca: "Mahle",
    modelos: "filtros, pistones, termostatos y piezas de motor",
    texto:
      "Filtros de aceite, aire, combustible y habitáculo Mahle, además de pistones, termostatos y piezas de motor.",
    texto_pt:
      "Filtros de aceite, aire, combustible y habitáculo Mahle, además de pistones, termostatos y piezas de motor.",
  },
  {
    marca: "Skf",
    modelos: "rodamientos, kits de distribución y mazas de rueda",
    texto:
      "Rodamientos de rueda, kits de distribución, poleas tensoras y mazas SKF para autos y camionetas.",
    texto_pt:
      "Rodamientos de rueda, kits de distribución, poleas tensoras y mazas SKF para autos y camionetas.",
  },
  {
    marca: "Sampel",
    modelos: "soportes de motor, bujes y gomas de suspensión",
    texto: "Soportes de motor y caja, bujes, gomas de suspensión y kits de amortiguador Sampel.",
    texto_pt: "Soportes de motor y caja, bujes, gomas de suspensión y kits de amortiguador Sampel.",
  },
  {
    marca: "Cofap",
    modelos: "amortiguadores y kits de suspensión",
    texto:
      "Amortiguadores Cofap delanteros y traseros y kits de suspensión para autos y camionetas.",
    texto_pt:
      "Amortiguadores Cofap delanteros y traseros y kits de suspensión para autos y camionetas.",
  },
  {
    marca: "Fras-le",
    modelos: "pastillas, cintas y discos de freno",
    texto: "Pastillas de freno, cintas y discos Fras-le para autos, utilitarios y camiones.",
    texto_pt: "Pastillas de freno, cintas y discos Fras-le para autos, utilitarios y camiones.",
  },
].map((m) => ({ ...m, slug: slugify(m.marca) }));

// Categorias principais do banco (os nomes já estão em espanhol)
const CATS: Omit<CategoriaSeo, "slug">[] = [
  {
    categoria: "Motor",
    nome: "Motor",
    texto:
      "Pistones, aros, cojinetes, juntas, retenes, válvulas, árboles de levas, bombas de aceite y kits de motor.",
    texto_pt:
      "Pistones, aros, cojinetes, juntas, retenes, válvulas, árboles de levas, bombas de aceite y kits de motor.",
  },
  {
    categoria: "Frenos",
    nome: "Frenos",
    texto:
      "Pastillas, discos, campanas, cintas, cilindros, servofrenos y kits de freno para autos, camionetas y camiones.",
    texto_pt:
      "Pastillas, discos, campanas, cintas, cilindros, servofrenos y kits de freno para autos, camionetas y camiones.",
  },
  {
    categoria: "Suspensión",
    nome: "Suspensión",
    texto: "Amortiguadores, rótulas, parrillas, bujes, espirales y bieletas.",
    texto_pt: "Amortiguadores, rótulas, parrillas, bujes, espirales y bieletas.",
  },
  {
    categoria: "Inyección y Combustible",
    nome: "Inyección y Combustible",
    texto:
      "Inyectores, bombas de combustible, filtros, sondas lambda, sensores y piezas de inyección.",
    texto_pt:
      "Inyectores, bombas de combustible, filtros, sondas lambda, sensores y piezas de inyección.",
  },
  {
    categoria: "Transmisión",
    nome: "Transmisión",
    texto:
      "Engranajes, sincronizadores, crucetas, semiejes, juntas homocinéticas y cables de mando.",
    texto_pt:
      "Engranajes, sincronizadores, crucetas, semiejes, juntas homocinéticas y cables de mando.",
  },
  {
    categoria: "Eléctrica",
    nome: "Eléctrica",
    texto: "Alternadores, motores de arranque, bobinas, bujías, faros, lámparas, relés y sensores.",
    texto_pt:
      "Alternadores, motores de arranque, bobinas, bujías, faros, lámparas, relés y sensores.",
  },
  {
    categoria: "Embrague",
    nome: "Embrague",
    texto: "Kits de embrague, discos, placas, rulemanes de empuje y cilindros.",
    texto_pt: "Kits de embrague, discos, placas, rulemanes de empuje y cilindros.",
  },
  {
    categoria: "Dirección",
    nome: "Dirección",
    texto: "Terminales, extremos, cajas de dirección, bombas y fuelles.",
    texto_pt: "Terminales, extremos, cajas de dirección, bombas y fuelles.",
  },
  {
    categoria: "Refrigeración",
    nome: "Refrigeración",
    texto: "Radiadores, bombas de agua, termostatos, mangueras, depósitos y electroventiladores.",
    texto_pt:
      "Radiadores, bombas de agua, termostatos, mangueras, depósitos y electroventiladores.",
  },
  {
    categoria: "Rodamientos",
    nome: "Rodamientos",
    texto: "Rodamientos de rueda, mazas, poleas tensoras y rulemanes.",
    texto_pt: "Rodamientos de rueda, mazas, poleas tensoras y rulemanes.",
  },
  {
    categoria: "Gomas y Soportes",
    nome: "Gomas y Soportes",
    texto: "Soportes de motor y caja, bujes, fuelles y gomas de suspensión.",
    texto_pt: "Soportes de motor y caja, bujes, fuelles y gomas de suspensión.",
  },
  {
    categoria: "Accesorios",
    nome: "Accesorios",
    texto: "Accesorios para tu vehículo: iluminación, audio, alfombras, portaequipajes y más.",
    texto_pt: "Accesorios para tu vehículo: iluminación, audio, alfombras, portaequipajes y más.",
  },
  {
    categoria: "Motos",
    nome: "Motos",
    texto: "Repuestos para motos: frenos, transmisión, eléctrica, iluminación y accesorios.",
    texto_pt: "Repuestos para motos: frenos, transmisión, eléctrica, iluminación y accesorios.",
  },
  {
    categoria: "Lubricación",
    nome: "Lubricación",
    texto: "Aceites, grasas, aditivos y fluidos para motor, caja y frenos.",
    texto_pt: "Aceites, grasas, aditivos y fluidos para motor, caja y frenos.",
  },
];
export const CATEGORIAS_SEO: CategoriaSeo[] = CATS.map((c) => ({ ...c, slug: slugify(c.nome) }));

export const marcaPorSlug = (s: string) => MARCAS_SEO.find((m) => m.slug === s) ?? null;
export const categoriaPorSlug = (s: string) => CATEGORIAS_SEO.find((c) => c.slug === s) ?? null;

// Tipo de veículo: sem páginas próprias (o buscador por veículo cobre isso)
export const MAQUINAS_SEO: CategoriaSeo[] = [];
// Páginas por tipo de peça ("pastillas de freno", "amortiguadores"...): peças da busca pelo termo
// (busca = termo em português, como estão os nomes das peças no banco)
export const PECAS_SEO: CategoriaSeo[] = [
  {
    slug: "pastillas-de-freno",
    categoria: "Pastillas de freno",
    nome: "Pastillas de freno",
    busca: "pastilha freio",
    texto:
      "Pastillas de freno delanteras y traseras para autos, camionetas y camiones, con código original y equivalentes.",
    texto_pt:
      "Pastillas de freno delanteras y traseras para autos, camionetas y camiones, con código original y equivalentes.",
  },
  {
    slug: "discos-de-freno",
    categoria: "Discos de freno",
    nome: "Discos de freno",
    busca: "disco freio",
    texto: "Discos de freno ventilados y sólidos para los autos más vendidos de Uruguay.",
    texto_pt: "Discos de freno ventilados y sólidos para los autos más vendidos de Uruguay.",
  },
  {
    slug: "amortiguadores",
    categoria: "Amortiguadores",
    nome: "Amortiguadores",
    busca: "amortecedor",
    texto:
      "Amortiguadores delanteros y traseros Nakata, Cofap, Monroe y más, para buscar por tu vehículo.",
    texto_pt:
      "Amortiguadores delanteros y traseros Nakata, Cofap, Monroe y más, para buscar por tu vehículo.",
  },
  {
    slug: "kits-de-embrague",
    categoria: "Kits de embrague",
    nome: "Kits de embrague",
    busca: "kit embreagem",
    texto: "Kits de embrague completos: disco, placa y rulemán de empuje para tu auto o camioneta.",
    texto_pt:
      "Kits de embrague completos: disco, placa y rulemán de empuje para tu auto o camioneta.",
  },
  {
    slug: "bombas-de-agua",
    categoria: "Bombas de agua",
    nome: "Bombas de agua",
    busca: "bomba agua",
    texto:
      "Bombas de agua para motores nafteros y diésel, con el código original para confirmar la compatibilidad.",
    texto_pt:
      "Bombas de agua para motores nafteros y diésel, con el código original para confirmar la compatibilidad.",
  },
  {
    slug: "correas-de-distribucion",
    categoria: "Correas de distribución",
    nome: "Correas de distribución",
    busca: "correia dentada",
    texto: "Correas y kits de distribución con poleas tensoras para cambiar en el service.",
    texto_pt: "Correas y kits de distribución con poleas tensoras para cambiar en el service.",
  },
  {
    slug: "bujias",
    categoria: "Bujías",
    nome: "Bujías",
    busca: "vela ignicao",
    texto: "Bujías de encendido y de precalentamiento para motores nafteros y diésel.",
    texto_pt: "Bujías de encendido y de precalentamiento para motores nafteros y diésel.",
  },
  {
    slug: "radiadores",
    categoria: "Radiadores",
    nome: "Radiadores",
    busca: "radiador",
    texto: "Radiadores y piezas del sistema de refrigeración para autos, camionetas y camiones.",
    texto_pt: "Radiadores y piezas del sistema de refrigeración para autos, camionetas y camiones.",
  },
  {
    slug: "rotulas",
    categoria: "Rótulas",
    nome: "Rótulas",
    busca: "pivo",
    texto: "Rótulas de suspensión para los autos más vendidos, con código original.",
    texto_pt: "Rótulas de suspensión para los autos más vendidos, con código original.",
  },
  {
    slug: "terminales-de-direccion",
    categoria: "Terminales de dirección",
    nome: "Terminales de dirección",
    busca: "terminal direcao",
    texto: "Terminales y extremos de dirección con código original y equivalentes.",
    texto_pt: "Terminales y extremos de dirección con código original y equivalentes.",
  },
  {
    slug: "filtros-de-aceite",
    categoria: "Filtros de aceite",
    nome: "Filtros de aceite",
    busca: "filtro oleo",
    texto:
      "Filtros de aceite para el service de tu vehículo, con el código original de cada pieza.",
    texto_pt:
      "Filtros de aceite para el service de tu vehículo, con el código original de cada pieza.",
  },
  {
    slug: "bombas-de-combustible",
    categoria: "Bombas de combustible",
    nome: "Bombas de combustible",
    busca: "bomba combustivel",
    texto:
      "Bombas de combustible eléctricas y sus repuestos, con el código original de cada pieza.",
    texto_pt:
      "Bombas de combustible eléctricas y sus repuestos, con el código original de cada pieza.",
  },
];
export const maquinaPorSlug = (s: string) =>
  [...MAQUINAS_SEO, ...PECAS_SEO].find((c) => c.slug === s) ?? null;
export const slugDaMarca = (marca: string) =>
  MARCAS_SEO.find((m) => m.marca === marca)?.slug ?? null;
export const slugDaCategoria = (categoria: string) =>
  CATEGORIAS_SEO.find((c) => c.categoria === categoria)?.slug ?? null;

// Endereço da página de entrada para uma marca e/ou categoria do banco (ou null se não existir)
export function urlRepuestos(o: {
  marca?: string | null;
  categoria?: string | null;
}): string | null {
  const m = o.marca ? slugDaMarca(o.marca) : null;
  const c = o.categoria ? slugDaCategoria(o.categoria) : null;
  if (o.marca && !m) return null;
  if (o.categoria && !c) return null;
  if (m && c) return `/repuestos/${m}/${c}`;
  if (m) return `/repuestos/${m}`;
  if (c) return `/repuestos/${c}`;
  return null;
}

// Perguntas frequentes das páginas (também vão como dados estruturados FAQPage)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function perguntasFrequentes(alvo: string, _idioma: "es" | "pt" = "es") {
  return [
    {
      p: "¿Cómo pido un repuesto?",
      r: "Buscá la pieza en el sitio por tu vehículo o por código, agregala al carrito y finalizá la compra, o mandanos el código por WhatsApp y te respondemos con precio y disponibilidad.",
    },
    {
      p: `¿Cómo sé si el repuesto ${alvo} es el correcto para mi vehículo?`,
      r: "Elegí la marca, el modelo y el año de tu vehículo en el buscador: te mostramos solo las piezas compatibles. También podés buscar por el código original o mandarnos una foto por WhatsApp y te confirmamos antes de comprar.",
    },
    {
      p: "¿Hacen envíos a todo Uruguay?",
      r: "Sí. Enviamos a cualquier ciudad del país por agencia de transporte. El costo del envío depende del destino y del tamaño del paquete.",
    },
    {
      p: "¿Aceptan cambios o devoluciones?",
      r: "Sí, tenés 7 días desde que recibís el pedido para cambiar o devolver un repuesto sin uso y en su embalaje original.",
    },
  ];
}
