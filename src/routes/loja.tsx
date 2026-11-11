import { createFileRoute, Link } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect, useRef } from "react";
import { z } from "zod";
import { ChevronRight, Search, Package, X, Loader2, MessageCircle, Bell } from "lucide-react";
import { guardarMeuVeiculo, rotuloVeiculo } from "@/components/BuscaVeiculo";
import { useSegment } from "@/components/SegmentContext";
import { SiteHeader } from "@/components/SiteHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import { listProducts, type ListParams, type Product } from "@/lib/products";
import { whatsappContactUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { BotaoFotoPieza } from "@/components/FotoPieza";
import { linksIdioma, comPrefixo, tr, useT, type Idioma } from "@/lib/idioma";
import { categoriaImprentaPorNome } from "@/lib/seo-imprenta";

// Categoria no idioma da página: em português é o nome do cadastro
// Categorias já estão em espanhol no banco; "Motor > Pistón" aparece como "Pistón"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const categoriaNo = (c: string, _idioma?: Idioma) => c.split(" > ").pop() ?? c;
import { CardLoja } from "@/components/CardPeca";
import { useCategoriasLoja } from "@/hooks/use-categorias-loja";
import { CATEGORIAS } from "@/lib/navegacao";
import { registrarEvento } from "@/lib/eventos";
import { pedirCadastro } from "@/lib/pedir-cadastro";
import { getSessionFn } from "@/lib/user-auth";

// O roteador lê "?q=6205" como número; aceita os dois e converte para texto (código só com
// dígitos derrubava a página)
const texto = z.union([z.string(), z.number()]).transform(String).optional();
const searchSchema = z.object({
  q: texto,
  categoria: texto,
  marca: texto,
  linha: texto,
  // Buscador por vehículo: marca (montadora), modelo y año
  auto: texto,
  modelo: texto,
  ano: z.coerce.number().int().optional().catch(undefined),
  sort: z
    .enum(["popular", "nome-asc", "preco-asc", "preco-desc", "created-desc"])
    .optional()
    .catch(undefined),
});

export const Route = createFileRoute("/loja")({
  validateSearch: searchSchema,
  // Primeira página de produtos já no HTML do servidor: o Google vê as peças da categoria/marca
  // sem depender do JavaScript. O navegador reaproveita esses dados (initialData).
  loaderDeps: ({ search }) => ({
    categoria: search.categoria,
    marca: search.marca,
    q: search.q,
    auto: search.auto,
    sort: search.sort,
  }),
  loader: async ({ deps }) => {
    if (deps.q || deps.auto) return { inicial: null, chave: "" };
    const params = paramsIniciais(deps.categoria, deps.marca, deps.sort);
    try {
      return {
        inicial: await listProducts({ ...params, contar: true }),
        chave: JSON.stringify(params),
      };
    } catch {
      return { inicial: null, chave: "" };
    }
  },
  head: ({ match }) => {
    const idioma: Idioma = match.context?.idioma ?? "es";
    const t = (es: string, pt: string) => tr(idioma, es, pt);
    const { categoria, marca, q, auto, modelo, ano } = (match.search ?? {}) as z.infer<
      typeof searchSchema
    >;
    const veiculo = auto ? rotuloVeiculo({ auto, modelo, ano }) : "";
    // Título conforme o filtro: "Filtros para Massey Ferguson" rende melhor no Google que "Loja"
    const alvo = [
      categoria ? categoriaNo(categoria, idioma) : "Productos de imprenta",
      veiculo && `para ${veiculo}`,
      marca && `${marca}`,
    ]
      .filter(Boolean)
      .join(" ");
    const titulo = q ? `${t("Resultados para", "Resultados para")} "${q}"` : alvo;
    const desc = `${alvo} ${t("personalizados con tu marca. Cotización sin compromiso y envíos a todo Uruguay.", "personalizados com a sua marca, com envio para todo o Uruguai.")}`;
    // Canonical só com os filtros que viram página própria (categoria e marca), na mesma ordem
    const params = new URLSearchParams();
    if (categoria) params.set("categoria", categoria);
    if (marca) params.set("marca", marca);
    const qs = params.toString();
    // Categoria com página própria (/categoria/<slug>): o canonical aponta para ela
    const pagCat = categoria && !marca ? categoriaImprentaPorNome(categoria) : null;
    const caminho = pagCat ? `/categoria/${pagCat.slug}` : `/loja${qs ? `?${qs}` : ""}`;
    return {
      links: linksIdioma(caminho, idioma),
      meta: [
        { property: "og:url", content: `${SITE_URL}${comPrefixo(caminho, idioma)}` },
        { title: `${titulo} | PRINTE UY` },
        { name: "description", content: desc },
        { property: "og:title", content: `${titulo} | PRINTE UY` },
        { property: "og:description", content: desc },
        // Buscas internas não devem ir para o índice do Google
        ...(q || auto ? [{ name: "robots", content: "noindex, follow" }] : []),
      ],
    };
  },
  component: LojaPage,
});

const PAGE_SIZE = 30;

// Mesmos parâmetros (e na mesma ordem) que a loja usa ao abrir sem busca: a chave JSON precisa bater
function paramsIniciais(
  categoria?: string,
  marca?: string,
  sort: ListParams["sort"] = "popular",
): ListParams {
  return {
    search: "",
    linha: "AUTOMOTIVA",
    categoria: categoria ? [categoria] : undefined,
    marca: marca ? [marca] : undefined,
    sort,
    pageSize: PAGE_SIZE,
    vitrine: true,
    hasImage: true,
  };
}

function LojaPage() {
  const { idioma } = useT();
  const { q, categoria, marca, linha, auto, modelo, ano, sort: sortUrl } = Route.useSearch();
  const navigate = Route.useNavigate();
  const veiculo = useMemo(
    () => (auto ? { montadora: auto, modelo: modelo ?? null, ano: ano ?? null } : undefined),
    [auto, modelo, ano],
  );
  const tirarVeiculo = () => {
    guardarMeuVeiculo(null);
    navigate({
      search: (s: Record<string, unknown>) => ({
        ...s,
        auto: undefined,
        modelo: undefined,
        ano: undefined,
      }),
    } as never);
  };
  const { inicial, chave } = Route.useLoaderData();
  const [search, setSearch] = useState(q ?? "");
  const busca = useDebounce(search.trim(), 400);
  const [categorias, setCategorias] = useState<string[]>(categoria ? [categoria] : []);
  const [marcas, setMarcas] = useState<string[]>(marca ? [marca] : []);
  const [sort, setSort] = useState<ListParams["sort"]>(sortUrl ?? "popular");
  // Navegando, a loja abre só com peças com foto (vitrine bonita); a busca procura em tudo
  const [soComFoto, setSoComFoto] = useState(true);
  const { segment, setSegment } = useSegment();
  const loaderRef = useRef<HTMLDivElement>(null);
  const listaCategorias = useCategoriasLoja();

  // Links do header/home trocam os filtros mesmo com a loja já aberta
  useEffect(() => {
    if (linha && (linha === "AUTOMOTIVA" || linha === "AUTOMOTIVA") && linha !== segment) {
      setSegment(linha as any);
    }
    setCategorias(categoria ? [categoria] : []);
    setMarcas(marca ? [marca] : []);
    setSearch(q ?? "");
    if (sortUrl) setSort(sortUrl);
  }, [linha, categoria, marca, q, sortUrl]);

  const queryParams = useMemo(
    () => ({
      search: busca,
      linha: segment,
      categoria: categorias.length > 0 ? categorias : undefined,
      marca: marcas.length > 0 ? marcas : undefined,
      veiculo,
      sort,
      pageSize: PAGE_SIZE,
      // Navegando sem busca, mostra só produtos apresentáveis; a busca procura em tudo.
      vitrine: !busca,
      hasImage: soComFoto && !busca,
    }),
    [busca, segment, categorias, marcas, veiculo, sort, soComFoto],
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["loja", queryParams],
    // Conta o total só na primeira página (mostra "1.234 repuestos" no topo)
    queryFn: ({ pageParam }) =>
      listProducts({ ...queryParams, cursor: pageParam, contar: !pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextCursor : undefined),
    initialData:
      inicial && JSON.stringify(queryParams) === chave
        ? { pages: [inicial], pageParams: [undefined] }
        : undefined,
    staleTime: 60_000,
  });

  const rows = useMemo(
    () => (data ? data.pages.flatMap((page) => page.rows as Product[]) : []),
    [data],
  );
  const total = data?.pages[0]?.total ?? -1;
  const filtroFoto = soComFoto && !busca;

  // Trocou categoria/marca: volta a mostrar primeiro só as com foto
  useEffect(() => setSoComFoto(true), [categorias, marcas, veiculo]);

  // Categoria ou marca sem nenhuma peça com foto: mostra todas em vez de uma lista vazia
  useEffect(() => {
    if (filtroFoto && !isLoading && total === 0) setSoComFoto(false);
  }, [filtroFoto, isLoading, total]);

  // Registra o que o cliente buscou e quantas peças achou (buscas sem resultado mostram
  // peças que faltam no catálogo). Uma vez por termo.
  const buscasRegistradas = useRef(new Set<string>());
  useEffect(() => {
    if (busca.length < 3 || isLoading || total < 0) return;
    const chave = busca.toLowerCase();
    if (buscasRegistradas.current.has(chave)) return;
    buscasRegistradas.current.add(chave);
    registrarEvento("busca", `${total}|${busca}`);
  }, [busca, total, isLoading]);

  // Rolagem infinita
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { threshold: 0.1, rootMargin: "400px" },
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const nomeVeiculo = auto ? rotuloVeiculo({ auto, modelo, ano }) : "";
  const catAtual = categorias.length === 1 ? categorias[0] : null;
  const infoCat = catAtual ? CATEGORIAS.find((c) => c.nome === catAtual) : null;
  const fotoCat = catAtual ? listaCategorias.find((c) => c.nome === catAtual)?.imagem : null;

  const titulo = busca
    ? `Resultados para "${busca}"`
    : catAtual
      ? categoriaNo(catAtual, idioma)
      : sort === "popular" && !categorias.length
        ? "Todos los productos"
        : "Todos los productos";

  const escolherCategoria = (c: string | null) =>
    navigate({
      search: (s: Record<string, unknown>) => ({ ...s, categoria: c ?? undefined }),
    } as never);

  const contagem = isLoading
    ? "Buscando…"
    : `${(total >= 0 ? total : rows.length).toLocaleString("es-UY")} producto${total === 1 ? "" : "s"}`;

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-4 md:px-6">
        {/* Trilha */}
        <nav aria-label="Ruta" className="mb-4 flex items-center gap-2 text-sm text-zinc-500">
          <Link to="/" className="hover:text-zinc-900">
            Inicio
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          {catAtual ? (
            <>
              <Link to="/loja" className="hover:text-zinc-900">
                Productos
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="truncate text-zinc-900">{categoriaNo(catAtual, idioma)}</span>
            </>
          ) : (
            <span className="text-zinc-900">Productos</span>
          )}
        </nav>

        {/* Banner da categoria */}
        <section className="relative overflow-hidden rounded-3xl bg-zinc-50">
          <div className="grid items-center gap-6 px-6 py-8 md:grid-cols-[1fr_auto] md:px-12 md:py-10">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-accent">
                {busca ? "Búsqueda" : catAtual ? "Categoría" : "Catálogo"}
              </p>
              <h1 className="mt-1 text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-tight tracking-tight text-zinc-900">
                {titulo}
              </h1>
              <p className="mt-2 text-zinc-600 md:text-lg">
                {busca
                  ? `${contagem} para tu búsqueda.`
                  : (infoCat?.descricao ??
                    "Tarjetas, adhesivos, packaging, volantes y regalos personalizados con tu marca, con cotización sin compromiso.")}
              </p>
            </div>
            {fotoCat && !busca && (
              <img
                src={fotoCat}
                alt=""
                className="hidden h-44 w-44 rounded-full object-cover shadow-xl ring-8 ring-white md:block"
              />
            )}
          </div>
        </section>

        {/* Barra fixa: categorias, busca e ordem */}
        <div className="sticky top-[var(--altura-header,140px)] z-30 -mx-4 mt-6 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="scrollbar-none -mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1">
              {[null, ...listaCategorias.map((c) => c.nome)].map((c) => {
                const ativo = c ? catAtual === c : !catAtual;
                return (
                  <button
                    key={c ?? "todos"}
                    onClick={() => escolherCategoria(c)}
                    className={cn(
                      "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition duration-200",
                      ativo
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 text-zinc-700 hover:border-zinc-400",
                    )}
                  >
                    {c ? (listaCategorias.find((x) => x.nome === c)?.curto ?? c) : "Todos"}
                  </button>
                );
              })}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="relative flex-1 lg:w-56 lg:flex-none">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar en el catálogo"
                  className="h-10 rounded-full border-zinc-200 pl-9 text-sm shadow-none focus-visible:border-zinc-900 focus-visible:ring-0"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    aria-label="Borrar búsqueda"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Select value={sort} onValueChange={(v) => setSort(v as ListParams["sort"])}>
                <SelectTrigger className="h-10 w-[170px] rounded-full border-zinc-200 text-sm shadow-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Más vendidos</SelectItem>
                  <SelectItem value="preco-asc">Menor precio</SelectItem>
                  <SelectItem value="preco-desc">Mayor precio</SelectItem>
                  <SelectItem value="nome-asc">Nombre (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <p className="mb-6 mt-5 flex items-center gap-2 text-sm text-zinc-500">
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {contagem}
          {nomeVeiculo && (
            <button onClick={tirarVeiculo} className="ml-2 underline">
              Quitar filtro
            </button>
          )}
        </p>

        {isLoading ? (
          <ProductGridSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState busca={busca} />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
            {rows.map((p, i) => (
              <div
                key={p.sku}
                className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: `${Math.min(i % PAGE_SIZE, 10) * 30}ms` }}
              >
                <CardLoja p={p} prioridade={i < 4} />
              </div>
            ))}
          </div>
        )}

        {(hasNextPage || isFetchingNextPage) && (
          <div ref={loaderRef} className="flex justify-center py-10">
            <Loader2 className="h-7 w-7 animate-spin text-zinc-400" />
          </div>
        )}

        {!hasNextPage && rows.length > 0 && !isLoading && (
          <div className="mt-16 flex flex-col items-start justify-between gap-5 rounded-3xl bg-zinc-950 px-6 py-8 text-white md:flex-row md:items-center md:px-10">
            <div>
              <p className="text-xl font-semibold">¿No encontraste lo que buscabas?</p>
              <p className="mt-1 text-white/70">
                Contanos qué querés imprimir y te pasamos el precio.
              </p>
            </div>
            <a
              href={whatsappContactUrl(
                `¡Hola! Quiero cotizar una impresión${busca ? `: ${busca}` : ""}.`,
              )}
              target="_blank"
              rel="noreferrer noopener"
              className="flex shrink-0 items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white transition hover:brightness-105"
            >
              <MessageCircle className="h-5 w-5" /> Cotizar por WhatsApp
            </a>
          </div>
        )}
      </main>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] rounded-2xl bg-zinc-100" />
          <div className="mt-3 h-4 w-3/4 rounded bg-zinc-100" />
          <div className="mt-2 h-3 w-1/2 rounded bg-zinc-100" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ busca }: { busca: string }) {
  const { t } = useT();
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-white/50 px-4 py-8 text-center md:py-24">
      <Package className="mb-3 h-12 w-12 text-zinc-300 md:mb-4 md:h-16 md:w-16" />
      <h3 className="text-xl font-bold text-zinc-900">
        {t("No encontramos repuestos", "Não encontramos peças")}
        {busca ? ` para "${busca}"` : ""}
      </h3>
      <p className="mt-2 max-w-sm text-sm font-medium text-zinc-500">
        {t(
          "Probá con el código original, otra palabra o quitá algún filtro. Si no aparece, te lo conseguimos.",
          "Tente o código original, outra palavra ou tire algum filtro. Se não aparecer, conseguimos para você.",
        )}
      </p>
      {busca.trim().length >= 3 && <AvisoChegada busca={busca.trim()} />}
      <a
        href={whatsappContactUrl(
          t(
            `¡Hola! Busco un repuesto${busca ? `: ${busca}` : ""}.`,
            `Olá! Procuro uma peça${busca ? `: ${busca}` : ""}.`,
          ),
        )}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-5 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1EBE57]"
      >
        <MessageCircle className="h-4 w-4" /> {t("Pedir por WhatsApp", "Pedir pelo WhatsApp")}
      </a>
      <BotaoFotoPieza className="mt-3 flex items-center gap-2 rounded-full border-2 border-primary px-5 py-2 text-sm font-bold text-primary hover:bg-primary/5" />
    </div>
  );
}

// "Te avisamos cuando llegue": sem conta, o e-mail abre o pop-up já pedindo o código.
// A busca sem resultado fica ligada ao cliente e a automação "Busca sem resultado" avisa.
function AvisoChegada({ busca }: { busca: string }) {
  const { data: sessao } = useQuery({ queryKey: ["auth_session"], queryFn: () => getSessionFn() });
  const [email, setEmail] = useState("");
  const { t } = useT();
  if (sessao) {
    return (
      <p className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
        <Bell className="h-4 w-4" /> {t("Te avisamos por e-mail", "Avisamos por e-mail")}
        {sessao?.email ? ` (${sessao.email})` : ""} {t("apenas llegue.", "assim que chegar.")}
      </p>
    );
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        pedirCadastro({ motivo: "busca", termo: busca, email: email.trim() });
      }}
      className="mt-5 w-full max-w-md rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-black/5"
    >
      <p className="flex items-center gap-2 text-sm font-bold text-zinc-900">
        <Bell className="h-4 w-4 text-primary" />{" "}
        {t("Avisame cuando llegue", "Me avise quando chegar")}
      </p>
      <div className="mt-2 flex gap-2">
        <Input
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder={t("tu@email.com", "seu@email.com")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11"
        />
        <Button type="submit" className="h-11 shrink-0 font-bold">
          {t("Avisarme", "Me avise")}
        </Button>
      </div>
      <p className="mt-1.5 text-xs text-zinc-500">
        {t(
          "Y te llevás un cupón de descuento para tu primera compra.",
          "E ganhe um cupom de desconto na primeira compra.",
        )}
      </p>
    </form>
  );
}
