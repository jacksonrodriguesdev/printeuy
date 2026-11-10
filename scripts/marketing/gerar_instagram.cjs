// Gera artes para o Instagram (1080x1350, feed 4:5) com a marca PRINTE UY: 3 artes por produto,
// cada uma com uma foto do produto ocupando a arte inteira (sem preço).
// Usa só as fotos da galeria (as fotos "principal" da Printi têm selos de frete do Brasil).
//
// Uso (pasta site/, MySQL ligado):
//   CHROMIUM_PATH="C:/Program Files (x86)/Google/Chrome/Application/chrome.exe" \
//     node --env-file=.env scripts/marketing/gerar_instagram.cjs [--qtd=50] [--pular=sku1,sku2]
// Saída: ../instagram/<nn>-<sku>/1.jpg, 2.jpg, 3.jpg + ../instagram/index.html (revisão) + legendas.txt

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { chromium } = require("playwright");
const { PrismaClient } = require("@prisma/client");

const arg = (n, d) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split("=")[1] ?? d;
const QTD = Number(arg("qtd", 50));
const PULAR = new Set(arg("pular", "").split(",").filter(Boolean));
const MIDIA = path.resolve(process.env.UPLOADS_DIR || "../midia");
const SAIDA = path.resolve("..", "instagram");
const PUB = path.resolve("public");

const LOGO = fs.readFileSync(path.join(PUB, "logo.svg"), "utf8");
const FONTE = fs.readFileSync(path.join(PUB, "fonts", "plus-jakarta-sans-latin.woff2")).toString("base64");

const fmt = (n) => "$U " + n.toLocaleString("es-UY").replace(/,/g, ".");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

async function dataUri(rel, largura) {
  const buf = await sharp(path.join(MIDIA, decodeURIComponent(rel.replace(/^\/uploads\//, ""))), { failOn: "none" })
    .rotate()
    .resize({ width: largura, withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

// Frases por categoria (o resto usa a genérica)
const FRASES = {
  "Etiquetas y Adhesivos": "Tu marca en cada paquete",
  "Tarjetas y Papelería": "La primera impresión cuenta",
  "Volantes y Folletos": "Llegá a más clientes",
  "Packaging y Envases": "Un packaging que enamora",
  "Regalos Empresariales": "Regalos con tu marca",
  "Tazas, Vasos y Botellas": "Tu marca, todos los días",
  "Cartelería y Banners": "Que todos te vean",
  "Material de Marketing": "Hacé crecer tu negocio",
  "Agendas y Calendarios": "Tu marca todo el año",
  "Catálogos, Libros y Revistas": "Mostrá lo que hacés",
  "Línea Hot Stamping": "Acabado premium que brilla",
  "Línea Barniz": "Detalles que se sienten",
  "Línea Markatto": "Papeles especiales, resultado único",
  "Ropa y Mochilas": "Vestí tu marca",
};
const frase = (c) => FRASES[c] || "Personalizado a tu manera";

const BASE = `
@font-face{font-family:"J";src:url(data:font/woff2;base64,${FONTE}) format("woff2");font-weight:200 800}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1350px;overflow:hidden;font-family:"J",sans-serif;color:#141414}
.marca{display:flex;align-items:center;gap:16px;font-weight:800;font-size:46px;letter-spacing:-1.5px}
.marca svg{width:62px;height:62px}
.marca b{color:#f26b1d}
.cta{display:inline-flex;align-items:center;gap:12px;border-radius:999px;font-weight:700;font-size:34px;padding:22px 40px}
`;

const marca = (cor = "#141414") => `<div class="marca" style="color:${cor}">${LOGO}<span>printe<b>uy</b></span></div>`;

// Foto ocupando a arte inteira (recortada em 4:5 pelo sharp, mirando a área mais "interessante")
async function fotoCheia(rel) {
  const buf = await sharp(path.join(MIDIA, decodeURIComponent(rel.replace(/^\/uploads\//, ""))), { failOn: "none" })
    .rotate()
    .resize(1080, 1350, { fit: "cover", position: sharp.strategy.attention })
    .jpeg({ quality: 92 })
    .toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}
const PILULA = `.pil{display:inline-flex;align-items:center;background:#fff;border-radius:999px;padding:12px 28px 12px 14px;box-shadow:0 6px 24px rgba(0,0,0,.15)}.pil .marca{font-size:36px}.pil .marca svg{width:48px;height:48px}`;
// v1: logo no topo + nome e site embaixo; v2: só a pílula da marca embaixo; v3: frase no topo + logo
const cheia = (p, f, v) => `<style>${BASE}${PILULA}
body{background:#ddd url(${f}) center/cover}
.sombra{position:absolute;left:0;right:0;${v === 3 ? "top:0;height:420px;background:linear-gradient(rgba(0,0,0,.55),transparent)" : "bottom:0;height:460px;background:linear-gradient(transparent,rgba(0,0,0,.6))"}}
.txt{position:absolute;left:56px;right:56px;color:#fff;text-shadow:0 2px 16px rgba(0,0,0,.35)}
h1{font-size:${p.nome.length > 28 ? 62 : 76}px;line-height:1.02;letter-spacing:-2.5px;font-weight:800}
h2{font-size:70px;line-height:1;letter-spacing:-2.5px;font-weight:800}
.site{font-size:32px;font-weight:700;margin-top:14px;opacity:.95}
</style>${v === 2 ? "" : '<div class="sombra"></div>'}
${v === 1 ? `<div class="pil" style="position:absolute;top:48px;left:48px">${marca()}</div>
<div class="txt" style="bottom:60px"><h1>${esc(p.nome)}</h1><div class="site">printecuy.com</div></div>` : ""}
${v === 2 ? `<div class="pil" style="position:absolute;bottom:56px;left:50%;transform:translateX(-50%);white-space:nowrap">${marca()}<span style="font-size:28px;font-weight:600;color:#555;margin-left:18px">printecuy.com</span></div>` : ""}
${v === 3 ? `<div class="txt" style="top:64px"><h2>${esc(frase(p.categoria))}</h2></div>
<div class="pil" style="position:absolute;bottom:52px;right:48px">${marca()}</div>` : ""}`;

// Modelos antigos (com preço), guardados mas não usados
// 1) Foto grande + painel branco
const arte1 = (p, f) => `<style>${BASE}
.foto{position:absolute;inset:0 0 470px 0;background:#eee url(${f}) center/cover}
.topo{position:absolute;top:44px;left:48px;background:#fff;border-radius:999px;padding:12px 26px 12px 14px}
.topo .marca{font-size:36px}.topo .marca svg{width:48px;height:48px}
.painel{position:absolute;left:0;right:0;bottom:0;height:500px;background:#fff;border-radius:44px 44px 0 0;padding:52px 60px}
.cat{font-size:26px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#f26b1d}
h1{font-size:${p.nome.length > 28 ? 64 : 78}px;line-height:1.02;letter-spacing:-2.5px;font-weight:800;margin:14px 0 22px}
.preco{font-size:34px;color:#555}.preco strong{color:#141414;font-size:52px;font-weight:800;letter-spacing:-1px}
.rodape{position:absolute;left:60px;right:60px;bottom:52px;display:flex;justify-content:space-between;align-items:center}
.cta{background:#141414;color:#fff}.site{font-size:30px;font-weight:700;color:#141414}
</style>
<div class="foto"></div>
<div class="topo">${marca()}</div>
<div class="painel">
  <div class="cat">${esc(p.categoria)}</div>
  <h1>${esc(p.nome)}</h1>
  <div class="preco">Desde <strong>${fmt(p.preco)}</strong> · ${p.qtd} un.</div>
  <div class="rodape"><span class="cta">Pedí el tuyo →</span><span class="site">printecuy.com</span></div>
</div>`;

// 2) Fundo amarelo, frase + foto em cartão + selo de preço
const arte2 = (p, f) => `<style>${BASE}
body{background:#fcd12d}
.topo{position:absolute;top:56px;left:64px;right:64px;display:flex;justify-content:space-between;align-items:center}
.tag{font-size:26px;font-weight:700;background:#141414;color:#fcd12d;border-radius:999px;padding:12px 24px}
h1{position:absolute;top:170px;left:64px;right:64px;font-size:${frase(p.categoria).length > 26 ? 80 : 94}px;line-height:.98;letter-spacing:-3.5px;font-weight:800}
.card{position:absolute;left:64px;right:64px;bottom:150px;height:640px;border-radius:40px;background:#fff url(${f}) center/cover;box-shadow:0 30px 60px rgba(0,0,0,.18);transform:rotate(-1.5deg)}
.selo{position:absolute;right:46px;bottom:700px;width:250px;height:250px;border-radius:50%;background:#141414;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(8deg);text-align:center}
.selo small{font-size:26px;font-weight:600;opacity:.8}.selo strong{font-size:50px;font-weight:800;letter-spacing:-1.5px;color:#fcd12d;line-height:1.05}.selo em{font-style:normal;font-size:22px;opacity:.8}
.nome{position:absolute;left:64px;right:64px;bottom:60px;display:flex;justify-content:space-between;align-items:center;font-size:36px;font-weight:700}
</style>
<div class="topo">${marca()}<span class="tag">printecuy.com</span></div>
<h1>${esc(frase(p.categoria))}</h1>
<div class="card"></div>
<div class="selo"><small>desde</small><strong>${fmt(p.preco)}</strong><em>${p.qtd} unidades</em></div>
<div class="nome"><span>${esc(p.nome)}</span><span>→</span></div>`;

// 3) Fundo escuro, duas fotos + vantagens
const arte3 = (p, f1, f2) => `<style>${BASE}
body{background:#141414;color:#fff}
.fotos{position:absolute;top:150px;left:56px;right:56px;height:640px;display:grid;grid-template-columns:1.25fr 1fr;gap:18px}
.fotos div{border-radius:32px;background:#333 center/cover}
.topo{position:absolute;top:50px;left:56px;right:56px;display:flex;justify-content:space-between;align-items:center}
.topo span{font-size:28px;font-weight:600;color:#fcd12d}
h1{position:absolute;top:830px;left:56px;right:56px;font-size:${p.nome.length > 28 ? 58 : 70}px;line-height:1.02;letter-spacing:-2px;font-weight:800}
ul{position:absolute;top:${p.nome.length > 28 ? 985 : 945}px;left:56px;right:56px;list-style:none;display:grid;gap:18px}
li{font-size:34px;display:flex;align-items:center;gap:18px;color:#e5e5e5}
li i{width:44px;height:44px;border-radius:50%;background:#fcd12d;color:#141414;font-style:normal;font-weight:800;display:grid;place-items:center;font-size:26px;flex:none}
.rodape{position:absolute;left:56px;right:56px;bottom:52px;display:flex;justify-content:space-between;align-items:center}
.cta{background:#fcd12d;color:#141414}.preco{font-size:30px;color:#bbb;text-align:right}.preco strong{display:block;color:#fff;font-size:46px;font-weight:800}
</style>
<div class="topo">${marca("#fff")}<span>Imprenta online</span></div>
<div class="fotos"><div style="background-image:url(${f1})"></div><div style="background-image:url(${f2})"></div></div>
<h1>${esc(p.nome)}</h1>
<ul><li><i>✓</i>Impresión profesional con tu diseño</li><li><i>✓</i>Envíos a todo Uruguay</li><li><i>✓</i>Te asesoramos por WhatsApp</li></ul>
<div class="rodape"><span class="cta">printecuy.com</span><span class="preco">desde<strong>${fmt(p.preco)}</strong></span></div>`;

(async () => {
  const prisma = new PrismaClient();
  const [cot] = await prisma.$queryRawUnsafe("SELECT valor FROM cotacoes ORDER BY id DESC LIMIT 1");
  const cfg = Object.fromEntries(
    (await prisma.$queryRawUnsafe("SELECT chave, valor FROM configuracoes")).map((r) => [r.chave, r.valor]),
  );
  const ajuste = Number(cfg.ajuste_cambio) || 0;
  const passo = Number(cfg.arredondar_uyu) || 10;
  const uyu = (brl) => Math.ceil((brl * Number(cot.valor) * (1 + ajuste / 100)) / passo - 1e-9) * passo;

  const pecas = await prisma.$queryRawUnsafe(
    `SELECT p.sku, COALESCE(p.nome_es, p.nome) nome, p.categoria, p.preco_brl, p.qtd_minima,
            GROUP_CONCAT(i.image_path ORDER BY i.id SEPARATOR '|') fotos
       FROM pecas p JOIN pecas_img i ON i.sku = p.sku AND i.image_path LIKE '%/galeria/%'
      WHERE p.preco_brl > 0 AND p.categoria NOT IN ('Material Electoral', 'Varios') AND p.sku NOT LIKE '%elei%'
      GROUP BY p.sku HAVING COUNT(*) >= 3
      ORDER BY p.popularidade DESC`,
  );
  await prisma.$disconnect();

  // Variedade: alterna entre categorias, do mais popular para o menos; evita nomes repetidos
  const porCat = new Map();
  for (const p of pecas) {
    if (PULAR.has(p.sku)) continue;
    if (!porCat.has(p.categoria)) porCat.set(p.categoria, []);
    porCat.get(p.categoria).push(p);
  }
  const escolhidos = [];
  const nomes = new Set();
  while (escolhidos.length < QTD && [...porCat.values()].some((l) => l.length)) {
    for (const lista of porCat.values()) {
      const p = lista.shift();
      if (!p || nomes.has(p.nome.toLowerCase())) continue;
      nomes.add(p.nome.toLowerCase());
      escolhidos.push(p);
      if (escolhidos.length >= QTD) break;
    }
  }

  fs.mkdirSync(SAIDA, { recursive: true });
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  const legendas = [];
  const fichas = [];
  let n = 0;
  for (const p of escolhidos) {
    n++;
    const fotos = p.fotos.split("|");
    const prod = { nome: p.nome, categoria: p.categoria, preco: uyu(Number(p.preco_brl)), qtd: p.qtd_minima || 1 };
    const pasta = path.join(SAIDA, `${String(n).padStart(2, "0")}-${p.sku}`);
    fs.mkdirSync(pasta, { recursive: true });
    const [a, b, c] = [fotos[0], fotos[1 % fotos.length], fotos[2 % fotos.length]];
    const artes = [
      cheia(prod, await fotoCheia(a), 1),
      cheia(prod, await fotoCheia(b), 2),
      cheia(prod, await fotoCheia(c), 3),
    ];
    for (let i = 0; i < 3; i++) {
      await page.setContent(`<!doctype html><html><head><meta charset="utf-8"></head><body>${artes[i]}</body></html>`);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(pasta, `${i + 1}.jpg`), type: "jpeg", quality: 92 });
    }
    const rel = path.basename(pasta);
    fichas.push({ rel, sku: p.sku, nome: p.nome, cat: p.categoria, preco: fmt(prod.preco), fotos: [a, b, c, fotos[3] ?? a] });
    legendas.push(
      `${rel}\n${p.nome} ✨ ${frase(p.categoria)}.\nImpresión profesional y envíos a todo Uruguay.\n👉 Pedí el tuyo en printecuy.com\n#printeuy #imprenta #uruguay #montevideo #personalizados #${p.categoria.split(/[ ,]/)[0].toLowerCase()}\n`,
    );
    process.stdout.write(`\r${n}/${escolhidos.length} ${p.sku}                    `);
  }
  await browser.close();

  fs.writeFileSync(path.join(SAIDA, "legendas.txt"), legendas.join("\n"));
  fs.writeFileSync(
    path.join(SAIDA, "index.html"),
    `<!doctype html><meta charset="utf-8"><title>Instagram PRINTE UY</title>
<style>body{font-family:system-ui;margin:24px;background:#f4f4f5}h2{font-size:15px;margin:18px 0 8px}div{display:flex;gap:10px}img{width:260px;border-radius:8px;box-shadow:0 1px 4px #0002}</style>
${fichas.map((f) => `<h2>${f.rel} · ${esc(f.nome)} · ${esc(f.cat)}</h2><div>${[1, 2, 3].map((i) => `<a href="${f.rel}/${i}.jpg"><img src="${f.rel}/${i}.jpg" loading="lazy"></a>`).join("")}</div>`).join("\n")}`,
  );
  console.log(`\nPronto: ${escolhidos.length} produtos, ${escolhidos.length * 3} artes em ${SAIDA}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
