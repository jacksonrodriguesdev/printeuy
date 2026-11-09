import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Car, ChevronRight, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { CardLoja } from "@/components/CardPeca";
import { PerguntasBloco } from "@/components/GuiaSeo";
import { iconeCategoria } from "@/lib/navegacao";
import { getPaginaVeiculoFn } from "@/lib/veiculos";
import { nomeModeloSeo, urlVeiculo, VEICULOS_UY, veiculoPorSlug } from "@/lib/veiculos-seo";
import { ldPerguntas } from "@/lib/seo-guias";
import { linksIdioma } from "@/lib/idioma";
import { whatsappContactUrl } from "@/lib/whatsapp";
import { SITE_URL } from "@/lib/site";
import type { Product } from "@/lib/products";

// /vehiculos/volkswagen/gol: página indexável por veículo ("repuestos gol uruguay").
// Conteúdo único de cada página: total de peças, anos cobertos, categorias com contagem e as
// peças com foto que servem nesse modelo (tabela pecas_aplicacao).
const faixaAnos = (anos: number[]) =>
  anos.length ? `${Math.min(...anos)}–${Math.max(...anos)}` : "";

const perguntas = (nome: string, anos: string) => [
  {
    p: `¿Cómo sé si el repuesto le sirve a mi ${nome}?`,
    r: `Cada repuesto muestra los ${nome} compatibles con año y motor${anos ? ` (cubrimos modelos ${anos})` : ""}. Si tenés dudas, mandanos el año, el motor o una foto de la pieza por WhatsApp y te confirmamos antes de comprar.`,
  },
  {
    p: `¿Hacen envíos de repuestos para ${nome} a todo Uruguay?`,
    r: "Sí. Enviamos a cualquier departamento por agencia de transporte. El costo depende del destino y del tamaño del paquete.",
  },
  {
    p: `¿Qué repuestos de ${nome} tienen?`,
    r: "Frenos, suspensión, motor, embrague, transmisión, dirección, refrigeración y piezas eléctricas, con código original y equivalentes de marcas como Bosch, Nakata, Metal Leve, Sabó y SKF.",
  },
];

export const Route = createFileRoute("/vehiculos/$marca/$modelo")({
  loader: async ({ params }) => {
    const achado = veiculoPorSlug(params.marca, params.modelo);
    if (!achado?.modelo) throw notFound();
    const dados = await getPaginaVeiculoFn({
      data: { montadora: achado.veiculo.valor, modelo: achado.modelo },
    });
    return { veiculo: achado.veiculo, modelo: achado.modelo, dados };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [{ title: "Vehículo no encontrado" }, { name: "robots", content: "noindex" }],
      };
    const { veiculo, modelo, dados } = loaderData;
    const nome = `${veiculo.nome} ${nomeModeloSeo(modelo)}`;
    const anos = faixaAnos(dados.anos);
    const caminho = urlVeiculo(veiculo, modelo);
    const titulo = `Repuestos para ${nome}${anos ? ` ${anos}` : ""} en Uruguay | PRINTE UY`;
    const cats = dados.categorias.slice(0, 4).map((c) => c.nome.toLowerCase());
    const desc = `${dados.total.toLocaleString("es-UY")} repuestos para ${nome}${anos ? ` (${anos})` : ""}: ${cats.join(", ")} y más, con código original. Envíos a todo Uruguay.`;
    return {
      links: linksIdioma(caminho),
      meta: [
        { title: titulo },
        { name: "description", content: desc.slice(0, 160) },
        { property: "og:title", content: titulo },
        { property: "og:description", content: desc.slice(0, 160) },
        { property: "og:url", content: `${SITE_URL}${caminho}` },
        // Modelo sem peças: não vale indexar
        ...(dados.total === 0 ? [{ name: "robots", content: "noindex, follow" }] : []),
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(ldPerguntas(perguntas(nome, anos))),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
              {
                "@type": "ListItem",
                position: 2,
                name: "Vehículos",
                item: `${SITE_URL}/vehiculos`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: veiculo.nome,
                item: `${SITE_URL}${urlVeiculo(veiculo)}`,
              },
              { "@type": "ListItem", position: 4, name: nome, item: `${SITE_URL}${caminho}` },
            ],
          }),
        },
      ],
    };
  },
  component: PaginaVeiculo,
});

function PaginaVeiculo() {
  const { veiculo, modelo, dados } = Route.useLoaderData();
  const nome = `${veiculo.nome} ${nomeModeloSeo(modelo)}`;
  const anos = faixaAnos(dados.anos);
  const filtro = { auto: veiculo.valor, modelo };
  const outros = veiculo.modelos.filter((m) => m !== modelo);
  return (
    <div className="min-h-screen bg-zinc-50">
      <SiteHeader />
      <main>
        <section className="bg-gradient-to-br from-[#081530] via-[#0f2850] to-[#173a72] text-white">
          <div className="mx-auto max-w-7xl px-4 py-9 md:py-12">
            <nav
              aria-label="Ruta"
              className="flex flex-wrap items-center gap-1 text-sm text-white/70"
            >
              <Link to="/" className="hover:text-white">
                Inicio
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link to="/vehiculos" className="hover:text-white">
                Vehículos
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white">{nome}</span>
            </nav>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">
              Repuestos para {nome}
              {anos && <span className="block text-orange-300 md:inline"> {anos}</span>}
            </h1>
            <p className="mt-3 max-w-3xl text-white/80 md:text-lg">
              {dados.total.toLocaleString("es-UY")} repuestos que sirven en tu {nome}
              {dados.categorias.length
                ? `: ${dados.categorias
                    .slice(0, 5)
                    .map((c) => c.nome.toLowerCase())
                    .join(", ")} y más`
                : ""}
              . Cada pieza con código original, equivalentes y envío a todo Uruguay.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/loja"
                search={filtro as never}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-5 font-bold text-white shadow-lg shadow-orange-600/25 hover:brightness-110"
              >
                Ver los {dados.total.toLocaleString("es-UY")} repuestos{" "}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={whatsappContactUrl(`¡Hola! Busco un repuesto para mi ${nome}.`)}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-white/10 px-5 font-bold ring-1 ring-white/20 hover:bg-white/15"
              >
                <MessageCircle className="h-4 w-4" /> Consultar por WhatsApp
              </a>
            </div>
          </div>
        </section>

        {dados.categorias.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 pt-8">
            <h2 className="mb-3 text-xl font-extrabold text-zinc-900">
              Repuestos de {nome} por categoría
            </h2>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
              {dados.categorias.map((c) => {
                const Icone = iconeCategoria(c.nome);
                return (
                  <Link
                    key={c.nome}
                    to="/loja"
                    search={{ ...filtro, categoria: c.nome } as never}
                    className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 transition hover:border-primary/40 hover:shadow-md"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.07] text-primary">
                      <Icone className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-zinc-800">
                        {c.nome}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {c.total.toLocaleString("es-UY")} piezas
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section className="mx-auto max-w-7xl px-4 py-8">
          <h2 className="mb-4 text-xl font-extrabold text-zinc-900">Destacados para {nome}</h2>
          {dados.produtos.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-6">
              {(dados.produtos as Product[]).map((p, i) => (
                <CardLoja key={p.sku} p={p} prioridade={i < 4} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-white p-6 text-zinc-600">
              Todavía no tenemos repuestos con foto para este modelo. Consultanos por WhatsApp y te
              lo conseguimos.
            </p>
          )}
        </section>

        <section className="mx-auto max-w-7xl space-y-6 px-4 pb-12">
          {outros.length > 0 && (
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200/70">
              <h2 className="mb-3 text-lg font-bold">Otros modelos {veiculo.nome}</h2>
              <div className="flex flex-wrap gap-2">
                {outros.map((m) => (
                  <Link
                    key={m}
                    to="/vehiculos/$marca/$modelo"
                    params={urlParams(veiculo, m)}
                    className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:border-primary/40 hover:text-primary"
                  >
                    <Car className="h-3.5 w-3.5 text-primary" /> {veiculo.nome} {nomeModeloSeo(m)}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <PerguntasBloco
            titulo={`Preguntas sobre repuestos para ${nome}`}
            perguntas={perguntas(nome, anos)}
          />
        </section>
      </main>
    </div>
  );
}

// Parâmetros da rota a partir do endereço (/vehiculos/<marca>/<modelo>)
function urlParams(v: (typeof VEICULOS_UY)[number], modelo: string) {
  const [, , marca, mod] = urlVeiculo(v, modelo).split("/");
  return { marca, modelo: mod };
}
