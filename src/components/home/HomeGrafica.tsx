import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import useEmblaCarousel from "embla-carousel-react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  MousePointerClick,
  Palette,
  Plus,
  Truck,
  Upload,
  Zap,
} from "lucide-react";
import { ProductRail } from "@/components/home/ProductRail";
import { useCategoriasLoja } from "@/hooks/use-categorias-loja";
import { listProducts, type ListParams, type Product } from "@/lib/products";
import { whatsappContactUrl } from "@/lib/whatsapp";
import { urlCategoria } from "@/lib/seo-imprenta";
import { cn } from "@/lib/utils";

// Home da gráfica (PRINTE UY), na estrutura da Printi: banner rotativo, 4 vantagens, categorias
// populares em círculos, "Más vendidos", sliders por categoria, como funciona, cadastro e texto.
// Os blocos do Construtor da Home (admin) entram no meio, como children.

const CONTAINER = "mx-auto w-full max-w-[1400px] px-4 md:px-6";

// ---------------------------------------------------------------- Banner rotativo
const SLIDES = [
  {
    titulo: "Tarjetas de presentación",
    destaque: "que se recuerdan",
    texto: "Papeles premium, hot stamping y barniz localizado. Desde 100 unidades.",
    cta: "Crear mis tarjetas",
    sku: "fbcard",
    img: "/uploads/produtos/papelaria-personalizada/cartao-de-visita/principal/small_image_540x720_22_98828d4057.webp",
    fundo: "from-[#0b1d3a] to-[#173a72]",
  },
  {
    titulo: "Adhesivos y etiquetas",
    destaque: "para tu marca",
    texto: "Redondos, cuadrados o con troquel especial. En bobina o sueltos.",
    cta: "Ver adhesivos",
    categoria: "Etiquetas y Adhesivos",
    img: "/uploads/produtos/adesivos-rotulos-etiquetas/adesivo-redondo/principal/small_image_14_1x_df928b472c.webp",
    fundo: "from-[#1d1d1b] to-[#3a3a36]",
  },
  {
    titulo: "Packaging",
    destaque: "que vende solo",
    texto: "Cajas, bolsas y envases personalizados para tu negocio.",
    cta: "Ver packaging",
    categoria: "Packaging y Envases",
    img: "/uploads/produtos/embalagens/sacola-com-adesivo/principal/CARD_sacola_com_adesivo_01_fddf92b1a2.webp",
    fundo: "from-[#c2410c] to-[#f97316]",
  },
];

function BannerRotativo() {
  const [ref, api] = useEmblaCarousel({ loop: true, duration: 30 });
  const [atual, setAtual] = useState(0);
  const pausa = useRef(false);

  useEffect(() => {
    if (!api) return;
    const sel = () => setAtual(api.selectedScrollSnap());
    api.on("select", sel);
    const t = setInterval(() => !pausa.current && api.scrollNext(), 6000);
    return () => {
      clearInterval(t);
      api.off("select", sel);
    };
  }, [api]);

  const ir = useCallback((i: number) => api?.scrollTo(i), [api]);

  return (
    <section className={cn(CONTAINER, "pt-4 md:pt-6")}>
      <div
        className="group/banner relative overflow-hidden rounded-3xl"
        onMouseEnter={() => (pausa.current = true)}
        onMouseLeave={() => (pausa.current = false)}
      >
        <div ref={ref} className="overflow-hidden">
          <div className="flex">
            {SLIDES.map((s, i) => {
              const destino = s.sku
                ? ({ to: "/produto/$sku", params: { sku: s.sku } } as object)
                : ({ to: urlCategoria(s.categoria) } as object);
              return (
                <div key={s.titulo} className="min-w-0 flex-[0_0_100%]">
                  <div
                    className={cn(
                      "grid min-h-[300px] items-center gap-4 bg-gradient-to-br px-6 py-8 text-white md:min-h-[340px] md:grid-cols-[1.1fr_1fr] md:px-14",
                      s.fundo,
                    )}
                  >
                    <div className="max-w-xl">
                      <h2 className="text-[clamp(1.8rem,4vw,3.2rem)] font-extrabold leading-[1.05] tracking-tight">
                        {s.titulo} <span className="text-orange-300">{s.destaque}</span>
                      </h2>
                      <p className="mt-3 text-white/80 md:text-lg">{s.texto}</p>
                      <Link
                        {...(destino as { to: "/" })}
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-zinc-900 transition hover:gap-3"
                      >
                        {s.cta} <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                    <div className="hidden justify-center md:flex">
                      <img
                        src={s.img}
                        alt=""
                        loading={i === 0 ? "eager" : "lazy"}
                        fetchPriority={i === 0 ? "high" : undefined}
                        className="h-[280px] w-[230px] rotate-2 rounded-2xl object-cover shadow-2xl ring-4 ring-white/20 transition duration-700 group-hover/banner:rotate-0"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {(["prev", "next"] as const).map((d) => (
          <button
            key={d}
            onClick={() => (d === "prev" ? api?.scrollPrev() : api?.scrollNext())}
            aria-label={d === "prev" ? "Anterior" : "Siguiente"}
            className={cn(
              "absolute top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-lg backdrop-blur transition hover:scale-105 md:flex",
              d === "prev" ? "left-4" : "right-4",
            )}
          >
            {d === "prev" ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        ))}
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.titulo}
              onClick={() => ir(i)}
              aria-label={`Banner ${i + 1}`}
              className={cn(
                "h-2 rounded-full bg-white transition-all duration-500",
                i === atual ? "w-7" : "w-2 opacity-50 hover:opacity-80",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- 4 vantagens
function Vantagens() {
  const itens = [
    {
      icon: Zap,
      titulo: "Cotización sin compromiso",
      texto: "Configurá y te pasamos el precio",
      link: "/loja",
      acao: "Ver productos",
    },
    {
      icon: Truck,
      titulo: "Envíos a todo Uruguay",
      texto: "Por agencia a tu ciudad",
      link: "/ayuda",
      acao: "Saber más",
    },
    {
      icon: MessageCircle,
      titulo: "Te ayudamos con el arte",
      texto: "Por WhatsApp, sin vueltas",
      link: "zap",
      acao: "Escribinos",
    },
    {
      icon: Building2,
      titulo: "Empresas",
      texto: "Condiciones especiales",
      link: "/cotizar",
      acao: "Cotizar",
    },
  ];
  return (
    <section className={cn(CONTAINER, "pt-4")}>
      <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white lg:grid-cols-4">
        {itens.map((v, i) => (
          <div
            key={v.titulo}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-4 text-center md:py-5",
              i % 2 === 1 && "border-l border-zinc-200",
              i >= 2 && "border-t border-zinc-200 lg:border-t-0",
              i === 2 && "lg:border-l",
            )}
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-zinc-900 md:text-base">
              <v.icon className="h-5 w-5 text-accent" /> {v.titulo}
            </p>
            <p className="text-xs text-zinc-500 md:text-sm">
              {v.texto} ·{" "}
              {v.link === "zap" ? (
                <a
                  href={whatsappContactUrl("¡Hola! Necesito ayuda con mi arte.")}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-semibold text-zinc-900 underline underline-offset-2"
                >
                  {v.acao}
                </a>
              ) : (
                <Link
                  to={v.link}
                  className="font-semibold text-zinc-900 underline underline-offset-2"
                >
                  {v.acao}
                </Link>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- Títulos de seção
const cat = (s?: object) => (s as { categoria?: string } | undefined)?.categoria;

function Titulo({
  titulo,
  sub,
  link,
}: {
  titulo: string;
  sub?: string;
  link?: { search?: object; texto?: string };
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-[clamp(1.35rem,2.2vw,1.85rem)] font-semibold tracking-tight text-zinc-900">
          {titulo}
        </h2>
        {sub && <p className="mt-0.5 truncate text-sm text-zinc-500">{sub}</p>}
      </div>
      {link && (
        <Link
          {...(cat(link.search)
            ? { to: urlCategoria(cat(link.search)) as never }
            : { to: "/loja", search: link.search as never })}
          className="flex shrink-0 items-center gap-1 rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:border-zinc-900 hover:bg-zinc-900 hover:text-white"
        >
          {link.texto ?? "Ver todos"} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Categorias populares
function CategoriasPopulares() {
  const categorias = useCategoriasLoja();
  return (
    <section className={cn(CONTAINER, "py-10 md:py-14")}>
      <Titulo titulo="Categorías populares" />
      <div className="scrollbar-none -mx-4 flex gap-5 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-7 md:gap-6 md:px-0">
        {categorias.slice(0, 6).map((c) => (
          <Link
            key={c.nome}
            to={urlCategoria(c.nome) as never}
            className="group flex w-28 shrink-0 flex-col items-center gap-3 text-center md:w-auto"
          >
            <span className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-full bg-zinc-100 ring-4 ring-transparent transition duration-300 group-hover:ring-accent/30">
              {/* Ícone por baixo: aparece se a foto faltar ou não carregar (a foto se esconde) */}
              <c.icon className="absolute h-10 w-10 text-zinc-400" />
              {c.imagem && (
                <img
                  src={c.imagem}
                  alt=""
                  loading="lazy"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                  className="relative h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
              )}
            </span>
            <span className="text-sm font-medium leading-tight text-zinc-800 group-hover:text-accent md:text-[15px]">
              {c.rotulo}
            </span>
          </Link>
        ))}
        <Link
          to="/loja"
          className="group flex w-28 shrink-0 flex-col items-center gap-3 text-center md:w-auto"
        >
          <span className="flex aspect-square w-full items-center justify-center rounded-full bg-zinc-100 transition duration-300 group-hover:bg-zinc-900 group-hover:text-white">
            <Plus className="h-8 w-8" />
          </span>
          <span className="text-sm font-medium text-zinc-800 md:text-[15px]">Ver todos</span>
        </Link>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- Sliders de produtos
// true quando o elemento chega a ~1 tela de distância (o slider só busca os produtos então)
function usePerto<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [perto, setPerto] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || perto) return;
    if (typeof IntersectionObserver === "undefined") return setPerto(true);
    const obs = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setPerto(true);
          obs.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [perto]);
  return [ref, perto] as const;
}

function SliderProdutos({
  titulo,
  sub,
  filtro,
  link,
}: {
  titulo: string;
  sub?: string;
  filtro: ListParams;
  link: object;
}) {
  const [ref, perto] = usePerto<HTMLElement>();
  const { data, isLoading } = useQuery({
    queryKey: ["home-grafica", titulo],
    queryFn: () => listProducts({ hasImage: true, vitrine: true, pageSize: 16, ...filtro }),
    enabled: perto,
    staleTime: 10 * 60 * 1000,
  });
  const produtos = (data?.rows ?? []) as Product[];
  if (perto && !isLoading && !produtos.length) return null;
  return (
    <section ref={ref} className={cn(CONTAINER, "py-8 md:py-10")}>
      <Titulo titulo={titulo} sub={sub} link={{ search: link }} />
      <ProductRail products={produtos} loading={!perto || isLoading} />
    </section>
  );
}

const SLIDERS: Array<{ titulo: string; sub: string; categoria: string }> = [
  {
    titulo: "Tarjetas y Papelería",
    sub: "Tarjetas, blocks, sobres, carpetas y más",
    categoria: "Tarjetas y Papelería",
  },
  {
    titulo: "Etiquetas y Adhesivos",
    sub: "Para tus productos, envases y regalos",
    categoria: "Etiquetas y Adhesivos",
  },
  {
    titulo: "Agendas y Calendarios",
    sub: "Con tu marca, para todo el año",
    categoria: "Agendas y Calendarios",
  },
  {
    titulo: "Línea Hot Stamping",
    sub: "Terminaciones metalizadas que destacan",
    categoria: "Línea Hot Stamping",
  },
  {
    titulo: "Regalos Empresariales",
    sub: "Bolígrafos, botellas, mochilas y más",
    categoria: "Regalos Empresariales",
  },
];

// ---------------------------------------------------------------- Como funciona
function ComoFunciona() {
  const passos = [
    {
      icon: MousePointerClick,
      titulo: "Elegí el producto",
      texto: "Más de 600 productos para tu marca.",
    },
    {
      icon: Palette,
      titulo: "Configuralo",
      texto: "Formato, papel, terminación y cantidad, y te enviamos la cotización sin compromiso.",
    },
    {
      icon: Upload,
      titulo: "Mandanos tu arte",
      texto: "Por WhatsApp. Si no tenés diseño, te ayudamos.",
    },
    { icon: Truck, titulo: "Recibilo", texto: "Lo imprimimos y te lo enviamos a todo Uruguay." },
  ];
  return (
    <section className="bg-zinc-50 py-12 md:py-16">
      <div className={CONTAINER}>
        <h2 className="mb-8 text-center text-[clamp(1.35rem,2.2vw,1.85rem)] font-semibold tracking-tight text-zinc-900">
          Cómo funciona
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {passos.map((p, i) => (
            <div
              key={p.titulo}
              className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
                <p.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Paso {i + 1}
              </p>
              <p className="text-lg font-semibold text-zinc-900">{p.titulo}</p>
              <p className="mt-1 text-sm text-zinc-600">{p.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- Cadastro
function Cadastro() {
  return (
    <section className={cn(CONTAINER, "py-10 md:py-14")}>
      <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-zinc-950 px-6 py-10 text-white md:flex-row md:items-center md:px-12">
        <div>
          <h2 className="text-[clamp(1.4rem,2.4vw,2rem)] font-semibold tracking-tight">
            Registrate y aprovechá las promociones exclusivas
          </h2>
          <p className="mt-1 text-white/70">Cupones, novedades y lanzamientos antes que nadie.</p>
        </div>
        <Link
          to="/cadastro"
          className="flex shrink-0 items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-bold text-white transition hover:gap-3 hover:brightness-110"
        >
          Crear mi cuenta <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- Texto (Google)
function Sobre() {
  return (
    <section className={cn(CONTAINER, "pb-12 md:pb-16")}>
      <div className="grid gap-8 border-t border-zinc-200 pt-10 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">
            Imprenta online para impresiones personalizadas en todo Uruguay
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            En PRINTE UY imprimís tarjetas de presentación, adhesivos, etiquetas, volantes,
            folletos, packaging, agendas, calendarios y regalos empresariales con tu marca. Elegís
            el producto, lo configurás con el formato, el papel y la terminación que necesitás, y te
            enviamos la cotización sin compromiso.
          </p>
        </div>
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
            <BadgeCheck className="h-5 w-5 text-accent" /> Cómo comprar en PRINTE UY
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">
            Configurá tu producto, pedilo por WhatsApp y mandanos tu arte. Revisamos el archivo
            antes de imprimir, te confirmamos el plazo y lo enviamos a cualquier ciudad del país.
          </p>
        </div>
      </div>
    </section>
  );
}

export function HomeGrafica({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <BannerRotativo />
      <Vantagens />
      <CategoriasPopulares />
      <SliderProdutos
        titulo="Más vendidos"
        sub="Lo que más piden nuestros clientes"
        filtro={{ sort: "popular" }}
        link={{ sort: "popular" }}
      />
      {SLIDERS.slice(0, 2).map((s) => (
        <SliderProdutos
          key={s.titulo}
          titulo={s.titulo}
          sub={s.sub}
          filtro={{ categoria: s.categoria, sort: "popular" }}
          link={{ categoria: s.categoria }}
        />
      ))}
      <ComoFunciona />
      {SLIDERS.slice(2).map((s) => (
        <SliderProdutos
          key={s.titulo}
          titulo={s.titulo}
          sub={s.sub}
          filtro={{ categoria: s.categoria, sort: "popular" }}
          link={{ categoria: s.categoria }}
        />
      ))}
      {children}
      <Cadastro />
      <Sobre />
    </>
  );
}
