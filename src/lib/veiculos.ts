// Funções do navegador para o buscador por veículo (marca → modelo → año)
import { createServerFn } from "@tanstack/react-start";

export type { OpcaoVeiculo } from "./veiculos.server";

const curto = (v: unknown) => String(v ?? "").slice(0, 80);

export const marcasVeiculoFn = createServerFn({ method: "GET" }).handler(async () => {
  const s = await import("./veiculos.server");
  return s.marcasVeiculo();
});

export const modelosVeiculoFn = createServerFn({ method: "GET" })
  .validator((d: { montadora: string }) => ({ montadora: curto(d?.montadora) }))
  .handler(async ({ data }) => {
    const s = await import("./veiculos.server");
    return data.montadora ? s.modelosVeiculo(data.montadora) : [];
  });

export const anosVeiculoFn = createServerFn({ method: "GET" })
  .validator((d: { montadora: string; modelo: string }) => ({
    montadora: curto(d?.montadora),
    modelo: curto(d?.modelo),
  }))
  .handler(async ({ data }) => {
    const s = await import("./veiculos.server");
    return data.montadora && data.modelo ? s.anosVeiculo(data.montadora, data.modelo) : [];
  });

// Página por veículo (/vehiculos/<marca>/<modelo>): total, peças em destaque, anos e quantas
// peças há em cada categoria principal. Tudo em cache (o catálogo muda pouco).
export const getPaginaVeiculoFn = createServerFn({ method: "GET" })
  .validator((d: { montadora: string; modelo?: string | null }) => ({
    montadora: curto(d?.montadora),
    modelo: d?.modelo ? curto(d.modelo) : null,
  }))
  .handler(async ({ data }) => {
    const { emCache } = await import("./cache.server");
    return emCache(`pagina-veiculo|${data.montadora}|${data.modelo}`, 30 * 60_000, async () => {
      const { buscarSkus } = await import("./busca-catalogo.server");
      const { listProducts } = await import("./products.server");
      const { anosVeiculo, modelosVeiculo } = await import("./veiculos.server");
      const { CATEGORIAS } = await import("./navegacao");
      const veiculo = { montadora: data.montadora, modelo: data.modelo };
      const [todos, pagina, anos, modelos] = await Promise.all([
        buscarSkus({ vitrine: true, veiculo }),
        listProducts({ vitrine: true, hasImage: true, veiculo, sort: "nome-asc", pageSize: 24 }),
        data.modelo ? anosVeiculo(data.montadora, data.modelo) : Promise.resolve([] as number[]),
        data.modelo ? Promise.resolve([]) : modelosVeiculo(data.montadora),
      ]);
      const categorias: Array<{ nome: string; total: number }> = [];
      for (const c of CATEGORIAS.slice(0, 12)) {
        const n = (await buscarSkus({ vitrine: true, veiculo, categoria: c.nome })).length;
        if (n) categorias.push({ nome: c.nome, total: n });
      }
      return {
        total: todos.length,
        produtos: pagina.rows,
        anos,
        modelos: modelos.slice(0, 40),
        categorias: categorias.sort((a, b) => b.total - a.total),
      };
    });
  });
