// Boas-vindas depois do primeiro login (/cuenta?completar=1): 2 passos curtos e uma tela final.
// 1) nome, celular (WhatsApp) e departamento; 2) o vehículo (opcional); 3) pronto.
// O endereço de envio fica para depois, em "Mi cuenta".
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Car, Check, Loader2, MapPin, MessageCircle, User } from "lucide-react";
import { Campo, CampoCelular, inputCls } from "@/components/auth/AuthShell";
import { BuscaVeiculo, rotuloVeiculo, type MeuVeiculo } from "@/components/BuscaVeiculo";
import { salvarPerfilFn, type Perfil } from "@/lib/conta";
import { DEPARTAMENTOS_UY, mascararCelularUY } from "@/lib/validacao-conta";
import { cn } from "@/lib/utils";

export function CompletarCadastro({ perfil, destino }: { perfil: Perfil; destino?: string }) {
  const [passo, setPasso] = useState<1 | 2 | 3>(1);
  const [nome, setNome] = useState(perfil.nome_completo);
  const [tel, setTel] = useState(mascararCelularUY(perfil.telefone || ""));
  const [depto, setDepto] = useState(perfil.departamento || "");
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [auto, setAuto] = useState<MeuVeiculo | null>(null);
  const primeiroNome = nome.trim().split(" ")[0];
  // Volta para onde a pessoa estava (ex.: a página da peça), menos a própria conta
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
      setPasso(2);
    } catch (err: any) {
      setErro(err?.message || "No pudimos guardar. Probá de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-slate-100">
      <div aria-hidden className="absolute inset-x-0 top-0 h-[260px] bg-[#0b1d3a]">
        <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="absolute inset-x-0 bottom-14 h-[6px] [background-image:repeating-linear-gradient(90deg,#f59e0b_0_48px,transparent_48px_96px)] opacity-80" />
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-orange-500/25 blur-3xl" />
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
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-lg font-black text-[#0b1d3a]">
              {(primeiroNome[0] || "U").toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-xl font-black">
              ¡Bienvenido{primeiroNome ? `, ${primeiroNome}` : ""}!
            </p>
            <p className="text-sm text-white/70">
              {passo < 3 ? "Dos pasos rápidos y listo." : "Tu cuenta está lista."}
            </p>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-[0_30px_80px_-30px_rgba(11,29,58,0.45)] ring-1 ring-black/5 sm:p-8">
          {/* Progresso */}
          {passo < 3 && (
            <div className="mb-6 flex items-center gap-2">
              {[1, 2].map((n) => (
                <div key={n} className="flex flex-1 items-center gap-2">
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black transition",
                      passo > n
                        ? "bg-emerald-500 text-white"
                        : passo === n
                          ? "bg-orange-500 text-white"
                          : "bg-slate-100 text-slate-400",
                    )}
                  >
                    {passo > n ? <Check className="h-4 w-4" /> : n}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-bold",
                      passo >= n ? "text-[#0b1d3a]" : "text-slate-400",
                    )}
                  >
                    {n === 1 ? "Tus datos" : "Tu auto"}
                  </span>
                  {n === 1 && (
                    <span
                      className={cn(
                        "h-1 flex-1 rounded-full",
                        passo > 1 ? "bg-emerald-500" : "bg-slate-100",
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {passo === 1 && (
            <form onSubmit={salvarDados} className="space-y-4" noValidate>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-[#0b1d3a]">
                  ¿Cómo te contactamos?
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Te respondemos por WhatsApp con el precio de tus impresos.
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
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3.5 text-base font-black text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600 active:scale-[0.99] disabled:opacity-50 disabled:shadow-none"
              >
                {busy ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ArrowRight className="h-5 w-5" />
                )}
                Continuar
              </button>
            </form>
          )}

          {passo === 2 && (
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#0b1d3a]">
                ¿Qué auto tenés?
              </h1>
              <p className="mb-5 mt-1 text-sm text-slate-500">
                Lo guardamos para mostrarte solo los repuestos que le sirven.
              </p>
              <BuscaVeiculo
                variante="compacta"
                rotuloBotao="Guardar mi auto"
                aoBuscar={(v) => {
                  setAuto(v);
                  setPasso(3);
                }}
              />
              <button
                type="button"
                onClick={() => setPasso(3)}
                className="mt-3 w-full py-2 text-center text-sm font-semibold text-slate-500 hover:text-[#0b1d3a]"
              >
                Saltar por ahora
              </button>
            </div>
          )}

          {passo === 3 && (
            <div className="text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                <Check className="h-8 w-8" strokeWidth={3} />
              </span>
              <h1 className="mt-4 text-2xl font-black tracking-tight text-[#0b1d3a]">¡Listo!</h1>
              <p className="mt-1 text-sm text-slate-500">
                {auto
                  ? `Guardamos tu ${rotuloVeiculo(auto)}.`
                  : "Ya podés cotizar repuestos en un clic."}
              </p>
              <div className="mt-6 grid gap-2.5">
                {voltar ? (
                  <a
                    href={voltar}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3.5 font-black text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600"
                  >
                    Seguir donde estaba <ArrowRight className="h-5 w-5" />
                  </a>
                ) : (
                  <Link
                    to="/loja"
                    search={(auto ?? {}) as never}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3.5 font-black text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600"
                  >
                    <Car className="h-5 w-5" />
                    {auto ? "Ver repuestos para mi auto" : "Ver repuestos"}
                  </Link>
                )}
                <Link
                  to="/cuenta"
                  className="rounded-2xl bg-slate-100 py-3.5 font-bold text-[#0b1d3a] hover:bg-slate-200"
                >
                  Ir a mi cuenta
                </Link>
              </div>
              <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-400">
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
