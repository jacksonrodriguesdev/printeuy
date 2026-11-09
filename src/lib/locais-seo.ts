// Páginas de entrada por local para o Google: /repuestos-autos/montevideo, /repuestos-autos/salto...
// Só Uruguai (o site é indexado só no Uruguai). Cada local tem um perfil e uma categoria em foco
// (peças diferentes em cada página), para o texto não ser repetido.
import { slugify } from "./seo-paginas";

export type LocalSeo = {
  slug: string;
  nome: string;
  pais: "UY" | "RS"; // só "UY" neste site (o tipo aceita o valor antigo do código compartilhado)
  tipo: "pais" | "departamento" | "cidade" | "regiao" | "estado";
  dentro?: string; // departamento a que pertence
  perfil: { es: string; pt: string };
  maquinas: { es: string; pt: string };
  foco: string; // categoria do banco com destaque na página
  marcas: string[];
  vizinhos: string[]; // slugs de locais próximos (links internos)
  regiao?: string;
  ibge?: DadosIbge;
};
// Tipos mantidos para o componente da página (sem dados do Brasil neste site)
export type DadosIbge = { ha: number; ano: string; culturas: Array<[string, number]> };
export type CidadeDaLista = { nome: string; slug: string | null };
export type ExtrasLocal = {
  ibge: DadosIbge | null;
  regiao: string | null;
  vizinhos: Array<{ slug: string; nome: string }>;
  estado: Array<{ regiao: string; cidades: CidadeDaLista[] }> | null;
};

type Base = Omit<LocalSeo, "slug" | "pais" | "perfil" | "maquinas"> & { perfil: string };
const BASE: Base[] = [
  {
    nome: "Uruguay",
    tipo: "pais",
    perfil: "todo el país, con autos, camionetas, utilitarios y camiones de todas las marcas",
    foco: "Frenos",
    vizinhos: ["montevideo", "canelones", "maldonado", "salto", "paysandu", "rivera"],
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Montevideo",
    tipo: "departamento",
    perfil:
      "la capital y el mayor parque automotor del país: autos particulares, taxis, aplicaciones y flotas de reparto",
    foco: "Frenos",
    vizinhos: ["canelones", "ciudad-de-la-costa", "las-piedras", "san-jose"],
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Canelones",
    tipo: "departamento",
    perfil:
      "un parque automotor grande y en crecimiento, con mucho auto particular y utilitarios de trabajo",
    foco: "Suspensión",
    vizinhos: ["montevideo", "ciudad-de-la-costa", "las-piedras", "florida", "lavalleja"],
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Ciudad de la Costa",
    tipo: "cidade",
    perfil: "una ciudad con mucho auto familiar que viaja todos los días a Montevideo",
    foco: "Embrague",
    vizinhos: ["montevideo", "canelones", "maldonado"],
    dentro: "Canelones",
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Las Piedras",
    tipo: "cidade",
    perfil: "talleres, autos particulares y utilitarios de comercio",
    foco: "Motor",
    vizinhos: ["montevideo", "canelones"],
    dentro: "Canelones",
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Maldonado",
    tipo: "departamento",
    perfil: "autos particulares, alquileres de temporada y camionetas",
    foco: "Refrigeración",
    vizinhos: ["punta-del-este", "rocha", "lavalleja", "canelones"],
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Punta del Este",
    tipo: "cidade",
    perfil: "mucho movimiento de autos en temporada, alquileres y camionetas",
    foco: "Eléctrica",
    vizinhos: ["maldonado", "rocha"],
    dentro: "Maldonado",
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Rocha",
    tipo: "departamento",
    perfil: "rutas largas, camionetas y autos que recorren la costa",
    foco: "Suspensión",
    vizinhos: ["chuy", "maldonado", "treinta-y-tres", "lavalleja"],
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Chuy",
    tipo: "cidade",
    perfil: "la frontera con Brasil, con mucho tránsito de autos y camionetas",
    foco: "Frenos",
    vizinhos: ["rocha", "treinta-y-tres"],
    dentro: "Rocha",
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Colonia",
    tipo: "departamento",
    perfil: "autos particulares, camionetas de trabajo y transporte de carga hacia el puerto",
    foco: "Transmisión",
    vizinhos: ["san-jose", "soriano", "flores"],
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "San José",
    tipo: "departamento",
    perfil: "camionetas, utilitarios y camiones de reparto",
    foco: "Embrague",
    vizinhos: ["montevideo", "colonia", "flores", "florida"],
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Flores",
    tipo: "departamento",
    perfil: "camionetas y autos que recorren rutas nacionales",
    foco: "Suspensión",
    vizinhos: ["san-jose", "colonia", "soriano", "durazno", "florida"],
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Florida",
    tipo: "departamento",
    perfil: "camionetas, autos y camiones de transporte",
    foco: "Motor",
    vizinhos: ["canelones", "san-jose", "durazno", "lavalleja", "flores"],
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Durazno",
    tipo: "departamento",
    perfil: "el centro del país, con camiones y camionetas en las rutas 5 y 14",
    foco: "Transmisión",
    vizinhos: ["florida", "flores", "tacuarembo", "treinta-y-tres"],
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Lavalleja",
    tipo: "departamento",
    perfil: "autos particulares y camionetas en rutas de sierra",
    foco: "Frenos",
    vizinhos: ["minas", "maldonado", "canelones", "rocha", "treinta-y-tres", "florida"],
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Minas",
    tipo: "cidade",
    perfil: "autos particulares, camionetas y talleres",
    foco: "Frenos",
    vizinhos: ["lavalleja", "maldonado"],
    dentro: "Lavalleja",
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Treinta y Tres",
    tipo: "departamento",
    perfil: "camionetas y camiones en caminos rurales",
    foco: "Suspensión",
    vizinhos: ["rocha", "lavalleja", "cerro-largo", "durazno"],
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Cerro Largo",
    tipo: "departamento",
    perfil: "camionetas, autos y la frontera con Brasil",
    foco: "Motor",
    vizinhos: ["melo", "treinta-y-tres", "tacuarembo", "rivera"],
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Melo",
    tipo: "cidade",
    perfil: "autos particulares, camionetas y talleres de frontera",
    foco: "Motor",
    vizinhos: ["cerro-largo", "treinta-y-tres"],
    dentro: "Cerro Largo",
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Rivera",
    tipo: "departamento",
    perfil: "frontera con Brasil, mucho auto particular y camionetas",
    foco: "Eléctrica",
    vizinhos: ["tacuarembo", "artigas", "cerro-largo"],
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Tacuarembó",
    tipo: "departamento",
    perfil: "camionetas y camiones forestales en rutas largas",
    foco: "Suspensión",
    vizinhos: ["rivera", "durazno", "cerro-largo", "salto", "paysandu"],
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Artigas",
    tipo: "departamento",
    perfil: "frontera norte, con autos y camionetas que recorren grandes distancias",
    foco: "Refrigeración",
    vizinhos: ["salto", "rivera"],
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Salto",
    tipo: "departamento",
    perfil: "autos particulares, camionetas y transporte de carga del litoral",
    foco: "Refrigeración",
    vizinhos: ["paysandu", "artigas", "tacuarembo"],
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Paysandú",
    tipo: "departamento",
    perfil: "autos particulares, camionetas y transporte de carga hacia Argentina",
    foco: "Frenos",
    vizinhos: ["salto", "rio-negro", "tacuarembo"],
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Río Negro",
    tipo: "departamento",
    perfil: "camionetas, camiones forestales y autos particulares",
    foco: "Transmisión",
    vizinhos: ["fray-bentos", "paysandu", "soriano"],
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Fray Bentos",
    tipo: "cidade",
    perfil: "camionetas, autos y transporte de carga",
    foco: "Transmisión",
    vizinhos: ["rio-negro", "soriano"],
    dentro: "Río Negro",
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Soriano",
    tipo: "departamento",
    perfil: "camionetas de trabajo, camiones y autos particulares",
    foco: "Embrague",
    vizinhos: ["mercedes", "colonia", "rio-negro", "flores"],
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
  {
    nome: "Mercedes",
    tipo: "cidade",
    perfil: "autos particulares, camionetas y talleres",
    foco: "Embrague",
    vizinhos: ["soriano", "fray-bentos"],
    dentro: "Soriano",
    marcas: ["Volkswagen", "Chevrolet", "Fiat", "Renault", "Peugeot", "Toyota"],
  },
];

const VEICULOS = "autos, camionetas, utilitarios y camiones";
export const LOCAIS_SEO: LocalSeo[] = BASE.map((b) => ({
  ...b,
  pais: "UY" as const,
  perfil: { es: b.perfil, pt: b.perfil },
  maquinas: { es: VEICULOS, pt: VEICULOS },
  slug: slugify(b.nome),
}));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const idiomaDoLocal = (_l: Pick<LocalSeo, "pais">): "es" | "pt" => "es";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const locaisDoIdioma = (_idioma?: "es" | "pt") => LOCAIS_SEO;
export const localPorSlug = (s: string) => LOCAIS_SEO.find((l) => l.slug === s) ?? null;
export const UF: Record<string, string> = {};
export const localPeloNome = (nome: string) => LOCAIS_SEO.find((l) => l.nome === nome) ?? null;

// Texto da página (gerado a partir do perfil: muda de um local para outro)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function textoLocal(l: LocalSeo, _idioma: "es" | "pt", totalPecas: number) {
  const n = totalPecas.toLocaleString("es-UY");
  const onde = l.tipo === "cidade" && l.dentro ? `${l.nome} (${l.dentro})` : l.nome;
  return [
    `Tienda online de repuestos para autos con más de ${n} repuestos publicados, precio a la vista y envío a ${onde}.`,
    `${l.tipo === "pais" ? "Atendemos" : `En ${l.nome} atendemos`} ${l.perfil.es}. Elegí la marca, el modelo y el año de tu vehículo y te mostramos solo las piezas que le sirven, de marcas como Bosch, Nakata, Metal Leve, Sabó y SKF.`,
    `Mandanos el código original o una foto de la pieza por WhatsApp y te confirmamos la compatibilidad antes de comprar.`,
  ];
}

export const emLocal = (l: LocalSeo) => `en ${l.nome}`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function tituloLocal(l: LocalSeo, _idioma?: "es" | "pt") {
  return l.tipo === "pais"
    ? "Repuestos para autos en Uruguay"
    : `Repuestos para autos en ${l.nome}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function descricaoLocal(l: LocalSeo, _idioma: "es" | "pt", totalPecas: number) {
  const n = totalPecas.toLocaleString("es-UY");
  return `Más de ${n} repuestos para ${l.marcas.slice(0, 3).join(", ")} y más marcas, con envío a ${l.nome}. Frenos, suspensión, motor y embrague con código original.`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function perguntasLocal(l: LocalSeo, _idioma?: "es" | "pt") {
  return [
    {
      p: `¿Hacen envíos de repuestos a ${l.nome}?`,
      r: `Sí. Enviamos a ${l.nome} por agencia de transporte. El costo y el plazo dependen del destino; te los confirmamos antes de la compra.`,
    },
    {
      p: "¿Cómo sé si el repuesto le sirve a mi vehículo?",
      r: "Elegí la marca, el modelo y el año en el buscador por vehículo, o mandanos el código original o una foto de la pieza por WhatsApp. Te confirmamos la compatibilidad antes de comprar.",
    },
    {
      p: "¿Cómo pago?",
      r: "Podés pagar online al finalizar la compra o coordinar el pago con nosotros por WhatsApp.",
    },
  ];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const nomeLocal = (l: LocalSeo, _idioma?: "es" | "pt") => l.nome;
