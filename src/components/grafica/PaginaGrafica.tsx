import { useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronRight,
  FileUp,
  MessageCircle,
  Play,
  Palette,
  Ruler,
  ShieldCheck,
  ShoppingCart,
  Star,
  X,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductRail } from "@/components/home/ProductRail";
import { usePrecos } from "@/components/PrecoTag";
import { fmtUYU, uyuDeBrl, type ConfigPrecos } from "@/lib/precos";
import { whatsappContactUrl } from "@/lib/whatsapp";
import { nomeProduto } from "@/lib/pecas-es";
import { SITE_URL } from "@/lib/site";
import { idYoutube, type CombinacaoGrafica, type DetalhesGrafica } from "@/lib/grafica";
import type { Product } from "@/lib/products";
import { urlCategoria } from "@/lib/seo-imprenta";
import { cn } from "@/lib/utils";

// Página do produto gráfico, na estrutura da Printi:
// galeria + resumo → "Tu proyecto empieza acá" (combinações prontas) → configuração por atributo
// (cartões de opção) + quantidades com desconto → resumo fixo ao lado → abas (descrição,
// especificações, FAQ) → vídeos → relacionados.
// Preço: só as combinações prontas têm tabela (dados da Printi, já com a margem). Uma escolha que
// não bate com nenhuma combinação vira "a cotizar" e segue pelo WhatsApp com tudo o que foi escolhido.

type Produto = Pick<Product, "sku" | "nome" | "categoria" | "imagem_principal"> & {
  nome_es?: string | null;
};

// Subtítulos dos atributos mais comuns (o resto fica só com o nome)
const AJUDA: Array<[RegExp, string]> = [
  [/formato|tamaño/i, "Elegí el tamaño de tu material"],
  [/papel|material|sustrato/i, "El material que mejor combina con tu proyecto"],
  [/impresión|lados/i, "Dónde se aplica la impresión"],
  [/colores|color/i, "Cantidad de colores de la impresión"],
  [/extras/i, "Destacá tu arte con efectos especiales"],
  [/terminación especial/i, "Una capa extra de protección y estilo"],
  [/terminación|corte|pliegue/i, "Cómo se termina tu material"],
];
const ajudaDe = (nome: string) => AJUDA.find(([re]) => re.test(nome))?.[1];

const VISIVEIS = 6; // opções antes do "Ver más opciones"

type Atributo = {
  chave: string; // parte|atributo
  parte: string;
  id: string;
  nome: string;
  opcoes: { id: string; nome: string; imagem: string | null }[];
};

export function PaginaGrafica({
  produto,
  detalhes,
  precos,
  galeria,
  relacionados,
  naCotacao,
  adicionar,
}: {
  produto: Produto;
  detalhes: DetalhesGrafica;
  precos?: ConfigPrecos;
  galeria: string[];
  relacionados: Product[];
  naCotacao: boolean;
  adicionar: () => void;
}) {
  const cfg = usePrecos(precos);
  const uyu = (brl: number) => (cfg?.mostrar && cfg.cotacao ? uyuDeBrl(brl, cfg) : null);
  const nome = nomeProduto(produto);
  const link = `${SITE_URL}/produto/${encodeURIComponent(produto.sku)}`;

  // ---------- atributos que o cliente escolhe ----------
  const atributos: Atributo[] = useMemo(
    () =>
      detalhes.partes.flatMap((pt) =>
        pt.atributos
          .filter((a) => a.visivel && a.opcoes.length > 0 && !/^auxiliar/i.test(a.nome))
          .map((a) => ({
            chave: `${pt.id}|${a.id}`,
            parte: pt.id,
            id: a.id,
            nome: detalhes.partes.length > 1 ? `${pt.nome} · ${a.nome}` : a.nome,
            // A Printi repete a mesma opção por lado de impressão (4x0/4x4): mostra cada nome uma vez
            opcoes: a.opcoes.filter((o, i, l) => l.findIndex((x) => x.nome === o.nome) === i),
          })),
      ),
    [detalhes],
  );
  const formatoLivre = detalhes.partes.find((p) => p.formatoPersonalizado)?.formatoPersonalizado;
  const combinacoes = useMemo(
    () => detalhes.combinacoes.filter((c) => c.precos.length > 0),
    [detalhes],
  );
  const escolhaDe = (c: CombinacaoGrafica, a: Atributo) =>
    c.opcoes.find((o) => o.parte === a.parte)?.escolhas[a.id];
  const selecaoDe = (c?: CombinacaoGrafica) =>
    Object.fromEntries(atributos.map((a) => [a.chave, (c && escolhaDe(c, a)) || a.opcoes[0].nome]));

  const [sel, setSel] = useState<Record<string, string>>(() => selecaoDe(combinacoes[0]));
  const [qtd, setQtd] = useState<number | null>(combinacoes[0]?.precos[0]?.quantidade ?? null);
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});
  const [foto, setFoto] = useState(0);
  const [videoAberto, setVideoAberto] = useState(false);
  const [aba, setAba] = useState<"descricao" | "specs" | "faq">("descricao");
  const abasRef = useRef<HTMLDivElement>(null);

  // Combinação que bate com tudo o que está escolhido (atributo sem valor na combinação = tanto faz)
  const ativa = combinacoes.findIndex((c) =>
    atributos.every((a) => {
      const v = escolhaDe(c, a);
      return !v || v === sel[a.chave];
    }),
  );
  const comb = ativa >= 0 ? combinacoes[ativa] : null;
  const tabela = comb?.precos ?? combinacoes[0]?.precos ?? [];
  const linha = tabela.find((x) => x.quantidade === qtd) ?? tabela[0];
  const unitBase = tabela[0] ? tabela[0].preco / tabela[0].quantidade : 0;
  const total = comb && linha ? uyu(linha.preco) : null;
  const unitario = total && linha ? total / linha.quantidade : null;

  const escolherCombinacao = (i: number) => {
    const c = combinacoes[i];
    setSel(selecaoDe(c));
    if (!c.precos.some((x) => x.quantidade === qtd)) setQtd(c.precos[0]?.quantidade ?? null);
  };

  const chips = atributos.map((a) => sel[a.chave]).filter(Boolean);
  const mensagem =
    `¡Hola! Quiero pedir:\n\n*${nome}*\n` +
    atributos.map((a) => `• ${a.nome}: ${sel[a.chave]}`).join("\n") +
    (linha ? `\nCantidad: ${linha.quantidade.toLocaleString("es-UY")} un.` : "") +
    (total ? `\nPrecio en la web: ${fmtUYU(total)}` : "\nPrecio: a cotizar") +
    `\n${link}`;
  const zap = whatsappContactUrl(mensagem);

  const precoDesde = combinacoes[0]?.precos[0];
  const fotos = galeria.length
    ? galeria
    : produto.imagem_principal
      ? [produto.imagem_principal]
      : [];
  const verAba = (a: typeof aba) => {
    setAba(a);
    abasRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-4 md:px-6">
        {/* Trilha */}
        <nav aria-label="Ruta" className="mb-5 flex items-center gap-2 text-sm text-zinc-500">
          <Link to="/" className="hover:text-zinc-900">
            Inicio
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          {produto.categoria && (
            <>
              <Link to={urlCategoria(produto.categoria) as never} className="hover:text-zinc-900">
                {produto.categoria}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
            </>
          )}
          <span className="truncate text-zinc-900">{nome}</span>
        </nav>

        {/* 1. Galeria + resumo */}
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-12">
          <div className="min-w-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-100">
              {fotos.map((f, i) => (
                <img
                  key={f}
                  src={f}
                  alt={i === 0 ? nome : ""}
                  loading={i === 0 ? "eager" : "lazy"}
                  className={cn(
                    "absolute inset-0 h-full w-full object-contain transition duration-500",
                    i === foto ? "scale-100 opacity-100" : "scale-[1.02] opacity-0",
                  )}
                />
              ))}
              {/* Vídeo do produto: miniatura tocando sem som no canto, como na Printi; ao clicar abre grande */}
              {detalhes.videos[0] &&
                (videoAberto ? (
                  <div className="absolute inset-0 z-10 bg-black">
                    <video
                      src={detalhes.videos[0]}
                      controls
                      autoPlay
                      playsInline
                      className="h-full w-full object-contain"
                    />
                    <button
                      onClick={() => setVideoAberto(false)}
                      aria-label="Cerrar video"
                      className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-zinc-900 shadow transition hover:bg-white"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setVideoAberto(true)}
                    aria-label="Ver video del producto"
                    className="group absolute bottom-3 right-3 z-10 aspect-video w-36 overflow-hidden rounded-xl bg-black shadow-lg ring-2 ring-white/80 transition hover:scale-[1.03] sm:w-48 md:bottom-4 md:right-4 md:w-56"
                  >
                    <video
                      src={detalhes.videos[0]}
                      muted
                      autoPlay
                      loop
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-0 grid place-items-center bg-black/10 transition group-hover:bg-black/25">
                      <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-white/90 bg-black/20 text-white backdrop-blur-sm">
                        <Play className="ml-0.5 h-5 w-5 fill-current" />
                      </span>
                    </span>
                  </button>
                ))}
            </div>
            {fotos.length > 1 && (
              <div className="scrollbar-none mt-3 flex gap-3 overflow-x-auto">
                {fotos.map((f, i) => (
                  <button
                    key={f}
                    onClick={() => {
                      setFoto(i);
                      setVideoAberto(false);
                    }}
                    aria-label={`Foto ${i + 1}`}
                    className={cn(
                      "aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl bg-zinc-100 ring-2 transition md:w-36",
                      i === foto ? "ring-zinc-900" : "ring-transparent hover:ring-zinc-300",
                    )}
                  >
                    <img src={f} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="min-w-0">
            {detalhes.destaque && (
              <span className="mb-3 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                {detalhes.destaque === "Favorito" ? "Favorito de los clientes" : detalhes.destaque}
              </span>
            )}
            <h1 className="text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-tight tracking-tight text-zinc-900">
              {nome}
            </h1>
            {detalhes.avaliacao && detalhes.avaliacao.total > 0 && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-zinc-600">
                <span className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < Math.round(detalhes.avaliacao!.media)
                          ? "fill-amber-400 text-amber-400"
                          : "text-zinc-300",
                      )}
                    />
                  ))}
                </span>
                {detalhes.avaliacao.media.toFixed(1)} · {detalhes.avaliacao.total} opiniones
              </p>
            )}

            {precoDesde && (
              <div className="mt-5">
                <p className="text-sm text-zinc-500">
                  {(linha?.quantidade ?? precoDesde.quantidade).toLocaleString("es-UY")} unidades
                  por
                </p>
                <p className="flex items-baseline gap-3">
                  <span className="text-3xl font-semibold tracking-tight text-zinc-900 transition-all">
                    {total ? fmtUYU(total) : "A cotizar"}
                  </span>
                  {unitario && (
                    <span className="text-sm text-zinc-500">
                      $U {unitario.toLocaleString("es-UY", { maximumFractionDigits: 2 })} / unid.
                    </span>
                  )}
                </p>
              </div>
            )}

            {detalhes.descricaoCurta && (
              <p className="mt-5 leading-relaxed text-zinc-600">
                {detalhes.descricaoCurta}{" "}
                <button
                  onClick={() => verAba("descricao")}
                  className="font-semibold text-zinc-900 underline underline-offset-4"
                >
                  Ver más
                </button>
              </p>
            )}

            {detalhes.caracteristicas.length > 0 && (
              <div className="mt-6 border-t border-zinc-200 pt-5">
                <p className="mb-3 text-sm text-zinc-500">Características</p>
                <ul className="space-y-2.5">
                  {detalhes.caracteristicas.map((c) => (
                    <li key={c} className="flex items-start gap-2.5 text-[15px] text-zinc-800">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <a
              href="#configuracion"
              className="mt-7 hidden w-full items-center justify-center gap-2 rounded-full bg-zinc-900 py-3.5 font-semibold text-white transition hover:bg-zinc-800 lg:flex"
            >
              Configurar mi pedido <ChevronDown className="h-4 w-4" />
            </a>
          </div>
        </section>

        {/* 2. Combinações prontas */}
        {combinacoes.length > 0 && (
          <section className="mt-14">
            <h2 className="text-[clamp(1.35rem,2.2vw,1.85rem)] font-semibold tracking-tight text-zinc-900">
              Tu proyecto empieza acá
            </h2>
            <p className="mt-1 text-zinc-500">
              Elegí una de las opciones listas o armalo a tu manera más abajo
            </p>
            <div className="scrollbar-none -mx-4 mt-5 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
              {combinacoes.slice(0, 8).map((c, i) => {
                const p0 = c.precos[0];
                const v = p0 ? uyu(p0.preco) : null;
                const ativo = i === ativa;
                return (
                  <button
                    key={c.id}
                    onClick={() => escolherCombinacao(i)}
                    className="group w-[44%] shrink-0 snap-start text-left sm:w-[30%] lg:w-[calc((100%-4rem)/5)]"
                  >
                    <div
                      className={cn(
                        "relative aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-100 ring-2 transition duration-300",
                        ativo ? "ring-zinc-900" : "ring-transparent group-hover:ring-zinc-300",
                      )}
                    >
                      <img
                        src={c.imagem || fotos[i % Math.max(fotos.length, 1)] || ""}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-zinc-900">{c.nome}</span>
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                          ativo ? "border-zinc-900 bg-zinc-900" : "border-zinc-300",
                        )}
                      >
                        {ativo && <span className="h-2 w-2 rounded-full bg-white" />}
                      </span>
                    </div>
                    {p0 && (
                      <p className="text-sm text-zinc-500">
                        {p0.quantidade.toLocaleString("es-UY")} un. por{" "}
                        <span className="font-semibold text-zinc-900">
                          {v ? fmtUYU(v) : "consultar"}
                        </span>
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. Configuração + resumo */}
        <section
          id="configuracion"
          className="mt-12 grid scroll-mt-[calc(var(--altura-header,140px)+16px)] gap-8 lg:grid-cols-[minmax(0,1fr)_380px]"
        >
          <div className="min-w-0 space-y-5">
            <h2 className="text-[clamp(1.35rem,2.2vw,1.85rem)] font-semibold tracking-tight text-zinc-900">
              Configuración
            </h2>

            {atributos.map((a) => {
              const aberto = abertos[a.chave];
              const lista = aberto ? a.opcoes : a.opcoes.slice(0, VISIVEIS);
              const comImagem = a.opcoes.some((o) => o.imagem);
              const ajuda = ajudaDe(a.nome);
              const formato = /formato/i.test(a.nome) && formatoLivre;
              return (
                <div key={a.chave} className="rounded-2xl border border-zinc-200 p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-zinc-900">{a.nome}</p>
                      {ajuda && <p className="text-sm text-zinc-500">{ajuda}</p>}
                    </div>
                    {formato && (
                      <a
                        href={whatsappContactUrl(
                          `¡Hola! Quiero *${nome}* en medida personalizada (de ${formatoLivre.width.min} a ${formatoLivre.width.max} cm).\n${link}`,
                        )}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-300 px-3.5 py-1.5 text-sm font-medium text-zinc-900 transition hover:border-zinc-900"
                      >
                        <Ruler className="h-4 w-4" /> Personalizar
                      </a>
                    )}
                  </div>
                  <div
                    className={cn(
                      "grid gap-3",
                      comImagem
                        ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
                        : "grid-cols-2 sm:grid-cols-3",
                    )}
                  >
                    {lista.map((o) => {
                      const marcado = sel[a.chave] === o.nome;
                      return (
                        <button
                          key={o.id}
                          onClick={() => setSel((s) => ({ ...s, [a.chave]: o.nome }))}
                          className={cn(
                            "group flex flex-col overflow-hidden rounded-xl border text-left text-sm transition duration-200",
                            marcado
                              ? "border-zinc-900 ring-1 ring-zinc-900"
                              : "border-zinc-200 hover:border-zinc-400",
                          )}
                        >
                          {comImagem && (
                            <span className="block aspect-[4/3] bg-zinc-50">
                              {o.imagem && (
                                <img
                                  src={o.imagem}
                                  alt=""
                                  loading="lazy"
                                  className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
                                />
                              )}
                            </span>
                          )}
                          <span
                            className={cn(
                              "flex flex-1 items-center gap-2 px-3 py-2.5",
                              marcado ? "font-semibold text-zinc-900" : "text-zinc-700",
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition",
                                marcado ? "border-zinc-900 bg-zinc-900" : "border-zinc-300",
                              )}
                            >
                              {marcado && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </span>
                            {o.nome}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {a.opcoes.length > VISIVEIS && (
                    <button
                      onClick={() => setAbertos((s) => ({ ...s, [a.chave]: !aberto }))}
                      className="mt-3 flex items-center gap-1 text-sm font-semibold text-zinc-900 underline underline-offset-4"
                    >
                      {aberto ? "Ver menos" : `Ver más opciones (${a.opcoes.length - VISIVEIS})`}
                      <ChevronDown className={cn("h-4 w-4 transition", aberto && "rotate-180")} />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Quantidade */}
            {tabela.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 p-5">
                <p className="font-semibold text-zinc-900">Cantidad</p>
                <p className="mb-4 text-sm text-zinc-500">
                  {comb
                    ? "Cuanto mayor la cantidad, mayor el descuento."
                    : "Esta combinación se cotiza a pedido: elegí la cantidad y te pasamos el precio."}
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {tabela.map((x) => {
                    const v = comb ? uyu(x.preco) : null;
                    const desconto = unitBase
                      ? Math.round((1 - x.preco / x.quantidade / unitBase) * 100)
                      : 0;
                    const marcado = linha?.quantidade === x.quantidade;
                    return (
                      <button
                        key={x.quantidade}
                        onClick={() => setQtd(x.quantidade)}
                        className={cn(
                          "rounded-xl border p-3 text-left transition duration-200",
                          marcado
                            ? "border-zinc-900 ring-1 ring-zinc-900"
                            : "border-zinc-200 hover:border-zinc-400",
                        )}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-zinc-900">
                            {x.quantidade.toLocaleString("es-UY")} un.
                          </span>
                          {comb && desconto > 0 && (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              -{desconto}%
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block text-sm text-zinc-900">
                          {v ? fmtUYU(v) : "A cotizar"}
                        </span>
                        {v && (
                          <span className="block text-xs text-zinc-500">
                            $U{" "}
                            {(v / x.quantidade).toLocaleString("es-UY", {
                              maximumFractionDigits: 2,
                            })}{" "}
                            / unid.
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {comb && (
                  <p className="mt-3 text-xs text-zinc-500">
                    El descuento se calcula sobre el valor unitario de la menor cantidad.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Resumo fixo */}
          <aside className="lg:sticky lg:top-[calc(var(--altura-header,140px)+16px)] lg:self-start">
            <div className="rounded-2xl border border-zinc-200 p-5 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.25)]">
              <p className="mb-3 text-lg font-semibold text-zinc-900">Resumen</p>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Cantidad</dt>
                  <dd className="font-medium text-zinc-900">
                    {linha ? `${linha.quantidade.toLocaleString("es-UY")} un.` : "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Precio por unidad</dt>
                  <dd className="font-medium text-zinc-900">
                    {unitario
                      ? `$U ${unitario.toLocaleString("es-UY", { maximumFractionDigits: 2 })}`
                      : "—"}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-zinc-200 pt-3">
                  <dt className="font-semibold text-zinc-900">Total</dt>
                  <dd className="text-2xl font-semibold tracking-tight text-zinc-900">
                    {total ? fmtUYU(total) : "A cotizar"}
                  </dd>
                </div>
              </dl>
              <a
                href={zap}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-900 font-semibold text-white transition hover:bg-zinc-800 active:scale-[0.99]"
              >
                <MessageCircle className="h-5 w-5 text-emerald-400" />
                {total ? "Pedir por WhatsApp" : "Cotizar por WhatsApp"}
              </a>
              <button
                onClick={adicionar}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-zinc-300 text-sm font-semibold text-zinc-900 transition hover:border-zinc-900"
              >
                {naCotacao ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                {naCotacao ? "En tu cotización" : "Agregar a mi cotización"}
              </button>
              <ul className="mt-5 space-y-3 border-t border-zinc-200 pt-4 text-xs text-zinc-600">
                <li className="flex gap-2.5">
                  <FileUp className="h-4 w-4 shrink-0 text-zinc-900" />
                  <span>
                    <b className="text-zinc-900">Envío del arte.</b> Nos mandás tu archivo por
                    WhatsApp después del pedido.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <Palette className="h-4 w-4 shrink-0 text-zinc-900" />
                  <span>
                    <b className="text-zinc-900">¿Sin diseño?</b> Te ayudamos a armar o ajustar tu
                    arte.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-zinc-900" />
                  <span>
                    <b className="text-zinc-900">Revisión.</b> Revisamos tu arte antes de imprimir.
                  </span>
                </li>
              </ul>
              <div className="mt-5 border-t border-zinc-200 pt-4">
                <p className="mb-2 text-xs font-medium text-zinc-500">Configuración elegida</p>
                <div className="flex flex-wrap gap-1.5">
                  {chips.map((c, i) => (
                    <span
                      key={`${c}-${i}`}
                      className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700 transition"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* 4. Abas */}
        <section ref={abasRef} className="mt-16 scroll-mt-[calc(var(--altura-header,140px)+16px)]">
          <div className="flex gap-6 border-b border-zinc-200">
            {(
              [
                ["descricao", "Descripción completa"],
                ["specs", "Especificaciones"],
                ["faq", "Preguntas frecuentes"],
              ] as const
            ).map(([id, rotulo]) => (
              <button
                key={id}
                onClick={() => setAba(id)}
                className={cn(
                  "relative pb-3 text-sm font-semibold transition md:text-base",
                  aba === id ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-700",
                )}
              >
                {rotulo}
                <span
                  className={cn(
                    "absolute inset-x-0 -bottom-px h-0.5 bg-zinc-900 transition-transform duration-300",
                    aba === id ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </button>
            ))}
          </div>
          <div className="max-w-4xl py-8">
            {aba === "descricao" && (
              <div
                className="text-[15px] leading-relaxed text-zinc-700 [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-zinc-900 [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-zinc-900 [&_li]:ml-5 [&_li]:list-disc [&_p]:my-3"
                // HTML gerado pelo importador a partir dos blocos do CMS (texto já escapado)
                dangerouslySetInnerHTML={{
                  __html: (detalhes.descricaoHtml || detalhes.descricaoCurta).replace(
                    /<a [^>]*>|<\/a>/g,
                    "",
                  ),
                }}
              />
            )}
            {aba === "specs" && (
              <dl className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200">
                {atributos.map((a) => (
                  <div key={a.chave} className="grid gap-1 p-4 sm:grid-cols-[220px_1fr]">
                    <dt className="font-medium text-zinc-900">{a.nome}</dt>
                    <dd className="text-zinc-600">{a.opcoes.map((o) => o.nome).join(", ")}</dd>
                  </div>
                ))}
                {formatoLivre && (
                  <div className="grid gap-1 p-4 sm:grid-cols-[220px_1fr]">
                    <dt className="font-medium text-zinc-900">Medida personalizada</dt>
                    <dd className="text-zinc-600">
                      De {formatoLivre.width.min} a {formatoLivre.width.max} cm de ancho, de{" "}
                      {formatoLivre.height.min} a {formatoLivre.height.max} cm de alto
                    </dd>
                  </div>
                )}
                {detalhes.quantidadeMinima && (
                  <div className="grid gap-1 p-4 sm:grid-cols-[220px_1fr]">
                    <dt className="font-medium text-zinc-900">Cantidad mínima</dt>
                    <dd className="text-zinc-600">{detalhes.quantidadeMinima} unidades</dd>
                  </div>
                )}
              </dl>
            )}
            {aba === "faq" &&
              (detalhes.faq.length ? (
                <div className="divide-y divide-zinc-200 border-y border-zinc-200">
                  {detalhes.faq.map((f) => (
                    <details key={f.pergunta} className="group py-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-zinc-900">
                        {f.pergunta}
                        <ChevronDown className="h-5 w-5 shrink-0 text-zinc-400 transition duration-300 group-open:rotate-180" />
                      </summary>
                      <p className="mt-3 whitespace-pre-line text-zinc-600">{f.resposta}</p>
                    </details>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500">
                  ¿Tenés alguna duda?{" "}
                  <a
                    href={whatsappContactUrl(`¡Hola! Tengo una consulta sobre *${nome}*.\n${link}`)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-semibold text-zinc-900 underline"
                  >
                    Escribinos
                  </a>
                </p>
              ))}
          </div>
        </section>

        {/* 5. Vídeos */}
        {(detalhes.videos.length > 0 || detalhes.youtube.length > 0) && (
          <section className="mt-4">
            <h2 className="mb-5 text-[clamp(1.35rem,2.2vw,1.85rem)] font-semibold tracking-tight text-zinc-900">
              Mirá cómo queda
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
              {detalhes.videos.map((v) => (
                <video
                  key={v}
                  src={v}
                  controls
                  preload="metadata"
                  className="aspect-video w-full rounded-2xl bg-black"
                />
              ))}
              {detalhes.youtube.map((y) => (
                <iframe
                  key={y}
                  src={`https://www.youtube-nocookie.com/embed/${idYoutube(y)}`}
                  title="Video del producto"
                  loading="lazy"
                  allowFullScreen
                  className="aspect-video w-full rounded-2xl"
                />
              ))}
            </div>
          </section>
        )}

        {/* 6. Relacionados */}
        {relacionados.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-5 text-[clamp(1.35rem,2.2vw,1.85rem)] font-semibold tracking-tight text-zinc-900">
              También te puede interesar
            </h2>
            <ProductRail products={relacionados} />
          </section>
        )}

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl bg-zinc-50 px-6 py-6 text-sm text-zinc-600">
          <span className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-accent" /> Impresión profesional
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" /> Revisamos tu arte
          </span>
          <span className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-accent" /> Atención por WhatsApp
          </span>
        </div>
      </main>

      {/* Barra fixa no celular: total + pedir */}
      <div className="fixed inset-x-0 bottom-[var(--barra-inferior,0px)] z-40 border-t border-zinc-200 bg-white/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-zinc-500">
              {linha ? `${linha.quantidade.toLocaleString("es-UY")} un.` : "Total"}
            </p>
            <p className="truncate text-lg font-semibold leading-tight text-zinc-900">
              {total ? fmtUYU(total) : "A cotizar"}
            </p>
          </div>
          <a
            href={zap}
            target="_blank"
            rel="noreferrer noopener"
            className="flex h-11 items-center gap-2 rounded-full bg-zinc-900 px-5 text-sm font-semibold text-white active:scale-95"
          >
            <MessageCircle className="h-4 w-4 text-emerald-400" /> Pedir
          </a>
        </div>
      </div>
      <div className="h-16 lg:hidden" aria-hidden />
    </div>
  );
}
