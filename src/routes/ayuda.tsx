import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MessageCircle,
  Upload,
  ShoppingCart,
  Truck,
  CreditCard,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  FileCheck2,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { whatsappContactUrl } from "@/lib/whatsapp";
import { linksIdioma } from "@/lib/idioma";
import { FAQ_GERAL } from "@/lib/seo-imprenta";

// Página de ajuda da imprenta: como pedir, arquivo, envios, pagamento, garantia e perguntas.
// Os textos não prometem prazos nem condições que a loja não confirmou; revise antes de mudar.
const PREGUNTAS = [
  {
    p: "¿Cómo hago un pedido?",
    r: "Elegí el producto, configurá tamaño, papel, terminación y cantidad, y mirá el precio al instante. Después subís tu diseño o nos lo mandás por WhatsApp, y coordinamos el pago y el envío.",
  },
  {
    p: "¿En qué formato envío mi diseño?",
    r: "PDF en alta resolución (300 dpi) es lo ideal. También aceptamos AI, PSD, CDR y JPG. Dejá un margen de seguridad de 3 mm para que ningún texto quede cortado.",
  },
  {
    p: "¿Revisan el archivo antes de imprimir?",
    r: "Sí. Chequeamos medidas, márgenes, resolución y colores, y si algo no está bien te avisamos antes de imprimir.",
  },
  {
    p: "¿Los colores salen iguales a la pantalla?",
    r: "La pantalla muestra colores en RGB y la imprenta trabaja en CMYK, por eso puede haber pequeñas diferencias. Para mejores resultados, prepará el archivo en CMYK.",
  },
  {
    p: "¿Puedo pedir una cantidad que no está en la tabla?",
    r: "En muchos productos sí. Si no encontrás la cantidad o la medida que necesitás, escribinos por WhatsApp y te pasamos el precio.",
  },
  ...FAQ_GERAL,
];

const PASOS = [
  {
    icon: ShoppingCart,
    titulo: "Elegí tu producto",
    texto: "Tamaño, papel, terminación y cantidad, con el precio al instante.",
  },
  {
    icon: Upload,
    titulo: "Subí tu diseño",
    texto: "PDF, AI, PSD, CDR o JPG. Si no tenés diseño, te ayudamos.",
  },
  {
    icon: FileCheck2,
    titulo: "Revisamos el archivo",
    texto: "Chequeamos medidas, márgenes y colores antes de imprimir.",
  },
  {
    icon: Truck,
    titulo: "Recibilo donde estés",
    texto: "Producimos tu pedido y lo enviamos a todo Uruguay.",
  },
];

export const Route = createFileRoute("/ayuda")({
  head: () => ({
    links: linksIdioma("/ayuda"),
    meta: [
      { title: "Ayuda — Cómo pedir, archivos, envíos y preguntas frecuentes | PRINTE UY" },
      {
        name: "description",
        content:
          "Cómo hacer tu pedido en PRINTE UY: configurar el producto, preparar tu diseño, formas de pago, envíos a todo Uruguay y preguntas frecuentes.",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: PREGUNTAS.map((q) => ({
            "@type": "Question",
            name: q.p,
            acceptedAnswer: { "@type": "Answer", text: q.r },
          })),
        }),
      },
    ],
  }),
  component: AyudaPage,
});

function Seccion({
  id,
  icon: Icon,
  titulo,
  children,
}: {
  id: string;
  icon: typeof Truck;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-[calc(var(--altura-header,120px)+16px)] rounded-2xl bg-white p-5 shadow-sm md:p-8"
    >
      <h2 className="mb-4 flex items-center gap-3 text-xl font-extrabold text-zinc-900 md:text-2xl">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Icon className="h-5 w-5" />
        </span>
        {titulo}
      </h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-zinc-700">{children}</div>
    </section>
  );
}

function AyudaPage() {
  return (
    <div className="min-h-screen bg-zinc-100">
      <SiteHeader />
      <main className="mx-auto flex max-w-4xl flex-col gap-4 px-3 py-6 md:gap-6 md:px-4 md:py-10">
        <div className="px-1">
          <h1 className="text-2xl font-extrabold text-zinc-900 md:text-4xl">Centro de ayuda</h1>
          <p className="mt-2 text-zinc-600">
            Todo lo que necesitás saber para pedir tus impresos con tranquilidad.
          </p>
        </div>

        <Seccion id="como-comprar" icon={ShoppingCart} titulo="Cómo pedir">
          <ol className="grid gap-3 sm:grid-cols-2">
            {PASOS.map((p, i) => (
              <li key={p.titulo} className="flex gap-3 rounded-xl bg-zinc-50 p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="flex items-center gap-2 font-bold text-zinc-900">
                    <p.icon className="h-4 w-4 text-accent" /> {p.titulo}
                  </p>
                  <p className="text-sm text-zinc-600">{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </Seccion>

        <Seccion id="archivos" icon={Upload} titulo="Cómo preparar tu archivo">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Usá la medida final del producto más 3 mm de sangrado en cada lado.</li>
            <li>Dejá los textos y logos al menos a 3 mm del borde de corte.</li>
            <li>
              Resolución de 300 dpi para impresos chicos y de 100 a 150 dpi para gran formato.
            </li>
            <li>Colores en CMYK y fuentes convertidas a curvas (o incrustadas en el PDF).</li>
          </ul>
          <p>¿No tenés diseño o no sabés cómo prepararlo? Escribinos por WhatsApp y te ayudamos.</p>
        </Seccion>

        <Seccion id="envios" icon={Truck} titulo="Envíos a todo Uruguay">
          <p>
            Enviamos a Montevideo, Canelones, Maldonado y a los 19 departamentos del país. El costo
            y el plazo de entrega dependen de la localidad y del producto, y se confirman junto con
            tu pedido.{" "}
            <Link to={"/imprenta" as never} className="font-semibold text-accent underline">
              Ver localidades
            </Link>
          </p>
        </Seccion>

        <Seccion id="pagos" icon={CreditCard} titulo="Formas de pago">
          <p>
            Al confirmar el pedido te informamos las formas de pago disponibles. Cualquier duda,
            consultanos por WhatsApp antes de pagar.
          </p>
        </Seccion>

        <Seccion id="privacidad" icon={ShieldCheck} titulo="Privacidad">
          <p>
            Usamos tus datos solo para preparar y entregar tu pedido. Conocé los detalles en nuestra{" "}
            <Link to={"/privacidad" as never} className="font-semibold text-accent underline">
              política de privacidad
            </Link>
            .
          </p>
        </Seccion>

        <Seccion id="garantia" icon={ShieldCheck} titulo="Garantía de impresión">
          <p>
            Antes de imprimir revisamos tu archivo y, si hay algo para corregir, te avisamos. Como
            cada producto se fabrica con tu diseño, no se aceptan cambios de opinión una vez
            aprobado el pedido.
          </p>
          <p>
            <strong>Si el pedido llega con un defecto de impresión</strong> o distinto de lo que
            aprobaste, escribinos por WhatsApp dentro de los 7 días con fotos y lo reimprimimos o
            buscamos la mejor solución.
          </p>
        </Seccion>

        <Seccion id="preguntas" icon={HelpCircle} titulo="Preguntas frecuentes">
          <div className="divide-y divide-zinc-100">
            {PREGUNTAS.map((q) => (
              <details key={q.p} className="group py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-zinc-900">
                  {q.p}
                  <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400 transition group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-zinc-600">{q.r}</p>
              </details>
            ))}
          </div>
        </Seccion>

        <div className="flex flex-col items-center gap-3 rounded-2xl bg-zinc-900 p-6 text-center text-white md:p-10">
          <h2 className="text-xl font-extrabold md:text-2xl">¿Te quedó alguna duda?</h2>
          <p className="text-white/85">Hablá con nuestro equipo, te respondemos por WhatsApp.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <a
              href={whatsappContactUrl("¡Hola! Tengo una consulta sobre un pedido.")}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-bold text-white shadow-lg transition hover:bg-[#1EBE57] active:scale-95"
            >
              <MessageCircle className="h-5 w-5" /> Escribinos por WhatsApp
            </a>
            <Link
              to="/loja"
              className="rounded-full bg-white px-6 py-3 font-bold text-zinc-900 shadow-lg transition hover:bg-zinc-50 active:scale-95"
            >
              Ver productos
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
