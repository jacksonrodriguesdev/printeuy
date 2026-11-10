// Teste de fumaça: abre as páginas principais do site já compilado e confere status e conteúdo.
// Uso: BASE_URL=http://localhost:3000 node scripts/ci/fumaca.cjs   (dados de scripts/ci/semente.cjs)
const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");

// [caminho, status esperado, textos que precisam aparecer]
const PAGINAS = [
  ["/", 200, ["AUTO PIEZAS UY", "<h1", 'lang="es-UY"', "Elegí tu vehículo"]],
  ["/loja", 200, ["CI-0"]],
  // Site só em espanhol (Uruguai): a versão antiga em português redireciona
  ["/pt", 301, []],
  ["/pt/loja", 301, []],
  // App instalável (PWA) e chave das notificações push
  ["/sw.js", 200, ["notificationclick", "/offline.html"]],
  ["/offline.html", 200, ["Sin conexión"]],
  ["/manifest.webmanifest", 200, ['"lang": "es-UY"']],
  ["/api/public/push", 200, ['"chave"']],
  ["/app", 200, ["AUTO PIEZAS UY en tu celular"]],
  ["/produto/CI-001", 200, ["CI-001", "application/ld+json", "Vehículos compatibles", "Volkswagen Gol"]],
  ["/repuestos", 200, ["Bosch"]],
  ["/repuestos/bosch", 200, ["Bosch"]],
  ["/repuestos/frenos", 200, ["Frenos"]],
  ["/repuestos/pastillas-de-freno", 200, ["Pastillas de freno"]],
  ["/repuestos/no-existe-ci", 404, []],
  // Páginas por veículo
  ["/vehiculos", 200, ["Repuestos por marca y modelo", "/vehiculos/volkswagen/gol"]],
  ["/vehiculos/volkswagen/gol", 200, ["Repuestos para Volkswagen Gol", "CI-001", "application/ld+json"]],
  ["/vehiculos/marca-que-nao-existe/x", 404, []],
  // Páginas por local (só Uruguai)
  ["/repuestos-autos", 200, ["<h1"]],
  ["/repuestos-autos/montevideo", 200, ["Repuestos para autos en Montevideo"]],
  ["/repuestos-autos/pelotas", 404, []],
  ["/catalogos", 200, ["<h1"]],
  ["/ayuda", 200, ["<h1"]],
  ["/guias", 200, ["Guías"]],
  ["/guias/cuando-cambiar-las-pastillas-de-freno", 200, ["pastillas"]],
  ["/cotizar", 200, ["<h1"]],
  ["/pedido-rapido", 200, []],
  ["/login", 200, []],
  ["/cadastro", 200, []],
  ["/sitemap.xml", 200, ["<sitemapindex"]],
  ["/sitemaps/paginas.xml", 200, ["/repuestos-autos/montevideo", "/vehiculos/volkswagen/gol", "/repuestos/bosch"]],
  ["/sitemaps/pecas-1.xml", 200, ["CI-001"]],
  ["/robots.txt", 200, ["Sitemap", "Disallow: /admin"]],
  ["/feeds/google-merchant.xml", 200, ["<?xml"]],
  ["/feeds/meta-catalogo.xml", 200, ["<?xml"]],
  ["/pagar/link-que-nao-existe", 200, ["Link no encontrado"]],
  ["/pagina-que-nao-existe-ci", 404, []],
];
// Sinais de página quebrada (tela de erro do React/TanStack)
const QUEBRADA = [/Something went wrong/i, /Algo salió mal/i, /Algo deu errado/i, /"statusCode":\s*500/];

(async () => {
  const falhas = [];
  for (const [caminho, status, textos] of PAGINAS) {
    const t0 = Date.now();
    let res, html = "";
    try {
      res = await fetch(BASE + caminho, { redirect: "manual", headers: { "user-agent": "Mozilla/5.0 (CI fumaça)" } });
      html = await res.text();
    } catch (e) {
      falhas.push(`${caminho}: sem resposta (${e.message})`);
      continue;
    }
    const erros = [];
    if (res.status !== status) erros.push(`status ${res.status} (esperado ${status})`);
    for (const t of textos) if (!html.includes(t)) erros.push(`falta "${t}"`);
    if (status === 200) for (const re of QUEBRADA) if (re.test(html)) erros.push(`tela de erro (${re})`);
    console.log(`${erros.length ? "✘" : "✔"} ${String(res.status).padEnd(3)} ${String(Date.now() - t0).padStart(5)}ms ${caminho}${erros.length ? "  ← " + erros.join("; ") : ""}`);
    if (erros.length) falhas.push(`${caminho}: ${erros.join("; ")}`);
  }

  // Aviso da dLocal sem assinatura válida: recusado (ninguém marca um pagamento como pago de fora)
  {
    const r = await fetch(BASE + "/api/public/dlocal/pagamentos", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "V2-HMAC-SHA256, Signature: falsa", "x-date": new Date().toISOString() },
      body: JSON.stringify({ id: "D-falso", status: "PAID" }),
    });
    const ok = r.status === 401;
    console.log(`${ok ? "✔" : "✘"} aviso da dLocal sem assinatura → ${r.status}`);
    if (!ok) falhas.push(`webhook dLocal aceitou aviso falso (${r.status})`);
  }

  // WhatsApp das cotações: todo link do WhatsApp nas páginas principais vai para o número certo
  // (+55 53 99134-3980). Um dígito a menos e nenhuma cotação chega.
  const WHATSAPP = "5553991343980";
  for (const caminho of ["/", "/produto/CI-001", "/repuestos-autos/montevideo", "/vehiculos/volkswagen/gol"]) {
    const html = await (await fetch(BASE + caminho)).text();
    const numeros = [...html.matchAll(/api\.whatsapp\.com\/send\?phone=(\d+)/g)].map((m) => m[1]);
    const errados = numeros.filter((n) => n !== WHATSAPP);
    const ok = numeros.length > 0 && !errados.length;
    console.log(`${ok ? "✔" : "✘"} WhatsApp em ${caminho}: ${numeros.length} link(s)${errados.length ? ` — ERRADO: ${[...new Set(errados)].join(", ")}` : ""}`);
    if (!ok) falhas.push(`${caminho}: WhatsApp ${numeros.length ? `com número errado (${[...new Set(errados)]})` : "sem link"}`);
  }

  // Preço só em pesos uruguaios ($U), nunca em reais
  for (const [caminho, certa, errada] of [["/produto/CI-001", "$U", /R\$\s?\d/]]) {
    const html = await (await fetch(BASE + caminho)).text();
    const ok = html.includes(certa) && !errada.test(html);
    console.log(`${ok ? "✔" : "✘"} moeda em ${caminho}: ${ok ? `só ${certa}` : "moeda errada ou sem preço"}`);
    if (!ok) falhas.push(`${caminho}: moeda errada (esperado só ${certa})`);
  }

  // Admin sem login: o painel não pode vir no HTML (src/routes/admin.tsx só mostra depois de confirmar
  // a sessão; os dados passam por assertAdmin no servidor)
  for (const caminho of ["/admin", "/admin/analises", "/admin/clientes", "/admin/captura", "/admin/fiscal", "/admin/extratos"]) {
    const adm = await fetch(BASE + caminho, { redirect: "manual" });
    const htmlAdm = adm.status === 200 ? await adm.text() : "";
    const vazou = /Painel de controle|Criador de anúncios|E-mail marketing|Fiscal do MEI|Extrato do banco/.test(htmlAdm);
    console.log(`${vazou ? "✘" : "✔"} ${adm.status} ${caminho} sem login ${vazou ? "MOSTRA O PAINEL" : "não mostra o painel"}`);
    if (vazou) falhas.push(`${caminho} mostra o painel sem login`);
  }

  // Rastreio: grava uma visita e um evento
  for (const corpo of [{ path: "/loja", visitorId: "ci-fumaca", sessionId: "ci-fumaca" }, { path: "/_evento/busca/0%7Cpeca%20ci", pagina: "/loja", visitorId: "ci-fumaca", sessionId: "ci-fumaca" }]) {
    const r = await fetch(BASE + "/api/public/track", { method: "POST", headers: { "content-type": "application/json", "user-agent": "Mozilla/5.0 (CI fumaça)" }, body: JSON.stringify(corpo) });
    const j = await r.json().catch(() => ({}));
    const ok = r.status === 200 && j.ok === true;
    console.log(`${ok ? "✔" : "✘"} ${r.status} POST /api/public/track ${corpo.path}`);
    if (!ok) falhas.push(`track ${corpo.path}: ${r.status}`);
  }

  // Face ID (passkeys): a biblioteca carrega no build de produção e gera o desafio
  {
    const r = await fetch(BASE + "/api/auth/passkey/opcoes", { method: "POST", headers: { "content-type": "application/json", host: "localhost:3999" }, body: JSON.stringify({ tipo: "login" }) });
    const j = await r.json().catch(() => ({}));
    const ok = r.status === 200 && !!j.opcoes?.challenge && !!j.token;
    console.log(`${ok ? "✔" : "✘"} ${r.status} POST /api/auth/passkey/opcoes (login com Face ID)`);
    if (!ok) falhas.push(`passkey opcoes: ${r.status} ${JSON.stringify(j)}`);
  }

  // O evento foi para site_eventos (e não para site_visits)?
  if (process.env.DATABASE_URL) {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const ev = await prisma.site_eventos.count({ where: { visitor_id: "ci-fumaca", tipo: "busca", dado: "0|peca ci" } });
    const antigo = await prisma.site_visits.count({ where: { path: { startsWith: "/_evento/" } } });
    await prisma.$disconnect();
    const ok = ev === 1 && antigo === 0;
    console.log(`${ok ? "✔" : "✘"} evento gravado em site_eventos (${ev}) e nenhum em site_visits (${antigo})`);
    if (!ok) falhas.push("evento não foi para site_eventos");
  }

  if (falhas.length) {
    console.error(`\n${falhas.length} falha(s):\n- ${falhas.join("\n- ")}`);
    process.exit(1);
  }
  console.log("\nTodas as páginas principais OK");
})();
