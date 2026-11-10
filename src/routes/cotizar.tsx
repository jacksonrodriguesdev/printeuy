import { createFileRoute, Link } from "@tanstack/react-router";
import { ListChecks, BookOpen, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { BandeiraUruguay, BandeiraBrasil } from "@/components/Bandeiras";
import { CotizacionForm, VANTAGENS, VANTAGENS_PT } from "@/components/CotizacionDistribuidor";
import { comPrefixo, linksIdioma, tr, useT, type Idioma } from "@/lib/idioma";
import { whatsappContactUrl } from "@/lib/whatsapp";
import { SITE_URL } from "@/lib/site";

// Página de cotação de impressos sob medida (medida, quantidade ou produto especial)
export const Route = createFileRoute("/cotizar")({
  head: ({ match }) => {
    const idioma: Idioma = match.context?.idioma ?? "es";
    const t = (es: string, pt: string) => tr(idioma, es, pt);
    return {
      links: linksIdioma("/cotizar", idioma),
      meta: [
        {
          title: t(
            "Cotizá tu impreso a medida en Uruguay | PRINTE UY",
            "Orçamento de peças para autos com envio para o Sul do Brasil | PRINTE UY",
          ),
        },
        {
          name: "description",
          content: t(
            "¿Necesitás una medida, cantidad o producto especial? Pedí tu cotización gratis de tarjetas, adhesivos, packaging, banners y más: te respondemos por WhatsApp.",
            "Peças para carros e caminhonetes no RS, SC e PR. Peça seu orçamento grátis: respondemos pelo WhatsApp. Envio para todo o Sul do Brasil.",
          ),
        },
        {
          property: "og:title",
          content: t(
            "Cotizá tu impreso a medida con PRINTE UY",
            "Peça seu orçamento na PRINTE UY — envio para todo o Sul do Brasil",
          ),
        },
        { property: "og:url", content: `${SITE_URL}${comPrefixo("/cotizar", idioma)}` },
      ],
    };
  },
  component: CotizarPage,
});

const PASSOS = [
  ["Contanos qué necesitás", "Producto, cantidad, medidas y tu diseño (si ya lo tenés)."],
  ["Te pasamos el precio", "Por WhatsApp, con el plazo de producción y el costo de envío."],
  ["Confirmás y producimos", "Revisamos tu archivo, imprimimos y lo enviamos a tu ciudad."],
];
const PASSOS_PT = [
  ["Conte o que precisa", "Código, nome da peça ou uma foto."],
  ["Passamos o preço", "Pelo WhatsApp, com disponibilidade e frete."],
  ["Receba na sua cidade", "Enviamos por Correios ou transportadora, com nota fiscal e rastreio."],
];

function CotizarPage() {
  const { t, idioma } = useT();
  const pt = idioma === "pt";
  return (
    <div className="min-h-screen bg-[#f3f5f1]">
      <SiteHeader />
      <section className="relative overflow-hidden bg-[#0f2850] text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] [background-image:repeating-linear-gradient(-28deg,#fff_0_2px,transparent_2px_42px)]"
        />
        <div
          aria-hidden
          className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/25 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 pb-10 pt-8 md:grid-cols-[1fr_1.05fr] md:gap-12 md:pb-16 md:pt-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold ring-1 ring-white/15">
              {pt ? (
                <BandeiraBrasil className="h-3.5 w-5 rounded-sm" />
              ) : (
                <BandeiraUruguay className="h-3.5 w-5 rounded-sm" />
              )}{" "}
              Imprenta online en Uruguay
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-5xl md:leading-[1.05]">
              Cotizá tu impreso a medida
            </h1>
            <p className="mt-3 text-xl font-bold text-orange-300 md:text-2xl">
              Medidas, cantidades o productos especiales.
            </p>
            <p className="mt-4 max-w-xl text-white/80">
              Si no encontrás la medida, la cantidad o el producto que necesitás, contanos tu idea y
              te pasamos el precio por WhatsApp. Para comercios, empresas, emprendedores y eventos.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {(pt ? VANTAGENS_PT : VANTAGENS).map((v) => (
                <li key={v.titulo} className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <v.icon className="h-5 w-5 text-emerald-300" />
                  </span>
                  <div>
                    <p className="font-bold">{v.titulo}</p>
                    <p className="text-sm text-white/70">{v.texto}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <CotizacionForm />
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 md:py-14">
        <section>
          <h2 className="text-2xl font-extrabold text-zinc-900">
            {t("¿Cómo funciona?", "Como funciona?")}
          </h2>
          <ol className="mt-4 grid gap-3 md:grid-cols-3">
            {(pt ? PASSOS_PT : PASSOS).map(([titulo, d], i) => (
              <li
                key={titulo}
                className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent font-extrabold text-[#0f2850]">
                  {i + 1}
                </span>
                <div>
                  <p className="font-bold text-zinc-900">{titulo}</p>
                  <p className="text-sm text-zinc-600">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <Link
            to="/loja"
            className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 hover:ring-primary/40"
          >
            <ListChecks className="h-8 w-8 shrink-0 text-primary" />
            <div>
              <p className="font-bold">¿Ya sabés qué querés?</p>
              <p className="text-sm text-zinc-600">
                Configurá tu producto y mirá el precio al instante.
              </p>
            </div>
          </Link>
          <Link
            to="/ayuda"
            hash="archivos"
            className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 hover:ring-primary/40"
          >
            <BookOpen className="h-8 w-8 shrink-0 text-primary" />
            <div>
              <p className="font-bold">¿Cómo preparo mi archivo?</p>
              <p className="text-sm text-zinc-600">Medidas, sangrado, resolución y colores.</p>
            </div>
          </Link>
          <a
            href={whatsappContactUrl(
              t(
                "¡Hola! Quiero cotizar un impreso con PRINTE UY.",
                "Olá! Quero fazer um orçamento de peças com a PRINTE UY.",
              ),
            )}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-4 rounded-2xl bg-[#25D366] p-5 text-white shadow-sm"
          >
            <MessageCircle className="h-8 w-8 shrink-0" />
            <div>
              <p className="font-bold">{t("¿Preferís hablar?", "Prefere conversar?")}</p>
              <p className="text-sm text-white/90">
                {t("Escribinos directo por WhatsApp.", "Fale direto pelo WhatsApp.")}
              </p>
            </div>
          </a>
        </section>
      </main>
    </div>
  );
}
