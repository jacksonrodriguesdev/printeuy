// Sliders da home: 7 de peças por categoria e 7 por montadora, intercalados.
// Cada slider só busca as peças quando chega perto da tela (a home não faz 14 buscas de uma vez).
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { ProductRail } from "@/components/home/ProductRail";
import { listProducts, type ListParams, type Product } from "@/lib/products";
import { iconeCategoria, MARCAS_VEICULO, siglaMarca } from "@/lib/navegacao";
import { cn } from "@/lib/utils";

// As categorias com mais peças com foto
export const SLIDERS_CATEGORIA = [
  { nome: "Motor", sub: "Juntas, pistones, bombas de aceite, correas y más" },
  { nome: "Frenos", sub: "Pastillas, discos, cilindros y kits de freno" },
  { nome: "Suspensión", sub: "Amortiguadores, bujes, rótulas y parrillas" },
  { nome: "Inyección y Combustible", sub: "Bombas, inyectores, sensores y filtros" },
  { nome: "Transmisión", sub: "Crucetas, homocinéticas, semiejes y cajas" },
  { nome: "Eléctrica", sub: "Alternadores, arranques, bobinas y sensores" },
  { nome: "Dirección", sub: "Extremos, axiales, cremalleras y bombas" },
];

// As montadoras mais comuns no Uruguai
export const SLIDERS_MONTADORA = [
  "VOLKSWAGEN",
  "CHEVROLET",
  "FIAT",
  "FORD",
  "RENAULT",
  "PEUGEOT",
  "TOYOTA",
].map((valor) => MARCAS_VEICULO.find((m) => m.valor === valor)!);

// true quando o elemento chega a ~1 tela de distância
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

function SliderPecas({
  chave,
  titulo,
  sub,
  icone,
  link,
  filtro,
  escuro,
}: {
  chave: string;
  titulo: string;
  sub: string;
  icone: React.ReactNode;
  link: object;
  filtro: ListParams;
  escuro?: boolean;
}) {
  const [ref, perto] = usePerto<HTMLElement>();
  const { data, isLoading } = useQuery({
    queryKey: ["home-slider", chave],
    queryFn: () => listProducts(filtro),
    enabled: perto,
    staleTime: 10 * 60 * 1000,
  });
  const pecas = (data?.rows ?? []) as Product[];
  // Sem peças (categoria vazia no banco): o slider some
  if (perto && !isLoading && !pecas.length) return null;
  return (
    <section ref={ref} className={cn(escuro ? "bg-slate-100/80" : "bg-white")}>
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">
        <div className="mb-4 flex items-center justify-between gap-4 md:mb-5">
          <div className="flex min-w-0 items-center gap-3">
            {icone}
            <div className="min-w-0">
              <h2 className="truncate text-lg font-extrabold tracking-tight text-zinc-900 md:text-2xl">
                {titulo}
              </h2>
              <p className="truncate text-xs text-zinc-500 md:text-sm">{sub}</p>
            </div>
          </div>
          <Link
            to="/loja"
            search={link as never}
            className="flex shrink-0 items-center gap-1 rounded-full bg-primary/[0.07] px-3.5 py-2 text-xs font-bold text-primary transition hover:bg-primary hover:text-white md:text-sm"
          >
            Ver todo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ProductRail products={pecas} loading={!perto || isLoading} />
      </div>
    </section>
  );
}

const base: ListParams = {
  linha: "AUTOMOTIVA",
  hasImage: true,
  vitrine: true,
  sort: "variado",
  pageSize: 16,
};

export function SlidersHome() {
  const itens: React.ReactNode[] = [];
  for (let i = 0; i < 7; i++) {
    const c = SLIDERS_CATEGORIA[i];
    const Icone = iconeCategoria(c.nome);
    itens.push(
      <SliderPecas
        key={"c" + c.nome}
        chave={"cat:" + c.nome}
        titulo={c.nome}
        sub={c.sub}
        link={{ categoria: c.nome }}
        filtro={{ ...base, categoria: [c.nome] }}
        escuro={itens.length % 2 === 1}
        icone={
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-500/25 md:h-12 md:w-12">
            <Icone className="h-6 w-6" strokeWidth={1.9} />
          </span>
        }
      />,
    );
    const m = SLIDERS_MONTADORA[i];
    itens.push(
      <SliderPecas
        key={"m" + m.valor}
        chave={"auto:" + m.valor}
        titulo={`Repuestos para ${m.nome}`}
        sub={`Piezas compatibles con vehículos ${m.nome}`}
        link={{ auto: m.valor }}
        filtro={{ ...base, veiculo: { montadora: m.valor } }}
        escuro={itens.length % 2 === 1}
        icone={
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0b1d3a] text-[15px] font-black text-white shadow-md md:h-12 md:w-12">
            {siglaMarca(m)}
          </span>
        }
      />,
    );
  }
  return <>{itens}</>;
}
