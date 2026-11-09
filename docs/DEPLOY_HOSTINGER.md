# Publicar o PRINTE UY na Hostinger (GitHub + banco + fotos)

O site é um app **Node.js 22** (não é PHP) com banco **MySQL/MariaDB**, igual ao AUTO PIEZAS UY.
Precisa de um plano da Hostinger com **Node.js** (o mesmo onde está o autopiezasuy.com serve).

```
 PC (você)                               Hostinger
 ─────────                               ─────────
 git push ──▶ GitHub (main) ──────────▶  app Node.js (npm install → npm run build → npm start)
                                              │ UPLOADS_DIR
 dados/deploy/midia_*.zip ── Gerenciador ──▶  /home/SEU_USUARIO/printeuy-midia   (fotos e vídeos)
 dados/deploy/*.sql(.gz) ─── phpMyAdmin ──▶  banco MySQL  ◀── DATABASE_URL
```

## 0. Arquivos prontos no PC (`site/dados/deploy/`, fora do git)

| Arquivo                    | O que é                                                      | Tamanho |
| -------------------------- | ------------------------------------------------------------ | ------- |
| `01_estrutura.sql`         | as 61 tabelas vazias + registro da migração `0_init`         | 43 KB   |
| `02_catalogo.sql.gz`       | 632 produtos, configurador, fotos, ficha, 19 categorias      | 3,4 MB  |
| `printeuy_completo.sql.gz` | os dois juntos (para importar pelo terminal)                 | 3,4 MB  |
| `midia_imagens.zip`        | 6.047 fotos usadas pelo site (já reduzidas para até 1600 px) | 193 MB  |
| `midia_videos.zip`         | 38 vídeos dos produtos                                       | 805 MB  |

Gerar de novo (depois de mudar preços ou o catálogo):

```bash
cd site
node --env-file=.env scripts/deploy/exportar_banco.cjs        # SQL
node --env-file=.env scripts/deploy/listar_midia_usada.cjs    # lista das fotos usadas
cd .. && node scripts/otimizar_midia.cjs                      # cópia leve em deploy_midia/
```

Os zips são feitos a partir de `deploy_midia/` (ver o fim deste arquivo).

## 1. Banco de dados

1. hPanel → **Bancos de dados → Gerenciamento** → crie banco e usuário
   (ex.: `u123_printeuy`). Anote **nome, usuário e senha**. O host, para o app da Hostinger, é `localhost`.
2. **phpMyAdmin** desse banco → **Importar**, nesta ordem:
   1. `01_estrutura.sql`
   2. `02_catalogo.sql.gz`
3. Conferir (aba **SQL**):

   ```sql
   SELECT COUNT(*) FROM pecas;            -- 632
   SELECT COUNT(*) FROM pecas_detalhes;   -- 632
   SELECT migration_name FROM _prisma_migrations;  -- 0_init
   ```

## 2. Fotos e vídeos

1. hPanel → **Arquivos → Gerenciador de arquivos**. Na pasta do usuário (`/home/SEU_USUARIO`,
   **fora** de `public_html` e fora da pasta do app), crie a pasta `printeuy-midia`.
2. Envie `midia_imagens.zip` para dentro dela e use **Extrair** (fica `printeuy-midia/produtos/...`
   e `printeuy-midia/opcoes/...`). Apague o zip depois.
3. Faça o mesmo com `midia_videos.zip` (pode ser depois: sem ele o site funciona, só faltam os vídeos).
   Se o upload de 805 MB falhar pelo navegador, envie por **SFTP** (FileZilla, dados de acesso em
   hPanel → **Avançado → SSH**).

## 3. Código: GitHub → Hostinger

1. No GitHub, crie o repositório **`printeuy`** (privado, vazio, sem README).
2. No PC:

   ```bash
   cd site
   git remote add origin https://github.com/jacksonrodriguesdev/printeuy.git
   git push -u origin main
   ```

3. hPanel → **Websites → Adicionar site → Node.js App → Importar do GitHub** → repositório
   `printeuy`, ramo **`main`**.

| Campo          | Valor                                                       |
| -------------- | ----------------------------------------------------------- |
| Versão do Node | 22.x                                                        |
| Instalação     | `npm install` (gera o Prisma no `postinstall`)              |
| Build          | `npm run build`                                             |
| Início         | `npm start` (arquivo de entrada `.output/server/index.mjs`) |

### Variáveis de ambiente (hPanel → app Node.js → Variáveis)

| Variável        | Valor                                                     |
| --------------- | --------------------------------------------------------- |
| `DATABASE_URL`  | `mysql://USUARIO:SENHA@localhost:3306/NOME_DO_BANCO`      |
| `JWT_SECRET`    | texto aleatório de 64+ caracteres (comando abaixo)        |
| `VITE_SITE_URL` | `https://printecuy.com` (o domínio final; entra no build) |
| `UPLOADS_DIR`   | `/home/SEU_USUARIO/printeuy-midia` (a pasta do passo 2)   |
| `NODE_ENV`      | `production`                                              |

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Senha do banco com `@ # / :`? Codifique no `DATABASE_URL` (`@` → `%40`, `#` → `%23`).
Mudou o `VITE_SITE_URL`? Faça o deploy de novo (ele entra no build).

## 4. Administrador

Crie uma conta em `/cadastro` e, no phpMyAdmin:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'seu@email.com';
```

## 5. Conferir

- `/` abre a home; `/loja` lista os produtos com preço em **$U**; `/produto/fbcard` mostra o configurador.
- As fotos aparecem (se não: confira `UPLOADS_DIR` e se a pasta tem `produtos/` direto dentro).
- `/admin` abre com a conta ADMIN → **Precificação**: confira a cotação R$ → $U.
- `/sitemap.xml` e `/robots.txt` respondem com o domínio certo.

## Atualizações

```bash
git add -A
git commit -m "o que mudou"
git push
```

A Hostinger publica (ative o **deploy automático** no hPanel, ou clique em _Deploy_).

- **Mudou o `prisma/schema.prisma`?** `npx prisma migrate dev --name descricao` no PC, envie, e no
  banco da hospedagem rode o `migration.sql` novo no phpMyAdmin.
- **Mudou preços/catálogo no PC?** Exporte de novo e, no phpMyAdmin, esvazie `pecas_detalhes`,
  `pecas_ficha_tecnica`, `pecas_img`, `pecas` e `categories` antes de importar o `02_catalogo.sql.gz`.

## Montar os zips de mídia (Windows)

```powershell
cd C:\Users\USER\Desktop\printeuy\deploy_midia
tar.exe -a -c -f ..\site\dados\deploy\midia_imagens.zip --exclude "*.mp4" produtos opcoes
Get-ChildItem -Recurse -File -Filter *.mp4 | % { $_.FullName.Substring((pwd).Path.Length+1) } | Set-Content -Encoding ascii ..\site\dados\deploy\videos.txt
tar.exe -a -c -f ..\site\dados\deploy\midia_videos.zip -T ..\site\dados\deploy\videos.txt
```
