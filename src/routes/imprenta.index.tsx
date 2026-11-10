import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import {
  CONTAINER,
  ChamadaWhatsapp,
  PerguntasSeo,
  SecaoProdutos,
  Trilha,
  faqLd,
  ld,
  trilhaLd,
} from "@/components/seo/BlocosSeo";
import { listProducts, type Product } from "@/lib/products";
import { linksIdioma } from "@/lib/idioma";
import { SITE_URL } from "@/lib/site";
import { FAQ_GERAL } from "@/lib/seo-imprenta";
import {
  LUGARES,
  NOMES_DEPARTAMENTOS,
  lugaresDoDepartamento,
  slugDoDepartamento,
} from "@/lib/ciudades-uy";

// Índice das páginas por localidade: os 19 departamentos com as cidades (e os bairros de
// Montevidéu). Centraliza os links internos para todas as páginas /imprenta/<lugar>.
const TITULO = "Imprenta online en todo Uruguay | Envíos a los 19 departamentos | PRINTE UY";
const DESC =
  "PRINTE UY imprime tarjetas, adhesivos, volantes, packaging, banners y regalos con tu logo y los envía a Montevideo, Canelones, Maldonado, Salto, Paysandú y todo Uruguay.";

export const Route = createFileRoute("/imprenta/")({
  loader: async () => {
    const r = await listProducts({ vitrine: true, hasImage: true, sort: "popular", pageSize: 12 });
    return { populares: (r?.rows ?? []) as Product[] };
  },
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "description", content: DESC },
      { property: "og:title", content: TITULO },
      { property: "og:description", content: DESC },
      { property: "og:url", content: `${SITE_URL}/imprenta` },
    ],
    links: linksIdioma("/imprenta"),
    scripts: [
      ld(
        trilhaLd([
          { nome: "Inicio", url: "/" },
          { nome: "Imprenta en Uruguay", url: "/imprenta" },
        ]),
      ),
      ld(faqLd(FAQ_GERAL)),
    ],
  }),
  component: Indice,
});

function Indice() {
  const { populares } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main>
        <section className="bg-zinc-50">
          <div className={`${CONTAINER} py-8 md:py-12`}>
            <Trilha itens={[{ nome: "Inicio", url: "/" }, { nome: "Imprenta en Uruguay" }]} />
            <h1 className="mt-4 max-w-3xl text-[clamp(1.8rem,3.6vw,2.9rem)] font-extrabold leading-tight tracking-tight text-zinc-900">
              Imprenta online con envío a todo Uruguay
            </h1>
            <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-zinc-600">
              Estés donde estés, pedís tus impresos online y los recibís en tu ciudad. Elegí tu
              departamento y tu localidad para ver los productos más pedidos y cómo llega el envío.
            </p>
            <p className="mt-3 text-sm font-medium text-zinc-500">
              {LUGARES.length} localidades · 19 departamentos
            </p>
          </div>
        </section>

        <section className={`${CONTAINER} py-10`}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {NOMES_DEPARTAMENTOS.map((dep) => (
              <div key={dep} className="rounded-2xl border border-zinc-200 p-5">
                <h2 className="text-lg font-semibold">
                  <Link
                    to={`/imprenta/${slugDoDepartamento(dep)}` as never}
                    className="hover:underline"
                  >
                    {dep}
                  </Link>
                </h2>
                <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-sm">
                  {lugaresDoDepartamento(dep).map((l) => (
                    <li key={l.slug}>
                      <Link
                        to={`/imprenta/${l.slug}` as never}
                        className="inline-flex items-center gap-1 text-zinc-600 hover:text-zinc-900"
                      >
                        <MapPin className="h-3 w-3" />
                        {l.nome}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <SecaoProdutos
          titulo="Los más pedidos en Uruguay"
          sub="Los productos favoritos de nuestros clientes"
          produtos={populares}
        />
        <PerguntasSeo titulo="Preguntas frecuentes" faq={FAQ_GERAL} />
        <ChamadaWhatsapp texto="Te ayudamos con tu pedido y coordinamos el envío a tu ciudad." />
      </main>
    </div>
  );
}
