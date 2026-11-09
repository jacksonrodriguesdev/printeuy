import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Car, Search, Loader2 } from "lucide-react";
import { marcasVeiculoFn, modelosVeiculoFn, anosVeiculoFn } from "@/lib/veiculos";
import { MARCAS_VEICULO } from "@/lib/navegacao";
import { cn } from "@/lib/utils";

// Vehículo elegido por el cliente: queda guardado en el navegador para la próxima visita
export type MeuVeiculo = { auto: string; modelo?: string; ano?: number };
const CHAVE = "mi_vehiculo";
export function lerMeuVeiculo(): MeuVeiculo | null {
  try {
    const v = JSON.parse(localStorage.getItem(CHAVE) ?? "null");
    return v && typeof v.auto === "string" ? v : null;
  } catch {
    return null;
  }
}
export function guardarMeuVeiculo(v: MeuVeiculo | null) {
  try {
    if (v) localStorage.setItem(CHAVE, JSON.stringify(v));
    else localStorage.removeItem(CHAVE);
  } catch {
    /* modo privado */
  }
}

// Nombre para mostrar: "Volkswagen Gol 2010"
export function rotuloVeiculo(v: { auto?: string; modelo?: string | null; ano?: number | null }) {
  if (!v.auto) return "";
  const marca =
    MARCAS_VEICULO.find((m) => m.valor === v.auto)?.nome ??
    v.auto.toLowerCase().replace(/(^|\s)\p{L}/gu, (l) => l.toUpperCase());
  const modelo = v.modelo ? v.modelo.charAt(0) + v.modelo.slice(1).toLowerCase() : "";
  return [marca, modelo, v.ano].filter(Boolean).join(" ");
}

const campo =
  "h-12 w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 pr-9 text-[15px] font-medium text-zinc-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400";
const seta =
  "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E\")] bg-[length:16px] bg-[right_0.85rem_center] bg-no-repeat";

// Buscador por vehículo: marca → modelo → año, y abre la tienda con las piezas que sirven.
// variante "hero": en la portada (3 campos en línea en computadora); "compacta": barra lateral de la tienda.
export function BuscaVeiculo({
  inicial,
  variante = "hero",
  className,
  aoBuscar,
  rotuloBotao = "Buscar repuestos",
}: {
  inicial?: MeuVeiculo | null;
  variante?: "hero" | "compacta";
  className?: string;
  aoBuscar?: (v: MeuVeiculo) => void;
  rotuloBotao?: string;
}) {
  const navigate = useNavigate();
  const [auto, setAuto] = useState(inicial?.auto ?? "");
  const [modelo, setModelo] = useState(inicial?.modelo ?? "");
  const [ano, setAno] = useState<string>(inicial?.ano ? String(inicial.ano) : "");

  // Sin vehículo en la URL: usa el último que el cliente eligió
  useEffect(() => {
    if (inicial) return;
    const salvo = lerMeuVeiculo();
    if (salvo) {
      setAuto(salvo.auto);
      setModelo(salvo.modelo ?? "");
      setAno(salvo.ano ? String(salvo.ano) : "");
    }
  }, [inicial]);

  const marcas = useQuery({
    queryKey: ["veiculos", "marcas"],
    queryFn: () => marcasVeiculoFn(),
    staleTime: 60 * 60 * 1000,
  });
  const modelos = useQuery({
    queryKey: ["veiculos", "modelos", auto],
    queryFn: () => modelosVeiculoFn({ data: { montadora: auto } }),
    enabled: !!auto,
    staleTime: 60 * 60 * 1000,
  });
  const anos = useQuery({
    queryKey: ["veiculos", "anos", auto, modelo],
    queryFn: () => anosVeiculoFn({ data: { montadora: auto, modelo } }),
    enabled: !!auto && !!modelo,
    staleTime: 60 * 60 * 1000,
  });

  // Marcas más buscadas primero, después el resto en orden alfabético
  const destaque = new Set(MARCAS_VEICULO.map((m) => m.valor));
  const listaMarcas =
    marcas.data ?? MARCAS_VEICULO.map((m) => ({ valor: m.valor, rotulo: m.nome, total: 0 }));
  const principais = MARCAS_VEICULO.map((m) => listaMarcas.find((x) => x.valor === m.valor)).filter(
    Boolean,
  ) as typeof listaMarcas;
  const outras = listaMarcas
    .filter((m) => !destaque.has(m.valor))
    .sort((a, b) => a.rotulo.localeCompare(b.rotulo, "es"));

  const buscar = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!auto) return;
    const v: MeuVeiculo = {
      auto,
      ...(modelo ? { modelo } : {}),
      ...(ano ? { ano: Number(ano) } : {}),
    };
    guardarMeuVeiculo(v);
    if (aoBuscar) aoBuscar(v);
    else navigate({ to: "/loja", search: v as never });
  };

  const hero = variante === "hero";
  return (
    <form
      onSubmit={buscar}
      className={cn(
        "grid gap-2.5",
        hero ? "md:grid-cols-[1fr_1fr_0.8fr_auto] md:gap-3" : "grid-cols-1",
        className,
      )}
    >
      <label className="block">
        <span className="sr-only">Marca</span>
        <select
          className={cn(campo, seta)}
          value={auto}
          onChange={(e) => {
            setAuto(e.target.value);
            setModelo("");
            setAno("");
          }}
        >
          <option value="">Marca</option>
          <optgroup label="Más buscadas">
            {principais.map((m) => (
              <option key={m.valor} value={m.valor}>
                {m.rotulo}
              </option>
            ))}
          </optgroup>
          {outras.length > 0 && (
            <optgroup label="Todas las marcas">
              {outras.map((m) => (
                <option key={m.valor} value={m.valor}>
                  {m.rotulo}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </label>
      <label className="block">
        <span className="sr-only">Modelo</span>
        <select
          className={cn(campo, seta)}
          value={modelo}
          disabled={!auto || modelos.isLoading}
          onChange={(e) => {
            setModelo(e.target.value);
            setAno("");
          }}
        >
          <option value="">{modelos.isLoading ? "Cargando modelos…" : "Modelo"}</option>
          {(modelos.data ?? []).map((m) => (
            <option key={m.valor} value={m.valor}>
              {m.rotulo}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="sr-only">Año</span>
        <select
          className={cn(campo, seta)}
          value={ano}
          disabled={!modelo || anos.isLoading}
          onChange={(e) => setAno(e.target.value)}
        >
          <option value="">{anos.isLoading ? "Cargando…" : "Año"}</option>
          {(anos.data ?? []).map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={!auto}
        className={cn(
          "flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-[15px] font-bold text-white shadow-lg shadow-orange-600/25 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {marcas.isLoading && !marcas.data ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : hero ? (
          <Search className="h-5 w-5" />
        ) : (
          <Car className="h-5 w-5" />
        )}
        {rotuloBotao}
      </button>
    </form>
  );
}
