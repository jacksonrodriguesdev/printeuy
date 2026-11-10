import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, MapPin, MessageCircle } from "lucide-react";
import { ProductRail } from "@/components/home/ProductRail";
import type { Product } from "@/lib/products";
import { SITE_URL } from "@/lib/site";
import { whatsappContactUrl } from "@/lib/whatsapp";
import { urlCategoria, type Pergunta } from "@/lib/seo-imprenta";

// Peças das páginas de SEO (/categoria, /imprenta): trilha, sliders, perguntas e links internos.
export const CONTAINER = "mx-auto w-full max-w-[1400px] px-4 md:px-6";

export type Migalha = { nome: string; url?: string };

export function Trilha({ itens }: { itens: Migalha[] }) {
  return (
    <nav aria-label="Ruta" className="flex flex-wrap items-center gap-1.5 text-sm text-zinc-500">
      {itens.map((m, i) => (
        <span key={m.nome} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
          {m.url ? (
            <Link to={m.url as never} className="hover:text-zinc-900">
              {m.nome}
            </Link>
          ) : (
            <span className="text-zinc-900">{m.nome}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

// Dados estruturados (BreadcrumbList) da mesma trilha
export const trilhaLd = (itens: Migalha[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: itens.map((m, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: m.nome,
    ...(m.url && { item: `${SITE_URL}${m.url === "/" ? "" : m.url}` }),
  })),
});

export const faqLd = (faq: Pergunta[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((f) => ({
    "@type": "Question",
    name: f.p,
    acceptedAnswer: { "@type": "Answer", text: f.r },
  })),
});

export const listaLd = (nome: string, produtos: Product[]) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: nome,
  itemListElement: produtos.slice(0, 20).map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: `${SITE_URL}/produto/${encodeURIComponent(p.sku)}`,
    name: (p as any).nome_es || p.nome,
  })),
});

export const ld = (o: object) => ({ type: "application/ld+json", children: JSON.stringify(o) });

export function SecaoProdutos({
  titulo,
  sub,
  categoria,
  produtos,
}: {
  titulo: string;
  sub?: string;
  categoria?: string;
  produtos: Product[];
}) {
  if (!produtos.length) return null;
  return (
    <section className={`${CONTAINER} py-8 md:py-10`}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[clamp(1.35rem,2.2vw,1.85rem)] font-semibold tracking-tight text-zinc-900">
            {titulo}
          </h2>
          {sub && <p className="mt-1 text-sm text-zinc-500">{sub}</p>}
        </div>
        {categoria && (
          <Link
            to={urlCategoria(categoria) as never}
            className="shrink-0 text-sm font-semibold text-zinc-900 underline-offset-4 hover:underline"
          >
            Ver todo
          </Link>
        )}
      </div>
      <ProductRail products={produtos} />
    </section>
  );
}

export function PerguntasSeo({ titulo, faq }: { titulo: string; faq: Pergunta[] }) {
  if (!faq.length) return null;
  return (
    <section className={`${CONTAINER} py-10`}>
      <h2 className="mb-5 text-[clamp(1.35rem,2.2vw,1.85rem)] font-semibold tracking-tight text-zinc-900">
        {titulo}
      </h2>
      <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
        {faq.map((f) => (
          <details key={f.p} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-zinc-900">
              <h3 className="text-[15px]">{f.p}</h3>
              <ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-[15px] leading-relaxed text-zinc-600">{f.r}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function LinksLugares({
  titulo,
  lugares,
}: {
  titulo: string;
  lugares: Array<{ slug: string; nome: string }>;
}) {
  if (!lugares.length) return null;
  return (
    <section className={`${CONTAINER} py-8`}>
      <h2 className="mb-4 text-lg font-semibold text-zinc-900">{titulo}</h2>
      <div className="flex flex-wrap gap-2">
        {lugares.map((l) => (
          <Link
            key={l.slug}
            to={`/imprenta/${l.slug}` as never}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-sm text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900"
          >
            <MapPin className="h-3.5 w-3.5" /> {l.nome}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ChamadaWhatsapp({ texto }: { texto: string }) {
  return (
    <section className={`${CONTAINER} py-10`}>
      <div className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-zinc-900 p-8 text-white md:flex-row md:items-center">
        <div>
          <p className="text-xl font-semibold">¿Tenés dudas sobre tu pedido?</p>
          <p className="mt-1 text-zinc-300">{texto}</p>
        </div>
        <a
          href={whatsappContactUrl("Hola, quiero consultar sobre un impreso.")}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 rounded-full bg-[#fcd12d] px-6 py-3 font-semibold text-zinc-900"
        >
          <MessageCircle className="h-5 w-5" /> Escribinos por WhatsApp
        </a>
      </div>
    </section>
  );
}
