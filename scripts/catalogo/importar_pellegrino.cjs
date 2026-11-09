// Importa o catálogo Pellegrino para o banco do AUTO PIEZAS UY.
//
// Origem dos dados:
//   - peças, aplicações, similares e ficha técnica: banco `rstratorpecas` (tabelas products,
//     produto_aplicacao, produto_similar, produto_ficha_tecnica), no mesmo servidor MySQL;
//   - fotos: Cloudflare R2 (enviadas por C:/Users/USER/Desktop/shope/r2.cjs), nomes SKU_1.jpg,
//     SKU_2.jpg... A lista de nomes vem da pasta local `fotos` da shope (FOTOS_DIR).
//
// Uso: node --env-file=.env scripts/catalogo/importar_pellegrino.cjs
//      (APAGA e recria as peças e categorias do banco de destino)
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const ORIGEM = process.env.ORIGEM_DB || "rstratorpecas";
const FOTOS_DIR = process.env.FOTOS_DIR || "C:/Users/USER/Desktop/shope/fotos";
const FOTOS_URL = (process.env.VITE_FOTOS_URL || "").replace(/\/$/, "");
if (!FOTOS_URL) throw new Error("Defina VITE_FOTOS_URL no .env (endereço público do R2)");

// Montadoras de máquinas agrícolas: o site é só de veículos, essas aplicações ficam de fora
const MONTADORAS_FORA = [
  "MASSEY FERGUSON", "VALTRA", "NEW HOLLAND", "CASE", "CASE IH", "JOHN DEERE", "VALMET",
  "CBT", "AGCO", "FENDT", "CLAAS", "LANDINI", "KUBOTA", "JACTO", "STARA", "SLC", "SAME",
  "DEUTZ FAHR", "DEUTZ-FAHR", "LS TRACTOR", "MAHINDRA", "YANMAR", "TRAMONTINI", "AGRITECH",
  "BRANCO", "TOBATA", "BUFFALO", "MONTANA", "JCB", "CATERPILLAR", "KOMATSU", "RANDON",
];

const db = new PrismaClient();
const sql = (s, ...p) => db.$executeRawUnsafe(s, ...p);
const titulo = (s) =>
  s.toLowerCase().replace(/(^|[\s/(-])([a-zà-ú])/g, (m, a, b) => a + b.toUpperCase()).trim();

(async () => {
  console.time("importação");
  console.log("Limpando tabelas de destino...");
  await sql("SET FOREIGN_KEY_CHECKS=0");
  for (const t of ["pecas_img", "pecas_aplicacao", "pecas_similar", "pecas_ficha_tecnica", "pecas", "categories"])
    await sql(`TRUNCATE TABLE ${t}`);
  await sql("SET FOREIGN_KEY_CHECKS=1");

  // 1) Categorias: 2 níveis a partir de "MOTOR > PISTAO > PISTAO MOTOR C/ANEL"
  console.log("Criando categorias...");
  const pares = await db.$queryRawUnsafe(`
    SELECT TRIM(SUBSTRING_INDEX(categoria,' > ',1)) c1,
           TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(categoria,' > ',2),' > ',-1)) c2, COUNT(*) n
      FROM ${ORIGEM}.products GROUP BY c1, c2`);
  await sql("DROP TEMPORARY TABLE IF EXISTS cat_map");
  await sql("CREATE TEMPORARY TABLE cat_map (c1 VARCHAR(191), c2 VARCHAR(191), id INT, PRIMARY KEY (c1, c2))");
  const pais = new Map();
  for (const { c1, c2 } of pares) {
    const n1 = c1 || "DIVERSOS";
    if (!pais.has(n1)) {
      const p = await db.categories.create({ data: { nome: titulo(n1), linha: "AUTOMOTIVA" } });
      pais.set(n1, { id: p.id, filhos: new Map() });
    }
    const pai = pais.get(n1);
    let id = pai.id;
    if (c2 && c2 !== c1) {
      if (!pai.filhos.has(c2)) {
        const f = await db.categories.create({ data: { nome: titulo(c2), parent_id: pai.id, linha: "AUTOMOTIVA" } });
        pai.filhos.set(c2, f.id);
      }
      id = pai.filhos.get(c2);
    }
    await sql("INSERT INTO cat_map VALUES (?,?,?)", c1 || "", c2 || "", id);
  }
  console.log(`${pais.size} categorias principais, ${[...pais.values()].reduce((s, p) => s + p.filhos.size, 0)} subcategorias`);

  // 2) Peças
  console.log("Copiando peças...");
  const nPecas = await sql(`
    INSERT INTO pecas (sku, categoria, category_id, created_at, updated_at, descricao, estoque, marca, fabricante,
                       nome, peso, tamanho, altura, largura, profundidade, valor_compra, valor_promocional, preco_brl,
                       veiculos_compativeis, codigo_fabricante, ean, ncm, marca_confirmada, preco_modo)
    SELECT p.sku, p.categoria, m.id, p.created_at, NOW(), p.descricao, p.estoque, p.marca, p.marca,
           p.nome, p.peso, p.tamanho, p.altura, p.largura, p.profundidade, p.preco_brl, p.valor_promocional, p.preco_brl,
           p.veiculos_compativeis, p.codigo_fabricante, p.ean, p.ncm, 1, 'AUTO'
      FROM ${ORIGEM}.products p
      LEFT JOIN cat_map m
        ON m.c1 = TRIM(SUBSTRING_INDEX(p.categoria,' > ',1))
       AND m.c2 = TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(p.categoria,' > ',2),' > ',-1))`);
  console.log(`${nPecas} peças`);
  // Preço Pellegrino é o CUSTO (valor_compra); venda = custo + margem padrão (40%, ajustável no
  // admin → Precificação). A promoção da origem não vale aqui.
  await sql(`UPDATE pecas SET margem = 40, preco_brl = ROUND(valor_compra * 1.4, 2), valor_promocional = NULL,
             precificado_em = NOW() WHERE valor_compra > 0`);
  // A loja filtra pelo texto `categoria` ("Principal > Subcategoria", igual ao nome das categorias)
  await sql(`
    UPDATE pecas p JOIN categories c ON c.id = p.category_id LEFT JOIN categories pai ON pai.id = c.parent_id
       SET p.categoria = IF(pai.id IS NULL, c.nome, CONCAT(pai.nome, ' > ', c.nome))`);

  // 3) Aplicações (sem máquinas agrícolas), similares e ficha técnica
  console.log("Copiando aplicações...");
  const fora = MONTADORAS_FORA.map((m) => `'${m}'`).join(",");
  const nAp = await sql(`
    INSERT INTO pecas_aplicacao (sku, montadora, veiculo, ano, motor)
    SELECT sku, montadora, veiculo, ano, motor FROM ${ORIGEM}.produto_aplicacao
     WHERE UPPER(TRIM(montadora)) NOT IN (${fora})`);
  console.log(`${nAp} aplicações`);
  const nSim = await sql(`INSERT INTO pecas_similar (sku, codigo_similar, marca_similar)
    SELECT sku, codigo_similar, marca_similar FROM ${ORIGEM}.produto_similar`);
  const nFicha = await sql(`INSERT INTO pecas_ficha_tecnica (sku, chave, valor)
    SELECT sku, chave, valor FROM ${ORIGEM}.produto_ficha_tecnica`);
  console.log(`${nSim} similares, ${nFicha} itens de ficha técnica`);

  // 4) Fotos do R2
  console.log("Ligando fotos do R2...");
  const skus = new Set((await db.pecas.findMany({ select: { sku: true } })).map((p) => p.sku));
  const fotos = fs
    .readdirSync(FOTOS_DIR)
    .map((f) => {
      const m = f.match(/^(.+)_(\d+)\.\w+$/);
      return m && skus.has(m[1]) ? { sku: m[1], ordem: Number(m[2]), arquivo: f } : null;
    })
    .filter(Boolean)
    .sort((a, b) => (a.sku === b.sku ? a.ordem - b.ordem : a.sku < b.sku ? -1 : 1));
  const url = (f) => `${FOTOS_URL}/fotos/${encodeURIComponent(f)}`;
  for (let i = 0; i < fotos.length; i += 2000) {
    await db.pecas_img.createMany({
      data: fotos.slice(i, i + 2000).map((f) => ({
        sku: f.sku,
        image_path: url(f.arquivo),
        image_type: f.ordem === 1 ? "main_image" : "gallery",
        sort_order: f.ordem - 1,
      })),
      skipDuplicates: true,
    });
  }
  await sql(`
    UPDATE pecas p JOIN (SELECT sku, MIN(sort_order) o FROM pecas_img GROUP BY sku) x ON x.sku = p.sku
      JOIN pecas_img i ON i.sku = x.sku AND i.sort_order = x.o
       SET p.imagem_principal = i.image_path`);
  const comFoto = await db.pecas.count({ where: { imagem_principal: { not: null } } });
  console.log(`${fotos.length} fotos, ${comFoto} peças com foto`);

  console.timeEnd("importação");
  await db.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
