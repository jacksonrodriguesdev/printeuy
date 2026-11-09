// Importa o catálogo extraído da printi.com.br (../dados/catalogo.json + ../midia/) para o banco do site.
// APAGA e recria produtos (pecas, pecas_img, pecas_ficha_tecnica) e categorias.
//
// Uso (pasta site/):
//   node --env-file=.env scripts/catalogo/importar_printi.cjs              -> simulação (só conta)
//   node --env-file=.env scripts/catalogo/importar_printi.cjs --aplicar    -> grava no banco
//   ... --margem=30   -> preço de venda = preço Printi + 30% (padrão 0)
//
// Fotos: o site serve a pasta ../midia em /uploads (UPLOADS_DIR=../midia no .env);
// o banco guarda "/uploads/produtos/<categoria>/<produto>/galeria/<arquivo>".
// Preço: valor_compra = menor preço da Printi (R$), preco_brl = valor × (1 + margem).
//   O site mostra em $U pela cotação do dia (admin → Precificação).

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { nomeEspanhol } = require("./glossario_grafica.cjs");

const RAIZ = path.join(__dirname, "../../..");
const CATALOGO = path.join(RAIZ, "dados/catalogo.json");
const CATEGORIAS = path.join(RAIZ, "dados/categorias.json");
const MANIFESTO = path.join(RAIZ, "midia/manifesto.json");
const APLICAR = process.argv.includes("--aplicar");
const MARGEM = Number((process.argv.find((a) => a.startsWith("--margem=")) || "=0").split("=")[1]) || 0;
const LINHA = "AUTOMOTIVA"; // o site tem uma linha só (src/lib/linhas.ts)

const lerJson = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const semHtml = (s) => (s || "").replace(/<br\s*\/?>/g, "\n").replace(/<\/(p|h\d|li)>/g, "\n").replace(/<[^>]+>/g, "").replace(/\n{3,}/g, "\n\n").trim();
const reais = (v) => `R$ ${Number(v).toFixed(2).replace(".", ",")}`;

(async () => {
  const catalogo = lerJson(CATALOGO);
  const categorias = fs.existsSync(CATEGORIAS) ? lerJson(CATEGORIAS) : [];
  const manifesto = fs.existsSync(MANIFESTO) ? lerJson(MANIFESTO) : {};
  const local = (url) => (url && manifesto[url] ? `/uploads/${manifesto[url]}` : null);

  // Categorias da loja em espanhol (iguais a CATEGORIAS em src/lib/navegacao.ts).
  // Nome da Printi (página da categoria ou do produto) -> categoria da loja; o resto vai para "Varios".
  const MAPA = [
    [/brindes/i, "Regalos Empresariales"],
    [/embalage/i, "Packaging y Envases"],
    [/r[óo]tulo|etiqueta|adesivo/i, "Etiquetas y Adhesivos"],
    [/verniz/i, "Línea Barniz"],
    [/hot stamping/i, "Línea Hot Stamping"],
    [/markatto/i, "Línea Markatto"],
    [/squeeze|copo|caneca/i, "Tazas, Vasos y Botellas"],
    [/marketing/i, "Material de Marketing"],
    [/papelaria|escrit[óo]rio/i, "Tarjetas y Papelería"],
    [/banner|faixa|placa|comunica[çc][ãa]o visual/i, "Cartelería y Banners"],
    [/flyer|panfleto|folder/i, "Volantes y Folletos"],
    [/cat[áa]logo|livro|revista/i, "Catálogos, Libros y Revistas"],
    [/agenda|calend[áa]rio/i, "Agendas y Calendarios"],
    [/elei[çc]/i, "Material Electoral"],
    [/vestu[áa]rio|bolsa|mala|mochila/i, "Ropa y Mochilas"],
    [/casa|decora/i, "Casa y Decoración"],
    [/restaurante|delivery/i, "Gastronomía y Delivery"],
    [/pet/i, "Mascotas"],
  ];
  const categoriaLoja = (nome) => (MAPA.find(([re]) => re.test(nome || "")) || [null, "Varios"])[1];
  const nomeCat = new Map();
  for (const p of catalogo) {
    if (nomeCat.has(p.categoriaSlug)) continue;
    const pagina = categorias.find((c) => c.slug === p.categoriaSlug);
    nomeCat.set(p.categoriaSlug, categoriaLoja(pagina?.nome || p.categoria));
  }
  // Duas categorias com o mesmo nome viram uma só
  const nomes = [...new Set(nomeCat.values())];

  // Produtos
  const vistos = new Set();
  const pecas = [], imagens = [], fichas = [], detalhesLista = [];
  const comMargem = (v) => (v == null ? v : Math.round(v * (1 + MARGEM / 100) * 100) / 100);
  for (const p of catalogo) {
    let sku = (p.sku || p.slug).trim();
    if (vistos.has(sku)) sku = `${sku}-${p.slug}`; // mesmo SKU em dois produtos
    vistos.add(sku);
    const preco = p.precoMinimo ? Math.round(p.precoMinimo * (1 + MARGEM / 100) * 100) / 100 : null;

    // Fotos: principal, hover e galeria, nesta ordem, sem repetir
    const fotos = [...new Set([p.imagens.principal, ...p.imagens.galeria.map((g) => g.url), p.imagens.hover].map(local).filter(Boolean))];

    // Troca as URLs da Printi pelas locais dentro dos detalhes (opções, combinações, conteúdo)
    const trocar = (o) => JSON.parse(JSON.stringify(o).replace(/https:\/\/(?:d1br4h274rc9sc\.cloudfront\.net|s3\.amazonaws\.com\/printi-[\w-]+)\/[^"\\\s)]+/g, (u) => local(u) || u));
    const detalhes = trocar({
      slug: p.slug,
      descricaoCurta: p.descricaoCurta,
      descricaoHtml: p.descricaoHtml,
      caracteristicas: p.caracteristicas,
      destaque: p.destaque,
      faq: p.faq,
      avaliacao: p.avaliacao,
      // Nomes em espanhol para a página (o original fica em nomePt)
      partes: p.partes.map((pt) => ({
        ...pt,
        nome: nomeEspanhol(pt.nome),
        atributos: pt.atributos.map((a) => ({
          ...a,
          nomePt: a.nome,
          nome: nomeEspanhol(a.nome.split(":")[0].trim()),
          opcoes: a.opcoes.map((o) => ({ ...o, nomePt: o.nome, nome: nomeEspanhol(o.nome) })),
        })),
      })),
      // Preços das combinações já com a margem (o custo da Printi não sai para o site)
      combinacoes: p.combinacoes.map((c) => ({
        ...c,
        nome: nomeEspanhol(c.nome),
        opcoes: c.opcoes.map((o) => ({ ...o, escolhas: Object.fromEntries(Object.entries(o.escolhas).map(([k, v]) => [k, nomeEspanhol(String(v))])) })),
        precos: c.precos.map((x) => ({ quantidade: x.quantidade, preco: comMargem(x.preco), unitario: comMargem(x.unitario) })) })),
      regrasBloqueio: p.regrasBloqueio,
      totalVariacoes: p.totalVariacoes,
      quantidadeMinima: p.quantidadeMinima,
      quantidadePersonalizada: p.quantidadePersonalizada,
      formatosArquivo: p.formatosArquivo,
      vendaCruzada: p.vendaCruzada,
      videos: p.midias.filter((m) => m.papel === "videos" && /\.mp4/i.test(m.url)).map((m) => local(m.url)).filter(Boolean),
      youtube: p.youtube,
      seo: p.seo,
      classificacoes: p.classificacoes,
    });

    pecas.push({
      sku,
      nome: p.nome,
      nome_es: nomeEspanhol(p.nome),
      categoria: nomeCat.get(p.categoriaSlug),
      descricao: [p.descricaoCurta, semHtml(p.descricaoHtml)].filter(Boolean).join("\n\n"),
      estoque: p.disponivel ? 9999 : 0, // produto sob encomenda: sempre "disponível"
      imagem_principal: fotos[0] || null,
      marca: null,
      marca_confirmada: false,
      valor_compra: p.precoMinimo,
      margem: MARGEM,
      preco_brl: preco,
      precificado_em: preco ? new Date() : null,
      url: p.url,
      // Mais vendido na Printi primeiro; depois quem tem mais avaliações
      popularidade: (p.classificacoes.some((c) => c.slug === "mais-vendidos") ? 100000 : 0) + (p.avaliacao?.total || 0),
      qtd_minima: p.quantidadeMinima || null,
    });
    detalhesLista.push({ sku, dados: detalhes });
    fotos.forEach((f, i) => imagens.push({ sku, image_path: f, image_type: i === 0 ? "main" : "thumb", sort_order: i }));

    // Ficha técnica: o que a loja já mostra em tabela
    const ficha = [];
    if (p.quantidadeMinima) ficha.push(["Cantidad mínima", `${p.quantidadeMinima} un.`]);
    for (const pt of p.partes) {
      if (pt.formatoPersonalizado) {
        const f = pt.formatoPersonalizado;
        ficha.push(["Medida personalizada", `${f.width.min}–${f.width.max} × ${f.height.min}–${f.height.max} cm`]);
      }
      for (const a of pt.atributos) {
        if (!a.visivel || !a.opcoes.length) continue;
        const chave = a.nome.split(":")[0].trim();
        ficha.push([p.partes.length > 1 ? `${pt.nome} · ${chave}` : chave, a.opcoes.map((o) => o.nome).join(", ")]);
      }
    }
    if (p.caracteristicas.length) ficha.push(["Características", p.caracteristicas.join(" · ")]);
    for (const c of p.combinacoes) {
      if (!c.precos.length) continue;
      ficha.push([`Precio ${c.nome}`, c.precos.map((x) => `${x.quantidade} un. ${reais(comMargem(x.preco))}`).join(" | ")]);
    }
    for (const [chave, valor] of ficha) fichas.push({ sku, chave: chave.slice(0, 190), valor });
  }

  console.log(`Categorias: ${nomes.length}`);
  console.log(`Produtos: ${pecas.length} (${pecas.filter((p) => p.imagem_principal).length} con foto, ${pecas.filter((p) => p.preco_brl).length} con precio)`);
  console.log(`Fotos: ${imagens.length} | Ficha técnica: ${fichas.length} líneas | Margen: ${MARGEM}%`);
  if (!APLICAR) return console.log("\nSimulación. Para grabar: --aplicar");

  const prisma = new PrismaClient();
  try {
    await prisma.$transaction([
      prisma.pecas_detalhes.deleteMany(),
      prisma.pecas_ficha_tecnica.deleteMany(),
      prisma.pecas_img.deleteMany(),
      prisma.pecas_aplicacao.deleteMany(),
      prisma.pecas_similar.deleteMany(),
      prisma.pecas.deleteMany(),
      prisma.categories.deleteMany(),
    ]);
    const idCat = new Map();
    // Foto da categoria: a do produto mais popular dela (círculos da home)
    const fotoCat = (nome) =>
      pecas.filter((p) => p.categoria === nome && p.imagem_principal).sort((a, b) => b.popularidade - a.popularidade)[0]?.imagem_principal ?? null;
    for (const nome of nomes)
      idCat.set(nome, (await prisma.categories.create({ data: { nome, linha: LINHA, image_path: fotoCat(nome) } })).id);
    for (let i = 0; i < pecas.length; i += 100) {
      await prisma.pecas.createMany({ data: pecas.slice(i, i + 100).map((p) => ({ ...p, category_id: idCat.get(p.categoria) })) });
    }
    for (let i = 0; i < imagens.length; i += 500) await prisma.pecas_img.createMany({ data: imagens.slice(i, i + 500), skipDuplicates: true });
    for (let i = 0; i < detalhesLista.length; i += 50) await prisma.pecas_detalhes.createMany({ data: detalhesLista.slice(i, i + 50) });
    for (let i = 0; i < fichas.length; i += 500) await prisma.pecas_ficha_tecnica.createMany({ data: fichas.slice(i, i + 500) });
    console.log(`\nGrabado: ${await prisma.pecas.count()} productos, ${await prisma.categories.count()} categorías, ${await prisma.pecas_img.count()} fotos`);
  } finally {
    await prisma.$disconnect();
  }
})().catch((e) => {
  console.error("Falló:", e);
  process.exit(1);
});
