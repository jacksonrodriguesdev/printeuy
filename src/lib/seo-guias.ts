// Conteúdo próprio de cada página de entrada (em espanhol do Uruguai: é a versão que vai para o Google).
// Escrito para as buscas com intenção de compra: "repuestos para autos Uruguay",
// "pastillas de freno Gol", "amortiguadores Nakata"... Sem promessas que não dá para provar
// (nada de "el mejor precio" ou "el más completo").
import { perguntasFrequentes } from "./seo-paginas";

export type Pergunta = { p: string; r: string };
export type GuiaSeo = { titulo: string; paragrafos: string[]; perguntas: Pergunta[] };

// Guias por marca de repuesto (chave = slug de MARCAS_SEO)
export const GUIAS_MARCA: Record<string, GuiaSeo> = {
  bosch: {
    titulo: "Repuestos Bosch en Uruguay: inyección, encendido y eléctrica",
    paragrafos: [
      "Bosch es una de las marcas de repuestos más usadas por talleres y particulares: bujías, bobinas, bombas de combustible, inyectores, sensores, escobillas, filtros y piezas de freno. En nuestro catálogo cada pieza Bosch tiene su código original y la lista de vehículos donde se aplica.",
      "Elegí la marca, el modelo y el año de tu vehículo para ver solo las piezas Bosch que le sirven, o buscá directamente por el código grabado en la pieza.",
    ],
    perguntas: [
      {
        p: "¿Cómo encuentro la bujía Bosch correcta para mi auto?",
        r: "Usá el buscador por vehículo (marca, modelo y año) y filtrá por la categoría Eléctrica. Si ya tenés la bujía vieja, buscá por el código impreso en ella.",
      },
    ],
  },
  nakata: {
    titulo: "Suspensión y dirección Nakata",
    paragrafos: [
      "Nakata fabrica amortiguadores, rótulas, terminales y extremos de dirección, bujes y parrillas para los autos más vendidos de la región: Volkswagen, Chevrolet, Fiat, Ford, Renault y Peugeot.",
      "Revisá la aplicación de cada pieza (modelo, año y motor) antes de comprar, o consultanos por WhatsApp y te confirmamos la compatibilidad.",
    ],
    perguntas: [
      {
        p: "¿Conviene cambiar los amortiguadores de a pares?",
        r: "Sí. Se recomienda cambiar siempre los dos amortiguadores del mismo eje para que el vehículo frene y doble de forma pareja.",
      },
    ],
  },
};

// Guias por categoría (chave = slug de CATEGORIAS_SEO)
export const GUIAS_CATEGORIA: Record<string, GuiaSeo> = {
  frenos: {
    titulo: "Repuestos de freno para tu vehículo",
    paragrafos: [
      "Pastillas, discos, campanas, cintas, cilindros y servofrenos para autos, camionetas y camiones. Los frenos son la pieza de seguridad más importante de tu vehículo: elegí siempre el repuesto indicado para tu modelo y año.",
      "Con el buscador por vehículo te mostramos solo las piezas compatibles. Cada repuesto tiene el código original y los equivalentes de otras marcas.",
    ],
    perguntas: [
      {
        p: "¿Cada cuánto se cambian las pastillas de freno?",
        r: "Depende del uso, pero en general entre 20.000 y 40.000 km. Si escuchás un chirrido al frenar o el pedal se siente distinto, revisalas cuanto antes.",
      },
    ],
  },
  suspension: {
    titulo: "Repuestos de suspensión: amortiguadores, rótulas y bujes",
    paragrafos: [
      "Amortiguadores, rótulas, parrillas, bujes, espirales y bieletas para los autos y camionetas más vendidos de Uruguay. Una suspensión en buen estado mejora el frenado, la estabilidad y el desgaste de los neumáticos.",
    ],
    perguntas: [
      {
        p: "¿Cómo sé si tengo que cambiar los amortiguadores?",
        r: "Si el auto rebota después de un pozo, se inclina mucho en las curvas o ves pérdida de aceite en el amortiguador, es momento de revisarlo.",
      },
    ],
  },
  motor: {
    titulo: "Repuestos de motor con código original",
    paragrafos: [
      "Pistones, aros, cojinetes, juntas, retenes, válvulas, árboles de levas y kits de motor de marcas como Metal Leve, Mahle y Sabó. Ideal para talleres de rectificación y mecánica general.",
    ],
    perguntas: [],
  },
};

// Página inicial ("repuestos para autos en Uruguay")
export const GUIA_INICIO: GuiaSeo = {
  titulo: "Repuestos para autos en Uruguay, con envío a todo el país",
  paragrafos: [
    "PRINTE UY es una tienda online de repuestos para autos, camionetas, utilitarios y camiones en Uruguay. Tenemos más de 100.000 repuestos con código original de marcas como Bosch, Metal Leve, Nakata, Sabó, Mahle, SKF y Eaton: frenos, suspensión, motor, embrague, transmisión, dirección, refrigeración y piezas eléctricas.",
    "Elegí la marca, el modelo y el año de tu vehículo y te mostramos solo las piezas que le sirven. También podés buscar por el código de la pieza o por el tipo de repuesto, comprar online o consultarnos por WhatsApp.",
  ],
  perguntas: [
    {
      p: "¿Dónde comprar repuestos para autos en Uruguay?",
      r: "En PRINTE UY podés buscar entre más de 100.000 repuestos por vehículo o por código, y recibirlos en cualquier ciudad del país.",
    },
    {
      p: "¿Cómo sé si el repuesto le sirve a mi auto?",
      r: "Elegí la marca, el modelo y el año en el buscador por vehículo: te mostramos solo las piezas compatibles. Si tenés dudas, mandanos una foto o el código por WhatsApp y te confirmamos antes de comprar.",
    },
    {
      p: "¿Hacen envíos a todo Uruguay?",
      r: "Sí. Enviamos a todo el país por agencia de transporte. El costo depende del destino y del tamaño del paquete.",
    },
  ],
};

// Página de zonas ("repuestos para autos en Montevideo, Canelones...")
export const GUIA_ZONAS: GuiaSeo = {
  titulo: "Repuestos para autos en todo Uruguay",
  paragrafos: [
    "Enviamos repuestos para autos, camionetas y camiones a todos los departamentos de Uruguay: Montevideo, Canelones, Maldonado, Colonia, Salto, Paysandú, Rivera, Rocha y el resto del país.",
    "Elegí tu ciudad para ver cómo llega tu pedido, o buscá directamente por tu vehículo o por el código de la pieza.",
  ],
  perguntas: [
    {
      p: "¿Cuánto demora el envío?",
      r: "Despachamos por agencia de transporte; según la ciudad, el pedido llega en uno a tres días hábiles después de la confirmación.",
    },
    {
      p: "¿Cómo pido una cotización?",
      r: "Agregá los repuestos al carrito o mandanos tu lista por WhatsApp con el modelo de tu vehículo. Te respondemos con precio, disponibilidad y costo del envío.",
    },
  ],
};

// Perguntas da página de marca/categoria: as próprias primeiro, depois as gerais
export function perguntasDaPagina(
  marca: { slug: string } | null | undefined,
  categoria: { slug: string } | null | undefined,
  alvo: string,
  idioma: "es" | "pt" = "es",
): Pergunta[] {
  const guia = guiaDaPagina(marca, categoria);
  return [...(guia?.perguntas ?? []), ...perguntasFrequentes(alvo, idioma)];
}

export function guiaDaPagina(
  marca: { slug: string } | null | undefined,
  categoria: { slug: string } | null | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _idioma: "es" | "pt" = "es",
): GuiaSeo | null {
  if (marca && categoria) return null;
  if (marca) return GUIAS_MARCA[marca.slug] ?? null;
  if (categoria) return GUIAS_CATEGORIA[categoria.slug] ?? null;
  return null;
}

// Dados estruturados FAQPage de uma lista de perguntas
export const ldPerguntas = (perguntas: Pergunta[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: perguntas.map((q) => ({
    "@type": "Question",
    name: q.p,
    acceptedAnswer: { "@type": "Answer", text: q.r },
  })),
});

// O site é só em espanhol: as funções com idioma devolvem sempre a versão do Uruguai
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const guiaInicio = (_idioma?: "es" | "pt") => GUIA_INICIO;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const guiaZonas = (_idioma?: "es" | "pt") => GUIA_ZONAS;
// Nomes antigos (versão em português), mantidos para o código que ainda os importa
export const GUIAS_MARCA_PT = GUIAS_MARCA;
export const GUIAS_CATEGORIA_PT = GUIAS_CATEGORIA;
export const GUIA_INICIO_PT = GUIA_INICIO;
export const GUIA_ZONAS_PT = GUIA_ZONAS;
