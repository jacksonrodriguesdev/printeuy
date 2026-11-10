import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";

// Molde das páginas legais (privacidade, exclusão de dados): texto corrido, largura de leitura.
export const EMAIL_CONTATO = "printeuy@gmail.com";

export function PaginaLegal({
  titulo,
  atualizado,
  children,
}: {
  titulo: string;
  atualizado: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 md:py-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 md:text-4xl">
          {titulo}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">Última actualización: {atualizado}</p>
        <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-zinc-700 [&_a]:font-semibold [&_a]:text-accent [&_a]:underline [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-zinc-900 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
          {children}
        </div>
      </main>
    </div>
  );
}
