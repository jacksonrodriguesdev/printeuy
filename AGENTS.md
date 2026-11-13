# PRINTE UY (printecuy.com)

Imprenta online para o Uruguai: TanStack Start (React 19, SSR) + Prisma + MySQL.
Nasceu como cópia do AUTO PIEZAS UY (`C:\Users\USER\Desktop\AUTOPIEZASUY`); o admin é o mesmo.
Ainda há telas/rotas de autopeças (busca por veículo, /repuestos, /vehiculos, guias) que não aparecem no menu.

## Rodando

```bash
npm install
npx prisma db push   # banco printeuy (MySQL local)
npm run dev          # http://localhost:8080 (ou a próxima porta livre)
```

Variáveis em `.env` (modelo em `.env.example`). Banco: `printeuy`. Fotos/vídeos: `UPLOADS_DIR=../midia`.

## Catálogo (Printi)

- Extração da printi.com.br na pasta de cima (`../scripts`, `../dados`, `../midia`; ver `../README.md`).
- Importação: `node --env-file=.env scripts/catalogo/importar_printi.cjs --aplicar` (APAGA e recria
  produtos e categorias; `--margem=30` soma 30% aos preços da Printi).
- Produto em `pecas` (SKU Printi, nome em português, `nome_es` em espanhol pelo glossário
  `scripts/catalogo/glossario_grafica.cjs`), fotos em `pecas_img`, configurador em `pecas_detalhes` (JSON:
  combinações com preço por quantidade, opções, descrição HTML, FAQ, vídeos).
- Categorias da loja: `CATEGORIAS` em `src/lib/navegacao.ts` (o importador usa os mesmos nomes).
- Preço: `preco_brl` = preço Printi (+ margem). Hoje o site é só de cotação: `PRECOS_NO_SITE = false`
  em `src/lib/precos.ts` esconde todos os preços (vale por cima da chave do admin).

## Catálogo (360imprimir)

- 330 produtos extras (brindes, papelaria, banners…) com SKU `360-<slug>`, sem preço nem opções (só
  cotação). Extração: `node ../scripts/extrair_360.cjs` (páginas públicas; a API de preços deles bloqueia
  robôs). Fotos no bucket R2 `360` (`pub-507a…/360imprimir/...`, URL completa em `imagem_principal`).
- Nome em espanhol e categoria: `scripts/catalogo/mapa_360.tsv`. Importação (não mexe na Printi):
  `node --env-file=.env scripts/catalogo/importar_360.cjs --aplicar`; para produção, `--sql` gera
  `dados/deploy/importar_360.sql` (rodar no phpMyAdmin).

## Site

Layout na estrutura da printi.com.br (mais fluido):

- Header: `src/components/SiteHeader.tsx` (faixa preta, busca grande, faixa de categorias, mega-menu
  "Todos los productos" com os produtos de cada categoria).
- Home: `src/components/home/HomeGrafica.tsx` (banner rotativo, vantagens, categorias em círculos,
  "Más vendidos", sliders por categoria) + blocos do Construtor da Home (admin).
- Cartão de produto (loja, sliders): `src/components/grafica/CardGrafica.tsx` (foto 3:4, "Desde").
- Produto: `src/routes/produto.$sku.tsx` → `src/components/grafica/PaginaGrafica.tsx` (combinações
  prontas, configurador por atributo, quantidades com desconto, resumo fixo, abas).
- Loja/categoria: `src/routes/loja.tsx` (banner da categoria, chips, ordem "popular" = `pecas.popularidade`).
- Marca: `public/logo.svg`; ícones: `CHROMIUM_PATH=<chrome.exe> node scripts/marca/gerar_icones.cjs`.

## SEO (Google)

- Categorias: `/categoria/<slug>` (`src/routes/categoria.$slug.tsx`, textos e FAQ em `src/lib/seo-imprenta.ts`).
  `/loja?categoria=X` tem canonical para a página da categoria; menus e rodapé usam `urlCategoria()`.
- Cidades: `/imprenta` e `/imprenta/<lugar>` (19 departamentos, cidades e bairros de Montevidéu em
  `src/lib/ciudades-uy.ts`): texto próprio, sliders de produtos no HTML do servidor, FAQ e JSON-LD.
- Textos dos produtos: a Printi deixou descrição/FAQ/características em português; são gerados em
  espanhol na hora (`src/lib/textos-es.ts`, chamado em `getDetalhesGraficaFn`).
- Sitemap: `src/lib/sitemap.server.ts` (páginas + produtos com imagem). Endereços do site de autopeças
  (/repuestos, /vehiculos, /guias, /repuestos-autos, /catalogos, /pedido-rapido) redirecionam (301)
  em `redirecionarAutopecas` (`src/server.ts`).
- App instalável (PWA) desligado: `APP_ATIVO` em `src/lib/app-pwa.ts` (o `public/sw.js` atual só se
  remove dos aparelhos; o completo está em `public/sw-app-desligado.js.txt`).

## Pontos importantes

- Uploads (banners, fotos) ficam em `uploads/` (fora do git) e são servidos por `src/routes/uploads.$.ts`.
- Mudança no `prisma/schema.prisma`: pare o servidor de desenvolvimento antes do `npx prisma db push`.
- Antes de enviar: `npx prettier --write <arquivos>`, `npx tsc --noEmit` e `npm run lint` (zero erros).
