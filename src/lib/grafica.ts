import { createServerFn } from "@tanstack/react-start";

// Produto gráfico (catálogo importado da Printi): o que a página do produto usa além da tabela
// `pecas`. Fica em `pecas_detalhes` (JSON), montado por scripts/catalogo/importar_printi.cjs.
// Preços: os kits prontos (combinacoes) e cada variação (tabela pecas_variacoes) guardam o CUSTO da
// Printi; a venda (vendaGrafica, src/lib/precos.ts) é calculada aqui, no servidor, em R$, e a página
// converte para $U pela cotação.

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
  // Tem o custo de todas as variações em pecas_variacoes: a página pede o preço de cada escolha
  temVariacoes?: boolean;
  precosSaoCusto?: boolean;
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
    const [r, p, nVar] = await Promise.all([
      prisma.pecas_detalhes.findUnique({ where: { sku: data } }),
      prisma.pecas.findUnique({
        where: { sku: data },
        select: { nome: true, nome_es: true, categoria: true },
      }),
      prisma.pecas_variacoes.count({ where: { sku: data } }).catch(() => 0),
    ]);
    if (!r?.dados) return null;
    // Textos do catálogo (em português, da Printi) gerados em espanhol para o Uruguai
    const { detalhesEmEspanhol } = await import("./textos-es");
    const d = detalhesEmEspanhol(r.dados as unknown as DetalhesGrafica, {
      nome: p?.nome_es || p?.nome || "",
      categoria: p?.categoria ?? null,
    });
    const { vendaGrafica } = await import("./precos");
    const comVenda = d.precosSaoCusto
      ? d.combinacoes.map((c) => ({
          ...c,
          precos: c.precos.map((x) => paraVenda(x.quantidade, x.preco, vendaGrafica)),
        }))
      : d.combinacoes;
    return { ...d, combinacoes: comVenda, temVariacoes: nVar > 0, precosSaoCusto: false };
  });

const paraVenda = (quantidade: number, custo: number, venda: (c: number) => number) => {
  const preco = venda(custo);
  return { quantidade, preco, unitario: Math.round((preco / quantidade) * 10000) / 10000 };
};

// Variações de um produto (custos), guardadas por alguns minutos: o Adesivo Redondo tem 14 mil
type Variacao = { opcoes: Record<string, string>; custos: [number, number][] };
const memoVariacoes = new Map<string, { em: number; itens: Variacao[] }>();
async function variacoesDe(sku: string): Promise<Variacao[]> {
  const m = memoVariacoes.get(sku);
  if (m && Date.now() - m.em < 10 * 60_000) return m.itens;
  const { prisma } = await import("./prisma");
  const rows = await prisma.pecas_variacoes.findMany({
    where: { sku },
    select: { opcoes: true, custos: true },
  });
  const itens = rows.map((r) => ({
    opcoes: r.opcoes as Record<string, string>,
    custos: r.custos as [number, number][],
  }));
  if (memoVariacoes.size > 60) memoVariacoes.delete(memoVariacoes.keys().next().value!);
  memoVariacoes.set(sku, { em: Date.now(), itens });
  return itens;
}

// Preço (venda, R$) por quantidade da variação escolhida pelo cliente.
// escolhas: opções que o cliente escolheu ("<parte>|<atributo>" -> ids aceitos; a Printi repete o
// mesmo nome com ids diferentes, ex.: 4x0 em cada lado), todas obrigatórias.
// preferidas: atributos que o cliente não vê (o site usa o do kit pronto); servem para desempatar.
// Sem variação com essas escolhas (combinação que a Printi não vende): null -> "a cotizar".
export const precoVariacaoFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      sku: string;
      escolhas: Record<string, string[]>;
      preferidas?: Record<string, string>;
    }) => ({
      sku: String(d.sku).slice(0, 191),
      escolhas: Object.fromEntries(
        Object.entries(d.escolhas || {})
          .slice(0, 40)
          .map(([k, v]) => [
            String(k).slice(0, 200),
            (Array.isArray(v) ? v : [v]).slice(0, 20).map((x) => String(x).slice(0, 200)),
          ]),
      ),
      preferidas: Object.fromEntries(
        Object.entries(d.preferidas || {})
          .slice(0, 40)
          .map(([k, v]) => [String(k).slice(0, 200), String(v).slice(0, 200)]),
      ),
    }),
  )
  .handler(async ({ data }): Promise<PrecoQuantidade[] | null> => {
    const itens = await variacoesDe(data.sku);
    let melhor: Variacao | null = null;
    let pontos = -1;
    for (const v of itens) {
      if (!Object.entries(data.escolhas).every(([k, ids]) => ids.includes(v.opcoes[k]))) continue;
      const p = Object.entries(data.preferidas).filter(([k, id]) => v.opcoes[k] === id).length;
      if (p > pontos) {
        melhor = v;
        pontos = p;
      }
    }
    if (!melhor) return null;
    const { vendaGrafica } = await import("./precos");
    return melhor.custos.map(([q, c]) => paraVenda(q, c, vendaGrafica));
  });

// Nome do atributo sem a instrução que a Printi coloca depois dos dois-pontos
// ("Formato: A Altura deve ser igual a Largura." -> "Formato")
export const nomeAtributo = (nome: string) => nome.split(":")[0].trim();

// Atributos que o cliente escolhe (os internos, como "Auxiliaries", ficam de fora)
export const atributosVisiveis = (pt: ParteGrafica) =>
  pt.atributos.filter((a) => a.visivel && a.opcoes.length > 0);

// ID do vídeo do YouTube a partir do link salvo
export const idYoutube = (url: string) => url.split(/[=/]/).pop() ?? "";
