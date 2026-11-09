import {
  BookOpen,
  CalendarDays,
  CupSoda,
  Flag,
  Gift,
  Home,
  Megaphone,
  Newspaper,
  NotebookPen,
  Package,
  PawPrint,
  Shapes,
  Shirt,
  Sparkles,
  Stamp,
  Tag,
  UtensilsCrossed,
  Vote,
} from "lucide-react";
import { IconeVarios, type IconeAuto } from "@/components/icones/IconesAuto";

// Categorias principais da gráfica (nomes iguais ao banco, para o filtro da loja funcionar), na
// ordem do menu e da home. O importador (scripts/catalogo/importar_printi.cjs) usa estes nomes.
export const CATEGORIAS: Array<{
  nome: string;
  curto: string;
  icon: IconeAuto;
  descricao?: string;
}> = [
  {
    nome: "Tarjetas y Papelería",
    curto: "Papelería",
    icon: NotebookPen,
    descricao:
      "Tarjetas de presentación, hojas membretadas, sobres, blocks y carpetas con la identidad de tu marca.",
  },
  {
    nome: "Etiquetas y Adhesivos",
    curto: "Adhesivos",
    icon: Tag,
    descricao:
      "Adhesivos, etiquetas y rótulos para identificar productos, cerrar envases y destacar tu marca.",
  },
  {
    nome: "Volantes y Folletos",
    curto: "Volantes",
    icon: Newspaper,
    descricao:
      "Flyers, volantes y folletos para promociones, eventos y comunicación de tu negocio.",
  },
  {
    nome: "Packaging y Envases",
    curto: "Packaging",
    icon: Package,
    descricao:
      "Cajas, bolsas y envases personalizados que protegen tu producto y hacen que se vea mejor.",
  },
  {
    nome: "Regalos Empresariales",
    curto: "Regalos",
    icon: Gift,
    descricao:
      "Bolígrafos, llaveros, mochilas, botellas y más regalos con tu logo para clientes y equipos.",
  },
  {
    nome: "Tazas, Vasos y Botellas",
    curto: "Tazas",
    icon: CupSoda,
    descricao: "Tazas, vasos térmicos y botellas personalizadas para regalar o vender.",
  },
  {
    nome: "Cartelería y Banners",
    curto: "Cartelería",
    icon: Flag,
    descricao: "Banners, carteles, placas y piezas de comunicación visual para tu local o evento.",
  },
  {
    nome: "Material de Marketing",
    curto: "Marketing",
    icon: Megaphone,
    descricao: "Piezas impresas para promociones, puntos de venta y acciones de marketing.",
  },
  {
    nome: "Catálogos, Libros y Revistas",
    curto: "Catálogos",
    icon: BookOpen,
    descricao: "Catálogos, revistas, libros y folletos encuadernados con calidad profesional.",
  },
  {
    nome: "Agendas y Calendarios",
    curto: "Agendas",
    icon: CalendarDays,
    descricao: "Agendas, planners y calendarios de mesa o pared con tu marca, para todo el año.",
  },
  {
    nome: "Línea Hot Stamping",
    curto: "Hot Stamping",
    icon: Sparkles,
    descricao: "Terminaciones metalizadas en dorado, plateado y más, para piezas que destacan.",
  },
  {
    nome: "Línea Barniz",
    curto: "Barniz",
    icon: Stamp,
    descricao: "Barniz localizado que da brillo y relieve a los detalles de tu arte.",
  },
  {
    nome: "Línea Markatto",
    curto: "Markatto",
    icon: Sparkles,
    descricao: "Papeles especiales con textura para piezas premium.",
  },
  { nome: "Ropa y Mochilas", curto: "Ropa", icon: Shirt },
  { nome: "Gastronomía y Delivery", curto: "Gastronomía", icon: UtensilsCrossed },
  { nome: "Casa y Decoración", curto: "Casa", icon: Home },
  { nome: "Mascotas", curto: "Mascotas", icon: PawPrint },
  { nome: "Material Electoral", curto: "Electoral", icon: Vote },
  { nome: "Varios", curto: "Varios", icon: Shapes },
];

export function iconeCategoria(nome: string): IconeAuto {
  const principal = nome.split(" > ")[0];
  return CATEGORIAS.find((c) => c.nome === principal)?.icon ?? IconeVarios;
}

// Marcas de vehículos más buscadas en Uruguay (valor = campo `montadora` de pecas_aplicacao)
export const MARCAS_VEICULO: Array<{ valor: string; nome: string }> = [
  { valor: "VOLKSWAGEN", nome: "Volkswagen" },
  { valor: "CHEVROLET", nome: "Chevrolet" },
  { valor: "FIAT", nome: "Fiat" },
  { valor: "FORD", nome: "Ford" },
  { valor: "RENAULT", nome: "Renault" },
  { valor: "PEUGEOT", nome: "Peugeot" },
  { valor: "TOYOTA", nome: "Toyota" },
  { valor: "CITROEN", nome: "Citroën" },
  { valor: "HYUNDAI", nome: "Hyundai" },
  { valor: "NISSAN", nome: "Nissan" },
  { valor: "HONDA", nome: "Honda" },
  { valor: "MITSUBISHI", nome: "Mitsubishi" },
  { valor: "KIA", nome: "Kia" },
  { valor: "MERCEDES BENZ", nome: "Mercedes-Benz" },
  { valor: "SCANIA", nome: "Scania" },
  { valor: "VOLVO", nome: "Volvo" },
];

// Fabricantes de repuestos destacados (valor = campo `marca` da tabela pecas)
export const MARCAS_PECAS = [
  "Bosch",
  "Metal Leve",
  "Eaton",
  "Nakata",
  "Sabó",
  "Mahle",
  "Skf",
  "Sampel",
  "Cofap",
  "Monroe",
  "Fras-le",
  "Valeo",
];
// Nome antigo (filtros e listas de marca da peça no admin e na loja)
export const MONTADORAS = MARCAS_PECAS;

// Redes sociais: preencha com os endereços reais. Ícones e botões só aparecem quando preenchidos.
export const INSTAGRAM_URL = "";
export const INSTAGRAM_USUARIO = "";
export const FACEBOOK_URL = "";

// Sigla da marca no círculo (sem usar logotipos de terceiros): "VW", "CH", "MB"...
const SIGLAS: Record<string, string> = { VOLKSWAGEN: "VW", "MERCEDES BENZ": "MB", CITROEN: "CI" };
export const siglaMarca = (m: { valor: string; nome: string }) =>
  SIGLAS[m.valor] ??
  (/[\s-]/.test(m.nome)
    ? m.nome
        .split(/[\s-]/)
        .map((p) => p[0])
        .join("")
    : m.nome.slice(0, 2)
  )
    .slice(0, 2)
    .toUpperCase();
