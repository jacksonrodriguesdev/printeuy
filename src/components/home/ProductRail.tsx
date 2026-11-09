import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CardGrafica } from "@/components/grafica/CardGrafica";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";

// Carrossel de produtos (home, mega-menu, blocos do construtor): arrastar com o dedo/mouse,
// setas no computador. Mesmo cartão da loja (CardGrafica).

export function RailCard({ p }: { p: Product }) {
  return <CardGrafica p={p} />;
}

// Larguras por tela: no celular aparece um pedaço do próximo cartão, convidando a arrastar.
const LARGURA =
  "flex-[0_0_46%] sm:flex-[0_0_31%] md:flex-[0_0_23.5%] lg:flex-[0_0_18.8%] xl:flex-[0_0_15.6%]";

export function ProductRail({ products, loading }: { products: Product[]; loading?: boolean }) {
  const [emblaRef, api] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });
  const [pode, setPode] = useState({ prev: false, next: false });

  useEffect(() => {
    if (!api) return;
    const update = () => setPode({ prev: api.canScrollPrev(), next: api.canScrollNext() });
    api.on("select", update).on("reInit", update).on("scroll", update);
    update();
    return () => {
      api.off("select", update).off("reInit", update).off("scroll", update);
    };
  }, [api]);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden md:gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={cn(LARGURA, "animate-pulse")}>
            <div className="aspect-[3/4] rounded-2xl bg-zinc-100" />
            <div className="mt-3 h-4 w-3/4 rounded bg-zinc-100" />
            <div className="mt-2 h-3 w-1/2 rounded bg-zinc-100" />
          </div>
        ))}
      </div>
    );
  }

  const seta =
    "absolute top-[38%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-zinc-900 shadow-lg ring-1 ring-zinc-200 transition duration-300 hover:scale-105 md:flex";

  return (
    <div className="group/rail relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 md:gap-5">
          {products.map((p) => (
            <div key={p.sku} className={cn(LARGURA, "min-w-0")}>
              <CardGrafica p={p} />
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={() => api?.scrollPrev()}
        aria-label="Anteriores"
        className={cn(seta, "-left-5", pode.prev ? "opacity-100" : "pointer-events-none opacity-0")}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => api?.scrollNext()}
        aria-label="Siguientes"
        className={cn(
          seta,
          "-right-5",
          pode.next ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
