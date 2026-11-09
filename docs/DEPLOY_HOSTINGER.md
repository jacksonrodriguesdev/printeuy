# Publicar o AUTO PIEZAS UY (GitHub + banco + hospedagem)

O site é um app **Node.js 22** (não é PHP) com banco **MySQL/MariaDB**. Funciona em qualquer
hospedagem com Node e MySQL. O passo a passo abaixo usa a **Hostinger** (plano com Node.js).

```
 PC (você)            GitHub                        Hostinger
 ─────────            ──────                        ─────────
 git push  ───────▶  main ─▶ Actions (testes) ─▶ producao ─▶  app Node.js (npm run build)
                                                                 │
 dados/deploy/*.sql.gz ──── phpMyAdmin (uma vez) ───────────▶  banco MySQL  ◀── DATABASE_URL
```

## 0. O que você precisa ter

| Item            | Onde está                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------- |
| Código          | GitHub `jacksonrodriguesdev/autopiezasuy` (ramo `main`)                                     |
| Banco           | `dados/deploy/` no PC (gerado por `node --env-file=.env scripts/deploy/exportar_banco.cjs`) |
| Fotos das peças | já estão no Cloudflare R2 (o banco guarda o link completo; nada para subir)                 |
| Domínio         | `autopiezasuy.com` apontando para a Hostinger                                               |

Arquivos do banco (fora do git, porque têm 100 mil peças):

| Arquivo                        | Conteúdo                                                    | Tamanho    |
| ------------------------------ | ----------------------------------------------------------- | ---------- |
| `01_estrutura.sql`             | as 60 tabelas vazias + registro da migração do Prisma       | 60 KB      |
| `02_catalogo.sql.gz`           | peças, fotos, similares, ficha técnica, categorias, cotação | ~21 MB     |
| `03_aplicacoes_1…6.sql.gz`     | 2 milhões de aplicações por veículo, em partes              | ~5 MB cada |
| `autopiezasuy_completo.sql.gz` | tudo junto (para importar pelo terminal)                    | ~46 MB     |

Pedidos, clientes e estatísticas começam vazios no banco novo.

## 1. Banco de dados

1. hPanel → **Bancos de dados → Gerenciamento** → crie o banco e o usuário
   (ex.: banco `u123_autopiezas`, usuário `u123_autopiezas`). Anote **nome, usuário e senha**.
   O host, para o app da própria Hostinger, é `localhost`.
2. Abra o **phpMyAdmin** desse banco → aba **Importar** e envie, **nesta ordem**, um de cada vez:
   1. `01_estrutura.sql`
   2. `02_catalogo.sql.gz`
   3. `03_aplicacoes_1.sql.gz`, `03_aplicacoes_2.sql.gz` … até o último
3. Confira (aba **SQL**):

   ```sql
   SELECT COUNT(*) FROM pecas;            -- 102520
   SELECT COUNT(*) FROM pecas_aplicacao;  -- 2054277
   SELECT migration_name FROM _prisma_migrations;  -- 0_init
   ```

**Alternativa pelo terminal** (SSH da Hostinger ou MySQL remoto liberado no hPanel):

```bash
gunzip -c autopiezasuy_completo.sql.gz | mysql -h HOST -u USUARIO -p NOME_DO_BANCO
```

> A estrutura veio da migração `prisma/migrations/0_init`. Por isso o Prisma já considera o
> banco em dia (`npx prisma migrate status` → _Database schema is up to date_).

## 2. Conectar o GitHub à Hostinger

hPanel → **Websites → Adicionar site → Node.js App** → **Importar do Git/GitHub**:

1. Autorize a Hostinger na sua conta do GitHub e escolha o repositório **`autopiezasuy`**.
2. Ramo: **`producao`** (veja o porquê abaixo). Antes do primeiro envio passar nos testes, esse
   ramo ainda não existe: use `main` no primeiro deploy e troque para `producao` depois.
3. Configuração:

| Campo          | Valor                                                       |
| -------------- | ----------------------------------------------------------- |
| Versão do Node | 22.x                                                        |
| Instalação     | `npm install` (gera o Prisma sozinho no `postinstall`)      |
| Build          | `npm run build`                                             |
| Início         | `npm start` (arquivo de entrada `.output/server/index.mjs`) |

> **Por que `producao`:** a cada envio para o `main`, o GitHub Actions
> (`.github/workflows/verificar.yml`) compila o site, cria um banco de teste, roda ~35 testes e
> abre as páginas principais. Só se tudo passar ele copia o código para o ramo `producao`.
> Um erro nunca chega ao site no ar e o GitHub avisa por e-mail. Acompanhe na aba **Actions**.

### Variáveis de ambiente (hPanel → app Node.js → Variáveis)

| Variável                                      | Valor                                                                 |
| --------------------------------------------- | --------------------------------------------------------------------- |
| `DATABASE_URL`                                | `mysql://USUARIO:SENHA@localhost:3306/NOME_DO_BANCO`                  |
| `JWT_SECRET`                                  | texto aleatório de 64+ caracteres (gere com o comando abaixo)         |
| `VITE_SITE_URL`                               | `https://autopiezasuy.com` (entra no build: sitemap, links, WhatsApp) |
| `UPLOADS_DIR`                                 | pasta **fora** do app, ex.: `/home/SEU_USUARIO/autopiezas-uploads`    |
| `NODE_ENV`                                    | `production`                                                          |
| `VITE_GA4_ID`                                 | opcional: Google Analytics 4 (`G-XXXXXXX`)                            |
| `VITE_META_PIXEL_ID`                          | opcional: Meta Pixel                                                  |
| `GOOGLE_PLACES_API_KEY` / `GOOGLE_PLACE_ID`   | opcionais: avaliações do Google na home                               |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | opcionais: pagamentos online                                          |

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Senha do banco com `@ # / :`? Codifique no `DATABASE_URL` (`@` vira `%40`, `#` vira `%23`).

## 3. Criar o usuário administrador

O banco novo não tem nenhum usuário. Duas formas:

- **Pelo site:** crie uma conta em `/cadastro` e, no phpMyAdmin, rode
  `UPDATE users SET role = 'ADMIN' WHERE email = 'seu@email.com';`
- **Pelo terminal** (com o `DATABASE_URL` da hospedagem num arquivo `.env.producao`):

  ```bash
  ADMIN_EMAIL=seu@email.com ADMIN_SENHA='senha-forte-aqui' node --env-file=.env.producao scripts/deploy/criar_admin.cjs
  ```

## 4. Conferir depois de publicar

- `/` abre a home com o buscador por vehículo; `/vehiculos/volkswagen/gol` lista peças do Gol.
- `/loja` lista peças com foto e preço em **$U**; a busca por código encontra a peça.
- `/admin` pede login e abre com a conta ADMIN.
- `/sitemap.xml` e `/robots.txt` respondem com o domínio certo.
- **Google Search Console** (https://search.google.com/search-console): adicione
  `https://autopiezasuy.com`, verifique (Admin → Google tem o campo da verificação) e envie
  `https://autopiezasuy.com/sitemap.xml`. Em **Configurações → País de destino**, mantenha Uruguai.
- **Google Merchant Center**: feed `https://autopiezasuy.com/feeds/google-merchant.xml` (pesos).

## Atualizações do dia a dia

```bash
git add -A
git commit -m "o que mudou"
git push
```

O GitHub testa e libera para o ramo `producao`; a Hostinger publica (ative o **deploy
automático** no hPanel, ou clique em _Deploy_).

### Mudou o banco (`prisma/schema.prisma`)?

1. No PC: `npx prisma migrate dev --name descricao-da-mudanca` (cria a pasta em
   `prisma/migrations/` e aplica no banco local).
2. Envie para o GitHub.
3. No banco da hospedagem: `npm run db:migrate` (ou rode o `migration.sql` novo no phpMyAdmin).

### Atualizou o catálogo no PC?

Rode `node --env-file=.env scripts/deploy/exportar_banco.cjs` e importe de novo só
`02_catalogo.sql.gz` e os `03_aplicacoes_*.sql.gz` (antes, esvazie as tabelas `pecas*` e
`categories` no phpMyAdmin).
