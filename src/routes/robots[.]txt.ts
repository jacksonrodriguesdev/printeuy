import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";

// Orienta os buscadores: indexar a loja, não o painel, a API nem buscas internas.
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(
          [
            "User-agent: *",
            "Allow: /",
            "Disallow: /admin",
            "Disallow: /api/",
            "Disallow: /_serverFn/",
            "Disallow: /login",
            "Disallow: /cadastro",
            "Disallow: /cuenta",
            "Disallow: /baja",
            "Disallow: /pagar/",
            "Disallow: /pedido/",
            "Disallow: /etiqueta/",
            "Disallow: /avaliar/",
            "Disallow: /catalogos/ver/",
            "Disallow: /catalogos/archivo/",
            // Buscas internas e combinações do filtro de vehículo (infinitas): não gastar rastreamento
            "Disallow: /loja?q=",
            "Disallow: /loja?*auto=",
            "Disallow: /*utm_",
            // Versão antiga em português: só redireciona (301)
            "Disallow: /pt/",
            "",
            `Sitemap: ${SITE_URL}/sitemap.xml`,
            "",
          ].join("\n"),
          { headers: { "Content-Type": "text/plain; charset=utf-8" } },
        ),
    },
  },
});
