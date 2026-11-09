import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Mail, Lock, Loader2, MessageCircle, ArrowRight } from "lucide-react";
import {
  AuthShell,
  Campo,
  CampoSenha,
  BotaoGoogle,
  Separador,
  inputCls,
} from "@/components/auth/AuthShell";
import { getConfigLoginFn } from "@/lib/conta";
import { BotaoPasskey } from "@/components/auth/Passkey";
import { whatsappContactUrl } from "@/lib/whatsapp";
import { tr, useT, type Idioma } from "@/lib/idioma";

const ERROS: Record<string, [string, string]> = {
  google: [
    "No pudimos ingresar con Google. Probá de nuevo.",
    "Não conseguimos entrar com o Google. Tente de novo.",
  ],
  google_cancelado: ["Cancelaste el ingreso con Google.", "Você cancelou a entrada com o Google."],
  google_no_configurado: [
    "El ingreso con Google todavía no está disponible.",
    "A entrada com o Google ainda não está disponível.",
  ],
};

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional(), erro: z.string().optional() }),
  loader: () => getConfigLoginFn(),
  head: ({ match }) => ({
    meta: [
      {
        title: tr(
          (match.context?.idioma ?? "es") as Idioma,
          "Ingresar — PRINTE UY",
          "Entrar — PRINTE UY",
        ),
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect, erro } = Route.useSearch();
  const config = Route.useLoaderData();
  const { t, idioma, href } = useT();
  // Em português, o retorno depois de entrar também fica na versão /pt
  const destino = href(redirect || "/cuenta");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(
    erro && ERROS[erro] ? t(ERROS[erro][0], ERROS[erro][1]) : null,
  );
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-idioma": idioma },
        credentials: "include",
        body: JSON.stringify({ email, senha, redirect: destino }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Recarrega para o header e o resto do site pegarem a sessão
        window.location.href = data.destino || destino;
        return;
      }
      setError(data.error || t("E-mail o contraseña incorrectos.", "E-mail ou senha incorretos."));
    } catch {
      setError(t("Sin conexión. Probá de nuevo.", "Sem conexão. Tente de novo."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      aba="login"
      redirect={destino}
      titulo={t("¡Hola de nuevo!", "Olá de novo!")}
      subtitulo={t(
        "Ingresá para cotizar más rápido y ver tus pedidos.",
        "Entre para pedir orçamento mais rápido e ver seus pedidos.",
      )}
    >
      {/* Face ID / digital: some nos navegadores sem suporte */}
      <BotaoPasskey
        redirect={destino}
        aoErro={setError}
        className="mb-3"
        depois={config.google ? undefined : <Separador />}
      />
      {config.google && (
        <>
          <BotaoGoogle redirect={destino} />
          <Separador />
        </>
      )}
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Campo id="email" label="E-mail" icone={Mail}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={t("tu@email.com", "seu@email.com")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputCls()}
          />
        </Campo>
        <Campo id="senha" label={t("Contraseña", "Senha")} icone={Lock}>
          <CampoSenha
            id="senha"
            autoComplete="current-password"
            placeholder={t("Tu contraseña", "Sua senha")}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </Campo>
        <div className="flex justify-end">
          <a
            href={whatsappContactUrl(
              t(
                "¡Hola! Olvidé mi contraseña de PRINTE UY. Mi e-mail es: ",
                "Olá! Esqueci minha senha da PRINTE UY. Meu e-mail é: ",
              ),
            )}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            <MessageCircle className="h-4 w-4" />{" "}
            {t("¿Olvidaste tu contraseña?", "Esqueceu a senha?")}
          </a>
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-100"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || !email || !senha}
          className="group flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3.5 text-base font-black text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600 active:scale-[0.99] disabled:opacity-50 disabled:shadow-none"
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
          )}
          {busy ? t("Ingresando…", "Entrando…") : t("Ingresar", "Entrar")}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        {t("¿Primera vez?", "Primeira vez?")}{" "}
        <Link
          to="/cadastro"
          search={{ redirect: destino } as never}
          className="font-bold text-[#0b1d3a] underline decoration-orange-400 decoration-2 underline-offset-4 hover:text-orange-600"
        >
          {t("Creá tu cuenta en 30 segundos", "Crie sua conta em 30 segundos")}
        </Link>
      </p>
    </AuthShell>
  );
}
