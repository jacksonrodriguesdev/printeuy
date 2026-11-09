// Portada de PRINTE UY: buscador por vehículo y por código, categorías con íconos,
// marcas de vehículos, destacados y marcas de repuestos. Los bloques del Constructor de la Home
// (admin → Homepage) siguen apareciendo debajo de estas secciones.
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Car,
  Hash,
  Search,
  Truck,
  MessageCircle,
  ShieldCheck,
  BadgeCheck,
  ArrowRight,
  Camera,
} from "lucide-react";
import { BuscaVeiculo } from "@/components/BuscaVeiculo";
import { SlidersHome } from "@/components/home/SlidersHome";
import { useCategoriasLoja } from "@/hooks/use-categorias-loja";
import { MARCAS_VEICULO, MARCAS_PECAS, siglaMarca } from "@/lib/navegacao";
import { whatsappContactUrl, PHONE_DISPLAY } from "@/lib/whatsapp";
import { abrirFotoPieza } from "@/components/FotoPieza";
import { cn } from "@/lib/utils";

const num = (n: number) => n.toLocaleString("es-UY");

function BuscaCodigo() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) navigate({ to: "/loja", search: { q: q.trim() } as never });
      }}
      className="grid gap-2.5 md:grid-cols-[1fr_auto] md:gap-3"
    >
      <label className="relative block">
        <span className="sr-only">Código o nombre de la pieza</span>
        <Hash className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Código original, equivalente o nombre (ej.: N 5033, pastilla de freno)"
          className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-12 pr-4 text-[15px] font-medium text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>
      <button
        type="submit"
        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-[15px] font-bold text-white shadow-lg shadow-orange-600/25 transition hover:brightness-110 active:scale-[0.98]"
      >
        <Search className="h-5 w-5" /> Buscar
      </button>
    </form>
  );
}

function Hero() {
  const [aba, setAba] = useState<"veiculo" | "codigo">("veiculo");
  const abaCls = (ativa: boolean) =>
    cn(
      "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold transition md:flex-none md:px-5",
      ativa ? "bg-white text-primary shadow" : "text-white/80 hover:bg-white/10 hover:text-white",
    );
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#081530] via-[#0f2850] to-[#173a72] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:32px_32px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-accent/25 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 md:pb-16 md:pt-14">
        <div className="max-w-3xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-orange-200 ring-1 ring-white/15">
            <BadgeCheck className="h-3.5 w-3.5" /> Más de 100.000 repuestos con código original
          </p>
          <h1 className="text-[28px] font-extrabold leading-[1.1] tracking-tight md:text-5xl">
            Repuestos para tu auto,
            <span className="block bg-gradient-to-r from-orange-300 to-accent bg-clip-text text-transparent">
              con envío a todo Uruguay
            </span>
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] text-white/75 md:text-lg">
            Elegí tu vehículo y te mostramos solo las piezas que le sirven: frenos, suspensión,
            motor, embrague, eléctrica y mucho más.
          </p>
        </div>

        <div className="mt-6 max-w-5xl rounded-2xl bg-white/10 p-2 ring-1 ring-white/15 backdrop-blur md:mt-8 md:p-3">
          <div className="mb-2 flex gap-1 rounded-xl bg-black/20 p-1 md:mb-3 md:inline-flex">
            <button
              type="button"
              className={abaCls(aba === "veiculo")}
              onClick={() => setAba("veiculo")}
            >
              <Car className="h-4 w-4" /> Por vehículo
            </button>
            <button
              type="button"
              className={abaCls(aba === "codigo")}
              onClick={() => setAba("codigo")}
            >
              <Hash className="h-4 w-4" /> Por código
            </button>
          </div>
          <div className="rounded-xl bg-white p-3 md:p-4">
            {aba === "veiculo" ? <BuscaVeiculo /> : <BuscaCodigo />}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
          <span className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-orange-300" /> Envíos a todo el país
          </span>
          <span className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-orange-300" /> Cotización por WhatsApp
          </span>
          <button
            type="button"
            onClick={abrirFotoPieza}
            className="flex items-center gap-2 underline-offset-4 hover:text-white hover:underline"
          >
            <Camera className="h-4 w-4 text-orange-300" /> ¿Sin código? Mandanos una foto
          </button>
        </div>
      </div>
    </section>
  );
}

function Titulo({
  titulo,
  sub,
  link,
}: {
  titulo: string;
  sub?: string;
  link?: { to: string; texto: string; search?: object };
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 md:mb-6">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 md:text-2xl">
          {titulo}
        </h2>
        {sub && <p className="mt-1 text-sm text-zinc-500">{sub}</p>}
      </div>
      {link && (
        <Link
          to={link.to}
          search={link.search as never}
          className="flex shrink-0 items-center gap-1 text-sm font-bold text-primary hover:underline"
        >
          {link.texto} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function Categorias() {
  const categorias = useCategoriasLoja();
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
      <Titulo
        titulo="Comprá por categoría"
        sub="Todo lo que tu vehículo necesita, organizado por sistema"
        link={{ to: "/loja", texto: "Ver todo" }}
      />
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:gap-4 lg:grid-cols-6">
        {categorias.slice(0, 12).map((c) => (
          <Link
            key={c.nome}
            to="/loja"
            search={{ categoria: c.nome } as never}
            className="group flex flex-col items-center gap-2.5 rounded-2xl border border-zinc-200/80 bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg md:p-5"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/[0.07] text-primary transition group-hover:bg-accent group-hover:text-white md:h-14 md:w-14">
              <c.icon className="h-6 w-6 md:h-7 md:w-7" strokeWidth={1.8} />
            </span>
            <span className="text-[13px] font-bold leading-tight text-zinc-800 md:text-sm">
              {c.curto}
            </span>
            {c.total > 0 && (
              <span className="-mt-1.5 text-[11px] font-medium text-zinc-400">
                {num(c.total)} piezas
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

// Monograma de la marca (sin usar logotipos de terceros)
function MarcasVeiculo() {
  return (
    <section className="border-y border-zinc-200/70 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <Titulo
          titulo="Buscá por marca de vehículo"
          sub="Autos, camionetas, utilitarios y camiones"
        />
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-8 md:gap-3">
          {MARCAS_VEICULO.map((m) => (
            <Link
              key={m.valor}
              to="/loja"
              search={{ auto: m.valor } as never}
              className="group flex flex-col items-center gap-2 rounded-xl border border-zinc-200/80 bg-zinc-50/60 px-2 py-3.5 transition hover:border-accent/40 hover:bg-white hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-[15px] font-extrabold tracking-tight text-white shadow-inner transition group-hover:bg-accent">
                {siglaMarca(m)}
              </span>
              <span className="text-[13px] font-semibold text-zinc-700">{m.nome}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function MarcasPecas() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 md:pb-14">
      <Titulo titulo="Marcas de repuestos" sub="Trabajamos con los principales fabricantes" />
      <div className="flex flex-wrap gap-2 md:gap-3">
        {MARCAS_PECAS.map((m) => (
          <Link
            key={m}
            to="/loja"
            search={{ marca: m } as never}
            className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-[15px] font-extrabold tracking-tight text-zinc-700 shadow-sm transition hover:border-primary/40 hover:text-primary"
          >
            {m}
          </Link>
        ))}
      </div>
    </section>
  );
}

function Beneficios() {
  const itens = [
    { icon: Truck, titulo: "Envíos a todo Uruguay", texto: "Despachamos por agencia a tu ciudad." },
    {
      icon: MessageCircle,
      titulo: "Asesoramiento por WhatsApp",
      texto: `Te ayudamos a encontrar la pieza · ${PHONE_DISPLAY}`,
    },
    {
      icon: BadgeCheck,
      titulo: "Código original y equivalentes",
      texto: "Cada pieza con su código y aplicaciones.",
    },
    { icon: ShieldCheck, titulo: "Compra segura", texto: "Pagá online o coordiná con nosotros." },
  ];
  return (
    <section className="bg-gradient-to-r from-[#081530] to-primary text-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 md:py-12 lg:grid-cols-4">
        {itens.map((i) => (
          <div key={i.titulo} className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-orange-300 ring-1 ring-white/15">
              <i.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold">{i.titulo}</p>
              <p className="mt-0.5 text-sm text-white/70">{i.texto}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ChamadaWhatsapp() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
      <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/70 md:flex-row md:items-center md:p-10">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-zinc-900 md:text-2xl">
            ¿No encontrás la pieza?
          </h2>
          <p className="mt-1 max-w-xl text-zinc-600">
            Mandanos el modelo de tu vehículo, el código o una foto del repuesto y te respondemos
            con precio y disponibilidad.
          </p>
        </div>
        <a
          href={whatsappContactUrl("¡Hola! Busco un repuesto para mi vehículo.")}
          target="_blank"
          rel="noreferrer noopener"
          className="flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-bold text-white shadow-lg shadow-green-600/20 transition hover:brightness-105"
        >
          <MessageCircle className="h-5 w-5" /> Consultar por WhatsApp
        </a>
      </div>
    </section>
  );
}

export function HomeAutos({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <Hero />
      <Categorias />
      <MarcasVeiculo />
      <SlidersHome />
      <MarcasPecas />
      <Beneficios />
      {children}
      <ChamadaWhatsapp />
    </>
  );
}
