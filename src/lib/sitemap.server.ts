// Mapa do site para o Google, dividido em partes (o Search Console mostra quantas de cada parte
// foram indexadas): /sitemap.xml é o índice; /sitemaps/paginas.xml tem as páginas principais e
// as páginas por marca/categoria; /sitemaps/pecas-N.xml tem as peças, 10 mil por arquivo.
// O site é só para o Uruguai: cada página entra uma vez, em espanhol (es-UY).
import { SITE_URL } from "./site";
import { HREFLANG } from "./idioma";

export const POR_ARQUIVO = 10_000;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// Endereço completo de uma página
const endereco = (caminho: string) => `${SITE_URL}${caminho}`;
const url = (caminho: string, extra = "") =>
  `<url><loc>${esc(endereco(caminho))}</loc>` +
  `<xhtml:link rel="alternate" hreflang="${HREFLANG.es}" href="${esc(endereco(caminho))}"/>${extra}</url>`;
const urlset = (linhas: string[]) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${linhas.join("\n")}\n</urlset>\n`;

let cache: {
  pecas: Array<{ sku: string; data: string; imagem: string | null }>;
  em: number;
} | null = null;
async function pecas() {
  if (cache && Date.now() - cache.em < 60 * 60 * 1000) return cache.pecas;
  const { prisma } = await import("./prisma");
  const rows = await prisma.pecas.findMany({
    where: { duplicado_de: null, category_id: { not: null } },
    select: { sku: true, updated_at: true, imagem_principal: true },
    orderBy: { sku: "asc" },
  });
  cache = {
    pecas: rows.map((r) => ({
      sku: r.sku.trim(),
      data: r.updated_at.toISOString().slice(0, 10),
      imagem: r.imagem_principal,
    })),
    em: Date.now(),
  };
  return cache.pecas;
}

export async function indiceSitemap() {
  const n = Math.max(1, Math.ceil((await pecas()).length / POR_ARQUIVO));
  const hoje = new Date().toISOString().slice(0, 10);
  const arquivos = ["paginas.xml", ...Array.from({ length: n }, (_, i) => `pecas-${i + 1}.xml`)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${arquivos
    .map((a) => `<sitemap><loc>${SITE_URL}/sitemaps/${a}</loc><lastmod>${hoje}</lastmod></sitemap>`)
    .join("\n")}\n</sitemapindex>\n`;
}

export async function sitemapParte(arquivo: string): Promise<string | null> {
  if (arquivo === "paginas.xml") {
    // Imprenta: home, loja, categorias, páginas por localidade e institucionais.
    // (As páginas de autopeças do site de origem redirecionam: ver redirecionarAutopecas em src/server.ts.)
    const { CATEGORIAS_IMPRENTA } = await import("./seo-imprenta");
    const { LUGARES } = await import("./ciudades-uy");
    return urlset([
      url(`/`, "<changefreq>daily</changefreq><priority>1.0</priority>"),
      url(`/loja`, "<changefreq>daily</changefreq><priority>0.9</priority>"),
      ...CATEGORIAS_IMPRENTA.map((c) =>
        url(`/categoria/${c.slug}`, "<changefreq>weekly</changefreq><priority>0.9</priority>"),
      ),
      url(`/imprenta`, "<changefreq>weekly</changefreq><priority>0.8</priority>"),
      ...LUGARES.map((l) =>
        url(
          `/imprenta/${l.slug}`,
          `<changefreq>weekly</changefreq><priority>${l.tipo === "barrio" ? "0.6" : "0.7"}</priority>`,
        ),
      ),
      url(`/cotizar`, "<changefreq>weekly</changefreq><priority>0.6</priority>"),
      url(`/ayuda`, "<priority>0.5</priority>"),
      url(`/cupones`, "<changefreq>daily</changefreq><priority>0.5</priority>"),
      url(`/privacidad`, "<priority>0.2</priority>"),
    ]);
  }
  const m = arquivo.match(/^pecas-(\d+)\.xml$/);
  if (!m) return null;
  const i = Number(m[1]) - 1;
  const lista = (await pecas()).slice(i * POR_ARQUIVO, (i + 1) * POR_ARQUIVO);
  if (!lista.length) return null;
  return urlset(
    lista.map((p) =>
      url(
        `/produto/${encodeURIComponent(p.sku)}`,
        `<lastmod>${p.data}</lastmod>` +
          (p.imagem
            ? `<image:image><image:loc>${esc(p.imagem.startsWith("http") ? p.imagem : endereco(p.imagem))}</image:loc></image:image>`
            : ""),
      ),
    ),
  );
}

// Todas as URLs do mapa (para avisar o Bing pela IndexNow). desde: só peças/catálogos alterados depois
export async function urlsDoSite(desde?: Date): Promise<string[]> {
  if (desde) {
    const { prisma } = await import("./prisma");
    const pecasNovas = await prisma.pecas.findMany({
      where: { duplicado_de: null, category_id: { not: null }, updated_at: { gt: desde } },
      select: { sku: true },
      take: 10_000,
    });
    return [...pecasNovas.map((p) => endereco(`/produto/${encodeURIComponent(p.sku.trim())}`))];
  }
  const paginas = await sitemapParte("paginas.xml");
  const locs = [...(paginas ?? "").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1].replace(/&amp;/g, "&"),
  );
  return [
    ...locs,
    ...(await pecas()).map((p) => endereco(`/produto/${encodeURIComponent(p.sku)}`)),
  ];
}
