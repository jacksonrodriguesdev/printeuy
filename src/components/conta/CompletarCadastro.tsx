// Boas-vindas depois do primeiro login (/cuenta?completar=1): um passo só (nome, celular/WhatsApp e
// departamento). Ao salvar, volta direto para onde a pessoa estava (ex.: a cotização ou o produto);
// sem destino, mostra a tela "¡Listo!". O endereço de envio fica para depois, em "Mi cuenta".
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Loader2, MapPin, MessageCircle, User } from "lucide-react";
import { Campo, CampoCelular, inputCls } from "@/components/auth/AuthShell";
import { salvarPerfilFn, type Perfil } from "@/lib/conta";
import { DEPARTAMENTOS_UY, mascararCelularUY } from "@/lib/validacao-conta";
import { cn } from "@/lib/utils";

export function CompletarCadastro({ perfil, destino }: { perfil: Perfil; destino?: string }) {
  const [pronto, setPronto] = useState(false);
  const [nome, setNome] = useState(perfil.nome_completo);
  const [tel, setTel] = useState(mascararCelularUY(perfil.telefone || ""));
  const [depto, setDepto] = useState(perfil.departamento || "");
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const primeiroNome = nome.trim().split(" ")[0];
  // Volta para onde a pessoa estava (ex.: a cotização), menos a própria conta
  const voltar = destino && !destino.startsWith("/cuenta") ? destino : null;

  const salvarDados = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setBusy(true);
    try {
      await salvarPerfilFn({
        data: {
          nome_completo: nome,
          telefone: tel,
          departamento: depto,
          cidade: perfil.cidade || "",
          endereco: perfil.endereco || "",
          numero_casa: perfil.numero_casa || "",
          ponto_referencia: perfil.ponto_referencia || "",
          cep: perfil.cep || "",
          recebe_emails: perfil.recebe_emails,
        },
      });
      if (voltar) {
        window.location.assign(voltar);
        return;
      }
      setPronto(true);
    } catch (err: any) {
      setErro(err?.message || "No pudimos guardar. Probá de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-zinc-100">
      <div aria-hidden className="absolute inset-x-0 top-0 h-[260px] bg-zinc-900">
        <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#fcd12d]/25 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-lg px-4 pb-24 pt-safe">
        {/* Topo: foto e saudação */}
        <div className="flex items-center gap-3 py-6 text-white">
          {perfil.avatar_url ? (
            <img
              src={perfil.avatar_url}
              alt=""
              referrerPolicy="no-referrer"
              className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white/25"
            />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fcd12d] text-lg font-black text-zinc-900">
              {(primeiroNome[0] || "U").toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-xl font-black">
              ¡Bienvenido{primeiroNome ? `, ${primeiroNome}` : ""}!
            </p>
            <p className="text-sm text-white/70">
              {pronto ? "Tu cuenta está lista." : "Un paso rápido y listo."}
            </p>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)] ring-1 ring-black/5 sm:p-8">
          {!pronto && (
            <form onSubmit={salvarDados} className="space-y-4" noValidate>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-zinc-900">
                  ¿Cómo te contactamos?
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                  Te respondemos por WhatsApp con la cotización de tus impresos.
                </p>
              </div>
              <Campo id="c-nome" label="Tu nombre" icone={User}>
                <input
                  id="c-nome"
                  autoComplete="name"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={inputCls()}
                />
              </Campo>
              <Campo id="c-tel" label="Celular (WhatsApp)">
                <CampoCelular id="c-tel" value={tel} onChange={setTel} />
              </Campo>
              <Campo id="c-depto" label="Departamento" icone={MapPin}>
                <select
                  id="c-depto"
                  value={depto}
                  onChange={(e) => setDepto(e.target.value)}
                  className={cn(inputCls(), "appearance-none")}
                >
                  <option value="">Elegí tu departamento…</option>
                  {DEPARTAMENTOS_UY.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </Campo>
              {erro && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-100"
                >
                  {erro}
                </p>
              )}
              <button
                type="submit"
                disabled={busy || nome.trim().length < 3 || tel.replace(/\D/g, "").length < 8}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3.5 text-base font-black text-white shadow-lg transition hover:bg-zinc-800 active:scale-[0.99] disabled:opacity-50 disabled:shadow-none"
              >
                {busy ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ArrowRight className="h-5 w-5" />
                )}
                {voltar ? "Guardar y seguir con mi cotización" : "Guardar"}
              </button>
            </form>
          )}

          {pronto && (
            <div className="text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                <Check className="h-8 w-8" strokeWidth={3} />
              </span>
              <h1 className="mt-4 text-2xl font-black tracking-tight text-zinc-900">¡Listo!</h1>
              <p className="mt-1 text-sm text-zinc-500">
                Ya podés pedir la cotización de tus impresos en un clic.
              </p>
              <div className="mt-6 grid gap-2.5">
                <Link
                  to="/loja"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3.5 font-black text-white shadow-lg hover:bg-zinc-800"
                >
                  Ver productos <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/cuenta"
                  className="rounded-2xl bg-zinc-100 py-3.5 font-bold text-zinc-900 hover:bg-zinc-200"
                >
                  Ir a mi cuenta
                </Link>
              </div>
              <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
                <MessageCircle className="h-3.5 w-3.5" /> La dirección de envío la cargás cuando
                hagas tu primer pedido.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
