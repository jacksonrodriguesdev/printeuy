import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Home, LayoutGrid, MessageCircle, User, LogOut, Printer } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getSessionFn } from "@/lib/user-auth";
import { whatsappContactUrl } from "@/lib/whatsapp";
import { useCategoriasLoja } from "@/hooks/use-categorias-loja";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/idioma";
import { SeletorIdioma } from "@/components/SeletorIdioma";

// Barra de navegação inferior no celular: "dock" azul flutuante com o vehículo do cliente no
// centro (o carrinho fica no header).
// Não aparece no admin nem em telas a partir de md (desktop usa o header).
export function MobileTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [sheet, setSheet] = useState<"categorias" | "conta" | null>(null);
  const { data: user } = useQuery({ queryKey: ["auth_session"], queryFn: () => getSessionFn() });
  const categorias = useCategoriasLoja();
  const { t, href } = useT();

  if (pathname.startsWith("/admin") || pathname.startsWith("/catalogos/ver/")) return null;

  const zap = whatsappContactUrl(
    t("¡Hola! Quiero cotizar una impresión.", "Olá! Quero fazer um orçamento de peças."),
  );
  const item = (ativo: boolean) =>
    cn(
      "relative flex flex-1 flex-col items-center justify-center gap-1 text-[10.5px] font-semibold tracking-wide transition active:scale-90",
      ativo ? "text-amber-400" : "text-white/60",
    );
  // Pontinho embaixo do item ativo
  const ponto = (ativo: boolean) =>
    ativo && <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-amber-400" />;
  const contaAtiva = sheet === "conta" || pathname === "/login" || pathname === "/cuenta";

  return (
    <>
      {/* Espaço no fim da página para a barra não cobrir o rodapé */}
      <div className="h-[calc(var(--barra-inferior)+1rem)] md:hidden" aria-hidden />
      <nav
        aria-label={t("Navegación principal", "Navegação principal")}
        className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] md:hidden"
      >
        <div className="relative mx-auto flex h-16 max-w-md items-stretch rounded-[22px] bg-[#0b1d3a]/95 shadow-[0_12px_32px_-8px_rgba(11,29,58,0.55)] ring-1 ring-white/10 backdrop-blur">
          <Link to="/" className={item(pathname === "/")}>
            <Home className="h-[22px] w-[22px]" />
            {t("Inicio", "Início")}
            {ponto(pathname === "/")}
          </Link>
          <button
            type="button"
            onClick={() => setSheet("categorias")}
            className={item(sheet === "categorias" || pathname.startsWith("/loja"))}
          >
            <LayoutGrid className="h-[22px] w-[22px]" />
            {t("Explorar", "Explorar")}
            {ponto(sheet === "categorias" || pathname.startsWith("/loja"))}
          </button>

          {/* Centro: todos os produtos */}
          <Link
            to="/loja"
            className="flex flex-1 flex-col items-center justify-start text-[10.5px] font-bold text-white active:scale-95"
          >
            <span className="-mt-5 mb-1 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg shadow-orange-600/40 ring-4 ring-slate-100">
              <Printer className="h-6 w-6" />
            </span>
            <span className="max-w-[72px] truncate">{t("Productos", "Produtos")}</span>
          </Link>

          <a href={zap} target="_blank" rel="noreferrer noopener" className={item(false)}>
            <MessageCircle className="h-[22px] w-[22px] text-emerald-400" />
            {t("Cotizar", "Orçamento")}
          </a>
          {user ? (
            <button type="button" onClick={() => setSheet("conta")} className={item(contaAtiva)}>
              <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white/15 text-[11px] font-black text-white">
                {(user.nome.trim()[0] ?? "U").toUpperCase()}
              </span>
              {t("Cuenta", "Conta")}
              {ponto(contaAtiva)}
            </button>
          ) : (
            <Link to="/login" className={item(contaAtiva)}>
              <User className="h-[22px] w-[22px]" />
              {t("Ingresar", "Entrar")}
              {ponto(contaAtiva)}
            </Link>
          )}
        </div>
      </nav>

      <Sheet open={sheet === "categorias"} onOpenChange={(o) => setSheet(o ? "categorias" : null)}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl pb-safe">
          <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-zinc-200" />
          <SheetHeader>
            <SheetTitle>{t("Categorías", "Categorias")}</SheetTitle>
          </SheetHeader>
          <SeletorIdioma variante="clara" className="justify-center pb-2" />
          <div className="grid grid-cols-3 gap-2 px-4">
            {categorias.map((c) => (
              <Link
                key={c.nome}
                to="/loja"
                search={{ categoria: c.nome } as never}
                onClick={() => setSheet(null)}
                className="flex flex-col items-center gap-2 rounded-2xl bg-zinc-50 p-3 text-center text-xs font-medium text-zinc-700 active:scale-95 active:bg-primary/10"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <c.icon className="h-5 w-5" />
                </span>
                {c.curto}
              </Link>
            ))}
          </div>

          <div className="mt-6 px-4 pb-4">
            <Link
              to="/loja"
              onClick={() => setSheet(null)}
              className="block rounded-xl bg-primary py-3 text-center text-sm font-semibold text-white active:scale-95"
            >
              {t("Ver todo el catálogo", "Ver todo o catálogo")}
            </Link>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "conta"} onOpenChange={(o) => setSheet(o ? "conta" : null)}>
        <SheetContent side="bottom" className="rounded-t-3xl pb-safe">
          <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-zinc-200" />
          <SheetHeader>
            <SheetTitle>
              {t("Hola", "Olá")}
              {user?.nome.trim() ? `, ${user.nome.trim().split(" ")[0]}` : ""}
            </SheetTitle>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </SheetHeader>
          <div className="flex flex-col gap-2 px-4 pb-4">
            <Link
              to="/cuenta"
              onClick={() => setSheet(null)}
              className="rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium"
            >
              {t("Mi perfil y datos", "Meu perfil e dados")}
            </Link>
            <Link
              to="/catalogos"
              onClick={() => setSheet(null)}
              className="rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium"
            >
              {t("Catálogos para mecánicos (PDF)", "Catálogos para mecânicos (PDF)")}
            </Link>
            {user?.role === "ADMIN" && (
              <Link
                to="/admin"
                onClick={() => setSheet(null)}
                className="rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium"
              >
                {t("Panel de administración", "Painel de administração")}
              </Link>
            )}
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = href("/");
              }}
              className="flex items-center gap-2 rounded-xl border border-red-100 px-4 py-3 text-sm font-medium text-red-600"
            >
              <LogOut className="h-4 w-4" /> {t("Cerrar sesión", "Sair da conta")}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
