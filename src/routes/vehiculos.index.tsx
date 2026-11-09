import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { BuscaVeiculo } from "@/components/BuscaVeiculo";
import { nomeModeloSeo, urlVeiculo, VEICULOS_UY } from "@/lib/veiculos-seo";
import { linksIdioma } from "@/lib/idioma";
import { SITE_URL } from "@/lib/site";

// /vehiculos: índice das páginas por veículo (links internos para o Google achar cada modelo)
export const Route = createFileRoute("/vehiculos/")({
  head: () => {
    const titulo = "Repuestos por marca y modelo de vehículo | PRINTE UY";
    const desc =
      "Repuestos para Volkswagen, Chevrolet, Fiat, Ford, Renault, Peugeot, Toyota y más: elegí tu modelo y mirá las piezas que le sirven. Envíos a todo Uruguay.";
    return {
      links: linksIdioma("/vehiculos"),
      meta: [
        { title: titulo },
        { name: "description", content: desc },
        { property: "og:title", content: titulo },
        { property: "og:description", content: desc },
        { property: "og:url", content: `${SITE_URL}/vehiculos` },
      ],
    };
  },
  component: IndiceVeiculos,
});

const partes = (caminho: string) => {
  const [, , marca, modelo] = caminho.split("/");
  return { marca, modelo };
};

function IndiceVeiculos() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader />
      <main>
        <section className="bg-gradient-to-br from-[#081530] via-[#0f2850] to-[#173a72] text-white">
          <div className="mx-auto max-w-7xl px-4 py-9 md:py-12">
            <nav aria-label="Ruta" className="flex items-center gap-1 text-sm text-white/70">
              <Link to="/" className="hover:text-white">
                Inicio
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white">Vehículos</span>
            </nav>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">
              Repuestos por marca y modelo
            </h1>
            <p className="mt-3 max-w-2xl text-white/80">
              Elegí tu vehículo y te mostramos solo los repuestos que le sirven.
            </p>
            <div className="mt-6 max-w-4xl rounded-2xl bg-white p-3 md:p-4">
              <BuscaVeiculo />
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
          {VEICULOS_UY.map((v) => (
            <div
              key={v.valor}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200/70"
            >
              <h2 className="mb-3 text-lg font-extrabold text-zinc-900">Repuestos {v.nome}</h2>
              <div className="flex flex-wrap gap-2">
                {v.modelos.map((m) => (
                  <Link
                    key={m}
                    to="/vehiculos/$marca/$modelo"
                    params={partes(urlVeiculo(v, m))}
                    className="rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-700 transition hover:border-primary/40 hover:text-primary"
                  >
                    {nomeModeloSeo(m)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
