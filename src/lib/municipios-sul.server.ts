// Locais gerados automaticamente: não existem neste site (só os locais do Uruguai de
// src/lib/locais-seo.ts). Mantém as funções que a página por local chama.
import { LOCAIS_SEO, type ExtrasLocal, type LocalSeo } from "./locais-seo";

export const NOME_UF: Record<string, string> = {};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function localGerado(_slug: string): LocalSeo | null {
  return null;
}
export const locaisGerados = (): LocalSeo[] => [];
export const totalMunicipios = () => 0;

// Vizinhos (links para locais próximos) com o nome de cada um
export function extrasDoLocal(l: LocalSeo): ExtrasLocal {
  const vizinhos = l.vizinhos
    .map((slug) => ({ slug, nome: LOCAIS_SEO.find((x) => x.slug === slug)?.nome ?? "" }))
    .filter((v) => v.nome && v.slug !== l.slug);
  return { ibge: null, regiao: null, vizinhos, estado: null };
}
