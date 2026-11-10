import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { Banner } from "@/lib/banners";
import { Fragment } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import {
  HeroSliderBlock,
  CategoryGridBlock,
  ProductsCarouselBlock,
  ProductsGridBlock,
  PromoStripBlock,
  FeaturesStripBlock,
  BrandsCarouselBlock,
  BuscaCodigoBlock,
  PromoBannersDuplosBlock,
  CarouselMontadorasBlock,
  DepoimentosBlock,
  EnvioDacBlock,
  NewsletterInstagramBlock,
  ParaVoceBlock,
} from "@/components/homepage-blocks";
import { CatalogosCtaBlock } from "@/components/home/CatalogosCta";
import { CotizacionDistribuidorBlock } from "@/components/CotizacionDistribuidor";
import type { HomepageBlock } from "@/lib/homepage";
import { tituloEs } from "@/lib/pecas-es";
import { linksIdioma, useT, type Idioma } from "@/lib/idioma";
import { SITE_URL } from "@/lib/site";
import { PHONE } from "@/lib/whatsapp";
import { tipoNovo } from "@/lib/blocos-home";
import { HomeGrafica } from "@/components/home/HomeGrafica";
import { CATEGORIAS_IMPRENTA } from "@/lib/seo-imprenta";
import { BlocoNovo } from "@/components/home/BlocosNovos";
import { HeroCampanhaHome } from "@/components/campanha/Campanha";

// Dados estruturados da loja: nome, logo, contato e a caixa de busca nos resultados do Google.
// Loja online para todo o Uruguai.
const lojaLd = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: "PRINTE UY",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/icon-512.png`,
  telephone: `+${PHONE}`,
  email: "printeuy@gmail.com",
  description:
    "Imprenta online en Uruguay: tarjetas de presentación, adhesivos, packaging, volantes y regalos empresariales personalizados, con precio al instante y envío a todo el país.",
  areaServed: { "@type": "Country", name: "Uruguay" },
  address: { "@type": "PostalAddress", addressCountry: "UY" },
  priceRange: "$",
  // Categorias que a loja vende (o Google entende o tipo de negócio)
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Productos de imprenta",
    itemListElement: CATEGORIAS_IMPRENTA.map((c) => ({
      "@type": "OfferCatalog",
      name: c.categoria,
      url: `${SITE_URL}/categoria/${c.slug}`,
    })),
  },
};
const siteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "PRINTE UY",
  url: SITE_URL,
  inLanguage: "es-UY",
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/loja?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const Route = createFileRoute("/")({
  head: ({ match, loaderData }) => {
    const idioma: Idioma = match.context?.idioma ?? "es";
    const b0 = loaderData?.hero?.[0];
    const u = (p: string) => (p.startsWith("http") || p.startsWith("/") ? p : `/uploads/${p}`);
    const preloadBanner = b0
      ? b0.image_path_mobile
        ? [
            {
              rel: "preload",
              as: "image",
              href: u(b0.image_path_mobile),
              media: "(max-width: 767px)",
              fetchPriority: "high" as const,
            },
            {
              rel: "preload",
              as: "image",
              href: u(b0.image_path),
              media: "(min-width: 768px)",
              fetchPriority: "high" as const,
            },
          ]
        : [{ rel: "preload", as: "image", href: u(b0.image_path), fetchPriority: "high" as const }]
      : [];
    const titulo = "PRINTE UY — Imprenta online en Uruguay";
    const desc =
      "Tarjetas de presentación, adhesivos, packaging, volantes, tazas y regalos empresariales personalizados. Precio al instante y envíos a todo Uruguay.";
    return {
      meta: [
        { title: titulo },
        { name: "description", content: desc },
        { property: "og:title", content: titulo },
        { property: "og:description", content: desc },
      ],
      links: [...linksIdioma("/", idioma), ...preloadBanner],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(lojaLd) },
        {
          type: "application/ld+json",
          children: JSON.stringify(siteLd),
        },
      ],
    };
  },
  // Blocos e banners do topo vêm do servidor: o banner já sai no HTML (é a maior imagem da página)
  loader: async () => {
    const [blocos, hero] = await Promise.all([
      import("@/lib/homepage").then((m) => m.listHomepageBlocks()),
      import("@/lib/banners")
        .then((m) => m.listActiveBanners("hero", "AUTOMOTIVA"))
        .catch(() => [] as Banner[]),
    ]);
    return { blocos, hero };
  },
  component: HomePage,
});

function Bloco({
  block,
  heroInicial,
  prioridade,
}: {
  block: HomepageBlock;
  heroInicial?: Banner[];
  prioridade?: boolean;
}) {
  const { config } = block;
  const { idioma } = useT();
  // Título do bloco: cadastrado em português no admin; em espanhol é traduzido pelo glossário
  const title = idioma === "pt" ? block.title : tituloEs(block.title);
  // Títulos já cadastrados em espanhol passam pelo glossário sem mudar
  switch (block.type) {
    case "HERO_SLIDER":
      return <HeroSliderBlock config={config} title={title} iniciais={heroInicial} />;
    case "CATEGORY_GRID":
      return <CategoryGridBlock config={config} title={title} />;
    case "PRODUCTS_CAROUSEL":
      return <ProductsCarouselBlock title={title} config={config} />;
    case "PRODUCTS_GRID":
      return <ProductsGridBlock title={title} config={config} />;
    case "PROMO_STRIP":
      return <PromoStripBlock title={title} config={config} />;
    case "FEATURES_STRIP":
      return <FeaturesStripBlock config={config} />;
    case "BRANDS_CAROUSEL":
      return <BrandsCarouselBlock config={config} />;
    case "BUSCA_CODIGO":
      return <BuscaCodigoBlock config={config} />;
    case "PROMO_BANNERS_DUPLOS":
      return <PromoBannersDuplosBlock config={config} />;
    case "CAROUSEL_MONTADORAS":
      return <CarouselMontadorasBlock config={config} />;
    case "DEPOIMENTOS":
      return <DepoimentosBlock config={config} title={title} />;
    case "NEWSLETTER_INSTAGRAM":
      return <NewsletterInstagramBlock config={config} />;
    case "ENVIO_DAC":
      return <EnvioDacBlock config={config} />;
    case "CATALOGOS_CTA":
      return <CatalogosCtaBlock />;
    case "COTIZACION":
      return <CotizacionDistribuidorBlock />;
    default:
      // Componentes do Construtor da Home (src/lib/blocos-home.ts)
      return tipoNovo(block.type) ? (
        <BlocoNovo tipo={block.type} config={config} prioridade={prioridade} />
      ) : null;
  }
}

function HomePage() {
  // Os blocos do Construtor da Home (admin) vêm prontos do servidor e aparecem depois das seções fixas
  const { blocos: iniciais, hero: heroInicial } = Route.useLoaderData();
  const { idioma, href } = useT();
  const { data: blocks = [] } = useQuery({
    queryKey: ["homepage_blocks"],
    queryFn: () => import("@/lib/homepage").then((m) => m.listHomepageBlocks()),
    initialData: iniciais,
    staleTime: 60 * 1000,
  });
  const ativos = blocks.filter((b) => b.active);
  const primeiroId = ativos[0]?.id;

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main>
        {/* Campanha no ar (Black Friday…): hero no topo, se a campanha pediu e não está no Construtor */}
        {!ativos.some((b) => b.type === "CAMPANHA_CONTAGEM") && <HeroCampanhaHome />}
        <HomeGrafica>
          {ativos.length > 0 && (
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-3 py-8 md:gap-5 md:px-4">
              {ativos.map((b) => (
                <Fragment key={b.id}>
                  <Bloco block={b} heroInicial={heroInicial} prioridade={b.id === primeiroId} />
                </Fragment>
              ))}
              <ParaVoceBlock />
            </div>
          )}
        </HomeGrafica>
      </main>
    </div>
  );
}
