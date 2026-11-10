// Páginas de entrada por localidade para o Google: /imprenta/montevideo, /imprenta/salto…
// Os 19 departamentos do Uruguai, as cidades de cada um e os bairros de Montevidéu.
// Cada página tem texto, categorias em destaque e perguntas próprias (escolhidos pelo nome do
// lugar), sliders de produtos e links para os lugares vizinhos.
import { slugify } from "./seo-paginas";

export type TipoLugar = "departamento" | "ciudad" | "barrio";
export type Lugar = {
  slug: string;
  nome: string;
  tipo: TipoLugar;
  departamento: string; // nome do departamento
  capital?: boolean;
};

type Dep = { nome: string; capital: string; cidades: string[]; vizinhos: string[] };

const DEPARTAMENTOS: Dep[] = [
  {
    nome: "Montevideo",
    capital: "Montevideo",
    cidades: [],
    vizinhos: ["Canelones", "San José"],
  },
  {
    nome: "Canelones",
    capital: "Canelones",
    cidades: [
      "Ciudad de la Costa",
      "Las Piedras",
      "Pando",
      "La Paz",
      "Progreso",
      "Barros Blancos",
      "Santa Lucía",
      "Atlántida",
      "Joaquín Suárez",
      "Colonia Nicolich",
      "Paso Carrasco",
      "Salinas",
      "Parque del Plata",
      "Sauce",
      "Toledo",
      "Tala",
      "San Ramón",
      "Empalme Olmos",
      "Santa Rosa",
      "Los Cerrillos",
      "San Jacinto",
      "San Bautista",
    ],
    vizinhos: ["Montevideo", "San José", "Florida", "Lavalleja", "Maldonado"],
  },
  {
    nome: "Maldonado",
    capital: "Maldonado",
    cidades: ["Punta del Este", "San Carlos", "Piriápolis", "Pan de Azúcar", "Aiguá", "La Barra"],
    vizinhos: ["Canelones", "Lavalleja", "Rocha"],
  },
  {
    nome: "Rocha",
    capital: "Rocha",
    cidades: ["Chuy", "Castillos", "Lascano", "La Paloma", "Punta del Diablo"],
    vizinhos: ["Maldonado", "Lavalleja", "Treinta y Tres"],
  },
  {
    nome: "Treinta y Tres",
    capital: "Treinta y Tres",
    cidades: ["Vergara", "Santa Clara de Olimar"],
    vizinhos: ["Cerro Largo", "Rocha", "Lavalleja", "Durazno", "Florida"],
  },
  {
    nome: "Cerro Largo",
    capital: "Melo",
    cidades: ["Río Branco", "Fraile Muerto"],
    vizinhos: ["Treinta y Tres", "Tacuarembó", "Rivera", "Durazno"],
  },
  {
    nome: "Rivera",
    capital: "Rivera",
    cidades: ["Tranqueras", "Vichadero", "Minas de Corrales"],
    vizinhos: ["Artigas", "Salto", "Tacuarembó", "Cerro Largo"],
  },
  {
    nome: "Artigas",
    capital: "Artigas",
    cidades: ["Bella Unión", "Tomás Gomensoro"],
    vizinhos: ["Salto", "Rivera"],
  },
  {
    nome: "Salto",
    capital: "Salto",
    cidades: ["Constitución", "Belén"],
    vizinhos: ["Artigas", "Paysandú", "Tacuarembó", "Rivera"],
  },
  {
    nome: "Paysandú",
    capital: "Paysandú",
    cidades: ["Guichón", "Quebracho"],
    vizinhos: ["Salto", "Río Negro", "Tacuarembó"],
  },
  {
    nome: "Río Negro",
    capital: "Fray Bentos",
    cidades: ["Young", "Nuevo Berlín", "San Javier"],
    vizinhos: ["Paysandú", "Soriano", "Tacuarembó", "Durazno"],
  },
  {
    nome: "Soriano",
    capital: "Mercedes",
    cidades: ["Dolores", "Cardona", "Palmitas", "José Enrique Rodó"],
    vizinhos: ["Río Negro", "Colonia", "Flores", "Durazno"],
  },
  {
    nome: "Colonia",
    capital: "Colonia del Sacramento",
    cidades: [
      "Carmelo",
      "Juan Lacaze",
      "Nueva Helvecia",
      "Rosario",
      "Nueva Palmira",
      "Tarariras",
      "Ombúes de Lavalle",
      "Florencio Sánchez",
    ],
    vizinhos: ["Soriano", "San José", "Flores"],
  },
  {
    nome: "San José",
    capital: "San José de Mayo",
    cidades: ["Ciudad del Plata", "Libertad", "Rodríguez", "Ecilda Paullier"],
    vizinhos: ["Montevideo", "Canelones", "Colonia", "Flores", "Florida"],
  },
  {
    nome: "Flores",
    capital: "Trinidad",
    cidades: ["Ismael Cortinas"],
    vizinhos: ["Soriano", "Colonia", "San José", "Florida", "Durazno"],
  },
  {
    nome: "Florida",
    capital: "Florida",
    cidades: ["Sarandí Grande", "Casupá", "Fray Marcos"],
    vizinhos: ["Canelones", "San José", "Flores", "Durazno", "Lavalleja", "Treinta y Tres"],
  },
  {
    nome: "Durazno",
    capital: "Durazno",
    cidades: ["Sarandí del Yí", "Villa del Carmen"],
    vizinhos: ["Florida", "Flores", "Tacuarembó", "Treinta y Tres", "Cerro Largo", "Río Negro"],
  },
  {
    nome: "Lavalleja",
    capital: "Minas",
    cidades: ["José Pedro Varela", "Solís de Mataojo", "José Batlle y Ordóñez"],
    vizinhos: ["Canelones", "Maldonado", "Rocha", "Treinta y Tres", "Florida"],
  },
  {
    nome: "Tacuarembó",
    capital: "Tacuarembó",
    cidades: ["Paso de los Toros", "San Gregorio de Polanco", "Ansina"],
    vizinhos: ["Rivera", "Salto", "Paysandú", "Río Negro", "Durazno", "Cerro Largo"],
  },
];

// Bairros de Montevidéu com mais comércio (muita busca "imprenta en Pocitos", "imprenta Cordón")
const BAIRROS_MVD = [
  "Centro",
  "Ciudad Vieja",
  "Cordón",
  "Pocitos",
  "Punta Carretas",
  "Parque Rodó",
  "Tres Cruces",
  "La Blanqueada",
  "Buceo",
  "Malvín",
  "Carrasco",
  "Punta Gorda",
  "Unión",
  "Prado",
  "Sayago",
  "Colón",
  "Cerro",
  "Aguada",
  "Goes",
  "Palermo",
];

// Departamento e cidade com o mesmo nome (Canelones, Salto…): a cidade fica com o slug simples
// e o departamento ganha "departamento-de-…". Montevidéu é uma página só.
const slugDep = (d: Dep) =>
  d.nome === "Montevideo" ? "montevideo" : `departamento-de-${slugify(d.nome)}`;

export const LUGARES: Lugar[] = [];
for (const d of DEPARTAMENTOS) {
  if (d.nome !== "Montevideo")
    LUGARES.push({ slug: slugDep(d), nome: d.nome, tipo: "departamento", departamento: d.nome });
  LUGARES.push({
    slug: slugify(d.capital),
    nome: d.capital,
    tipo: d.nome === "Montevideo" ? "departamento" : "ciudad",
    departamento: d.nome,
    capital: true,
  });
  for (const c of d.cidades)
    LUGARES.push({ slug: slugify(c), nome: c, tipo: "ciudad", departamento: d.nome });
}
for (const b of BAIRROS_MVD)
  LUGARES.push({
    slug: `montevideo-${slugify(b)}`,
    nome: b,
    tipo: "barrio",
    departamento: "Montevideo",
  });

export const lugarPorSlug = (s: string) => LUGARES.find((l) => l.slug === s) ?? null;
export const departamentoDe = (nome: string) => DEPARTAMENTOS.find((d) => d.nome === nome)!;
export const NOMES_DEPARTAMENTOS = DEPARTAMENTOS.map((d) => d.nome);
export const slugDoDepartamento = (nome: string) => slugDep(departamentoDe(nome));

// Endereços antigos de /repuestos-autos/<slug> (site de autopeças) que mudaram de nome
export const ALIAS_LUGAR: Record<string, string> = {
  colonia: "colonia-del-sacramento",
  "san-jose": "san-jose-de-mayo",
  "rio-negro": "departamento-de-rio-negro",
  soriano: "departamento-de-soriano",
  lavalleja: "departamento-de-lavalleja",
  "cerro-largo": "departamento-de-cerro-largo",
  flores: "departamento-de-flores",
};

// Como o lugar aparece no texto ("en Pocitos, Montevideo", "en Young, Río Negro")
export function nomeCompleto(l: Lugar) {
  if (l.tipo === "barrio") return `${l.nome}, Montevideo`;
  if (l.tipo === "departamento") return l.nome === "Montevideo" ? "Montevideo" : l.nome;
  return l.nome === l.departamento ? l.nome : `${l.nome}, ${l.departamento}`;
}
export const tituloLugar = (l: Lugar) =>
  l.tipo === "departamento" && l.nome !== "Montevideo"
    ? `Imprenta online en el departamento de ${l.nome}`
    : `Imprenta online en ${nomeCompleto(l)}`;

// Lugares próximos (links internos): mesma região primeiro, depois os departamentos vizinhos
export function vizinhosDe(l: Lugar): Lugar[] {
  const d = departamentoDe(l.departamento);
  const mesmos = LUGARES.filter(
    (x) => x.departamento === l.departamento && x.slug !== l.slug && x.tipo !== "departamento",
  );
  const deps = d.vizinhos
    .map((n) => LUGARES.find((x) => x.departamento === n && x.capital))
    .filter(Boolean) as Lugar[];
  return [...(l.tipo === "barrio" ? mesmos.filter((x) => x.tipo === "barrio") : mesmos), ...deps]
    .filter((x, i, a) => a.findIndex((y) => y.slug === x.slug) === i)
    .slice(0, 14);
}
export const lugaresDoDepartamento = (dep: string) =>
  LUGARES.filter((x) => x.departamento === dep && x.tipo !== "departamento");

// Número estável a partir do slug: escolhe frases e categorias diferentes para cada página
const semente = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const escolher = <T>(lista: T[], s: string, n = 0) => lista[(semente(s) + n) % lista.length];

// Categorias que entram em destaque na página (rodam de lugar para lugar)
const ROTACAO = [
  "Tarjetas y Papelería",
  "Etiquetas y Adhesivos",
  "Volantes y Folletos",
  "Packaging y Envases",
  "Regalos Empresariales",
  "Tazas, Vasos y Botellas",
  "Cartelería y Banners",
  "Material de Marketing",
  "Agendas y Calendarios",
  "Catálogos, Libros y Revistas",
];
export function categoriasEmDestaque(l: Lugar, n = 4): string[] {
  const ini = semente(l.slug) % ROTACAO.length;
  return Array.from({ length: n }, (_, i) => ROTACAO[(ini + i * 3) % ROTACAO.length]).filter(
    (c, i, a) => a.indexOf(c) === i,
  );
}

const ABERTURAS = [
  (n: string) =>
    `¿Buscás una imprenta en ${n}? En PRINTE UY imprimís tarjetas, adhesivos, volantes, packaging y regalos con tu marca sin salir de tu casa o tu negocio.`,
  (n: string) =>
    `PRINTE UY es la imprenta online para comercios, emprendedores y empresas de ${n}: configurás tu producto, ves el precio al momento y lo recibís donde estés.`,
  (n: string) =>
    `Desde ${n} podés encargar todo lo impreso que necesita tu marca: papelería, etiquetas, cartelería, packaging y merchandising, con calidad profesional.`,
  (n: string) =>
    `Si tenés un negocio en ${n}, tus impresos pueden estar en camino hoy mismo. Elegí entre más de 600 productos personalizables y pedí online.`,
];
const NEGOCIOS = [
  "comercios de barrio, profesionales y emprendimientos",
  "tiendas online, restaurantes, consultorios y estudios",
  "empresas, instituciones educativas y organizadores de eventos",
  "marcas de ropa, cosmética, gastronomía y regalos",
];

export function textosLugar(l: Lugar) {
  const n = nomeCompleto(l);
  const curto = l.nome;
  const intro = [
    escolher(ABERTURAS, l.slug)(n),
    `Trabajamos con ${escolher(NEGOCIOS, l.slug, 1)} de ${curto}${l.tipo === "barrio" ? "" : ` y de todo el departamento de ${l.departamento}`}. Subís tu diseño (o te ayudamos a prepararlo), revisamos el archivo antes de imprimir y coordinamos el envío hasta ${curto}.`,
  ];
  const passos = [
    {
      t: "Elegí el producto",
      d: "Tamaño, papel, terminación y cantidad, con el precio al instante.",
    },
    { t: "Subí tu diseño", d: "PDF, AI, PSD, CDR o JPG. Si no tenés, te ayudamos por WhatsApp." },
    { t: "Revisamos el archivo", d: "Chequeamos medidas, resolución y colores antes de imprimir." },
    {
      t: `Recibilo en ${curto}`,
      d: `Enviamos a ${n}; el costo y el plazo se confirman con el pedido.`,
    },
  ];
  const faq = [
    {
      p: `¿Hacen envíos a ${n}?`,
      r: `Sí. Enviamos a ${curto} y a todas las localidades del departamento de ${l.departamento}. El costo y el plazo de entrega se confirman junto con tu pedido.`,
    },
    {
      p: `¿Cuánto demora un pedido a ${curto}?`,
      r: "Depende del producto y de la cantidad: la producción lleva algunos días hábiles y después se suma el envío. Te confirmamos la fecha estimada antes de pagar.",
    },
    {
      p: `¿Qué productos se piden más en ${curto}?`,
      r: `Tarjetas de presentación, adhesivos para productos, volantes y ${categoriasEmDestaque(l, 2)[1].toLowerCase()}. Podés ver todos los productos y precios en esta página.`,
    },
    {
      p: "¿Puedo pedir sin tener el diseño listo?",
      r: "Sí. Escribinos por WhatsApp con tu logo o tu idea y te ayudamos a preparar el archivo para imprimir.",
    },
    {
      p: "¿Cómo pago?",
      r: "Al confirmar el pedido te informamos las formas de pago disponibles. Podés consultar cualquier duda por WhatsApp antes de pagar.",
    },
  ];
  return { intro, passos, faq };
}
