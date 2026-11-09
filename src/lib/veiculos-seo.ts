// Páginas por veículo para o Google: /vehiculos/<marca>/<modelo> ("repuestos gol uruguay").
// Os veículos mais comuns no Uruguai, com valor = montadora no banco (pecas_aplicacao) e modelos
// = primeira palavra do veículo cadastrado (o mesmo critério do buscador por veículo).
import { slugify } from "./seo-paginas";

// Veículos mais comuns no Uruguai. valor = montadora no banco (pecas_aplicacao), modelos = primeira
// palavra do veículo cadastrado (é o que o buscador por veículo usa: /loja?auto=&modelo=)
export const VEICULOS_UY: Array<{
  valor: string;
  nome: string;
  apelidos: string[];
  modelos: string[];
}> = [
  {
    valor: "VOLKSWAGEN",
    nome: "Volkswagen",
    apelidos: ["volkswagen", "vw"],
    modelos: [
      "GOL",
      "FOX",
      "VOYAGE",
      "SAVEIRO",
      "AMAROK",
      "UP",
      "POLO",
      "GOLF",
      "SURAN",
      "BORA",
      "VENTO",
    ],
  },
  {
    valor: "CHEVROLET",
    nome: "Chevrolet",
    apelidos: ["chevrolet", "chevy"],
    modelos: [
      "ONIX",
      "PRISMA",
      "CORSA",
      "CELTA",
      "S10",
      "SPIN",
      "CRUZE",
      "AGILE",
      "CLASSIC",
      "MONTANA",
      "TRACKER",
    ],
  },
  {
    valor: "FIAT",
    nome: "Fiat",
    apelidos: ["fiat"],
    modelos: [
      "UNO",
      "PALIO",
      "SIENA",
      "STRADA",
      "FIORINO",
      "CRONOS",
      "MOBI",
      "TORO",
      "ARGO",
      "DUCATO",
      "PUNTO",
    ],
  },
  {
    valor: "FORD",
    nome: "Ford",
    apelidos: ["ford"],
    modelos: ["FIESTA", "KA", "FOCUS", "RANGER", "ECOSPORT", "COURIER", "TRANSIT"],
  },
  {
    valor: "RENAULT",
    nome: "Renault",
    apelidos: ["renault"],
    modelos: ["CLIO", "SANDERO", "LOGAN", "KANGOO", "DUSTER", "MEGANE", "SYMBOL", "KWID", "OROCH"],
  },
  {
    valor: "PEUGEOT",
    nome: "Peugeot",
    apelidos: ["peugeot"],
    modelos: ["206", "207", "208", "307", "308", "PARTNER", "2008", "3008"],
  },
  {
    valor: "TOYOTA",
    nome: "Toyota",
    apelidos: ["toyota"],
    modelos: ["HILUX", "COROLLA", "ETIOS", "YARIS", "SW4", "RAV4"],
  },
  {
    valor: "CITROEN",
    nome: "Citroën",
    apelidos: ["citroen"],
    modelos: ["C3", "C4", "BERLINGO", "XSARA", "AIRCROSS"],
  },
  {
    valor: "HYUNDAI",
    nome: "Hyundai",
    apelidos: ["hyundai"],
    modelos: ["HB20", "ACCENT", "TUCSON", "CRETA", "I30", "H1", "HR"],
  },
  {
    valor: "NISSAN",
    nome: "Nissan",
    apelidos: ["nissan"],
    modelos: ["MARCH", "VERSA", "FRONTIER", "SENTRA", "TIIDA", "KICKS"],
  },
  {
    valor: "HONDA",
    nome: "Honda",
    apelidos: ["honda"],
    modelos: ["CIVIC", "FIT", "CITY", "HR-V", "CR-V"],
  },
  {
    valor: "KIA",
    nome: "Kia",
    apelidos: ["kia"],
    modelos: ["PICANTO", "RIO", "SPORTAGE", "CERATO"],
  },
  {
    valor: "MITSUBISHI",
    nome: "Mitsubishi",
    apelidos: ["mitsubishi"],
    modelos: ["L200", "PAJERO", "LANCER", "OUTLANDER"],
  },
  {
    valor: "MERCEDES BENZ",
    nome: "Mercedes-Benz",
    apelidos: ["mercedes benz", "mercedes"],
    modelos: ["SPRINTER", "ACCELO", "ATEGO", "AXOR", "CLASSE"],
  },
];

export const slugMarca = (v: { nome: string }) => slugify(v.nome);
export const urlVeiculo = (v: { nome: string }, modelo?: string) =>
  `/vehiculos/${slugMarca(v)}${modelo ? `/${slugify(modelo)}` : ""}`;
export function veiculoPorSlug(marca: string, modelo?: string) {
  const v = VEICULOS_UY.find((x) => slugMarca(x) === marca);
  if (!v) return null;
  const m = modelo ? v.modelos.find((x) => slugify(x) === modelo) : undefined;
  if (modelo && !m) return null;
  return { veiculo: v, modelo: m ?? null };
}
// "GOL" -> "Gol"; com número ("S10", "HB20", "206") fica como está
export const nomeModeloSeo = (m: string) =>
  /\d/.test(m) ? m : m.charAt(0) + m.slice(1).toLowerCase();
