// Lista as fotos e vídeos que o site realmente usa (banco + home) para subir só eles na hospedagem.
// A pasta ../midia tem 2,6 GB (inclui páginas e categorias da Printi que o site não mostra).
//
// Uso (pasta site/):
//   node --env-file=.env scripts/deploy/listar_midia_usada.cjs
// Saída: dados/deploy/midia_usada.txt (um caminho por linha, relativo a ../midia) e o total em MB.
// Depois: compactar com o tar (ver docs/DEPLOY_HOSTINGER.md).

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const MIDIA = path.resolve(process.env.UPLOADS_DIR || "../midia");
const SAIDA = path.join("dados", "deploy", "midia_usada.txt");

(async () => {
  const prisma = new PrismaClient();
  const usados = new Set();
  const add = (u) => {
    if (typeof u === "string" && u.startsWith("/uploads/")) usados.add(decodeURIComponent(u.slice(9)));
  };
  for (const p of await prisma.pecas.findMany({ select: { imagem_principal: true } })) add(p.imagem_principal);
  for (const i of await prisma.pecas_img.findMany({ select: { image_path: true } })) add(i.image_path);
  for (const c of await prisma.categories.findMany({ select: { image_path: true } })) add(c.image_path);
  for (const d of await prisma.pecas_detalhes.findMany({ select: { dados: true } }))
    for (const m of JSON.stringify(d.dados).match(/\/uploads\/[^"\\]+/g) || []) add(m);
  await prisma.$disconnect();
  // Fotos fixas no código (home)
  for (const f of ["src/components/home/HomeGrafica.tsx"])
    for (const m of fs.readFileSync(f, "utf8").match(/\/uploads\/[^"'`\s]+/g) || []) add(m);

  let bytes = 0, faltando = 0;
  const lista = [];
  for (const rel of [...usados].sort()) {
    const arq = path.join(MIDIA, rel);
    if (!fs.existsSync(arq)) {
      faltando++;
      continue;
    }
    bytes += fs.statSync(arq).size;
    lista.push(rel);
  }
  fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
  fs.writeFileSync(SAIDA, lista.join("\n") + "\n");
  console.log(`${lista.length} arquivos usados, ${(bytes / 1048576).toFixed(0)} MB (${faltando} referências sem arquivo)`);
  console.log(`Lista: ${SAIDA}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
