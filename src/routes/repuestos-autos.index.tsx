import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import { comPrefixo, linksIdioma, tr, type Idioma } from "@/lib/idioma";
import { getCidadesGeradasFn, getPaginaLocalFn } from "@/lib/repuestos";
import { PaginaZonas } from "@/components/PaginaLocal";
import { guiaZonas, ldPerguntas } from "@/lib/seo-guias";

// /repuestos-autos: todas as zonas de envio (links para as páginas por local)
export const Route = createFileRoute("/repuestos-autos/")({
  loader: async ({ context }) => {
    const pt = (context as any)?.idioma === "pt";
    // Português: também as cidades do RS, SC e PR geradas dos dados do IBGE
    const [local, geradas] = await Promise.all([
      getPaginaLocalFn({ data: {} }),
      pt ? getCidadesGeradasFn() : Promise.resolve([]),
    ]);
    return { total: local.total, geradas };
  },
  head: ({ match, loaderData }) => {
    const idioma: Idioma = match.context?.idioma ?? "es";
    const n = (loaderData?.total ?? 0).toLocaleString(idioma === "pt" ? "pt-BR" : "es-UY");
    const titulo = tr(
      idioma,
      "Repuestos para autos en Uruguay | Cotizá por WhatsApp | PRINTE UY",
      "Peças para autos no RS, SC e PR | PRINTE UY",
    );
    const desc = tr(
      idioma,
      `Repuestos para autos en Uruguay: más de ${n} repuestos para autos y camionetas Volkswagen, Chevrolet, Fiat y Ford y más, con código original. Cotizá por WhatsApp.`,
      `Mais de ${n} peças para carros e caminhonetes com envio para RS, SC e PR. Escolha sua região.`,
    );
    return {
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(ldPerguntas(guiaZonas(idioma).perguntas)),
        },
      ],
      links: linksIdioma("/repuestos-autos", idioma),
      meta: [
        { title: titulo },
        { name: "description", content: desc },
        { property: "og:url", content: `${SITE_URL}${comPrefixo("/repuestos-autos", idioma)}` },
        { property: "og:title", content: titulo },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: PaginaDasZonas,
});

function PaginaDasZonas() {
  const { total, geradas } = Route.useLoaderData();
  return <PaginaZonas total={total} geradas={geradas} />;
}
