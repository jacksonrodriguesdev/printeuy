// Testa a listagem da loja direto no servidor (sem navegador): categoria, veículo e busca.
// npx tsx --env-file=.env scripts/diagnostico/testar_loja.ts
import { listProducts } from "../../src/lib/products.server";
import { marcasVeiculo, modelosVeiculo, anosVeiculo } from "../../src/lib/veiculos.server";

const t = async (nome: string, f: () => Promise<unknown>) => {
  const ini = Date.now();
  const r = await f();
  console.log(nome, `${Date.now() - ini}ms`, JSON.stringify(r).slice(0, 300));
};

(async () => {
  await t("frenos", async () => {
    const r = await listProducts({
      categoria: ["Frenos"],
      hasImage: true,
      vitrine: true,
      pageSize: 3,
    });
    return {
      total: r.total,
      nomes: r.rows.map((p: any) => [p.nome, p.preco_brl, p.imagem_principal]),
    };
  });
  await t("marcas", async () => (await marcasVeiculo()).slice(0, 5));
  await t("modelos VW", async () => (await modelosVeiculo("VOLKSWAGEN")).slice(0, 8));
  await t("anos GOL", async () => (await anosVeiculo("VOLKSWAGEN", "GOL")).slice(0, 8));
  await t("gol 2010 frenos", async () => {
    const r = await listProducts({
      categoria: ["Frenos"],
      veiculo: { montadora: "VOLKSWAGEN", modelo: "GOL", ano: 2010 },
      vitrine: true,
      pageSize: 3,
    });
    return { total: r.total, nomes: r.rows.map((p: any) => p.nome) };
  });
  await t("busca pastilla", async () => {
    const r = await listProducts({ search: "pastilla de freno", pageSize: 3 });
    return { total: r.total, nomes: r.rows.map((p: any) => p.nome) };
  });
  process.exit(0);
})();
