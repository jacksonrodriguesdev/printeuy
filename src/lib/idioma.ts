// PRINTE UY: o site público é só em espanhol do Uruguai (es-UY) e indexado só no Uruguai.
// A versão em português ("/pt/...") foi desligada: o servidor redireciona (301) para a página em
// espanhol (src/server.ts). O tipo Idioma e o t(es, pt) continuam para o admin e o código antigo,
// mas no site o idioma é sempre "es".
// Textos: const { t } = useT(); t("Texto en español", "Texto em português").
import { useLocation } from "@tanstack/react-router";
import { SITE_URL } from "./site";
import { paraEs } from "./caminhos-pt";

export type Idioma = "es" | "pt";
export const HREFLANG: Record<Idioma, string> = { es: "es-UY", pt: "pt-BR" };
export const OG_LOCALE: Record<Idioma, string> = { es: "es_UY", pt: "pt_BR" };

// Caminhos que nunca são traduzidos (admin, APIs, arquivos, mapas do site, feeds)
const SEM_IDIOMA =
  /^\/(admin|api|_serverFn|uploads|sitemap|sitemaps|feeds|catalogo|img|pdfjs|assets|[0-9a-f]{32}\.txt)(\/|$|\.)/;
export const caminhoSemIdioma = (caminho: string) => SEM_IDIOMA.test(caminho);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function idiomaDoCaminho(_caminho: string): Idioma {
  return "es";
}

// Endereço antigo em português ("/pt/...") -> mesmo conteúdo em espanhol
export function caminhoPtAntigo(caminho: string): string | null {
  if (caminho !== "/pt" && !caminho.startsWith("/pt/")) return null;
  return paraEs(caminho.slice(3) || "/");
}

// "/pt/loja" -> "/loja"; "/pt/pecas/vedacoes" -> "/repuestos/sellos-y-juntas" (src/lib/caminhos-pt.ts)
export function tirarPrefixo(caminho: string): string {
  return caminho;
}

// "/loja" + pt -> "/pt/loja"; "/repuestos/sellos-y-juntas" + pt -> "/pt/pecas/vedacoes"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function comPrefixo(caminho: string, _idioma: Idioma): string {
  return caminho;
}

const caminhoDe = (href: string) => {
  try {
    return new URL(href, "http://x").pathname;
  } catch {
    return "/";
  }
};

export function useIdioma(): Idioma {
  return useLocation({ select: (l) => idiomaDoCaminho(caminhoDe(l.publicHref)) });
}

export const tr = (idioma: Idioma, es: string, pt: string) => (idioma === "pt" ? pt : es);

export function useT() {
  const idioma = useIdioma();
  return {
    idioma,
    t: (es: string, pt: string) => (idioma === "pt" ? pt : es),
    // Para <a href> escritos à mão (os <Link> já recebem o prefixo sozinhos)
    href: (caminho: string) => comPrefixo(caminho, idioma),
  };
}

// Canônico + versão única es-UY (o site é só para o Uruguai)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function linksIdioma(caminho: string, _idioma?: Idioma) {
  const url = `${SITE_URL}${caminho}`;
  return [
    { rel: "canonical", href: url },
    { rel: "alternate", hrefLang: HREFLANG.es, href: url },
    { rel: "alternate", hrefLang: "x-default", href: url },
  ];
}
