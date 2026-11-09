import { createServerFn } from "@tanstack/react-start";

// Produto gráfico (catálogo importado da Printi): o que a página do produto usa além da tabela
// `pecas`. Fica em `pecas_detalhes` (JSON), montado por scripts/catalogo/importar_printi.cjs.
// Os preços das combinações já vêm com a margem, em R$; a página converte para $U pela cotação.

export type OpcaoGrafica = { id: string; nome: string; imagem: string | null };
export type AtributoGrafica = {
  id: string;
  nome: string;
  visivel: boolean;
  opcoes: OpcaoGrafica[];
};
export type ParteGrafica = {
  id: string;
  nome: string;
  formatoPersonalizado: {
    width: { min: number; max: number };
    height: { min: number; max: number };
  } | null;
  atributos: AtributoGrafica[];
};
export type PrecoQuantidade = { quantidade: number; preco: number; unitario: number };
export type CombinacaoGrafica = {
  id: string;
  nome: string;
  descricao: string;
  imagem: string | null;
  opcoes: { parte: string; escolhas: Record<string, string> }[];
  precos: PrecoQuantidade[];
};
export type DetalhesGrafica = {
  slug: string;
  descricaoCurta: string;
  descricaoHtml: string;
  caracteristicas: string[];
  destaque: string | null;
  faq: { pergunta: string; resposta: string }[];
  avaliacao: { media: number; total: number } | null;
  partes: ParteGrafica[];
  combinacoes: CombinacaoGrafica[];
  totalVariacoes: number;
  quantidadeMinima: number | null;
  quantidadePersonalizada: { min: number; max: number; multiple: number } | null;
  formatosArquivo: { id: string; name: string; price: number }[] | null;
  vendaCruzada: string[];
  videos: string[];
  youtube: string[];
  seo: { titulo: string | null; descricao: string | null };
};

export const getDetalhesGraficaFn = createServerFn({ method: "GET" })
  .validator((sku: string) => String(sku).slice(0, 191))
  .handler(async ({ data }): Promise<DetalhesGrafica | null> => {
    const { prisma } = await import("./prisma");
    const r = await prisma.pecas_detalhes.findUnique({ where: { sku: data } });
    return (r?.dados as unknown as DetalhesGrafica) ?? null;
  });

// Nome do atributo sem a instrução que a Printi coloca depois dos dois-pontos
// ("Formato: A Altura deve ser igual a Largura." -> "Formato")
export const nomeAtributo = (nome: string) => nome.split(":")[0].trim();

// Atributos que o cliente escolhe (os internos, como "Auxiliaries", ficam de fora)
export const atributosVisiveis = (pt: ParteGrafica) =>
  pt.atributos.filter((a) => a.visivel && a.opcoes.length > 0);

// ID do vídeo do YouTube a partir do link salvo
export const idYoutube = (url: string) => url.split(/[=/]/).pop() ?? "";
