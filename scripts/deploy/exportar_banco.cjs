// Exporta o banco local (printeuy) em arquivos SQL para importar na hospedagem.
//
// Gera em dados/deploy/ (pasta fora do git):
//   01_estrutura.sql            todas as tabelas, vazias (= prisma/migrations/0_init + registro
//                               da migração, para o `prisma migrate deploy` saber que já está aplicada)
//   02_catalogo.sql.gz          peças, fotos, similares, ficha técnica, categorias, cotação e
//                               configurações do site
//   03_aplicacoes_N.sql.gz      aplicações por veículo (2 milhões de linhas), em partes menores
//                               para caber no limite de upload do phpMyAdmin
//   printeuy_completo.sql.gz  tudo junto num arquivo só (para importar pelo terminal)
//
// Uso (MySQL do Laragon ligado, na raiz do projeto):
//   node scripts/deploy/exportar_banco.cjs
// A importação está explicada em docs/DEPLOY_HOSTINGER.md.

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const MYSQLDUMP =
  process.env.MYSQLDUMP || "C:/laragon/bin/mysql/mysql-8.4.3-winx64/bin/mysqldump.exe";
const SAIDA = path.join("dados", "deploy");
const LINHAS_POR_PARTE = 400_000; // aplicações por arquivo (~8–10 MB compactado)

// Tabelas com dados (o resto vai vazio: pedidos, clientes, estatísticas começam do zero)
const CATALOGO = [
  "categories",
  "pecas",
  "pecas_img",
  "pecas_similar",
  "pecas_ficha_tecnica",
  "pecas_detalhes",
  "cotacoes",
  "configuracoes",
  "homepage_blocks",
  "site_banners",
];

function lerDatabaseUrl() {
  const linha = fs
    .readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .find((l) => l.startsWith("DATABASE_URL="));
  if (!linha) throw new Error("DATABASE_URL não encontrado no .env");
  const url = new URL(linha.slice("DATABASE_URL=".length).replace(/^"|"$/g, ""));
  return {
    usuario: decodeURIComponent(url.username),
    senha: decodeURIComponent(url.password),
    host: url.hostname,
    porta: url.port || "3306",
    banco: url.pathname.slice(1),
  };
}

function dump(db, args) {
  return execFileSync(
    MYSQLDUMP,
    [
      `--host=${db.host}`,
      `--port=${db.porta}`,
      `--user=${db.usuario}`,
      "--default-character-set=utf8mb4",
      "--single-transaction",
      "--skip-lock-tables",
      "--no-tablespaces", // hospedagem compartilhada não dá esse privilégio
      "--set-gtid-purged=OFF",
      "--skip-comments",
      "--no-create-info", // a estrutura vem da migração do Prisma
      "--extended-insert",
      "--net-buffer-length=1000000", // INSERTs de ~1 MB: rápidos e aceitos pelo phpMyAdmin
      ...args,
    ],
    // senha por variável de ambiente, nunca na linha de comando
    { env: { ...process.env, MYSQL_PWD: db.senha }, maxBuffer: 2 * 1024 * 1024 * 1024 },
  ).toString("utf8");
}

// MariaDB (comum em hospedagem) não conhece a collation padrão do MySQL 8
const compativel = (sql) => sql.replace(/utf8mb4_0900_ai_ci/g, "utf8mb4_unicode_ci");
const CAB = [
  "SET NAMES utf8mb4;",
  "SET FOREIGN_KEY_CHECKS=0;",
  "SET UNIQUE_CHECKS=0;",
  "SET AUTOCOMMIT=0;",
].join("\n");
const ROD = ["COMMIT;", "SET UNIQUE_CHECKS=1;", "SET FOREIGN_KEY_CHECKS=1;", ""].join("\n");

const gravarGz = (nome, texto) => {
  const arq = path.join(SAIDA, nome);
  fs.writeFileSync(arq, zlib.gzipSync(Buffer.from(texto, "utf8"), { level: 9 }));
  return arq;
};
const mb = (arq) => `${(fs.statSync(arq).size / 1024 / 1024).toFixed(1)} MB`;

const db = lerDatabaseUrl();
fs.mkdirSync(SAIDA, { recursive: true });
for (const f of fs.readdirSync(SAIDA)) if (/^0[123]_|^(autopiezasuy|printeuy)_/.test(f)) fs.unlinkSync(path.join(SAIDA, f));
console.log(`Exportando ${db.banco} de ${db.host}...`);

// 1) Estrutura: a migração do Prisma + registro em _prisma_migrations
const migracao = fs.readFileSync(path.join("prisma", "migrations", "0_init", "migration.sql"), "utf8");
const checksum = crypto.createHash("sha256").update(migracao).digest("hex");
const estrutura = [
  "-- PRINTE UY: estrutura completa do banco",
  "-- Gerado de prisma/migrations/0_init/migration.sql",
  "SET NAMES utf8mb4;",
  "SET FOREIGN_KEY_CHECKS=0;",
  migracao,
  "",
  "-- Registro da migração (o `npx prisma migrate deploy` passa a considerar o banco em dia)",
  "CREATE TABLE IF NOT EXISTS `_prisma_migrations` (",
  "  `id` VARCHAR(36) NOT NULL, `checksum` VARCHAR(64) NOT NULL, `finished_at` DATETIME(3) NULL,",
  "  `migration_name` VARCHAR(255) NOT NULL, `logs` TEXT NULL, `rolled_back_at` DATETIME(3) NULL,",
  "  `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),",
  "  `applied_steps_count` INTEGER UNSIGNED NOT NULL DEFAULT 0, PRIMARY KEY (`id`)",
  ") DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
  `INSERT INTO \`_prisma_migrations\` (id, checksum, finished_at, migration_name, applied_steps_count) VALUES ('${crypto.randomUUID()}', '${checksum}', NOW(3), '0_init', 1);`,
  "SET FOREIGN_KEY_CHECKS=1;",
  "",
].join("\n");
const arqEstrutura = path.join(SAIDA, "01_estrutura.sql");
fs.writeFileSync(arqEstrutura, compativel(estrutura));
console.log(`  ${arqEstrutura} (${mb(arqEstrutura)})`);

// Arquivo completo: gravado aos poucos (descompactado passa de 700 MB)
const completo = zlib.createGzip({ level: 9 });
const arqTudo = path.join(SAIDA, "printeuy_completo.sql.gz");
const fimCompleto = new Promise((ok, erro) =>
  completo.pipe(fs.createWriteStream(arqTudo)).on("finish", ok).on("error", erro),
);
completo.write(`${compativel(estrutura)}\n${CAB}\n`);

// 2) Catálogo
const catalogo = compativel(dump(db, [db.banco, ...CATALOGO]));
const arqCat = gravarGz("02_catalogo.sql.gz", `-- PRINTE UY: catálogo\n${CAB}\n${catalogo}\n${ROD}`);
console.log(`  ${arqCat} (${mb(arqCat)})`);
completo.write(`${catalogo}\n`);

// 3) Aplicações em partes (por faixa de id)
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
(async () => {
  const [{ mi, ma }] = await prisma.$queryRawUnsafe(
    "SELECT MIN(id) mi, MAX(id) ma FROM pecas_aplicacao",
  );
  await prisma.$disconnect();
  // Catálogo gráfico não tem aplicações por veículo (tabela vazia): não gera os arquivos 03
  for (let ini = Number(mi), n = 1; mi != null && ini <= Number(ma); ini += LINHAS_POR_PARTE, n++) {
    const fim = ini + LINHAS_POR_PARTE - 1;
    const sql = compativel(dump(db, [`--where=id BETWEEN ${ini} AND ${fim}`, db.banco, "pecas_aplicacao"]));
    const arq = gravarGz(
      `03_aplicacoes_${n}.sql.gz`,
      `-- PRINTE UY: aplicações por veículo (ids ${ini}–${fim})\n${CAB}\n${sql}\n${ROD}`,
    );
    completo.write(`${sql}\n`);
    console.log(`  ${arq} (${mb(arq)})`);
  }

  // 4) Tudo junto
  completo.end(ROD);
  await fimCompleto;
  console.log(`  ${arqTudo} (${mb(arqTudo)})`);
  console.log("Pronto. Importe na ordem 01 → 02 → 03_1, 03_2… (ou só o _completo pelo terminal).");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
