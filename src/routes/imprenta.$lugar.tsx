import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { MapPin, Truck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import {
  CONTAINER,
  ChamadaWhatsapp,
  LinksLugares,
  PerguntasSeo,
  SecaoProdutos,
  Trilha,
  faqLd,
  ld,
  listaLd,
  trilhaLd,
  type Migalha,
} from "@/components/seo/BlocosSeo";
import { listProducts, type Product } from "@/lib/products";
import { linksIdioma } from "@/lib/idioma";
import { SITE_URL } from "@/lib/site";
import { PHONE } from "@/lib/whatsapp";
import { categoriaImprentaPorNome } from "@/lib/seo-imprenta";
import {
  ALIAS_LUGAR,
  categoriasEmDestaque,
  lugarPorSlug,
  lugaresDoDepartamento,
  nomeCompleto,
  slugDoDepartamento,
  textosLugar,
  tituloLugar,
  vizinhosDe,
  type Lugar,
} from "@/lib/ciudades-uy";

// Página de cada localidade do Uruguai (/imprenta/montevideo, /imprenta/young…): texto próprio,
// sliders de produtos das categorias em destaque (no HTML do servidor, para o Google), passos do
// pedido, perguntas frequentes com dados estruturados e links para os lugares vizinhos.
export const Route = createFileRoute("/imprenta/$lugar")({
  loader: async ({ params }) => {
    const alias = ALIAS_LUGAR[params.lugar];
    if (alias)
      throw redirect({ to: "/imprenta/$lugar", params: { lugar: alias }, statusCode: 301 });
    const lugar = lugarPorSlug(params.lugar);
    if (!lugar) throw notFound();
    const cats = categoriasEmDestaque(lugar, 4);
    const base = { vitrine: true, hasImage: true, sort: "popular" as const, pageSize: 12 };
    const [populares, ...porCat] = await Promise.all([
      listProducts(base),
      ...cats.map((categoria) => listProducts({ ...base, categoria })),
    ]);
    return {
      lugar,
      populares: (populares?.rows ?? []) as Product[],
      secoes: cats.map((categoria, i) => ({
        categoria,
        produtos: (porCat[i]?.rows ?? []) as Product[],
      })),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Imprenta online en Uruguay | PRINTE UY" }] };
    const { lugar, populares } = loaderData;
    const caminho = `/imprenta/${lugar.slug}`;
    const n = nomeCompleto(lugar);
    const onde =
      lugar.tipo === "departamento" && lugar.nome !== "Montevideo"
        ? `el departamento de ${lugar.nome}`
        : lugar.tipo === "barrio"
          ? `${lugar.nome} (Montevideo)`
          : lugar.nome;
    const titulo = `Imprenta en ${onde}: tarjetas, adhesivos y más | PRINTE UY`;
    const desc = `Imprenta online con envío a ${n}. Tarjetas de presentación, adhesivos, volantes, packaging, banners y regalos con tu logo. Cotización sin compromiso por WhatsApp.`;
    const { faq } = textosLugar(lugar);
    return {
      meta: [
        { title: titulo },
        { name: "description", content: desc },
        { property: "og:title", content: titulo },
        { property: "og:description", content: desc },
        { property: "og:url", content: `${SITE_URL}${caminho}` },
        { name: "geo.region", content: "UY" },
        { name: "geo.placename", content: lugar.nome },
      ],
      links: linksIdioma(caminho),
      scripts: [
        // O serviço (imprenta online) e a área atendida: o Google liga a página à busca local
        ld({
          "@context": "https://schema.org",
          "@type": "Service",
          name: tituloLugar(lugar),
          serviceType: "Imprenta online",
          provider: {
            "@type": "Organization",
            name: "PRINTE UY",
            url: SITE_URL,
            telephone: `+${PHONE}`,
          },
          areaServed: {
            "@type": lugar.tipo === "departamento" ? "AdministrativeArea" : "City",
            name: n,
            containedInPlace: { "@type": "Country", name: "Uruguay" },
          },
          url: `${SITE_URL}${caminho}`,
        }),
        ld(trilhaLd(migalhas(lugar))),
        ld(listaLd(`Productos más pedidos en ${lugar.nome}`, populares)),
        ld(faqLd(faq)),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <p className="p-16 text-center text-zinc-600">
        No encontramos esta localidad.{" "}
        <Link to={"/imprenta" as never} className="underline">
          Ver todas las localidades
        </Link>
      </p>
    </div>
  ),
  component: PaginaLugar,
});

function migalhas(l: Lugar): Migalha[] {
  const m: Migalha[] = [
    { nome: "Inicio", url: "/" },
    { nome: "Imprenta en Uruguay", url: "/imprenta" },
  ];
  if (l.tipo !== "departamento")
    m.push({ nome: l.departamento, url: `/imprenta/${slugDoDepartamento(l.departamento)}` });
  m.push({ nome: l.nome, url: `/imprenta/${l.slug}` });
  return m;
}

function PaginaLugar() {
  const { lugar, populares, secoes } = Route.useLoaderData();
  const { intro, passos, faq } = textosLugar(lugar);
  const n = nomeCompleto(lugar);
  const dentro =
    lugar.tipo === "departamento"
      ? lugaresDoDepartamento(lugar.departamento).filter((x) => x.slug !== lugar.slug)
      : [];
  const vizinhos = vizinhosDe(lugar);
  const trilha = migalhas(lugar);
  trilha[trilha.length - 1] = { nome: lugar.nome };
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main>
        <section className="bg-zinc-50">
          <div className={`${CONTAINER} py-8 md:py-12`}>
            <Trilha itens={trilha} />
            <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-medium text-zinc-600 shadow-sm">
              <MapPin className="h-4 w-4 text-accent" /> {n}
            </p>
            <h1 className="mt-3 max-w-3xl text-[clamp(1.8rem,3.6vw,2.9rem)] font-extrabold leading-tight tracking-tight text-zinc-900">
              {tituloLugar(lugar)}
            </h1>
            <div className="mt-4 max-w-3xl space-y-3 text-[16px] leading-relaxed text-zinc-600">
              {intro.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/loja"
                className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white"
              >
                Ver todos los productos
              </Link>
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-3 text-sm text-zinc-700">
                <Truck className="h-4 w-4" /> Envío a {lugar.nome}
              </span>
            </div>
          </div>
        </section>

        <SecaoProdutos
          titulo={`Los más pedidos en ${lugar.nome}`}
          sub="Los productos favoritos de nuestros clientes"
          produtos={populares}
        />
        {secoes.map((s) => {
          const c = categoriaImprentaPorNome(s.categoria);
          return (
            <SecaoProdutos
              key={s.categoria}
              titulo={`${c?.h1 ?? s.categoria} en ${lugar.nome}`}
              sub={c?.intro[0].split(". ")[0]}
              categoria={s.categoria}
              produtos={s.produtos}
            />
          );
        })}

        <section className={`${CONTAINER} py-10`}>
          <h2 className="mb-5 text-[clamp(1.35rem,2.2vw,1.85rem)] font-semibold tracking-tight text-zinc-900">
            Cómo pedir tus impresos desde {lugar.nome}
          </h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {passos.map((p, i) => (
              <li key={p.t} className="rounded-2xl bg-zinc-50 p-5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#fcd12d] font-bold text-zinc-900">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-semibold text-zinc-900">{p.t}</h3>
                <p className="mt-1 text-sm text-zinc-600">{p.d}</p>
              </li>
            ))}
          </ol>
        </section>

        <PerguntasSeo titulo={`Preguntas frecuentes: imprenta en ${lugar.nome}`} faq={faq} />

        <LinksLugares
          titulo={`Localidades del departamento de ${lugar.departamento}`}
          lugares={dentro}
        />
        <LinksLugares titulo="También enviamos a" lugares={vizinhos} />
        <ChamadaWhatsapp texto={`Te asesoramos y coordinamos el envío a ${lugar.nome}.`} />
      </main>
    </div>
  );
}
