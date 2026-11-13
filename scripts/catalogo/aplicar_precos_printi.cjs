// Liga no site os preços da Printi baixados por ../scripts/precos_printi.cjs (../dados/precos/*.jsonl):
//   1. pecas_variacoes: o CUSTO de cada variação (todas as combinações de opções) por quantidade;
//      a página do produto calcula o preço da escolha do cliente com vendaGrafica() (src/lib/precos.ts).
//   2. pecas_detalhes: os kits prontos (combinacoes) voltam a guardar o CUSTO da Printi
//      (precosSaoCusto: true); a venda é calculada na hora em getDetalhesGraficaFn.
//   3. pecas: valor_compra = menor custo (preço mínimo da Printi), preco_brl = venda desse custo
//      (o "Desde" dos cartões), margem = MARGEM.
//
// MARGEM e FRETE precisam ser os mesmos de src/lib/precos.ts (MARGEM_GRAFICA, FRETE_PEDIDO_BRL).
//
// Uso:  node --env-file=.env scripts/catalogo/aplicar_precos_printi.cjs            (simulação)
//       node --env-file=.env scripts/catalogo/aplicar_precos_printi.cjs --aplicar  (banco do .env)
//       node --env-file=.env scripts/catalogo/aplicar_precos_printi.cjs --sql
//            -> dados/deploy/precos_printi.sql (phpMyAdmin; precisa do banco local p/ SKU e kits)

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const MARGEM = 350;
const FRETE = 35;
const venda = (c) => Math.round((c * (1 + MARGEM / 100) + FRETE) * 100) / 100;

const RAIZ = path.join(__dirname, "../../..");
const PRECOS = path.join(RAIZ, "dados", "precos");
const PRODUTOS = path.join(RAIZ, "dados", "produtos");
const APLICAR = process.argv.includes("--aplicar");
const SQL = process.argv.includes("--sql");

const q = (v) =>
  v === null || v === undefined
    ? "NULL"
    : typeof v === "number"
      ? String(v)
      : `'${String(v).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;

(async () => {
  const prisma = new PrismaClient();
  try {
    // slug da Printi -> SKU na loja (o importador usa o SKU da Printi; repetido ganha sufixo)
    const det = await prisma.pecas_detalhes.findMany({ where: { NOT: { sku: { startsWith: "360-" } } } });
    const skuDoSlug = new Map(det.map((d) => [d.dados?.slug, d.sku]));
    const produtos = new Map();
    for (const f of fs.readdirSync(PRODUTOS)) {
      const p = JSON.parse(fs.readFileSync(path.join(PRODUTOS, f), "utf8"));
      produtos.set(p.slug, p);
    }

    // 1. Variações
    const variacoes = [];
    let semSku = 0;
    for (const f of fs.readdirSync(PRECOS).filter((f) => f.endsWith(".jsonl"))) {
      const slug = f.replace(/\.jsonl$/, "");
      const sku = skuDoSlug.get(slug);
      const p = produtos.get(slug);
      if (!sku || !p) {
        semSku++;
        continue;
      }
      const parte0 = p.partes[0]?.id;
      for (const l of fs.readFileSync(path.join(PRECOS, f), "utf8").split("\n")) {
        if (!l) continue;
        let v;
        try {
          v = JSON.parse(l);
        } catch {
          continue;
        }
        if (!v.precos.length) continue; // combinação que a Printi não vende
        const opcoes = {};
        for (const [k, id] of Object.entries(v.opcoes)) {
          if (id == null) continue;
          const [parte, attr] = k.includes(".") ? k.split(".") : [parte0, k];
          opcoes[`${parte}|${attr}`] = id;
        }
        variacoes.push({ sku, opcoes, custos: v.precos });
      }
    }

    // 2 e 3. Kits prontos e "Desde"
    const kits = [];
    const pecas = [];
    for (const d of det) {
      const p = produtos.get(d.dados?.slug);
      if (!p) continue;
      const custoDe = new Map(p.combinacoes.map((c) => [String(c.id), c.precos]));
      const combinacoes = (d.dados.combinacoes || []).map((c) => ({
        ...c,
        precos: (custoDe.get(String(c.id)) || []).map((x) => ({
          quantidade: x.quantidade,
          preco: Math.round(x.preco * 100) / 100,
          unitario: Math.round((x.preco / x.quantidade) * 10000) / 10000,
        })),
      }));
      kits.push({ sku: d.sku, combinacoes });
      if (p.precoMinimo > 0)
        pecas.push({ sku: d.sku, custo: p.precoMinimo, venda: venda(p.precoMinimo) });
    }

    const comVar = new Set(variacoes.map((v) => v.sku)).size;
    console.log(`Variações: ${variacoes.length} (de ${comVar} productos; ${semSku} archivos sin producto)`);
    console.log(`Kits: ${kits.length} productos · "Desde": ${pecas.length} productos`);
    const ex = pecas.find((x) => x.sku === "fadesivo_redondo");
    if (ex) console.log(`Ej.: Adesivo Redondo costo R$ ${ex.custo} -> venta R$ ${ex.venda}`);

    if (SQL) {
      const L = [
        "-- Preços da Printi no site (custo × 4,5 + R$ 35). Rodar no phpMyAdmin, aba SQL.",
        "-- Pode rodar de novo: apaga e recria as variações.",
        "SET NAMES utf8mb4;",
        fs.readFileSync(path.join(__dirname, "../../dados/deploy/tabela_variacoes.sql"), "utf8").trim(),
        "DELETE FROM pecas_variacoes;",
      ];
      for (let i = 0; i < variacoes.length; i += 400)
        L.push(
          "INSERT INTO pecas_variacoes (sku, opcoes, custos) VALUES " +
            variacoes
              .slice(i, i + 400)
              .map((v) => `(${q(v.sku)}, ${q(JSON.stringify(v.opcoes))}, ${q(JSON.stringify(v.custos))})`)
              .join(",\n") +
            ";",
        );
      for (const k of kits)
        L.push(
          `UPDATE pecas_detalhes SET dados = JSON_SET(dados, '$.combinacoes', CAST(${q(JSON.stringify(k.combinacoes))} AS JSON), '$.precosSaoCusto', true), updated_at = NOW(3) WHERE sku = ${q(k.sku)};`,
        );
      for (const p of pecas)
        L.push(
          `UPDATE pecas SET valor_compra = ${p.custo}, preco_brl = ${p.venda}, margem = ${MARGEM}, preco_modo = 'AUTO', precificado_em = NOW(3), updated_at = NOW(3) WHERE sku = ${q(p.sku)};`,
        );
      const arq = path.join(__dirname, "../../dados/deploy/precos_printi.sql");
      fs.writeFileSync(arq, L.join("\n") + "\n");
      console.log(`SQL: ${arq} (${(fs.statSync(arq).size / 1048576).toFixed(1)} MB)`);
      return;
    }
    if (!APLICAR) return console.log("\nSimulación. Para grabar: --aplicar   ·   SQL para producción: --sql");

    await prisma.pecas_variacoes.deleteMany({});
    for (let i = 0; i < variacoes.length; i += 1000)
      await prisma.pecas_variacoes.createMany({ data: variacoes.slice(i, i + 1000) });
    for (const k of kits) {
      const d = det.find((x) => x.sku === k.sku);
      await prisma.pecas_detalhes.update({
        where: { sku: k.sku },
        data: { dados: { ...d.dados, combinacoes: k.combinacoes, precosSaoCusto: true } },
      });
    }
    for (const p of pecas)
      await prisma.pecas.update({
        where: { sku: p.sku },
        data: { valor_compra: p.custo, preco_brl: p.venda, margem: MARGEM, preco_modo: "AUTO", precificado_em: new Date() },
      });
    console.log("Grabado.");
  } finally {
    await prisma.$disconnect();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
