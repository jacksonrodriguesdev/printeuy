// Gera os ícones PNG/WebP/ICO do site a partir de public/logo.svg (usa o Chromium do Playwright).
// Uso: node scripts/marca/gerar_icones.cjs
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const PUB = path.join(__dirname, "..", "..", "public");
const svg = fs.readFileSync(path.join(PUB, "logo.svg"), "utf8");
const fonte = fs.readFileSync(path.join(PUB, "fonts", "plus-jakarta-sans-latin.woff2")).toString("base64");

// [arquivo, tamanho, margem (maskable precisa de área segura), tipo]
const SAIDAS = [
  ["icon-192.png", 192, 0, "png"],
  ["icon-512.png", 512, 0, "png"],
  ["icon-maskable-192.png", 192, 0.12, "png"],
  ["icon-maskable-512.png", 512, 0.12, "png"],
  ["apple-touch-icon.png", 180, 0.06, "png"],
  ["favicon-48.png", 48, 0, "png"],
  ["logo.png", 256, 0, "png"],
  ["badge-96.png", 96, 0, "png"],
  ["logo-96.webp", 96, 0, "webp"],
  ["favicon-32.png", 32, 0, "png"],
];

(async () => {
  // Usa o Chromium já baixado (CHROMIUM_PATH) quando o do Playwright não estiver instalado
  const browser = await chromium.launch(
    process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  );
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const [nome, tam, margem, tipo] of SAIDAS) {
    const pad = Math.round(tam * margem);
    await page.setViewportSize({ width: tam, height: tam });
    await page.setContent(`<!doctype html><html><head><style>
      @font-face{font-family:"Plus Jakarta Sans";src:url(data:font/woff2;base64,${fonte}) format("woff2");font-weight:200 800}
      html,body{margin:0;background:${margem ? "#ffffff" : "transparent"}}
      .c{width:${tam}px;height:${tam}px;box-sizing:border-box;padding:${pad}px}
      svg{width:100%;height:100%;display:block}
    </style></head><body><div class="c">${svg}</div></body></html>`);
    await page.evaluate(() => document.fonts.ready);
    const buf = await page.screenshot({ type: "png", omitBackground: !margem });
    if (tipo === "webp") {
      // WebP: converte no próprio navegador (canvas)
      const b64 = await page.evaluate(async (png) => {
        const img = new Image();
        img.src = "data:image/png;base64," + png;
        await img.decode();
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        c.getContext("2d").drawImage(img, 0, 0);
        return c.toDataURL("image/webp", 0.92).split(",")[1];
      }, buf.toString("base64"));
      fs.writeFileSync(path.join(PUB, nome), Buffer.from(b64, "base64"));
    } else {
      fs.writeFileSync(path.join(PUB, nome), buf);
    }
    console.log("ok", nome);
  }
  await browser.close();

  // favicon.ico com um PNG de 32x32 dentro
  const png = fs.readFileSync(path.join(PUB, "favicon-32.png"));
  const cab = Buffer.alloc(22);
  cab.writeUInt16LE(0, 0);
  cab.writeUInt16LE(1, 2);
  cab.writeUInt16LE(1, 4);
  cab.writeUInt8(32, 6);
  cab.writeUInt8(32, 7);
  cab.writeUInt8(0, 8);
  cab.writeUInt8(0, 9);
  cab.writeUInt16LE(1, 10);
  cab.writeUInt16LE(32, 12);
  cab.writeUInt32LE(png.length, 14);
  cab.writeUInt32LE(22, 18);
  fs.writeFileSync(path.join(PUB, "favicon.ico"), Buffer.concat([cab, png]));
  fs.unlinkSync(path.join(PUB, "favicon-32.png"));
  console.log("ok favicon.ico");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
