// Gera os posts de Instagram/Facebook das peças escolhidas por selecionar_pecas.ts.
// Para cada peça: 1 imagem de feed (1080x1350) e 1 de story (1080x1920), em 4 layouts que se
// alternam, mais a legenda pronta (texto + hashtags) e uma galeria para ver tudo.
//
// Uso:
//   npx tsx --env-file=.env scripts/marketing/selecionar_pecas.ts      (escolhe as peças)
//   node scripts/marketing/gerar_posts.cjs [marketing/posts]           (gera as imagens)
// Precisa do Chromium do Playwright (o mesmo de scripts/marca). Pasta de saída fora do git.
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const PASTA = path.resolve(process.argv[2] || "marketing/posts");
const PECAS = JSON.parse(fs.readFileSync(path.join(PASTA, "pecas.json"), "utf8"));
const LOGO = fs.readFileSync(path.join(__dirname, "../../public/logo.svg"), "utf8");
const ZAP = "+55 47 99191-9365";
const SITE = "autopiezasuy.com";

// ---------- Textos ----------
const FRASES = {
  Motor: [
    ["Potencia", "que dura"],
    ["Tu motor", "como nuevo"],
    ["Rendimiento", "sin vueltas"],
  ],
  "Suspensión": [
    ["Firme en", "cada camino"],
    ["Confort y", "seguridad"],
    ["Chau a los", "ruidos"],
  ],
  Embrague: [
    ["Cambios", "suaves"],
    ["Arrancá", "sin tirones"],
  ],
  "Transmisión": [
    ["Toda la fuerza", "a las ruedas"],
    ["Girá", "sin ruidos"],
  ],
  Frenos: [
    ["Frená", "seguro"],
    ["Seguridad en", "cada frenada"],
  ],
  "Eléctrica": [
    ["Arranque", "garantizado"],
    ["Energía", "para tu auto"],
  ],
  "Dirección": [["Precisión en", "cada curva"]],
  "Refrigeración": [["Temperatura", "bajo control"]],
  "Inyección y Combustible": [["Consumo", "en su punto"]],
};
const SUB = {
  Motor: "El corazón de tu auto merece repuestos de calidad.",
  "Suspensión": "Estabilidad y confort en calles, rutas y caminos de balasto.",
  Embrague: "Pasá los cambios con suavidad y sin patinar.",
  "Transmisión": "Sin golpes ni ruidos al doblar o acelerar.",
  Frenos: "Lo más importante de tu auto: frenar bien.",
  "Eléctrica": "Que tu auto arranque siempre, incluso en invierno.",
  "Dirección": "Manejo firme, sin juego en el volante.",
  "Refrigeración": "Evitá recalentamientos y cuidá el motor.",
  "Inyección y Combustible": "Combustión justa: más rendimiento y menos consumo.",
};
const EMOJI = {
  Motor: "🔧",
  "Suspensión": "🛞",
  Embrague: "⚙️",
  "Transmisión": "⚙️",
  Frenos: "🛑",
  "Eléctrica": "⚡",
  "Dirección": "🎯",
  "Refrigeración": "🌡️",
  "Inyección y Combustible": "⛽",
};

// Nome curto e natural para o post ("Filtro Aceite" -> "Filtro de aceite")
const TROCAS = [
  [/^pastilla\b.*/i, "Pastillas de freno"],
  [/^amortiguador del\b.*/i, "Amortiguador delantero"],
  [/^amortiguador tras\b.*/i, "Amortiguador trasero"],
  [/^bieleta del\b.*/i, "Bieleta delantera"],
  [/^bieleta\b.*/i, "Bieleta de suspensión"],
  [/^buj[ií]a\b.*/i, "Bujías de encendido"],
  [/^pivote suspensi[oó]n.*/i, "Rótula de suspensión"],
  [/^terminal direcci[oó]n.*/i, "Extremo de dirección"],
  [/^terminal axial.*/i, "Axial de dirección"],
  [/^semi eje homocin[eé]tico.*/i, "Semieje homocinético"],
  [/^semi eje.*/i, "Semieje"],
  [/^tr[ií]pode.*/i, "Trípode de homocinética"],
  [/^junta fija.*/i, "Junta homocinética fija"],
  [/^pist[oó]n c\/anillo.*/i, "Pistón con aros"],
  [/^cilindro esclavo.*/i, "Cilindro esclavo de embrague"],
  [/^actuador hidr[aá]ulico.*/i, "Actuador hidráulico de embrague"],
  [/^juego juntas cambio.*/i, "Juego de juntas de caja"],
  [/^juego juntas.*/i, "Juego de juntas de motor"],
  [/^sonda lambda.*/i, "Sonda lambda"],
  [/^sensor rotaci[oó]n abs.*/i, "Sensor de ABS"],
  [/^resorte a gas.*/i, "Amortiguador de portón (resorte a gas)"],
  [/^bandeja( de)? suspensi[oó]n.*/i, "Parrilla de suspensión"],
  [/^bandeja.*/i, "Parrilla de suspensión"],
  [/^cojinete biela.*/i, "Cojinetes de biela"],
  [/^polea micro v.*/i, "Polea de correa poly-V"],
  [/^tensor( completo)? correa.*/i, "Tensor de correa"],
  [/^motor arranque.*/i, "Motor de arranque"],
  [/^disco freno.*/i, "Disco de freno ventilado"],
  [/^rodamiento embrague.*/i, "Rodamiento de embrague"],
];
const DE = [
  ["Filtro Aceite", "Filtro de aceite"],
  ["Cilindro Rueda", "Cilindro de rueda"],
  ["Cubo Rueda", "Cubo de rueda"],
  ["Kit Embrague", "Kit de embrague"],
  ["Bobina Encendido", "Bobina de encendido"],
  ["Bujía Encendido", "Bujía de encendido"],
  ["Plato Embrague", "Plato de embrague"],
  ["Disco Embrague", "Disco de embrague"],
  ["Vástago Embrague", "Vástago de embrague"],
  ["Actuador Embrague", "Actuador de embrague"],
  ["Junta Tapa de cilindros", "Junta de tapa de cilindros"],
  ["Resorte Helicoidal", "Espiral de suspensión"],
];
const CORTE =
  /^(del|delantero|delantera|tras|trasero|trasera|ld|le|izq|der|inf|sup|dir|esq|std|super|plus|completo|asfaltica|asfáltica|analizador|membrana|ventilado|3p|-)$|^(c\/|s\/|rl\d|bb\d|\d)/i;
function nomePost(nome) {
  let n = nome.replace(/\s+/g, " ").trim();
  for (const [re, novo] of TROCAS) if (re.test(n)) return novo;
  const palavras = [];
  for (const p of n.split(" ")) {
    if (palavras.length >= 2 && CORTE.test(p)) break;
    palavras.push(p);
  }
  n = palavras.join(" ");
  for (const [de, para] of DE) if (n.toLowerCase().startsWith(de.toLowerCase())) n = para + n.slice(de.length);
  // "Válvula Termostatica" -> "Válvula termostática"
  return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase().replace(/termostatica/, "termostática");
}

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const sigla = (m) => ({ VOLKSWAGEN: "VW", "MERCEDES BENZ": "MB", CITROEN: "CI" })[m.montadora] ?? m.montadoraNome.slice(0, 2).toUpperCase();
const modelosTxt = (p, max = 3) =>
  p.modelos
    .slice(0, max)
    .map((v) => v.modelo)
    .join(" · ");

// ---------- Ícones (SVG em linha) ----------
const IC = {
  zap: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.2.1.7-.1 1.2z"/></svg>`,
  web: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.6 2.6 4 6 4 9.5s-1.4 6.9-4 9.5c-2.6-2.6-4-6-4-9.5s1.4-6.9 4-9.5z"/></svg>`,
  ok: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>`,
  car: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 16v-3l2.2-5.2A2 2 0 0 1 7 6.5h10a2 2 0 0 1 1.8 1.3L21 13v3"/><path d="M3 16h18v2.2a.8.8 0 0 1-.8.8h-2.4a.8.8 0 0 1-.8-.8V17H7v1.2a.8.8 0 0 1-.8.8H3.8a.8.8 0 0 1-.8-.8z"/><path d="M4.5 12.5h15"/></svg>`,
  truck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h11v10H2zM13 9h4l4 4v3h-8z"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>`,
};

const BASE_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:var(--h);overflow:hidden}
body{font-family:'Plus Jakarta Sans',sans-serif;-webkit-font-smoothing:antialiased}
.cond{font-family:'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:-.01em}
.logo{display:flex;align-items:center;gap:18px}
.logo svg{width:84px;height:84px}
.logo b{display:block;font:900 40px/1 'Barlow Condensed';letter-spacing:.01em}
.logo small{display:block;margin-top:6px;font:800 15px/1 'Plus Jakarta Sans';letter-spacing:.28em;color:#f59e0b}
.foto{width:100%;height:100%;object-fit:contain}
.rodape{display:flex;align-items:center;justify-content:space-between;gap:20px;font-weight:700;font-size:25px}
.rodape span{display:flex;align-items:center;gap:12px}
.rodape svg{width:38px;height:38px}
`;

const logo = (cor, corSub = "#f59e0b") =>
  `<div class="logo" style="color:${cor}">${LOGO}<span><b>AUTO PIEZAS UY</b><small style="color:${corSub}">REPUESTOS PARA AUTOS</small></span></div>`;
const rodape = (cor, corIcone) => `
  <div class="rodape" style="color:${cor}">
    <span><i style="color:${corIcone};display:flex">${IC.zap}</i>${ZAP}</span>
    <span><i style="color:${corIcone};display:flex">${IC.web}</i>${SITE}</span>
  </div>`;

// ---------- Layouts ----------
// A) Vitrine escura com plataforma iluminada
function layoutA(p, f, story) {
  return `
<style>
body{background:radial-gradient(ellipse 80% 55% at 50% 42%,#1d4280 0%,#0d2148 45%,#060f22 100%);color:#fff}
.wrap{height:100%;display:flex;flex-direction:column;padding:${story ? "120px 70px 110px" : "64px 70px 56px"}}
.kick{margin-top:${story ? 90 : 46}px;text-align:center;font-weight:800;font-size:24px;letter-spacing:.32em;color:#fbbf24}
h1{margin-top:14px;text-align:center;font-weight:900;font-size:${story ? 150 : 128}px;line-height:.86}
h1 em{display:block;font-style:italic;color:#f97316}
.sub{margin-top:22px;text-align:center;font-size:27px;color:#cbd5e1}
.palco{position:relative;flex:1;display:flex;align-items:center;justify-content:center;margin-top:20px}
.card{position:relative;z-index:2;width:${story ? 640 : 520}px;aspect-ratio:1;border-radius:44px;background:#fff;padding:34px;box-shadow:0 40px 80px -20px rgba(0,0,0,.7),0 0 0 10px rgba(255,255,255,.06)}
.anel{position:absolute;left:50%;bottom:${story ? 40 : 4}%;transform:translateX(-50%);width:880px;height:120px;border-radius:50%;border:5px solid rgba(147,197,253,.85);box-shadow:0 0 40px rgba(96,165,250,.8),inset 0 0 30px rgba(96,165,250,.5)}
.anel.b{width:960px;height:150px;bottom:calc(${story ? 40 : 4}% - 40px);border-color:rgba(249,115,22,.7);box-shadow:0 0 40px rgba(249,115,22,.6)}
.info{margin-top:26px;text-align:center}
.nome{font-weight:800;font-size:44px}
.dados{margin-top:12px;font-size:25px;color:#cbd5e1}
.dados b{color:#fff}
.cta{margin:26px auto 0;display:inline-flex;gap:14px;align-items:center;padding:20px 36px;border-radius:999px;background:#22c55e;font-weight:800;font-size:28px}
.cta svg{width:36px;height:36px}
.rodape{margin-top:34px;padding-top:26px;border-top:2px solid rgba(255,255,255,.12)}
</style>
<div class="wrap">
  ${logo("#fff")}
  <p class="kick">REPUESTOS PARA ${esc(p.montadoraNome.toUpperCase())}</p>
  <h1 class="cond">${esc(f[0])}<em>${esc(f[1])}</em></h1>
  ${story ? `<p class="sub">${esc(SUB[p.categoria] || "")}</p>` : ""}
  <div class="palco"><div class="anel b"></div><div class="anel"></div><div class="card"><img class="foto" src="${p.foto}"></div></div>
  <div class="info">
    <p class="nome">${esc(p.nomePost)}</p>
    <p class="dados">Código <b>${esc(p.codigo)}</b>${p.marca ? ` · Marca <b>${esc(p.marca)}</b>` : ""}${p.modelos.length ? ` · ${esc(modelosTxt(p))}` : ""}</p>
    <div style="text-align:center"><span class="cta">${IC.zap}Consultá el precio</span></div>
  </div>
  ${rodape("#fff", "#f97316")}
</div>`;
}

// B) Naranja com faixas diagonais e lista de vantagens
function layoutB(p, f, story) {
  return `
<style>
body{background:linear-gradient(140deg,#fb923c 0%,#f97316 45%,#ea580c 100%);color:#fff;position:relative}
.faixa{position:absolute;inset:0;overflow:hidden}
.faixa i{position:absolute;display:block;background:#0b1d3a}
.faixa .f1{width:1500px;height:${story ? 980 : 720}px;left:-260px;bottom:-${story ? 380 : 300}px;transform:rotate(-14deg)}
.faixa .f2{width:1500px;height:26px;left:-260px;bottom:${story ? 560 : 390}px;transform:rotate(-14deg);background:#fff;opacity:.9}
.faixa .f3{width:1500px;height:10px;left:-260px;bottom:${story ? 610 : 432}px;transform:rotate(-14deg);background:#fff;opacity:.55}
.wrap{position:relative;height:100%;display:flex;flex-direction:column;padding:${story ? "120px 70px 110px" : "64px 70px 56px"}}
h1{margin-top:${story ? 90 : 52}px;font-weight:900;font-size:${story ? 140 : 118}px;line-height:.86;text-shadow:0 6px 0 rgba(0,0,0,.08)}
h1 em{display:block;font-style:italic;color:#0b1d3a}
.nome{margin-top:20px;font-weight:800;font-size:40px}
.meio{flex:1;position:relative;display:flex;align-items:center;margin-top:20px}
.lista{position:relative;z-index:2;width:50%;display:flex;flex-direction:column;gap:22px;font-size:28px;font-weight:700}
.lista li{list-style:none;display:flex;gap:16px;align-items:flex-start}
.lista i{flex:none;display:flex;width:46px;height:46px;border-radius:50%;background:#fff;color:#ea580c;padding:9px}
.lista small{display:block;font-size:22px;font-weight:600;opacity:.85}
.card{position:absolute;right:-10px;top:50%;transform:translateY(-50%) rotate(-5deg);width:${story ? 560 : 500}px;aspect-ratio:1;border-radius:48px;background:#fff;padding:32px;box-shadow:0 40px 70px -20px rgba(11,29,58,.65)}
.cta{position:relative;margin-top:30px;align-self:flex-start;display:inline-flex;gap:14px;align-items:center;padding:20px 34px;border-radius:22px;background:#fff;color:#0b1d3a;font-weight:800;font-size:28px}
.cta svg{width:36px;height:36px;color:#22c55e}
.rodape{position:relative;margin-top:34px}
</style>
<div class="faixa"><i class="f1"></i><i class="f2"></i><i class="f3"></i></div>
<div class="wrap">
  ${logo("#fff", "#0b1d3a")}
  <h1 class="cond">${esc(f[0])}<em>${esc(f[1])}</em></h1>
  <p class="nome">${esc(p.nomePost)} para ${esc(p.montadoraNome)}</p>
  <div class="meio">
    <ul class="lista">
      <li><i>${IC.ok}</i><span>Código ${esc(p.codigo)}<small>${p.marca ? `Marca ${esc(p.marca)}` : "Código original"}</small></span></li>
      ${p.modelos.length ? `<li><i>${IC.car}</i><span>${esc(modelosTxt(p))}<small>${esc(p.modelos[0].anos || "Varios años")}</small></span></li>` : ""}
      <li><i>${IC.truck}</i><span>Envíos a todo Uruguay<small>Por agencia a tu ciudad</small></span></li>
    </ul>
    <div class="card"><img class="foto" src="${p.foto}"></div>
  </div>
  <span class="cta">${IC.zap}Pedí tu cotización</span>
  ${rodape("#fff", "#fbbf24")}
</div>`;
}

// C) Azul escuro com círculo branco grande e lista de modelos
function layoutC(p, f, story) {
  const modelos = p.modelos.slice(0, story ? 5 : 4);
  return `
<style>
body{background:#0b1d3a;color:#fff;position:relative;overflow:hidden}
.pontos{position:absolute;inset:0;opacity:.08;background-image:radial-gradient(#fff 1.6px,transparent 1.6px);background-size:30px 30px}
.fita{position:absolute;right:-120px;top:${story ? 120 : 70}px;transform:rotate(35deg);width:520px;padding:16px 0;background:#f59e0b;color:#0b1d3a;text-align:center;font:900 30px/1 'Barlow Condensed';letter-spacing:.12em}
.wrap{position:relative;height:100%;display:flex;flex-direction:column;padding:${story ? "120px 70px 110px" : "64px 70px 56px"}}
.marca{margin-top:${story ? 90 : 48}px;display:flex;align-items:center;gap:18px;font-weight:800;font-size:30px;color:#fbbf24}
.marca i{display:flex;align-items:center;justify-content:center;width:70px;height:70px;border-radius:50%;background:#fff;color:#0b1d3a;font:900 30px/1 'Barlow Condensed';font-style:normal}
h1{margin-top:20px;font-weight:900;font-size:${story ? 118 : 104}px;line-height:.88;max-width:900px}
.meio{flex:1;position:relative;margin-top:24px}
.circulo{position:absolute;right:-190px;top:50%;transform:translateY(-50%);width:${story ? 820 : 660}px;aspect-ratio:1;border-radius:50%;background:#fff;padding:${story ? 150 : 120}px;box-shadow:0 0 0 22px rgba(249,115,22,.9),0 0 0 44px rgba(249,115,22,.25)}
.mods{position:relative;z-index:2;display:flex;flex-direction:column;gap:6px;padding-top:${story ? 60 : 30}px;max-width:${story ? 470 : 420}px}
.mods p{font:900 ${story ? 58 : 50}px/1 'Barlow Condensed';text-transform:uppercase}
.mods p span{font-size:.62em;color:#94a3b8;margin-left:10px}
.cod{margin-top:22px;font:600 26px/1.3 'Plus Jakarta Sans';text-transform:none;color:#cbd5e1}.cod b{color:#fff}
.preco{position:relative;z-index:2;margin-top:24px;align-self:flex-start;padding:18px 30px;border-radius:18px;background:#f97316;font-weight:800;font-size:28px;display:inline-flex;gap:12px;align-items:center}
.preco svg{width:34px;height:34px}
.rodape{margin-top:34px;padding-top:26px;border-top:2px solid rgba(255,255,255,.12)}
</style>
<div class="pontos"></div><div class="fita">DESTACADO</div>
<div class="wrap">
  ${logo("#fff")}
  <p class="marca"><i>${esc(sigla(p))}</i>${esc(p.montadoraNome)}</p>
  <h1 class="cond">${esc(p.nomePost)}</h1>
  <div class="meio">
    <div class="circulo"><img class="foto" src="${p.foto}"></div>
    <div class="mods">${modelos.map((v) => `<p>${esc(v.modelo)}${v.anos ? `<span>${esc(v.anos)}</span>` : ""}</p>`).join("")}
      <p class="cod">Cód. <b>${esc(p.codigo)}</b>${p.marca ? `<br>Marca <b>${esc(p.marca)}</b>` : ""}</p>
    </div>
  </div>
  <span class="preco">${IC.zap}Consultá precio por WhatsApp</span>
  ${rodape("#fff", "#f97316")}
</div>`;
}

// D) Claro, cartão com a foto e faixa azul embaixo
function layoutD(p, f, story) {
  return `
<style>
body{background:#eef2f7;color:#0b1d3a;position:relative;overflow:hidden}
.curva{position:absolute;right:-260px;top:-260px;width:760px;height:760px;border-radius:50%;border:4px solid #f97316;opacity:.5}
.curva.b{right:-200px;top:-200px;width:640px;height:640px;border-color:#0b1d3a;opacity:.12}
.wrap{position:relative;height:100%;display:flex;flex-direction:column;padding:${story ? "120px 70px 0" : "64px 70px 0"}}
.painel{position:relative;flex:none;height:${story ? 960 : 600}px;margin-top:${story ? 60 : 40}px;border-radius:48px;background:#fff;box-shadow:0 30px 60px -30px rgba(11,29,58,.35);padding:${story ? 90 : 56}px;display:flex}
.painel img{mix-blend-mode:multiply}
.tag{position:absolute;left:36px;top:36px;padding:12px 22px;border-radius:999px;background:#0b1d3a;color:#fff;font-weight:800;font-size:22px;letter-spacing:.06em}
.tag b{color:#fbbf24}
h1{margin-top:${story ? 50 : 34}px;font-weight:900;font-size:${story ? 112 : 88}px;line-height:.9}
h1 em{font-style:italic;color:#f97316}
.nome{margin-top:16px;font-weight:700;font-size:32px;color:#334155}
.chips{margin-top:20px;display:flex;flex-wrap:wrap;gap:12px}
.chips span{padding:12px 20px;border-radius:14px;background:#fff;border:2px solid #dbe3ee;font-weight:700;font-size:24px}
.chips span.cod{background:#0b1d3a;border-color:#0b1d3a;color:#fff}
.base{margin:auto -70px 0;padding:34px 70px ${story ? 110 : 44}px;background:#0b1d3a}
.base .cta{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;color:#fff;font-weight:800;font-size:30px}
.base .cta span{padding:14px 26px;border-radius:16px;background:#22c55e;font-size:26px}
</style>
<div class="curva"></div><div class="curva b"></div>
<div class="wrap">
  ${logo("#0b1d3a")}
  <div class="painel"><span class="tag">PARA <b>${esc(p.montadoraNome.toUpperCase())}</b></span><img class="foto" src="${p.foto}"></div>
  <h1 class="cond">${esc(f[0])} <em>${esc(f[1])}</em></h1>
  <p class="nome">${esc(p.nomePost)}</p>
  <div class="chips"><span class="cod">Cód. ${esc(p.codigo)}</span>${p.marca ? `<span>${esc(p.marca)}</span>` : ""}${p.modelos
    .slice(0, 3)
    .map((v) => `<span>${esc(v.modelo)}</span>`)
    .join("")}</div>
  <div class="base">
    <div class="cta">¿Lo necesitás? <span>Escribinos</span></div>
    ${rodape("#fff", "#fbbf24")}
  </div>
</div>`;
}

const LAYOUTS = [layoutA, layoutB, layoutC, layoutD];
const NOMES_LAYOUT = ["vitrine-escura", "diagonal-laranja", "destaque-circulo", "claro"];

function pagina(corpo, altura) {
  return `<!doctype html><html lang="es-UY"><head><meta charset="utf-8"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,800;0,900;1,800;1,900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=block" rel="stylesheet"><style>:root{--h:${altura}px}${BASE_CSS}</style></head><body>${corpo}</body></html>`;
}

function legenda(p, f) {
  const tags = [
    "autopiezasuy",
    "repuestos",
    "repuestosuruguay",
    "autopartes",
    "uruguay",
    "montevideo",
    p.montadoraNome.toLowerCase().replace(/[^a-z]/g, ""),
    ...p.modelos.slice(0, 2).map((v) => (p.montadoraNome + v.modelo).toLowerCase().replace(/[^a-z0-9]/g, "")),
    p.categoria
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .split(" ")[0],
    "mecanica",
    "taller",
  ];
  const mods = p.modelos
    .slice(0, 4)
    .map((v) => `${v.modelo}${v.anos ? ` (${v.anos})` : ""}`)
    .join(", ");
  return [
    `${EMOJI[p.categoria] || "🔧"} ${f[0]} ${f[1]}: ${p.nomePost} para ${p.montadoraNome}`,
    "",
    SUB[p.categoria] || "",
    "",
    `✅ Código: ${p.codigo}`,
    p.marca ? `✅ Marca: ${p.marca}` : null,
    mods ? `🚗 Compatible con ${p.montadoraNome} ${mods}` : null,
    "",
    `📲 Consultá precio y disponibilidad por WhatsApp: ${ZAP}`,
    `🌐 ${SITE} (link en la bio)`,
    "🚚 Envíos a todo Uruguay",
    "",
    [...new Set(tags)].map((t) => `#${t}`).join(" "),
  ]
    .filter((l) => l !== null)
    .join("\n");
}

(async () => {
  const exe =
    process.env.CHROMIUM_PATH ||
    path.join(
      process.env.LOCALAPPDATA || "",
      "ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-win64/chrome-headless-shell.exe",
    );
  const browser = await chromium.launch(fs.existsSync(exe) ? { executablePath: exe } : {});
  for (const d of ["feed", "story"]) fs.mkdirSync(path.join(PASTA, d), { recursive: true });

  // Ordem do feed: intercala montadoras e categorias (não fica 4 VW seguidas)
  const porMarca = new Map();
  for (const p of PECAS) porMarca.set(p.montadora, [...(porMarca.get(p.montadora) || []), p]);
  const ordem = [];
  for (let r = 0; ordem.length < PECAS.length; r++) for (const lista of porMarca.values()) if (lista[r]) ordem.push(lista[r]);

  const registros = [];
  const contFrase = {};
  // LIMITE=4 gera só os primeiros (para testar o visual)
  const limite = Number(process.env.LIMITE) || ordem.length;
  for (const [i, p] of ordem.slice(0, limite).entries()) {
    p.nomePost = nomePost(p.nome);
    p.codigo = p.codigo.replace(/,\s+/g, ",").replace(/\.$/, "");
    const lista = FRASES[p.categoria] || [["La pieza", "justa"]];
    const k = (contFrase[p.categoria] = (contFrase[p.categoria] ?? -1) + 1);
    const f = lista[k % lista.length];
    const li = i % LAYOUTS.length;
    const base = `${String(i + 1).padStart(2, "0")}-${p.montadoraNome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[^a-z]/g, "")}-${p.nomePost
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}`;
    for (const [formato, altura] of [
      ["feed", 1350],
      ["story", 1920],
    ]) {
      const page = await browser.newPage({ viewport: { width: 1080, height: altura } });
      await page.setContent(pagina(LAYOUTS[li](p, f, formato === "story"), altura), { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map((im) => (im.complete ? 0 : new Promise((r) => (im.onload = im.onerror = r)))));
      });
      await page.screenshot({ path: path.join(PASTA, formato, `${base}.jpg`), type: "jpeg", quality: 92 });
      await page.close();
    }
    const texto = legenda(p, f);
    fs.writeFileSync(path.join(PASTA, "feed", `${base}.txt`), texto);
    registros.push({ n: i + 1, arquivo: base, layout: NOMES_LAYOUT[li], ...p, legenda: texto });
    console.log(`${String(i + 1).padStart(2)} ${NOMES_LAYOUT[li].padEnd(17)} ${base}`);
  }
  await browser.close();

  // Legendas numa planilha (abre no Excel) e galeria para revisar
  const csv = [
    "numero;arquivo;montadora;categoria;codigo;link;legenda",
    ...registros.map((r) =>
      [r.n, r.arquivo, r.montadoraNome, r.categoria, r.codigo, r.url, `"${r.legenda.replace(/"/g, '""')}"`].join(";"),
    ),
  ].join("\n");
  fs.writeFileSync(path.join(PASTA, "legendas.csv"), "﻿" + csv);
  fs.writeFileSync(
    path.join(PASTA, "index.html"),
    `<!doctype html><meta charset="utf-8"><title>Posts AUTO PIEZAS UY</title>
<style>body{font-family:system-ui;background:#0b1d3a;color:#fff;margin:0;padding:24px}h1{margin:0 0 20px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:22px}.c{background:#13294f;border-radius:16px;padding:12px}
.c img{width:100%;border-radius:10px;display:block}.c .s{display:flex;gap:10px;margin-top:10px}.c .s img{width:35%}
pre{white-space:pre-wrap;font-size:12px;color:#cbd5e1;max-height:180px;overflow:auto}</style>
<h1>${registros.length} posts · AUTO PIEZAS UY</h1><div class="g">${registros
      .map(
        (r) =>
          `<div class="c"><b>${r.n}. ${esc(r.nomePost)} · ${esc(r.montadoraNome)}</b><div class="s"><img src="feed/${r.arquivo}.jpg" style="width:63%"><img src="story/${r.arquivo}.jpg"></div><pre>${esc(r.legenda)}</pre></div>`,
      )
      .join("")}</div>`,
  );
  console.log(`\n${registros.length} posts em ${PASTA} (feed/, story/, legendas.csv, index.html)`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
