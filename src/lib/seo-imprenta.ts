// SEO da imprenta: páginas de categoria (/categoria/<slug>) com texto próprio, usos e perguntas
// frequentes em espanhol do Uruguai. Os nomes das categorias são os do banco (CATEGORIAS em
// src/lib/navegacao.ts). As páginas de cidade (/imprenta/<slug>) usam src/lib/ciudades-uy.ts.
import { slugify } from "./seo-paginas";

export type Pergunta = { p: string; r: string };
export type CategoriaImprenta = {
  categoria: string; // nome no banco
  slug: string;
  h1: string;
  termo: string; // como a pessoa busca ("tarjetas de presentación", "adhesivos personalizados")
  metaTitulo: string;
  metaDesc: string;
  intro: string[];
  usos: string[];
  faq: Pergunta[];
};

type Base = Omit<CategoriaImprenta, "slug">;

const BASE: Base[] = [
  {
    categoria: "Tarjetas y Papelería",
    h1: "Tarjetas de presentación y papelería personalizada",
    termo: "tarjetas de presentación",
    metaTitulo: "Tarjetas de presentación y papelería personalizada en Uruguay",
    metaDesc:
      "Imprimí tarjetas de presentación, hojas membretadas, sobres, blocks y carpetas con tu logo. Papeles premium, envío a todo Uruguay. Cotizá online.",
    intro: [
      "La papelería es lo primero que tus clientes tocan de tu marca. En PRINTE UY imprimís tarjetas de presentación, hojas membretadas, sobres, blocks de notas, carpetas y recetarios con tu diseño, en papeles comunes o premium.",
      "Elegí el tamaño, el papel, la terminación y la cantidad, pedí tu cotización sin compromiso y recibí tu pedido en cualquier punto de Uruguay.",
    ],
    usos: [
      "Tarjetas para profesionales, comercios y emprendedores",
      "Hojas membretadas y sobres para presupuestos y facturas",
      "Blocks y recetarios para consultorios y oficinas",
      "Carpetas para presentaciones y propuestas comerciales",
    ],
    faq: [
      {
        p: "¿Qué papel conviene para tarjetas de presentación?",
        r: "Para el día a día, el couché de 300 g es firme y con buen color. Si buscás un acabado más elegante, probá papeles especiales, laminado mate o detalles con hot stamping o barniz sectorizado.",
      },
      {
        p: "¿Cuál es el tamaño estándar de una tarjeta?",
        r: "El más usado es 9 x 5 cm. También hay formatos cuadrados y verticales: elegís el que prefieras en el configurador del producto.",
      },
      {
        p: "¿Puedo imprimir las dos caras?",
        r: "Sí. Elegí la opción de impresión frente y dorso (4x4) en el configurador y subí el diseño de las dos caras.",
      },
    ],
  },
  {
    categoria: "Etiquetas y Adhesivos",
    h1: "Adhesivos y etiquetas personalizadas",
    termo: "adhesivos personalizados",
    metaTitulo: "Adhesivos y etiquetas personalizadas en Uruguay | Stickers con tu logo",
    metaDesc:
      "Adhesivos redondos, rectangulares, troquelados y etiquetas en rollo para tus productos y envases. Papel, vinilo y BOPP. Envío a todo Uruguay.",
    intro: [
      "Los adhesivos son la forma más simple de poner tu marca en todo: cajas, bolsas, frascos, regalos y vidrieras. Imprimimos stickers redondos, cuadrados, rectangulares y con forma, etiquetas para productos y rótulos en rollo.",
      "Podés elegir papel, vinilo o BOPP resistente a la humedad, con terminación brillante, mate o con detalles metalizados.",
    ],
    usos: [
      "Etiquetas para alimentos, cosmética y bebidas",
      "Stickers para cerrar bolsas y cajas de envío",
      "Adhesivos con logo para regalar o vender",
      "Rótulos en rollo para producción en serie",
    ],
    faq: [
      {
        p: "¿Qué material de adhesivo resiste agua o heladera?",
        r: "El BOPP y el vinilo resisten la humedad y el frío, por eso se usan en bebidas, cosmética y productos refrigerados. El papel adhesivo es ideal para uso seco y es el más económico.",
      },
      {
        p: "¿Puedo pedir adhesivos con forma de mi logo?",
        r: "Sí, con la opción troquelada cortamos el adhesivo siguiendo el contorno de tu diseño.",
      },
      {
        p: "¿Los entregan sueltos o en rollo?",
        r: "Según el producto, en planchas, sueltos o en bobina. El formato de entrega aparece en las opciones de cada adhesivo.",
      },
    ],
  },
  {
    categoria: "Volantes y Folletos",
    h1: "Volantes, flyers y folletos",
    termo: "volantes y flyers",
    metaTitulo: "Impresión de volantes, flyers y folletos en Uruguay",
    metaDesc:
      "Imprimí volantes, flyers y folletos plegados para promociones, eventos y delivery. Precios por cantidad y envío a todo Uruguay.",
    intro: [
      "Un buen volante sigue siendo una de las formas más baratas de llegar a clientes cerca de tu negocio. Imprimimos flyers, volantes, folletos con uno o dos pliegues y menús para delivery.",
      "Cuanto más cantidad, menor el precio por unidad: pedí la cotización con la cantidad que necesitás.",
    ],
    usos: [
      "Promociones y lanzamientos de tu comercio",
      "Eventos, fiestas y ferias",
      "Menús y listas de precios para delivery",
      "Folletos institucionales y de servicios",
    ],
    faq: [
      {
        p: "¿Qué tamaño de volante conviene?",
        r: "El A5 (15 x 21 cm) es el más usado para promociones; el A6 es práctico para repartir en mano y el A4 sirve para folletos con más información.",
      },
      {
        p: "¿Qué diferencia hay entre volante y folleto?",
        r: "El volante es una hoja impresa de una o dos caras; el folleto lleva pliegues (díptico o tríptico) y entra más información.",
      },
      {
        p: "¿Cuántos volantes debería imprimir?",
        r: "Para repartir en un barrio suelen alcanzar entre 1.000 y 2.500. A partir de esas cantidades el precio por unidad baja bastante.",
      },
    ],
  },
  {
    categoria: "Packaging y Envases",
    h1: "Packaging, cajas y bolsas personalizadas",
    termo: "packaging personalizado",
    metaTitulo: "Packaging personalizado en Uruguay | Cajas y bolsas con tu logo",
    metaDesc:
      "Cajas para envíos, cajas con tapa, bolsas de papel y envases personalizados para tu marca o e-commerce. Envío a todo Uruguay.",
    intro: [
      "El packaging protege tu producto y es parte de la experiencia de compra. Imprimimos cajas para envíos, cajas con tapa, cajas tipo cajón, envases para alimentos, bolsas de papel y tags.",
      "Ideal para tiendas online, emprendimientos de regalos, gastronomía y cosmética que quieren que cada entrega se vea profesional.",
    ],
    usos: [
      "Cajas para envíos de tiendas online",
      "Envases para dulces, panificados y comidas",
      "Bolsas de papel para comercios",
      "Cajas de regalo y kits corporativos",
    ],
    faq: [
      {
        p: "¿Puedo imprimir el interior de la caja?",
        r: "En varios modelos sí: elegí la opción de impresión interna en el configurador del producto.",
      },
      {
        p: "¿Las cajas llegan armadas?",
        r: "Se entregan planas para ocupar menos lugar y se arman fácilmente con los pliegues marcados.",
      },
      {
        p: "¿Cuál es la cantidad mínima de cajas?",
        r: "Depende del modelo; la cantidad mínima aparece en la página de cada producto.",
      },
    ],
  },
  {
    categoria: "Regalos Empresariales",
    h1: "Regalos empresariales y merchandising con tu logo",
    termo: "regalos empresariales",
    metaTitulo: "Regalos empresariales y merchandising personalizado en Uruguay",
    metaDesc:
      "Bolígrafos, llaveros, mochilas, botellas, pins y más regalos con tu logo para clientes, eventos y equipos. Envío a todo Uruguay.",
    intro: [
      "Un regalo útil con tu marca hace que te recuerden todos los días. Personalizamos bolígrafos, llaveros, pins, mouse pads, cuadernos, mochilas, botellas y muchos artículos más.",
      "Son perfectos para fin de año, bienvenida de nuevos colaboradores, ferias y eventos.",
    ],
    usos: [
      "Regalos de fin de año para clientes",
      "Kits de bienvenida para equipos",
      "Merchandising para ferias y congresos",
      "Souvenirs para eventos",
    ],
    faq: [
      {
        p: "¿Puedo pedir pocas unidades?",
        r: "Muchos regalos se pueden pedir desde pocas unidades. La cantidad mínima figura en cada producto.",
      },
      {
        p: "¿Cómo se personaliza cada regalo?",
        r: "Según el material: impresión a color, serigrafía, grabado o sublimación. El método aparece en la descripción del producto.",
      },
      {
        p: "¿Me ayudan con el diseño del logo?",
        r: "Sí, escribinos por WhatsApp y te orientamos para que el logo quede bien en cada producto.",
      },
    ],
  },
  {
    categoria: "Tazas, Vasos y Botellas",
    h1: "Tazas, vasos y botellas personalizadas",
    termo: "tazas personalizadas",
    metaTitulo: "Tazas, vasos y botellas personalizadas en Uruguay",
    metaDesc:
      "Tazas de cerámica, vasos térmicos, botellas de aluminio y squeezes con tu diseño o logo. Para regalar, vender o tu empresa.",
    intro: [
      "Las tazas y botellas personalizadas son de los regalos más pedidos: se usan todos los días y tu diseño queda siempre a la vista. Personalizamos tazas de cerámica, vasos térmicos, botellas de aluminio y squeezes.",
      "Sirven para regalos de cumpleaños, fechas especiales, emprendimientos y merchandising de empresas.",
    ],
    usos: [
      "Regalos personalizados con fotos y frases",
      "Merchandising para empresas y gimnasios",
      "Productos para vender en tu emprendimiento",
      "Kits corporativos y eventos",
    ],
    faq: [
      {
        p: "¿La impresión de la taza sale con el lavado?",
        r: "No: la sublimación queda dentro del esmalte de la taza. Para que dure más, recomendamos lavarla a mano.",
      },
      {
        p: "¿Puedo poner una foto?",
        r: "Sí, podés usar fotos, logos o frases. Usá imágenes en buena resolución para que salgan nítidas.",
      },
      {
        p: "¿Hacen botellas térmicas con logo?",
        r: "Sí, tenemos botellas y squeezes de distintos materiales con el logo grabado o impreso.",
      },
    ],
  },
  {
    categoria: "Cartelería y Banners",
    h1: "Banners, carteles y cartelería",
    termo: "banners y carteles",
    metaTitulo: "Banners, roll ups y carteles en Uruguay | Cartelería para tu negocio",
    metaDesc:
      "Banners, roll ups, carteles, displays, tótems y lonas para locales, ferias y eventos. Impresión en gran formato con envío a todo Uruguay.",
    intro: [
      "La cartelería hace que tu negocio se vea desde lejos. Imprimimos banners, roll ups, lonas, carteles, displays de mostrador, tótems y piezas de comunicación visual en gran formato.",
      "Ideales para vidrieras, ferias, congresos, inauguraciones y puntos de venta.",
    ],
    usos: [
      "Roll ups y banners para ferias y eventos",
      "Carteles y vinilos para vidrieras",
      "Displays de mostrador y QR para mesas",
      "Señalética para locales y oficinas",
    ],
    faq: [
      {
        p: "¿Qué es un roll up?",
        r: "Es un banner vertical que se enrolla en su propia base: se arma en segundos y se transporta en un bolso.",
      },
      {
        p: "¿Qué resolución necesita el archivo?",
        r: "Para gran formato alcanza con 100 a 150 dpi al tamaño final. Si tenés dudas, revisamos tu archivo antes de imprimir.",
      },
      {
        p: "¿Sirven para exterior?",
        r: "Las lonas y vinilos sí. Para exterior elegí materiales resistentes al sol y la lluvia en las opciones del producto.",
      },
    ],
  },
  {
    categoria: "Material de Marketing",
    h1: "Material de marketing para tu negocio",
    termo: "material de marketing",
    metaTitulo: "Material de marketing impreso en Uruguay | Postales, tags y más",
    metaDesc:
      "Postales, tarjetas de agradecimiento, tags, señaladores, credenciales y piezas impresas para promocionar tu marca. Envío a todo Uruguay.",
    intro: [
      "Los pequeños detalles impresos hacen la diferencia: una tarjeta de agradecimiento en cada pedido, un señalador o una postal con tu marca. Imprimimos postales, tags, señaladores, credenciales, vouchers y más.",
      "Son ideales para tiendas online, emprendimientos y eventos que quieren fidelizar a sus clientes.",
    ],
    usos: [
      "Tarjetas de agradecimiento para tus envíos",
      "Vouchers y gift cards",
      "Credenciales para eventos y equipos",
      "Postales y señaladores promocionales",
    ],
    faq: [
      {
        p: "¿Qué pongo en una tarjeta de agradecimiento?",
        r: "Un mensaje corto, tu logo, tus redes y, si querés, un cupón de descuento para la próxima compra.",
      },
      {
        p: "¿Puedo imprimir vouchers numerados?",
        r: "Escribinos por WhatsApp con la cantidad y el diseño y te pasamos las opciones de numeración.",
      },
    ],
  },
  {
    categoria: "Catálogos, Libros y Revistas",
    h1: "Impresión de catálogos, libros y revistas",
    termo: "impresión de catálogos",
    metaTitulo: "Impresión de catálogos, libros y revistas en Uruguay",
    metaDesc:
      "Imprimí catálogos de productos, libros, revistas, folletos anillados y cuadernillos con tapa a color. Precios por cantidad y envío a todo Uruguay.",
    intro: [
      "Un catálogo impreso muestra tus productos con calidad y queda en manos del cliente. Imprimimos catálogos, libros, revistas, cuadernillos y publicaciones con distintos tipos de encuadernación.",
      "Elegí la cantidad de páginas, el papel del interior y de la tapa, y el tipo de terminación.",
    ],
    usos: [
      "Catálogos de productos para vendedores",
      "Libros de autor y publicaciones",
      "Revistas institucionales",
      "Cuadernillos para cursos y capacitaciones",
    ],
    faq: [
      {
        p: "¿Qué encuadernación conviene?",
        r: "Con pocas páginas, el engrapado (lomo con grapas) es práctico y económico; con muchas páginas, el encolado (lomo cuadrado) o el anillado.",
      },
      {
        p: "¿La cantidad de páginas tiene que ser múltiplo de algo?",
        r: "En engrapado, la cantidad de páginas debe ser múltiplo de 4. El configurador te muestra las opciones válidas.",
      },
    ],
  },
  {
    categoria: "Agendas y Calendarios",
    h1: "Agendas y calendarios personalizados",
    termo: "calendarios personalizados",
    metaTitulo: "Agendas y calendarios personalizados 2027 en Uruguay",
    metaDesc:
      "Calendarios de pared y de escritorio, agendas y planners con tu marca o tus fotos. Un regalo útil para todo el año. Envío a todo Uruguay.",
    intro: [
      "Un calendario con tu marca acompaña a tus clientes los 365 días del año. Imprimimos calendarios de pared, de escritorio y de bolsillo, agendas y planners personalizados.",
      "Son un clásico para regalos de fin de año de empresas, y también para regalar con fotos familiares.",
    ],
    usos: [
      "Regalos de fin de año para clientes",
      "Calendarios con fotos para regalar",
      "Agendas corporativas para equipos",
      "Planners para emprendedores",
    ],
    faq: [
      {
        p: "¿Cuándo conviene encargar los calendarios?",
        r: "Lo ideal es pedirlos en octubre o noviembre para tenerlos antes de fin de año.",
      },
      {
        p: "¿Puedo poner una foto distinta en cada mes?",
        r: "Sí, en los calendarios con varias hojas cada mes puede llevar su propia imagen.",
      },
    ],
  },
  {
    categoria: "Línea Hot Stamping",
    h1: "Impresos con hot stamping (dorado y plateado)",
    termo: "hot stamping",
    metaTitulo: "Hot stamping en Uruguay | Tarjetas, invitaciones y tags con dorado",
    metaDesc:
      "Tarjetas, invitaciones, tags y adhesivos con hot stamping dorado, plateado o de colores. Un acabado premium que brilla. Envío a todo Uruguay.",
    intro: [
      "El hot stamping aplica una lámina metalizada (dorada, plateada o de color) sobre el impreso y le da un brillo que la tinta común no logra. Es el acabado preferido para marcas premium, casamientos y eventos.",
      "Lo ofrecemos en tarjetas de presentación, invitaciones, tags, adhesivos y carpetas.",
    ],
    usos: [
      "Tarjetas de presentación premium",
      "Invitaciones de casamiento y 15 años",
      "Tags y etiquetas para ropa y regalos",
      "Adhesivos de lujo para packaging",
    ],
    faq: [
      {
        p: "¿Qué partes del diseño pueden llevar hot stamping?",
        r: "Logos, textos y detalles sólidos. Los trazos muy finos o degradados no se recomiendan.",
      },
      {
        p: "¿Qué colores de lámina hay?",
        r: "Dorado, plateado y otros colores según el producto; aparecen en las opciones del configurador.",
      },
    ],
  },
  {
    categoria: "Línea Barniz",
    h1: "Impresos con barniz sectorizado",
    termo: "barniz sectorizado",
    metaTitulo: "Barniz sectorizado en Uruguay | Tarjetas e invitaciones con relieve brillante",
    metaDesc:
      "Tarjetas, invitaciones, carpetas y adhesivos con barniz UV sectorizado: brillo y textura solo donde vos querés. Envío a todo Uruguay.",
    intro: [
      "El barniz sectorizado agrega una capa brillante y con textura solo en partes del diseño, como el logo o un detalle. Se nota a la vista y al tacto, y hace que el impreso se sienta especial.",
      "Disponible en tarjetas de presentación, invitaciones, carpetas, tags y adhesivos.",
    ],
    usos: [
      "Tarjetas con el logo resaltado",
      "Invitaciones con detalles brillantes",
      "Carpetas institucionales",
      "Tags y adhesivos premium",
    ],
    faq: [
      {
        p: "¿Cómo preparo el archivo para barniz?",
        r: "Además del diseño, se envía una capa en negro al 100 % que marca dónde va el barniz. Si no sabés hacerlo, te ayudamos.",
      },
      {
        p: "¿El barniz combina con laminado mate?",
        r: "Sí, el contraste entre el mate del laminado y el brillo del barniz es lo que más destaca.",
      },
    ],
  },
  {
    categoria: "Línea Markatto",
    h1: "Papeles especiales Markatto",
    termo: "papeles especiales",
    metaTitulo: "Invitaciones y tarjetas en papeles especiales Markatto | Uruguay",
    metaDesc:
      "Invitaciones, tarjetas y postales en papeles especiales con textura Markatto. Un resultado único para casamientos, eventos y marcas.",
    intro: [
      "Los papeles Markatto tienen texturas y tonos especiales que transforman cualquier impreso en una pieza única. Son ideales para invitaciones de casamiento, tarjetas de marcas de diseño y postales.",
      "Elegí el papel en el configurador y combinalo con hot stamping o barniz para un acabado aún más exclusivo.",
    ],
    usos: [
      "Invitaciones de casamiento",
      "Tarjetas para marcas de diseño y moda",
      "Postales y tarjetas de agradecimiento",
      "Envíos de lujo",
    ],
    faq: [
      {
        p: "¿Qué tiene de especial el papel Markatto?",
        r: "Su textura y su gramaje alto: el impreso se siente más grueso y elegante que en papel común.",
      },
    ],
  },
  {
    categoria: "Ropa y Mochilas",
    h1: "Remeras, polos y mochilas personalizadas",
    termo: "remeras personalizadas",
    metaTitulo: "Remeras, polos y mochilas personalizadas con tu logo en Uruguay",
    metaDesc:
      "Remeras, polos, chalecos y mochilas con tu logo para uniformes, eventos y merchandising. Envío a todo Uruguay.",
    intro: [
      "Vestí a tu equipo con tu marca. Personalizamos remeras, polos, chalecos y mochilas para uniformes de trabajo, eventos, promociones y merchandising.",
      "Elegí la prenda, el talle y la ubicación del logo en el configurador del producto.",
    ],
    usos: [
      "Uniformes para comercios y empresas",
      "Remeras para eventos y promociones",
      "Mochilas con logo para regalos corporativos",
      "Chalecos de identificación",
    ],
    faq: [
      {
        p: "¿Puedo pedir talles distintos en el mismo pedido?",
        r: "Sí, indicá los talles al confirmar el pedido o escribinos por WhatsApp.",
      },
    ],
  },
  {
    categoria: "Gastronomía y Delivery",
    h1: "Impresos para gastronomía y delivery",
    termo: "menús y cartas",
    metaTitulo: "Menús, cartas e impresos para restaurantes y delivery en Uruguay",
    metaDesc:
      "Menús, cartas plastificadas, individuales, cortadores de pizza y más impresos para restaurantes, bares y delivery.",
    intro: [
      "Todo lo impreso que necesita tu restaurante, bar o delivery: menús y cartas resistentes, individuales, adhesivos para cerrar bolsas y accesorios con tu marca.",
      "Los menús plastificados o en PVC se limpian fácil y duran mucho más.",
    ],
    usos: [
      "Menús y cartas para mesas",
      "Individuales y servilletas",
      "Adhesivos para pedidos de delivery",
      "Regalos con logo para clientes",
    ],
    faq: [
      {
        p: "¿Qué menú dura más?",
        r: "Los menús de plástico o PVC resisten la humedad y se limpian con un paño, ideales para mesas.",
      },
    ],
  },
  {
    categoria: "Casa y Decoración",
    h1: "Cuadros y decoración personalizada",
    termo: "cuadros personalizados",
    metaTitulo: "Cuadros, lienzos y decoración personalizada en Uruguay",
    metaDesc:
      "Cuadros, lienzos (canvas) y piezas de decoración con tus fotos o diseños. Un regalo único para casa u oficina.",
    intro: [
      "Convertí tus fotos o diseños en cuadros y lienzos para decorar tu casa, tu local o tu oficina. Impresión en alta calidad con colores que duran.",
    ],
    usos: ["Cuadros con fotos familiares", "Lienzos para oficinas y locales", "Regalos únicos"],
    faq: [
      {
        p: "¿Qué resolución necesita la foto?",
        r: "Cuanto mayor, mejor. Para un cuadro mediano conviene una foto de al menos 2.000 píxeles de lado.",
      },
    ],
  },
  {
    categoria: "Mascotas",
    h1: "Productos personalizados para mascotas",
    termo: "productos para mascotas",
    metaTitulo: "Productos personalizados para mascotas en Uruguay",
    metaDesc:
      "Alfombras, casitas y accesorios personalizados para mascotas, con el nombre o la marca que quieras.",
    intro: [
      "Accesorios personalizados para perros y gatos: alfombras para comederos, casitas de cartón y más, con el nombre de tu mascota o la marca de tu pet shop.",
    ],
    usos: ["Regalos para dueños de mascotas", "Productos para pet shops y veterinarias"],
    faq: [],
  },
];

export const CATEGORIAS_IMPRENTA: CategoriaImprenta[] = BASE.map((c) => ({
  ...c,
  slug: slugify(c.categoria),
}));

export const categoriaImprentaPorSlug = (s: string) =>
  CATEGORIAS_IMPRENTA.find((c) => c.slug === s) ?? null;
export const categoriaImprentaPorNome = (nome: string | null | undefined) =>
  CATEGORIAS_IMPRENTA.find((c) => c.categoria === nome) ?? null;
// Link limpo da categoria (para o Google); categorias sem página caem no filtro da loja
export const urlCategoria = (nome: string | null | undefined) => {
  const c = categoriaImprentaPorNome(nome);
  return c ? `/categoria/${c.slug}` : `/loja?categoria=${encodeURIComponent(nome ?? "")}`;
};

// Perguntas que valem para qualquer produto (somadas às da categoria)
export const FAQ_GERAL: Pergunta[] = [
  {
    p: "¿Hacen envíos a todo Uruguay?",
    r: "Sí, enviamos a los 19 departamentos. El costo y el plazo dependen de la localidad y se confirman con tu pedido.",
  },
  {
    p: "¿Cómo envío mi diseño?",
    r: "Podés subir tu archivo en PDF, AI, PSD, CDR o JPG en alta resolución. Revisamos el archivo antes de imprimir y te avisamos si hay que ajustar algo.",
  },
  {
    p: "¿No tengo diseño, me pueden ayudar?",
    r: "Sí. Escribinos por WhatsApp con tu logo y la idea, y te orientamos para preparar el archivo.",
  },
  {
    p: "¿Cuáles son las formas de pago?",
    r: "Al confirmar el pedido te informamos las formas de pago disponibles. Cualquier duda, consultanos por WhatsApp antes de pagar.",
  },
];
