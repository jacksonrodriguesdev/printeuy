import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { CardGrafica } from "@/components/grafica/CardGrafica";
import {
  CONTAINER,
  ChamadaWhatsapp,
  LinksLugares,
  PerguntasSeo,
  Trilha,
  faqLd,
  ld,
  listaLd,
  trilhaLd,
} from "@/components/seo/BlocosSeo";
import { listProducts, type Product } from "@/lib/products";
import { linksIdioma } from "@/lib/idioma";
import { SITE_URL } from "@/lib/site";
import { CATEGORIAS_IMPRENTA, FAQ_GERAL, categoriaImprentaPorSlug } from "@/lib/seo-imprenta";
import { LUGARES } from "@/lib/ciudades-uy";

// Página de categoria para o Google (/categoria/tarjetas-y-papeleria): título, texto, todos os
// produtos da categoria (no HTML do servidor), usos, perguntas frequentes e links internos.
export const Route = createFileRoute("/categoria/$slug")({
  loader: async ({ params }) => {
    const cat = categoriaImprentaPorSlug(params.slug);
    if (!cat) throw notFound();
    // Todos os produtos da categoria (a busca devolve no máximo 100 por página)
    const produtos: Product[] = [];
    for (let page = 1; page <= 6; page++) {
      const r = await listProducts({
        categoria: cat.categoria,
        vitrine: true,
        sort: "popular",
        pageSize: 100,
        page,
      });
      produtos.push(...((r?.rows ?? []) as Product[]));
      if (!r?.hasNextPage) break;
    }
    return { cat, produtos };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Categoría no encontrada | PRINTE UY" }] };
    const { cat, produtos } = loaderData;
    const caminho = `/categoria/${cat.slug}`;
    const titulo = `${cat.metaTitulo} | PRINTE UY`;
    const migalhas = [
      { nome: "Inicio", url: "/" },
      { nome: cat.categoria, url: caminho },
    ];
    const foto = produtos[0]?.imagem_principal;
    const imagem = foto
      ? foto.startsWith("http")
        ? foto
        : `${SITE_URL}${foto}`
      : `${SITE_URL}/icon-512.png`;
    return {
      meta: [
        { title: titulo },
        { name: "description", content: cat.metaDesc },
        { property: "og:title", content: titulo },
        { property: "og:description", content: cat.metaDesc },
        { property: "og:url", content: `${SITE_URL}${caminho}` },
        { property: "og:image", content: imagem },
      ],
      links: linksIdioma(caminho),
      scripts: [
        ld({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: cat.h1,
          description: cat.metaDesc,
          url: `${SITE_URL}${caminho}`,
          inLanguage: "es-UY",
        }),
        ld(trilhaLd(migalhas)),
        ld(listaLd(cat.h1, produtos)),
        ld(faqLd([...cat.faq, ...FAQ_GERAL])),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <p className="p-16 text-center text-zinc-600">
        No encontramos esta categoría.{" "}
        <Link to="/loja" className="underline">
          Ver todos los productos
        </Link>
      </p>
    </div>
  ),
  component: PaginaCategoria,
});

const CAPITAIS = LUGARES.filter((l) => l.capital).map((l) => ({ slug: l.slug, nome: l.nome }));

function PaginaCategoria() {
  const { cat, produtos } = Route.useLoaderData();
  const outras = CATEGORIAS_IMPRENTA.filter((c) => c.slug !== cat.slug);
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main>
        <section className="bg-zinc-50">
          <div className={`${CONTAINER} py-8 md:py-12`}>
            <Trilha itens={[{ nome: "Inicio", url: "/" }, { nome: cat.categoria }]} />
            <h1 className="mt-4 max-w-3xl text-[clamp(1.8rem,3.6vw,2.9rem)] font-extrabold leading-tight tracking-tight text-zinc-900">
              {cat.h1}
            </h1>
            <div className="mt-4 max-w-3xl space-y-3 text-[16px] leading-relaxed text-zinc-600">
              {cat.intro.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <p className="mt-4 text-sm font-medium text-zinc-500">
              {produtos.length} productos · Envío a todo Uruguay
            </p>
          </div>
        </section>

        <section className={`${CONTAINER} py-8 md:py-10`}>
          <h2 className="sr-only">Productos de {cat.categoria}</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {produtos.map((p) => (
              <CardGrafica key={p.sku} p={p} />
            ))}
          </div>
        </section>

        {cat.usos.length > 0 && (
          <section className={`${CONTAINER} py-8`}>
            <h2 className="mb-4 text-[clamp(1.35rem,2.2vw,1.85rem)] font-semibold tracking-tight text-zinc-900">
              ¿Para qué se usan?
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {cat.usos.map((u) => (
                <li
                  key={u}
                  className="flex items-start gap-3 rounded-2xl bg-zinc-50 p-4 text-zinc-700"
                >
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" /> {u}
                </li>
              ))}
            </ul>
          </section>
        )}

        <PerguntasSeo
          titulo={`Preguntas frecuentes sobre ${cat.termo}`}
          faq={[...cat.faq, ...FAQ_GERAL]}
        />

        <section className={`${CONTAINER} py-8`}>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">Otras categorías</h2>
          <div className="flex flex-wrap gap-2">
            {outras.map((c) => (
              <Link
                key={c.slug}
                to={`/categoria/${c.slug}` as never}
                className="rounded-full border border-zinc-200 px-3.5 py-1.5 text-sm text-zinc-700 hover:border-zinc-900"
              >
                {c.categoria}
              </Link>
            ))}
          </div>
        </section>

        <LinksLugares titulo={`${cat.h1} con envío a todo Uruguay`} lugares={CAPITAIS} />
        <ChamadaWhatsapp texto="Te ayudamos a elegir el producto y a preparar tu diseño." />
      </main>
    </div>
  );
}
