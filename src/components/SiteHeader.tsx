import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ChevronDown,
  LogOut,
  Menu,
  MessageCircle,
  ShoppingCart,
  User,
} from "lucide-react";
import { BarraCampanha } from "@/components/campanha/Campanha";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { SinoNotificacoes } from "@/components/SinoNotificacoes";
import { useCart } from "@/components/CartContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { useCategoriasLoja, type CategoriaLoja } from "@/hooks/use-categorias-loja";
import { getSessionFn } from "@/lib/user-auth";
import { listProducts, type Product } from "@/lib/products";
import { nomeProduto } from "@/lib/pecas-es";
import { whatsappContactUrl } from "@/lib/whatsapp";
import { urlCategoria } from "@/lib/seo-imprenta";
import { cn } from "@/lib/utils";

// Header do PRINTE UY (mesma estrutura da Printi, mais fluido):
// 1. faixa preta fina (atalhos + frase da marca), some ao rolar;
// 2. barra principal: logo, busca grande arredondada, WhatsApp, conta e carrinho;
// 3. faixa de categorias: "Todos los productos" (mega-menu com os produtos de cada categoria),
//    as principais categorias e um destaque. Recolhe ao rolar para baixo e volta ao subir.
// É `fixed` com um espaçador de altura constante; a altura fica em --altura-header.

const DESTAQUES = 6; // categorias que aparecem direto na faixa

// Mega-menu: produtos da categoria sob o mouse
function ProdutosDaCategoria({
  categoria,
  fechar,
}: {
  categoria: CategoriaLoja;
  fechar: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["mega-menu", categoria.nome],
    queryFn: () =>
      listProducts({
        categoria: categoria.nome,
        hasImage: true,
        vitrine: true,
        sort: "popular",
        pageSize: 8,
      }),
    staleTime: 10 * 60 * 1000,
  });
  const produtos = (data?.rows ?? []) as Product[];
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-lg font-bold text-zinc-900">{categoria.rotulo}</p>
        <Link
          to={urlCategoria(categoria.nome) as never}
          onClick={fechar}
          className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Ver todos ({categoria.total}) <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-xl bg-zinc-100" />
                <div className="mt-2 h-3 w-3/4 rounded bg-zinc-100" />
              </div>
            ))
          : produtos.map((p) => (
              <Link
                key={p.sku}
                to="/produto/$sku"
                params={{ sku: p.sku }}
                onClick={fechar}
                className="group"
              >
                <div className="aspect-square overflow-hidden rounded-xl bg-zinc-100">
                  {p.imagem_principal && (
                    <img
                      src={p.imagem_principal}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-medium text-zinc-700 group-hover:text-primary">
                  {nomeProduto(p)}
                </p>
              </Link>
            ))}
      </div>
    </div>
  );
}

function MegaMenu({
  categorias,
  aberto,
  fechar,
}: {
  categorias: CategoriaLoja[];
  aberto: boolean;
  fechar: () => void;
}) {
  const [ativa, setAtiva] = useState(0);
  const cat = categorias[ativa] ?? categorias[0];
  return (
    <div
      className={cn(
        "absolute inset-x-0 top-full hidden origin-top border-t border-zinc-200 bg-white shadow-[0_24px_48px_-24px_rgba(15,40,80,0.35)] transition duration-200 md:block",
        aberto ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
      )}
    >
      <div className="mx-auto flex max-h-[min(70vh,560px)] max-w-[1400px] gap-8 px-6 py-6">
        <ul className="w-64 shrink-0 overflow-y-auto pr-2">
          {categorias.map((c, i) => (
            <li key={c.nome}>
              <Link
                to={urlCategoria(c.nome) as never}
                onMouseEnter={() => setAtiva(i)}
                onFocus={() => setAtiva(i)}
                onClick={fechar}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                  i === ativa ? "bg-zinc-100 text-zinc-900" : "text-zinc-600 hover:bg-zinc-50",
                )}
              >
                <c.icon className="h-4 w-4 shrink-0 text-accent" />
                <span className="flex-1 truncate">{c.rotulo}</span>
                <span className="text-xs text-zinc-400">{c.total}</span>
              </Link>
            </li>
          ))}
        </ul>
        {cat && aberto && <ProdutosDaCategoria categoria={cat} fechar={fechar} />}
      </div>
    </div>
  );
}

export function SiteHeader() {
  const { scrolled, hidden } = useScrollDirection();
  const categorias = useCategoriasLoja();
  const categoriaAtual = useRouterState({
    select: (s) =>
      s.location.pathname === "/loja"
        ? String((s.location.search as { categoria?: unknown }).categoria ?? "")
        : "",
  });
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Altura do header na variável --altura-header e no espaçador
  const headerRef = useRef<HTMLElement>(null);
  const [alturaTopo, setAlturaTopo] = useState<number | null>(null);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    let ultima = -1;
    let espera: ReturnType<typeof setTimeout> | undefined;
    const medir = () => {
      const h = el.offsetHeight;
      if (h !== ultima) {
        ultima = h;
        document.documentElement.style.setProperty("--altura-header", `${h}px`);
      }
      if (window.scrollY <= 8) setAlturaTopo((a) => (a === h ? a : h));
    };
    const ro = new ResizeObserver(() => {
      clearTimeout(espera);
      espera = setTimeout(medir, 260);
    });
    ro.observe(el);
    medir();
    return () => {
      ro.disconnect();
      clearTimeout(espera);
    };
  }, []);

  // Atalho "/" foca a busca
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      if (e.key !== "/" || /INPUT|TEXTAREA|SELECT/.test(alvo.tagName) || alvo.isContentEditable)
        return;
      const campo = document.querySelector<HTMLInputElement>("#busca-header input");
      if (campo) {
        e.preventDefault();
        campo.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Mega-menu: abre com o mouse (pequena espera para não piscar ao passar por cima)
  const [mega, setMega] = useState(false);
  const espera = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const abrirMega = () => {
    clearTimeout(espera.current);
    espera.current = setTimeout(() => setMega(true), 120);
  };
  const fecharMega = () => {
    clearTimeout(espera.current);
    espera.current = setTimeout(() => setMega(false), 160);
  };
  useEffect(() => setMega(false), [pathname, categoriaAtual]);

  const { data: user } = useQuery({ queryKey: ["auth_session"], queryFn: () => getSessionFn() });
  const { items, setIsCartOpen } = useCart();
  const itens = items.reduce((s, i) => s + i.quantity, 0);

  const botaoIcone =
    "relative flex h-11 w-11 items-center justify-center rounded-full text-zinc-800 transition hover:bg-zinc-100 active:scale-95";

  return (
    <>
      <header
        ref={headerRef}
        onMouseLeave={fecharMega}
        className={cn(
          "fixed inset-x-0 top-0 z-50 w-full bg-white pt-safe transition-shadow duration-300",
          scrolled || mega
            ? "shadow-[0_8px_30px_-16px_rgba(15,40,80,0.35)]"
            : "border-b border-zinc-200/80",
        )}
      >
        <BarraCampanha />

        {/* 1. Faixa preta */}
        <div
          className={cn(
            "overflow-hidden bg-zinc-950 text-[13px] font-medium text-white transition-[max-height] duration-300",
            scrolled ? "max-h-0" : "max-h-10",
          )}
        >
          <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-6">
            <nav className="flex items-center gap-5">
              <Link to="/cupones" className="transition hover:text-accent">
                Cupones
              </Link>
              <Link to="/cotizar" className="transition hover:text-accent">
                Empresas
              </Link>
              <Link to="/ayuda" className="hidden transition hover:text-accent sm:inline">
                Ayuda
              </Link>
            </nav>
            <p className="hidden font-semibold sm:block">PRINTE UY: tu imprenta, siempre.</p>
          </div>
        </div>

        {/* 2. Barra principal */}
        <div
          className={cn(
            "mx-auto flex max-w-[1400px] items-center gap-3 px-4 transition-[height] duration-300 md:gap-6 md:px-6",
            scrolled ? "h-14 md:h-16" : "h-16 md:h-[76px]",
          )}
        >
          <Link
            to="/"
            aria-label="PRINTE UY — inicio"
            className="flex shrink-0 items-center gap-2.5"
          >
            <img
              src="/logo.svg"
              alt=""
              width={40}
              height={40}
              className={cn(
                "transition-all duration-300",
                scrolled ? "h-8 w-8" : "h-9 w-9 md:h-10 md:w-10",
              )}
            />
            <span className="text-xl font-extrabold tracking-tight text-zinc-900 md:text-2xl">
              printe<span className="text-accent">uy</span>
            </span>
          </Link>

          {/* Busca (computador) */}
          <div
            id="busca-header"
            className="relative mx-auto hidden min-w-0 max-w-3xl flex-1 md:block"
          >
            <SearchAutocomplete
              segment="AUTOMOTIVA"
              redondo
              placeholder="¿Qué producto estás buscando?"
              inputClassName="h-11 rounded-full border border-zinc-300 bg-white text-[15px] text-zinc-900 shadow-none placeholder:text-zinc-500 transition hover:border-zinc-400 focus-visible:border-zinc-900 focus-visible:ring-0"
            />
          </div>
          <div className="flex-1 md:hidden" />

          {/* Ações */}
          <div className="flex shrink-0 items-center gap-1">
            <a
              href={whatsappContactUrl("¡Hola! Quiero hacer una consulta.")}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="WhatsApp"
              className={cn(botaoIcone, "hidden text-[#1fae55] md:flex")}
            >
              <MessageCircle className="h-5 w-5" />
            </a>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(botaoIcone, "hidden md:flex")}
                  aria-label="Mi cuenta"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white">
                    {user.nome.charAt(0).toUpperCase()}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/cuenta">Mi cuenta</Link>
                  </DropdownMenuItem>
                  {user.role === "ADMIN" && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/admin">Panel de administración</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={async () => {
                      await fetch("/api/auth/logout", { method: "POST" });
                      window.location.href = "/";
                    }}
                    className="cursor-pointer text-red-600 focus:text-red-700"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Salir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login" aria-label="Ingresar" className={cn(botaoIcone, "hidden md:flex")}>
                <User className="h-5 w-5" />
              </Link>
            )}
            {user && <SinoNotificacoes />}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Carrito con ${itens} ítems`}
              className={botaoIcone}
            >
              <ShoppingCart className="h-5 w-5" />
              {itens > 0 && (
                <span className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {itens}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Busca (celular) */}
        <div
          className={cn(
            "overflow-hidden px-4 transition-[max-height,padding] duration-300 md:hidden",
            hidden ? "max-h-0 pb-0" : "max-h-16 pb-2.5",
          )}
        >
          <SearchAutocomplete
            segment="AUTOMOTIVA"
            redondo
            placeholder="¿Qué querés imprimir?"
            inputClassName="h-11 rounded-full border border-zinc-300 bg-white text-base text-zinc-900 shadow-none placeholder:text-zinc-500 focus-visible:border-zinc-900 focus-visible:ring-0"
          />
        </div>

        {/* 3. Faixa de categorias */}
        <nav
          aria-label="Categorías"
          className={cn(
            "overflow-hidden border-t border-zinc-200/80 transition-[max-height,opacity] duration-300",
            hidden && !mega ? "max-h-0 opacity-0" : "max-h-16 opacity-100",
          )}
        >
          <div className="scrollbar-none mx-auto flex h-12 max-w-[1400px] items-stretch overflow-x-auto px-2 text-[13px] font-medium text-zinc-700 md:h-14 md:px-6">
            <Link
              to="/loja"
              onMouseEnter={abrirMega}
              onFocus={abrirMega}
              className={cn(
                "flex shrink-0 items-center gap-2 px-3 font-bold text-zinc-900 transition md:pr-5",
                mega && "text-accent",
              )}
            >
              <Menu className="h-4 w-4" />
              Todos los productos
              <ChevronDown
                className={cn("hidden h-3.5 w-3.5 transition md:block", mega && "rotate-180")}
              />
            </Link>
            {categorias.slice(0, DESTAQUES).map((c) => {
              const ativa = categoriaAtual === c.nome;
              return (
                <Link
                  key={c.nome}
                  to={urlCategoria(c.nome) as never}
                  onMouseEnter={fecharMega}
                  className={cn(
                    "group relative flex shrink-0 items-center justify-center px-3 text-center leading-tight transition hover:text-zinc-950 md:max-w-[150px] md:flex-1",
                    ativa && "text-zinc-950",
                  )}
                >
                  {c.rotulo}
                  <span
                    className={cn(
                      "absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-accent transition-transform duration-300",
                      ativa ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </Link>
              );
            })}
            <div className="min-w-2 flex-1" />
            <Link
              to="/loja"
              search={{ sort: "popular" } as never}
              onMouseEnter={fecharMega}
              className="flex shrink-0 items-center bg-accent px-5 font-bold text-white transition hover:brightness-110 md:px-8"
            >
              Más vendidos
            </Link>
          </div>
        </nav>

        <MegaMenu categorias={categorias} aberto={mega} fechar={() => setMega(false)} />
      </header>
      {/* Ocupa o lugar do header no fluxo da página, sempre com a mesma altura */}
      <div
        aria-hidden
        className={alturaTopo ? undefined : "h-[172px] md:h-[168px]"}
        style={alturaTopo ? { height: alturaTopo } : undefined}
      />
    </>
  );
}
