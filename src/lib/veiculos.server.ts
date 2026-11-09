// Busca por veículo (marca → modelo → ano) a partir das aplicações das peças (pecas_aplicacao).
// "Modelo" é a primeira palavra do veículo cadastrado ("GOL SPECIAL" → GOL, "CARGO C 2429" → CARGO).
// Os anos vêm das faixas "2001-2005". Tudo em cache: as aplicações mudam só quando o catálogo é
// importado de novo.
import { prisma } from "./prisma";
import { emCache } from "./cache.server";
import { modeloDe, nomeMontadora } from "./aplicacoes-resumo";

export { nomeMontadora };

const HORA = 3600_000;
const ANO_ATUAL = new Date().getFullYear();

export type OpcaoVeiculo = { valor: string; rotulo: string; total: number };

export function marcasVeiculo(): Promise<OpcaoVeiculo[]> {
  return emCache("veiculos|marcas", 6 * HORA, async () => {
    // COUNT(*) usa só o índice (montadora, veiculo); COUNT(DISTINCT sku) levava mais de 1 minuto
    const rows = await prisma.$queryRawUnsafe<Array<{ montadora: string; n: bigint }>>(
      `SELECT montadora, COUNT(*) n FROM pecas_aplicacao
        WHERE montadora <> '' GROUP BY montadora HAVING n >= 20 ORDER BY n DESC`,
    );
    return rows.map((r) => ({
      valor: r.montadora,
      rotulo: nomeMontadora(r.montadora),
      total: Number(r.n),
    }));
  });
}

export function modelosVeiculo(montadora: string): Promise<OpcaoVeiculo[]> {
  return emCache(`veiculos|modelos|${montadora}`, 6 * HORA, async () => {
    const rows = await prisma.$queryRawUnsafe<Array<{ veiculo: string; n: bigint }>>(
      `SELECT veiculo, COUNT(*) n FROM pecas_aplicacao WHERE montadora = ? GROUP BY veiculo`,
      montadora,
    );
    const porModelo = new Map<string, number>();
    for (const r of rows) {
      const m = modeloDe(r.veiculo);
      if (!m || m === "-") continue;
      porModelo.set(m, (porModelo.get(m) ?? 0) + Number(r.n));
    }
    return (
      [...porModelo.entries()]
        .filter(([, n]) => n >= 3)
        // Nombres (GOL, PALIO…) primero; códigos de camiones (17-210, 8.150…) al final
        .sort((a, b) => {
          const na = /^\d/.test(a[0]);
          const nb = /^\d/.test(b[0]);
          return na !== nb ? (na ? 1 : -1) : a[0].localeCompare(b[0], "es", { numeric: true });
        })
        .map(([m, n]) => ({ valor: m, rotulo: m, total: n }))
    );
  });
}

// Condição SQL do modelo: o veículo é o modelo ou começa com "MODELO "
const condModelo = "(veiculo = ? OR veiculo LIKE CONCAT(?, ' %'))";

export function anosVeiculo(montadora: string, modelo: string): Promise<number[]> {
  return emCache(`veiculos|anos|${montadora}|${modelo}`, 6 * HORA, async () => {
    const rows = await prisma.$queryRawUnsafe<Array<{ ano: string | null }>>(
      `SELECT DISTINCT ano FROM pecas_aplicacao WHERE montadora = ? AND ${condModelo}`,
      montadora,
      modelo,
      modelo,
    );
    const anos = new Set<number>();
    for (const { ano } of rows) {
      const m = ano?.match(/^(\d{4})(?:-(\d{4}))?$/);
      if (!m) continue;
      const ini = Number(m[1]);
      const fim = Math.min(Number(m[2] ?? m[1]), ANO_ATUAL + 1);
      if (ini < 1950 || fim < ini) continue;
      for (let a = ini; a <= fim; a++) anos.add(a);
    }
    return [...anos].sort((a, b) => b - a);
  });
}

export type FiltroVeiculo = { montadora: string; modelo?: string | null; ano?: number | null };

// SKUs das peças que servem no veículo
export function skusDoVeiculo(f: FiltroVeiculo): Promise<Set<string>> {
  const chave = `veiculos|skus|${f.montadora}|${f.modelo ?? ""}|${f.ano ?? ""}`;
  return emCache(chave, 6 * HORA, async () => {
    const cond = ["montadora = ?"];
    const params: Array<string | number> = [f.montadora];
    if (f.modelo) {
      cond.push(condModelo);
      params.push(f.modelo, f.modelo);
    }
    if (f.ano) {
      // Faixa "2001-2005" (ou ano único "2012") que contém o ano pedido
      cond.push(
        "ano REGEXP '^[0-9]{4}(-[0-9]{4})?$'",
        "CAST(LEFT(ano, 4) AS UNSIGNED) <= ?",
        "CAST(RIGHT(ano, 4) AS UNSIGNED) >= ?",
      );
      params.push(f.ano, f.ano);
    }
    const rows = await prisma.$queryRawUnsafe<Array<{ sku: string }>>(
      `SELECT DISTINCT sku FROM pecas_aplicacao WHERE ${cond.join(" AND ")}`,
      ...params,
    );
    return new Set(rows.map((r) => r.sku));
  });
}
