// Gera os banners de topo dos e-mails automáticos (public/email/automacoes/*.jpg, 1200x600)
// com a identidade AUTO PIEZAS UY. Uso:
//   CHROMIUM_PATH=<chrome-headless-shell.exe> node scripts/marca/gerar_banners_email.cjs
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const PUB = path.join(__dirname, "..", "..", "public");
const OUT = path.join(PUB, "email", "automacoes");
const logo = fs.readFileSync(path.join(PUB, "logo.svg"), "utf8");
const fonte = fs.readFileSync(path.join(PUB, "fonts", "plus-jakarta-sans-latin.woff2")).toString("base64");

const BANNERS = {
  boas_vindas: ["Bienvenido", "Bienvenido a AUTO PIEZAS UY", "Repuestos para tu auto, con envíos a todo Uruguay"],
  aniversario: ["Feliz cumpleaños", "¡Feliz cumpleaños!", "Tenemos un regalo para vos y tu vehículo"],
  busca_sem_resultado: ["Te ayudamos", "¿No encontraste la pieza?", "Mandanos el código o una foto y la buscamos"],
  carrinho_abandonado: ["Tu carrito", "Dejaste repuestos en tu carrito", "Terminá tu compra cuando quieras"],
  carrinho_baixou: ["Bajó el precio", "Bajó el precio de tu carrito", "Aprovechá antes de que se termine"],
  catalogo_aberto: ["Catálogos", "Tu catálogo te espera", "Encontrá la pieza justa para tu vehículo"],
  catalogo_novo: ["Nuevo", "Nuevo catálogo disponible", "Más repuestos para autos, camionetas y camiones"],
  cupom: ["Cupón", "Un cupón de descuento para vos", "Usalo en tu próxima compra"],
  data_especial: ["Fecha especial", "Una fecha para celebrar", "Ofertas en repuestos para tu auto"],
  interesse_sem_pedido: ["Para vos", "Las piezas que miraste", "Te ayudamos a elegir la correcta"],
  preco_baixou: ["Bajó el precio", "Bajó el precio de una pieza", "La que guardaste está más barata"],
  promocao: ["Promoción", "Ofertas en repuestos", "Frenos, suspensión, motor y más"],
  reengajamento: ["Te extrañamos", "¿Cómo anda tu vehículo?", "Revisá frenos, aceite y filtros antes de viajar"],
};

const html = ([chip, titulo, sub]) => `<!doctype html><html><head><style>
@font-face{font-family:"J";src:url(data:font/woff2;base64,${fonte}) format("woff2");font-weight:200 800}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:600px;font-family:J,Arial,sans-serif;color:#fff;overflow:hidden;
 background:linear-gradient(135deg,#081530 0%,#0f2850 55%,#173a72 100%);position:relative}
.grade{position:absolute;inset:0;opacity:.07;background-image:linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px);background-size:36px 36px}
.brilho{position:absolute;right:-160px;top:-160px;width:620px;height:620px;border-radius:50%;background:#f26b1d;filter:blur(120px);opacity:.35}
.marca{position:absolute;left:64px;top:52px;display:flex;align-items:center;gap:16px}
.marca svg{width:64px;height:64px}
.marca b{display:block;font-size:30px;font-weight:800;letter-spacing:-.5px}
.marca span{display:block;font-size:13px;font-weight:800;letter-spacing:4px;color:#ff9a57}
.chip{position:absolute;left:64px;top:190px;background:#f26b1d;border-radius:999px;padding:10px 22px;font-weight:800;font-size:20px;letter-spacing:3px;text-transform:uppercase}
h1{position:absolute;left:64px;top:252px;width:720px;font-size:66px;line-height:1.02;font-weight:800;letter-spacing:-1.5px}
p{position:absolute;left:64px;bottom:64px;width:700px;font-size:26px;color:rgba(255,255,255,.8)}
.roda{position:absolute;right:70px;top:120px;width:360px;height:360px}
</style></head><body><div class="grade"></div><div class="brilho"></div>
<div class="marca">${logo}<div><b>AUTO PIEZAS UY</b><span>REPUESTOS PARA AUTOS</span></div></div>
<div class="chip">${chip}</div><h1>${titulo}</h1><p>${sub}</p>
<svg class="roda" viewBox="0 0 200 200" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="6">
 <circle cx="100" cy="100" r="88" stroke="#f26b1d" stroke-width="14"/>
 <circle cx="100" cy="100" r="62"/><circle cx="100" cy="100" r="16" fill="rgba(255,255,255,.9)"/>
 ${[0, 72, 144, 216, 288].map((a) => `<line x1="100" y1="100" x2="${100 + 62 * Math.cos((a * Math.PI) / 180)}" y2="${100 + 62 * Math.sin((a * Math.PI) / 180)}"/>`).join("")}
 ${[36, 108, 180, 252, 324].map((a) => `<circle cx="${100 + 38 * Math.cos((a * Math.PI) / 180)}" cy="${100 + 38 * Math.sin((a * Math.PI) / 180)}" r="7" fill="rgba(255,255,255,.9)" stroke="none"/>`).join("")}
</svg></body></html>`;

(async () => {
  const browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  );
  const page = await browser.newPage({ viewport: { width: 1200, height: 600 } });
  for (const [nome, textos] of Object.entries(BANNERS)) {
    await page.setContent(html(textos));
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, `${nome}.jpg`), type: "jpeg", quality: 86 });
    console.log("ok", nome);
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
