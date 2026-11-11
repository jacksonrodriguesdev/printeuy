import { Link } from "@tanstack/react-router";
import { Check, Plus } from "lucide-react";
import { usePreco, principalDe, SeloOferta } from "@/components/PrecoTag";
import { useCart } from "@/components/CartContext";
import { codigoExibicao, type Product } from "@/lib/products";
import { nomeProduto } from "@/lib/pecas-es";
import { useIdioma } from "@/lib/idioma";
import { cn } from "@/lib/utils";

// Cartão de produto da gráfica (loja, sliders, mega-menu): foto alta 3:4 sem moldura, nome e
// "Desde · 250 un. · $U 330", como na Printi. O "+" adiciona à cotização sem sair da lista.
export function CardGrafica({
  p,
  prioridade,
  className,
}: {
  p: Product & { qtd_minima?: number | null };
  prioridade?: boolean;
  className?: string;
}) {
  const idioma = useIdioma();
  const preco = usePreco(p);
  const { items, addItem } = useCart();
  const naCotacao = items.some((i) => i.sku === p.sku);
  const nome = nomeProduto(p);

  return (
    <div className={cn("group relative flex flex-col", className)}>
      <Link
        to="/produto/$sku"
        params={{ sku: p.sku }}
        className="relative block aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-100"
      >
        {p.imagem_principal ? (
          <img
            src={p.imagem_principal}
            alt={nome}
            loading={prioridade ? "eager" : "lazy"}
            fetchPriority={prioridade ? "high" : undefined}
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-6">
            <img src="/logo.svg" alt="" className="h-16 w-16 opacity-30" />
          </div>
        )}
        <SeloOferta p={p} className="absolute left-3 top-3" />
      </Link>
      <button
        type="button"
        onClick={() => {
          if (!naCotacao)
            addItem({
              sku: p.sku,
              codigo: codigoExibicao(p),
              name: p.nome,
              nameEs: nome,
              image: p.imagem_principal || undefined,
              quantity: 1,
            });
        }}
        aria-label={naCotacao ? "Ya está en tu cotización" : "Agregar a la cotización"}
        title={naCotacao ? "Ya está en tu cotización" : "Agregar a la cotización"}
        className={cn(
          "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition duration-300 active:scale-90",
          naCotacao
            ? "bg-zinc-900 text-white"
            : "bg-white/95 text-zinc-900 opacity-100 hover:bg-zinc-900 hover:text-white md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100",
        )}
      >
        {naCotacao ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      </button>
      <Link to="/produto/$sku" params={{ sku: p.sku }} className="mt-3 block">
        <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-zinc-900 transition group-hover:text-accent md:text-[17px]">
          {nome}
        </h3>
        {preco ? (
          <div className="mt-1.5 text-sm text-zinc-500">
            <span>Desde</span>
            {p.qtd_minima ? <span> · {p.qtd_minima.toLocaleString("es-UY")} un.</span> : null}
            <p className="mt-0.5 text-base font-semibold text-zinc-900 md:text-lg">
              {principalDe(preco, idioma)}
            </p>
          </div>
        ) : (
          <p className="mt-1.5 text-sm font-medium text-zinc-500">Pedí tu cotización</p>
        )}
      </Link>
    </div>
  );
}
