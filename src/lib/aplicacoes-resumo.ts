// Resumo das aplicações de uma peça (tabela pecas_aplicacao): "Volkswagen Gol (2008–2014), Fox y
// Voyage". É o que torna cada página de peça única para o Google (o mesmo código de fábrica existe
// em muitos sites, mas a lista de vehículos compatíveis, em espanhol, não). Código puro (site e
// servidor).

export type Aplicacao = {
  montadora: string;
  veiculo: string;
  ano?: string | null;
  motor?: string | null;
};
export type VeiculoResumo = {
  valor: string; // montadora como está no banco (filtro ?auto=)
  marca: string; // nome para mostrar ("Mercedes-Benz")
  modelo: string; // primeira palavra do veículo (filtro ?modelo=)
  anoIni: number | null;
  anoFim: number | null;
  total: number; // quantas versões/motores
};

const NOMES_ESPECIAIS: Record<string, string> = {
  "MERCEDES BENZ": "Mercedes-Benz",
  "MERCEDES-BENZ": "Mercedes-Benz",
  BMW: "BMW",
  GMC: "GMC",
  JAC: "JAC",
  BYD: "BYD",
  MG: "MG",
  DAF: "DAF",
  "LAND ROVER": "Land Rover",
  CITROEN: "Citroën",
};
export function nomeMontadora(m: string): string {
  const k = m.trim().toUpperCase();
  if (NOMES_ESPECIAIS[k]) return NOMES_ESPECIAIS[k];
  return k.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase());
}

export const modeloDe = (veiculo: string) =>
  veiculo.trim().replace(/\s+-$/, "").split(/\s+/)[0] ?? "";

// "GOL" -> "Gol"; com número ("S10", "HB20", "206") fica como está
const nomeModelo = (m: string) => (/\d/.test(m) ? m : m.charAt(0) + m.slice(1).toLowerCase());

const ANO_MAX = new Date().getFullYear() + 1;

export function resumirAplicacoes(aps: Aplicacao[] | null | undefined, max = 12): VeiculoResumo[] {
  const mapa = new Map<string, VeiculoResumo>();
  for (const a of aps ?? []) {
    const modelo = modeloDe(a.veiculo || "");
    if (!a.montadora || !modelo || modelo === "-") continue;
    const k = `${a.montadora}|${modelo}`;
    const r =
      mapa.get(k) ??
      ({
        valor: a.montadora,
        marca: nomeMontadora(a.montadora),
        modelo: nomeModelo(modelo),
        anoIni: null,
        anoFim: null,
        total: 0,
      } as VeiculoResumo);
    r.total++;
    const m = a.ano?.match(/^(\d{4})(?:-(\d{4}))?$/);
    if (m) {
      const ini = Number(m[1]);
      const fim = Math.min(Number(m[2] ?? m[1]), ANO_MAX);
      if (ini >= 1950) {
        r.anoIni = r.anoIni == null ? ini : Math.min(r.anoIni, ini);
        r.anoFim = r.anoFim == null ? fim : Math.max(r.anoFim, fim);
      }
    }
    mapa.set(k, r);
  }
  return [...mapa.values()].sort((a, b) => b.total - a.total).slice(0, max);
}

export const anosTexto = (v: Pick<VeiculoResumo, "anoIni" | "anoFim">) =>
  v.anoIni == null ? "" : v.anoIni === v.anoFim ? `${v.anoIni}` : `${v.anoIni}–${v.anoFim}`;

// "Volkswagen Gol, Fox y Voyage": agrupa por marca, até `max` modelos
export function fraseVeiculos(res: VeiculoResumo[], max = 3): string {
  const escolhidos = res.slice(0, max);
  const porMarca = new Map<string, string[]>();
  for (const v of escolhidos) porMarca.set(v.marca, [...(porMarca.get(v.marca) ?? []), v.modelo]);
  const grupos = [...porMarca].map(([marca, modelos]) => `${marca} ${juntar(modelos)}`);
  return juntar(grupos);
}
const juntar = (xs: string[]) =>
  xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}`;
