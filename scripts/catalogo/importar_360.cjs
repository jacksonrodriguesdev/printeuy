// Importa os produtos extraídos da 360imprimir (../dados/360imprimir/catalogo.json) para a loja.
// NÃO apaga o catálogo da Printi: só (re)cria os produtos com SKU "360-<slug>".
//
// - Nome em espanhol e categoria da loja: scripts/catalogo/mapa_360.tsv (os ~300 "Adesivos de
//   <tema>" da 360 não estão no mapa: entram só como o produto "adesivos").
// - Foto: bucket R2 "360" (pub-507a…/360imprimir/<categoria>/<slug>.<ext>), enviada com
//   R2_BUCKET=360 R2_PREFIXO=360imprimir node --env-file=r2.env scripts/enviar_r2.cjs --origem=midia/360imprimir
// - Sem preço e sem opções (a 360 só mostra isso pela API dela, bloqueada para robôs): o produto
//   entra só para cotação; os textos da página saem em espanhol pelo src/lib/textos-es.ts.
//
// Uso:  node --env-file=.env scripts/catalogo/importar_360.cjs            (simulação)
//       node --env-file=.env scripts/catalogo/importar_360.cjs --aplicar  (grava no banco do .env)
//       node scripts/catalogo/importar_360.cjs --sql   (gera dados/deploy/importar_360.sql p/ phpMyAdmin)

const fs = require("fs");
const path = require("path");
const { crc32 } = require("zlib");

const RAIZ = path.join(__dirname, "../../..");
const CATALOGO = path.join(RAIZ, "dados", "360imprimir", "catalogo.json");
const FOTOS = path.join(RAIZ, "midia", "360imprimir");
const R2_360 = "https://pub-507a4ea681db4856974bae45f9bd4734.r2.dev/360imprimir";
const LINHA = "AUTOMOTIVA"; // o site tem uma linha só (src/lib/linhas.ts)
const APLICAR = process.argv.includes("--aplicar");
const SQL = process.argv.includes("--sql");

const CATS = {
  T: "Tarjetas y Papelería",
  E: "Etiquetas y Adhesivos",
  V: "Volantes y Folletos",
  P: "Packaging y Envases",
  R: "Regalos Empresariales",
  Z: "Tazas, Vasos y Botellas",
  C: "Cartelería y Banners",
  M: "Material de Marketing",
  A: "Agendas y Calendarios",
  O: "Ropa y Mochilas",
  G: "Gastronomía y Delivery",
  D: "Casa y Decoración",
  K: "Mascotas",
};

function lerMapa() {
  const mapa = new Map();
  for (const l of fs.readFileSync(path.join(__dirname, "mapa_360.tsv"), "utf8").split(/\r?\n/)) {
    if (!l.trim() || l.startsWith("#")) continue;
    const [slug, nome, cat] = l.split("\t");
    if (!CATS[cat]) throw new Error(`categoria desconhecida "${cat}" em ${slug}`);
    mapa.set(slug, { nome, categoria: CATS[cat] });
  }
  return mapa;
}

// Arquivo da foto baixada (midia/360imprimir/<pasta>/<slug>.<ext>) -> URL pública no R2
function indiceFotos() {
  const idx = new Map();
  for (const pasta of fs.readdirSync(FOTOS)) {
    const dir = path.join(FOTOS, pasta);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) idx.set(f.replace(/\.[^.]+$/, ""), `${R2_360}/${pasta}/${encodeURIComponent(f)}`);
  }
  return idx;
}

const nomePt = (n) =>
  n
    .replace(/\s*\|\s*Personalize.*$/i, "")
    .replace(/\s*-\s*(Melhor preço.*|Personalizável ao melhor preço|ao melhor preço)$/i, "")
    .replace(/\s+(Personalizad[oa]s?|Personalizável|Publicitári[oa]s?)$/i, "")
    .trim();

function montar() {
  const catalogo = JSON.parse(fs.readFileSync(CATALOGO, "utf8"));
  const mapa = lerMapa();
  const fotos = indiceFotos();
  const pecas = [],
    imagens = [],
    detalhes = [],
    semMapa = [];
  for (const p of catalogo) {
    const m = mapa.get(p.slug);
    if (!m) {
      if (!/Personalizados a preços imbatíveis/.test(p.nome)) semMapa.push(p.slug);
      continue;
    }
    const sku = `360-${p.slug}`.slice(0, 191);
    const foto = fotos.get(p.slug) || null;
    pecas.push({
      sku,
      nome: nomePt(p.nome),
      nome_es: m.nome,
      categoria: m.categoria,
      descricao: `${m.nome} personalizado con tu marca. Pedí tu cotización sin compromiso.`,
      estoque: 9999, // sob encomenda
      imagem_principal: foto,
      marca: null,
      marca_confirmada: false,
      // Mistura com a Printi na ordem "Más vendidos" (com 0 ficavam todos nas últimas páginas)
      popularidade: 1 + (crc32(sku) % 40),
    });
    if (foto) imagens.push({ sku, image_path: foto, image_type: "main", sort_order: 0 });
    detalhes.push({
      sku,
      dados: {
        slug: p.slug,
        descricaoCurta: "",
        descricaoHtml: "",
        caracteristicas: [],
        destaque: null,
        faq: [],
        avaliacao: null,
        partes: [],
        combinacoes: [],
        totalVariacoes: 1,
        quantidadeMinima: null,
        quantidadePersonalizada: null,
        formatosArquivo: null,
        vendaCruzada: [],
        videos: [],
        youtube: [],
        seo: { titulo: null, descricao: null },
        origem: "360imprimir",
      },
    });
  }
  return { pecas, imagens, detalhes, semMapa };
}

const q = (v) =>
  v === null || v === undefined
    ? "NULL"
    : typeof v === "number"
      ? String(v)
      : typeof v === "boolean"
        ? (v ? "1" : "0")
        : `'${String(v).replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;

function gerarSql({ pecas, imagens, detalhes }) {
  const L = [
    "-- Produtos da 360imprimir (SKU 360-...). Rodar no phpMyAdmin, aba SQL, no banco do site.",
    "-- Pode rodar de novo: apaga os 360-... antes e recria.",
    "SET NAMES utf8mb4;",
    "DELETE FROM pecas_detalhes WHERE sku LIKE '360-%';",
    "DELETE FROM pecas_img WHERE sku LIKE '360-%';",
    "DELETE FROM pecas WHERE sku LIKE '360-%';",
  ];
  for (const c of [...new Set(pecas.map((p) => p.categoria))])
    L.push(
      `INSERT INTO categories (nome, linha, created_at, updated_at) SELECT ${q(c)}, '${LINHA}', NOW(3), NOW(3) FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM categories WHERE nome = ${q(c)});`,
    );
  for (const p of pecas)
    L.push(
      `INSERT INTO pecas (sku, nome, nome_es, categoria, category_id, descricao, estoque, imagem_principal, marca, marca_confirmada, popularidade, preco_modo, created_at, updated_at) VALUES (${[
        p.sku,
        p.nome,
        p.nome_es,
        p.categoria,
      ]
        .map(q)
        .join(", ")}, (SELECT id FROM categories WHERE nome = ${q(p.categoria)} ORDER BY id LIMIT 1), ${q(p.descricao)}, ${p.estoque}, ${q(p.imagem_principal)}, NULL, 0, ${p.popularidade}, 'AUTO', NOW(3), NOW(3));`,
    );
  for (const i of imagens)
    L.push(
      `INSERT INTO pecas_img (sku, image_path, image_type, sort_order, created_at) VALUES (${q(i.sku)}, ${q(i.image_path)}, ${q(i.image_type)}, ${i.sort_order}, NOW(3));`,
    );
  for (const d of detalhes)
    L.push(`INSERT INTO pecas_detalhes (sku, dados, updated_at) VALUES (${q(d.sku)}, ${q(JSON.stringify(d.dados))}, NOW(3));`);
  const arq = path.join(__dirname, "../../dados/deploy/importar_360.sql");
  fs.mkdirSync(path.dirname(arq), { recursive: true });
  fs.writeFileSync(arq, L.join("\n") + "\n");
  console.log(`SQL: ${arq} (${L.length} linhas)`);
}

(async () => {
  const dados = montar();
  const { pecas, imagens, semMapa } = dados;
  const porCat = {};
  for (const p of pecas) porCat[p.categoria] = (porCat[p.categoria] || 0) + 1;
  console.log(`Produtos: ${pecas.length} (${imagens.length} con foto)`);
  console.log(porCat);
  if (semMapa.length) console.log(`Sin mapa (quedan fuera): ${semMapa.join(", ")}`);
  if (SQL) return gerarSql(dados);
  if (!APLICAR) return console.log("\nSimulación. Para grabar: --aplicar   ·   SQL para producción: --sql");

  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  try {
    await prisma.$transaction([
      prisma.pecas_detalhes.deleteMany({ where: { sku: { startsWith: "360-" } } }),
      prisma.pecas_img.deleteMany({ where: { sku: { startsWith: "360-" } } }),
      prisma.pecas.deleteMany({ where: { sku: { startsWith: "360-" } } }),
    ]);
    const idCat = new Map();
    for (const nome of [...new Set(pecas.map((p) => p.categoria))]) {
      const c =
        (await prisma.categories.findFirst({ where: { nome }, orderBy: { id: "asc" } })) ||
        (await prisma.categories.create({ data: { nome, linha: LINHA } }));
      idCat.set(nome, c.id);
    }
    await prisma.pecas.createMany({ data: pecas.map((p) => ({ ...p, category_id: idCat.get(p.categoria) })) });
    await prisma.pecas_img.createMany({ data: imagens, skipDuplicates: true });
    for (let i = 0; i < dados.detalhes.length; i += 50)
      await prisma.pecas_detalhes.createMany({ data: dados.detalhes.slice(i, i + 50) });
    console.log("Grabado.");
  } finally {
    await prisma.$disconnect();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
