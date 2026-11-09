// Análise da foto de uma peça para os posts (feita num Chromium do Playwright, sem bibliotecas):
// - recorta o fundo branco em volta (a peça aparece grande no post);
// - conta as cores: desenho técnico (traço azul ou preto) tem poucas cores; foto real tem centenas.
// Usado por selecionar_pecas.ts (descarta desenhos) e gerar_posts.cjs (usa a foto recortada).

async function analisarFoto(page, url) {
  const resp = await fetch(url);
  if (!resp.ok) return { erro: `HTTP ${resp.status}` };
  const buf = Buffer.from(await resp.arrayBuffer());
  const tipo = resp.headers.get("content-type") || "image/jpeg";
  const src = `data:${tipo};base64,${buf.toString("base64")}`;
  return page.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const W = img.naturalWidth;
    const H = img.naturalHeight;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d");
    g.fillStyle = "#fff";
    g.fillRect(0, 0, W, H);
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, W, H).data;
    let x0 = W,
      y0 = H,
      x1 = -1,
      y1 = -1,
      n = 0,
      meio = 0,
      saturados = 0;
    const cores = new Set();
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const r = d[i],
          gg = d[i + 1],
          b = d[i + 2];
        if (r > 238 && gg > 238 && b > 238) continue;
        n++;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
        cores.add(((r >> 4) << 8) | ((gg >> 4) << 4) | (b >> 4));
        const lum = 0.3 * r + 0.59 * gg + 0.11 * b;
        if (lum > 70 && lum < 215) meio++;
        if (Math.max(r, gg, b) - Math.min(r, gg, b) > 60) saturados++;
      }
    if (x1 < 0) return { vazia: true };
    const pad = Math.round(Math.max(x1 - x0, y1 - y0) * 0.05);
    const cx0 = Math.max(0, x0 - pad);
    const cy0 = Math.max(0, y0 - pad);
    const cw = Math.min(W, x1 + pad + 1) - cx0;
    const ch = Math.min(H, y1 + pad + 1) - cy0;
    const o = document.createElement("canvas");
    o.width = cw;
    o.height = ch;
    o.getContext("2d").drawImage(c, cx0, cy0, cw, ch, 0, 0, cw, ch);
    return {
      largura: W,
      altura: H,
      cores: cores.size,
      densidade: n / ((x1 - x0 + 1) * (y1 - y0 + 1)),
      meio: meio / n,
      saturados: saturados / n,
      // quanto da imagem a peça ocupa (0-1): foto com muita sobra branca fica pequena no post
      ocupacao: ((x1 - x0 + 1) * (y1 - y0 + 1)) / (W * H),
      recortada: o.toDataURL("image/jpeg", 0.92),
    };
  }, src);
}

// Desenho técnico ou foto pequena demais: não serve para post
const fotoRuim = (a) => !a || a.erro || a.vazia || a.cores < 90 || Math.min(a.largura, a.altura) < 300;

module.exports = { analisarFoto, fotoRuim };
