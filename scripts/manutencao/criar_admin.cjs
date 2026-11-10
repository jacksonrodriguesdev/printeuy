// Cria (ou promove) um usuário ADMIN do site. Se o e-mail já existe, vira ADMIN e a senha é trocada.
// A senha não fica salva no código: vem pela linha de comando e só o hash (bcrypt) vai para o banco.
//
// Direto no banco do .env (PC, ou na Hostinger pelo terminal SSH):
//   node --env-file=.env scripts/manutencao/criar_admin.cjs --email=admin@x.com --senha='Senha@123' [--nome="PRINTE UY"]
//
// Sem acesso ao banco pelo terminal: gera um SQL para colar no phpMyAdmin (aba SQL)
//   node scripts/manutencao/criar_admin.cjs --email=admin@x.com --senha='Senha@123' --sql
//   → grava dados/deploy/criar_admin.sql (pasta fora do git) e mostra o conteúdo na tela.

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const arg = (n) => {
  const a = process.argv.find((x) => x.startsWith(`--${n}=`));
  return a ? a.slice(n.length + 3) : undefined;
};
const email = (arg("email") || "").trim().toLowerCase();
const senha = arg("senha") || "";
const nome = arg("nome") || "PRINTE UY";
const soSql = process.argv.includes("--sql");

if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error("Informe um e-mail válido: --email=admin@exemplo.com");
  process.exit(1);
}
if (senha.length < 8) {
  console.error("Informe uma senha com pelo menos 8 caracteres: --senha='...'");
  process.exit(1);
}

// Mesmo custo do cadastro do site (src/routes/api/auth.register.ts)
const hash = bcrypt.hashSync(senha, 10);

(async () => {
  if (soSql) {
    const q = (s) => `'${s.replace(/\\/g, "\\\\").replace(/'/g, "''")}'`;
    const sql = [
      "-- PRINTE UY: cria ou promove o administrador (colar no phpMyAdmin, aba SQL)",
      "INSERT INTO `users` (nome_completo, email, senha_hash, role, created_at, updated_at)",
      `VALUES (${q(nome)}, ${q(email)}, ${q(hash)}, 'ADMIN', NOW(3), NOW(3))`,
      "ON DUPLICATE KEY UPDATE senha_hash = VALUES(senha_hash), role = 'ADMIN', updated_at = NOW(3);",
      "",
    ].join("\n");
    const arq = path.join("dados", "deploy", "criar_admin.sql");
    fs.mkdirSync(path.dirname(arq), { recursive: true });
    fs.writeFileSync(arq, sql);
    console.log(sql);
    console.log(`Salvo em ${arq}`);
    return;
  }

  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();
  const existia = await prisma.users.findUnique({ where: { email }, select: { id: true } });
  const u = await prisma.users.upsert({
    where: { email },
    update: { senha_hash: hash, role: "ADMIN" },
    create: { email, nome_completo: nome, senha_hash: hash, role: "ADMIN" },
    select: { id: true, email: true, role: true },
  });
  await prisma.$disconnect();
  console.log(`${existia ? "Atualizado" : "Criado"}: ${u.email} (id ${u.id}, ${u.role})`);
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
