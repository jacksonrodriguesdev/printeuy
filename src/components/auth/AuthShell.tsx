import { useState, type ReactNode, type InputHTMLAttributes } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, Check, MessageCircle, Search, PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/idioma";
import { whatsappContactUrl, PHONE_DISPLAY } from "@/lib/whatsapp";
import { avaliarSenha, mascararCelularUY } from "@/lib/validacao-conta";

// "o" / "ou" entre o botão do Google e o formulário
function SeparadorTexto() {
  const { t } = useT();
  return <>{t("o", "ou")}</>;
}

// Moldura das telas de conta (login e cadastro): faixa azul com a "estrada" no topo, um cartão
// único centralizado com abas Ingresar / Crear cuenta e, no computador, um painel laranja ao lado
// com o que a conta oferece. No celular o cartão ocupa a largura toda.
export function AuthShell({
  titulo,
  subtitulo,
  aba,
  redirect,
  children,
}: {
  titulo: string;
  subtitulo: string;
  aba?: "login" | "cadastro";
  redirect?: string;
  children: ReactNode;
}) {
  const { t } = useT();
  const busca = redirect ? ({ redirect } as never) : undefined;
  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-slate-100">
      {/* Faixa do topo: asfalto azul com a linha da estrada */}
      <div aria-hidden className="absolute inset-x-0 top-0 h-[300px] bg-[#0b1d3a] sm:h-[340px]">
        <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="absolute inset-x-0 bottom-16 h-[6px] [background-image:repeating-linear-gradient(90deg,#f59e0b_0_48px,transparent_48px_96px)] opacity-80" />
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-orange-500/25 blur-3xl" />
        <div className="absolute -right-20 top-10 h-64 w-64 rounded-full bg-sky-400/15 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[100dvh] max-w-[1040px] flex-col px-4 pb-24 pt-safe sm:px-6">
        {/* Barra superior */}
        <div className="flex items-center justify-between py-5 text-white">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="" width={44} height={44} className="h-11 w-11" />
            <span className="leading-none">
              <span className="block text-lg font-black tracking-tight">PRINTE UY</span>
              <span className="mt-1 block text-[11px] font-bold tracking-[0.22em] text-amber-400">
                {t("REPUESTOS PARA AUTOS", "AUTOPEÇAS")}
              </span>
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t("Volver a la tienda", "Voltar à loja")}</span>
            <span className="sm:hidden">{t("Tienda", "Loja")}</span>
          </Link>
        </div>

        {/* Cartão */}
        <div className="mt-4 grid overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_-30px_rgba(11,29,58,0.45)] ring-1 ring-black/5 sm:mt-8 lg:grid-cols-[1fr_380px]">
          <main className="p-6 sm:p-10">
            {aba && (
              <div className="mb-7 grid grid-cols-2 rounded-2xl bg-slate-100 p-1.5 text-[15px] font-bold">
                <Link
                  to="/login"
                  search={busca}
                  className={cn(
                    "rounded-xl py-2.5 text-center transition",
                    aba === "login"
                      ? "bg-white text-[#0b1d3a] shadow-sm"
                      : "text-slate-500 hover:text-slate-800",
                  )}
                >
                  {t("Ingresar", "Entrar")}
                </Link>
                <Link
                  to="/cadastro"
                  search={busca}
                  className={cn(
                    "rounded-xl py-2.5 text-center transition",
                    aba === "cadastro"
                      ? "bg-white text-[#0b1d3a] shadow-sm"
                      : "text-slate-500 hover:text-slate-800",
                  )}
                >
                  {t("Crear cuenta", "Criar conta")}
                </Link>
              </div>
            )}
            <h1 className="text-[28px] font-black leading-tight tracking-tight text-[#0b1d3a] sm:text-[32px]">
              {titulo}
            </h1>
            <p className="mb-7 mt-1.5 text-slate-500">{subtitulo}</p>
            {children}
          </main>

          {/* Painel lateral */}
          <aside className="relative hidden overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 p-9 text-white lg:flex lg:flex-col">
            <svg
              aria-hidden
              viewBox="0 0 200 200"
              className="absolute -bottom-16 -right-16 h-72 w-72 text-white/15"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
            >
              <circle cx="100" cy="100" r="80" />
              <circle cx="100" cy="100" r="28" />
              {[0, 60, 120, 180, 240, 300].map((g) => (
                <line
                  key={g}
                  x1="100"
                  y1="72"
                  x2="100"
                  y2="24"
                  transform={`rotate(${g} 100 100)`}
                />
              ))}
            </svg>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/80">
              {t("Tu cuenta", "Sua conta")}
            </p>
            <p className="mt-2 text-[26px] font-black leading-tight">
              {t("Tu garaje online", "Sua garagem online")}
            </p>
            <ul className="relative mt-7 space-y-4">
              {[
                [
                  Search,
                  t("Guardá tu vehículo", "Salve seu veículo"),
                  t("y encontrá repuestos que le sirven", "e ache peças que servem"),
                ],
                [
                  MessageCircle,
                  t("Cotizá en 1 clic", "Orçamento em 1 clique"),
                  t("por WhatsApp, con tus datos", "pelo WhatsApp, com seus dados"),
                ],
                [
                  PackageCheck,
                  t("Seguí tus pedidos", "Acompanhe seus pedidos"),
                  t("y tu historial de compras", "e seu histórico"),
                ],
              ].map(([Icone, forte, resto]: any) => (
                <li key={forte} className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                    <Icone className="h-5 w-5" />
                  </span>
                  <span className="pt-0.5 text-[15px] leading-snug">
                    <b className="block">{forte}</b>
                    <span className="text-white/85">{resto}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="relative mt-auto rounded-2xl bg-[#0b1d3a]/90 p-4">
              <p className="text-3xl font-black">+100.000</p>
              <p className="text-sm text-white/75">
                {t("repuestos con envío a todo Uruguay", "peças com envio para todo o Uruguai")}
              </p>
            </div>
          </aside>
        </div>

        {/* Ajuda */}
        <a
          href={whatsappContactUrl(
            t("¡Hola! Necesito ayuda con mi cuenta.", "Olá! Preciso de ajuda com minha conta."),
          )}
          target="_blank"
          rel="noreferrer noopener"
          className="mx-auto mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#0b1d3a]"
        >
          <MessageCircle className="h-4 w-4 text-emerald-600" />
          {t("¿Problemas para ingresar? WhatsApp", "Problemas para entrar? WhatsApp")}{" "}
          {PHONE_DISPLAY}
        </a>
      </div>
    </div>
  );
}

export function Campo({
  id,
  label,
  icone: Icone,
  erro,
  dica,
  children,
}: {
  id: string;
  label: string;
  icone?: any;
  erro?: string | null;
  dica?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-zinc-700">
        {label}
      </label>
      <div className="relative">
        {Icone && (
          <Icone className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
        )}
        {children}
      </div>
      {erro ? (
        <p className="mt-1.5 text-[13px] font-medium text-red-600">{erro}</p>
      ) : dica ? (
        <div className="mt-1.5 text-[13px] text-zinc-500">{dica}</div>
      ) : null}
    </div>
  );
}

export const inputCls = (comIcone = true, invalido = false) =>
  cn(
    "h-12 w-full rounded-xl border bg-zinc-50/60 pr-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:bg-white focus:ring-4",
    comIcone ? "pl-11" : "pl-4",
    invalido
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-zinc-200 focus:border-primary focus:ring-primary/15",
  );

// Senha com o "olho" para mostrar/esconder
export function CampoSenha(props: InputHTMLAttributes<HTMLInputElement> & { invalido?: boolean }) {
  const [ver, setVer] = useState(false);
  const { t } = useT();
  const { invalido, className, ...resto } = props;
  return (
    <>
      <input
        {...resto}
        type={ver ? "text" : "password"}
        className={cn(inputCls(true, invalido), "pr-12", className)}
      />
      <button
        type="button"
        onClick={() => setVer((v) => !v)}
        aria-label={
          ver ? t("Ocultar contraseña", "Ocultar senha") : t("Mostrar contraseña", "Mostrar senha")
        }
        aria-pressed={ver}
        className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
      >
        {ver ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </>
  );
}

// Celular uruguaio: prefixo +598 fixo e máscara 9X XXX XXX
export function CampoCelular({
  value,
  onChange,
  id,
  invalido,
}: {
  value: string;
  onChange: (v: string) => void;
  id: string;
  invalido?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-12 overflow-hidden rounded-xl border bg-zinc-50/60 transition focus-within:bg-white focus-within:ring-4",
        invalido
          ? "border-red-300 focus-within:ring-red-100"
          : "border-zinc-200 focus-within:border-primary focus-within:ring-primary/15",
      )}
    >
      <span className="flex items-center gap-1.5 border-r border-zinc-200 bg-zinc-100/70 px-3 text-sm font-semibold text-zinc-600">
        <svg viewBox="0 0 27 18" className="h-3.5 w-5 rounded-[2px]" aria-hidden>
          <rect width="27" height="18" fill="#fff" />
          {[2, 6, 10, 14].map((y) => (
            <rect key={y} y={y} width="27" height="2" fill="#0038A8" />
          ))}
          <rect width="10" height="10" fill="#fff" />
          <circle cx="5" cy="5" r="3" fill="#FCD116" />
        </svg>
        +598
      </span>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="9X XXX XXX"
        value={value}
        onChange={(e) => onChange(mascararCelularUY(e.target.value))}
        className="min-w-0 flex-1 bg-transparent px-3 text-base tracking-wide text-zinc-900 outline-none placeholder:text-zinc-400"
      />
    </div>
  );
}

export function ForcaSenha({ senha }: { senha: string }) {
  const { idioma } = useT();
  if (!senha) return null;
  const { nivel, regras } = avaliarSenha(senha);
  const cores = ["bg-red-500", "bg-orange-500", "bg-accent", "bg-lime-500", "bg-emerald-600"];
  const nomes =
    idioma === "pt"
      ? ["Muito fraca", "Fraca", "Aceitável", "Boa", "Excelente"]
      : ["Muy débil", "Débil", "Aceptable", "Buena", "Excelente"];
  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition",
              i < nivel ? cores[nivel] : "bg-zinc-200",
            )}
          />
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
        <span className="font-semibold text-zinc-700">{nomes[nivel]}</span>
        {regras.map((r) => (
          <span
            key={r.texto}
            className={cn(
              "inline-flex items-center gap-1",
              r.ok ? "text-emerald-700" : "text-zinc-400",
            )}
          >
            <Check className="h-3 w-3" />
            {r.texto}
          </span>
        ))}
      </div>
    </div>
  );
}

export function BotaoGoogle({ redirect, texto }: { redirect: string; texto?: string }) {
  const { t } = useT();
  return (
    <a
      href={`/api/auth/google?redirect=${encodeURIComponent(redirect)}`}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-zinc-300 bg-white text-[15px] font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 active:scale-[0.99]"
    >
      <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
        />
        <path
          fill="#FF3D00"
          d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
        />
        <path
          fill="#f26b1d"
          d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
        />
      </svg>
      {texto ?? t("Continuar con Google", "Continuar com Google")}
    </a>
  );
}

export const Separador = () => (
  <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
    <span className="h-px flex-1 bg-zinc-200" />
    <SeparadorTexto />
    <span className="h-px flex-1 bg-zinc-200" />
  </div>
);
