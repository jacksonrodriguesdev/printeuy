// Cria o usuário administrador (ou promove um usuário que já existe) no banco do DATABASE_URL.
// A senha nunca fica no código nem no histórico do terminal: vem de variável de ambiente.
//
// Uso (PowerShell):
//   $env:ADMIN_EMAIL="voce@exemplo.com"; $env:ADMIN_SENHA="uma-senha-forte"; node --env-file=.env scripts/deploy/criar_admin.cjs
// Uso (bash):
//   ADMIN_EMAIL=voce@exemplo.com ADMIN_SENHA='uma-senha-forte' node --env-file=.env scripts/deploy/criar_admin.cjs
//
// Para criar no banco da hospedagem, rode com o DATABASE_URL de lá (ex.: --env-file=.env.producao).
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const senha = process.env.ADMIN_SENHA || "";
const nome = (process.env.ADMIN_NOME || "Administrador").trim();

if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error("Defina ADMIN_EMAIL com um e-mail válido.");
  process.exit(1);
}
if (senha.length < 10) {
  console.error("Defina ADMIN_SENHA com pelo menos 10 caracteres.");
  process.exit(1);
}

const db = new PrismaClient();
(async () => {
  const senha_hash = await bcrypt.hash(senha, 10);
  const antes = await db.users.findUnique({ where: { email } });
  await db.users.upsert({
    where: { email },
    update: { role: "ADMIN", senha_hash },
    create: { email, nome_completo: nome, senha_hash, role: "ADMIN", pais: "Uruguai" },
  });
  console.log(
    antes ? `Usuário ${email} agora é ADMIN (senha atualizada).` : `Admin ${email} criado.`,
  );
  await db.$disconnect();
})().catch(async (e) => {
  console.error(e.message);
  await db.$disconnect();
  process.exit(1);
});
