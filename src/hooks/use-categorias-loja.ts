import { useQuery } from "@tanstack/react-query";
import { IconeVarios, type IconeAuto } from "@/components/icones/IconesAuto";
import { listCategories } from "@/lib/categories";
import { CATEGORIAS } from "@/lib/navegacao";
import { useIdioma, type Idioma } from "@/lib/idioma";

// As categorias já estão em espanhol no banco (scripts/catalogo/categorias_es.ts)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const categoriaRotulo = (nome: string, _idioma?: Idioma) => nome;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const categoriaCurta = (nome: string, _idioma?: Idioma) =>
  CATEGORIAS.find((c) => c.nome === nome)?.curto ?? nome;

export type CategoriaLoja = {
  // nome no banco (valor do filtro da loja); rotulo e curto são o que aparece no site, no idioma da página
  nome: string;
  rotulo: string;
  curto: string;
  icon: IconeAuto;
  imagem: string | null;
  total: number;
};

const urlImagem = (p: string) => (p.startsWith("http") || p.startsWith("/") ? p : `/uploads/${p}`);

// Categorias exibidas no site (header, barra do celular, home), vindas do banco:
// criar/renomear/excluir no admin aparece no site. Ícone vem da lista conhecida
// (src/lib/navegacao.ts); categorias novas usam um ícone genérico. Nomes em espanhol: src/lib/pecas-es.ts.
// Enquanto carrega, usa a lista conhecida para o menu nunca aparecer vazio.
export function useCategoriasLoja(): CategoriaLoja[] {
  const idioma = useIdioma();
  const { data } = useQuery({
    queryKey: ["categorias_loja"],
    queryFn: () => listCategories({ linha: "AUTOMOTIVA", onlyWithProducts: true }),
    staleTime: 5 * 60 * 1000,
  });

  if (!data)
    return CATEGORIAS.map((c) => ({
      ...c,
      rotulo: categoriaRotulo(c.nome, idioma),
      curto: categoriaCurta(c.nome, idioma),
      imagem: null,
      total: 0,
    }));

  const ordem = (nome: string) => {
    const i = CATEGORIAS.findIndex((c) => c.nome === nome);
    return i === -1 ? CATEGORIAS.length : i;
  };
  return data
    .map((c: any) => {
      const conhecida = CATEGORIAS.find((k) => k.nome === c.nome);
      return {
        nome: c.nome as string,
        rotulo: categoriaRotulo(c.nome, idioma),
        curto: categoriaCurta(c.nome, idioma),
        icon: conhecida?.icon ?? IconeVarios,
        imagem: c.image_path ? urlImagem(c.image_path) : null,
        total: (c.totalProducts as number) ?? 0,
      };
    })
    .sort((a, b) => ordem(a.nome) - ordem(b.nome) || b.total - a.total);
}
