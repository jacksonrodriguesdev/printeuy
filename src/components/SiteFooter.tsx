import { Link } from "@tanstack/react-router";
import {
  Mail,
  Instagram,
  Facebook,
  Lock,
  Truck,
  MessageCircle,
  Printer,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { whatsappContactUrl, PHONE_DISPLAY } from "@/lib/whatsapp";
import { CATEGORIAS, INSTAGRAM_URL, INSTAGRAM_USUARIO, FACEBOOK_URL } from "@/lib/navegacao";
import { BandeiraUruguay } from "@/components/Bandeiras";
import { useT } from "@/lib/idioma";
import { SeletorIdioma } from "@/components/SeletorIdioma";
import { CartaoApp } from "@/components/AppInstalavel";

const AYUDA = [
  { label: ["Cómo comprar", "Como comprar"], hash: "como-comprar" },
  { label: ["Envíos a Uruguay", "Envios"], hash: "envios" },
  { label: ["Formas de pago", "Formas de pagamento"], hash: "pagos" },
  { label: ["Garantía y devoluciones", "Garantia e trocas"], hash: "garantia" },
  { label: ["Preguntas frecuentes", "Perguntas frequentes"], hash: "preguntas" },
] as const;

const tituloCls = "mb-4 text-xs font-black uppercase tracking-[0.18em] text-amber-400";
const linkCls = "text-slate-300 transition-colors hover:text-white";

export function SiteFooter() {
  const { t } = useT();
  const zap = whatsappContactUrl(
    t("¡Hola! Quiero cotizar una impresión.", "Olá! Quero orçar uma impressão."),
  );
  return (
    <footer className="mt-auto bg-[#0b1d3a] text-sm">
      {/* Chamada do WhatsApp */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-white">
            <p className="text-xl font-black leading-tight sm:text-2xl">
              {t("¿Necesitás algo especial?", "Precisa de algo especial?")}
            </p>
            <p className="mt-1 text-white/90">
              {t(
                "Contanos qué querés imprimir, la cantidad y la medida, y te pasamos el precio.",
                "Conte o que quer imprimir, a quantidade e a medida, e passamos o preço.",
              )}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <a
              data-livre="1"
              href={zap}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0b1d3a] px-5 py-3 font-bold text-white shadow-lg transition hover:bg-[#13294f]"
            >
              <MessageCircle className="h-5 w-5 text-emerald-400" />
              WhatsApp {PHONE_DISPLAY}
            </a>
            <Link
              to="/cotizar"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-[#0b1d3a] transition hover:bg-orange-50"
            >
              {t("Pedir cotización", "Pedir orçamento")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Colunas */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <img
              decoding="async"
              loading="lazy"
              src="/logo.svg"
              alt=""
              width={48}
              height={48}
              className="h-12 w-12"
            />
            <span className="leading-none">
              <span className="block text-xl font-black tracking-tight text-white">PRINTE UY</span>
              <span className="mt-1 block text-[11px] font-bold tracking-[0.22em] text-amber-400">
                {t("IMPRENTA ONLINE", "GRÁFICA ONLINE")}
              </span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm leading-relaxed text-slate-400">
            {t(
              "Tarjetas, adhesivos, packaging, volantes y regalos empresariales con tu marca. Precio al instante y envíos a todo Uruguay.",
              "Cartões, adesivos, embalagens, panfletos e brindes com a sua marca, com envio para todo o Uruguai.",
            )}
          </p>
          <Link
            to="/loja"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 font-bold text-white ring-1 ring-white/10 transition hover:bg-white/10"
          >
            <Printer className="h-5 w-5 text-amber-400" />
            {t("Ver todos los productos", "Ver todos os produtos")}
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </Link>
          <CartaoApp />
        </div>

        <div>
          <h3 className={tituloCls}>{t("Tienda", "Loja")}</h3>
          <ul className="space-y-2.5">
            <li>
              <Link to="/loja" className={linkCls}>
                {t("Todos los productos", "Todos os produtos")}
              </Link>
            </li>
            {CATEGORIAS.slice(0, 6).map((c) => (
              <li key={c.nome}>
                <Link to="/loja" search={{ categoria: c.nome } as never} className={linkCls}>
                  {c.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className={tituloCls}>{t("Ayuda", "Ajuda")}</h3>
          <ul className="space-y-2.5">
            {AYUDA.map((a) => (
              <li key={a.hash}>
                <Link to="/ayuda" hash={a.hash} className={linkCls}>
                  {t(a.label[0], a.label[1])}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/cuenta" className={linkCls}>
                {t("Mi cuenta", "Minha conta")}
              </Link>
            </li>
            <li>
              <Link to={"/privacidad" as never} className={linkCls}>
                {t("Política de privacidad", "Política de privacidade")}
              </Link>
            </li>
            <li>
              <Link to={"/eliminar-datos" as never} className={linkCls}>
                {t("Eliminación de datos", "Exclusão de dados")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className={tituloCls}>{t("Contacto", "Contato")}</h3>
          <ul className="space-y-3">
            <li>
              <a
                data-livre="1"
                href={zap}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 p-3 ring-1 ring-emerald-400/20 transition hover:bg-emerald-500/20"
              >
                <MessageCircle className="h-5 w-5 shrink-0 text-emerald-400" />
                <span className="leading-tight">
                  <span className="block text-xs text-slate-400">WhatsApp</span>
                  <span className="font-bold text-white">{PHONE_DISPLAY}</span>
                </span>
              </a>
            </li>
            <li>
              <a
                href="mailto:contacto@printecuy.com"
                className="flex items-center gap-2 break-all text-slate-300 hover:text-white"
              >
                <Mail className="h-4 w-4 shrink-0 text-amber-400" /> contacto@printecuy.com
              </a>
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <BandeiraUruguay className="h-3.5 w-5 shrink-0 rounded-[2px]" />
              {t("Envíos a todo Uruguay", "Envio para todo o Uruguai")}
            </li>
          </ul>
          {(INSTAGRAM_URL || FACEBOOK_URL) && (
            <div className="mt-5 flex gap-2">
              {INSTAGRAM_URL && (
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Instagram ${INSTAGRAM_USUARIO}`}
                  className="rounded-xl bg-white/5 p-2.5 text-white ring-1 ring-white/10 hover:bg-white/10"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {FACEBOOK_URL && (
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="rounded-xl bg-white/5 p-2.5 text-white ring-1 ring-white/10 hover:bg-white/10"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rodapé final */}
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 text-xs text-slate-500 md:flex-row md:justify-between">
        <p>
          &copy; {new Date().getFullYear()} PRINTE UY ·{" "}
          {t("Imprenta online en Uruguay", "Gráfica online no Uruguai")}
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <li className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-emerald-400" /> {t("Sitio seguro", "Site seguro")}
          </li>
          <li className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />{" "}
            {t("Pago protegido", "Pagamento protegido")}
          </li>
          <li className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-emerald-400" />{" "}
            {t("Envíos a todo el país", "Envio para todo o país")}
          </li>
        </ul>
        <SeletorIdioma variante="escura" />
      </div>
    </footer>
  );
}
