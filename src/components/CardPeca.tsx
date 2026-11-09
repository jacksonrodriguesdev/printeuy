import { CardGrafica } from "@/components/grafica/CardGrafica";
import type { Product } from "@/lib/products";

// Cartão de produto da loja e das páginas de listagem: o mesmo da gráfica (foto 3:4, nome, "Desde").
// prioridade: os primeiros produtos da lista (aparecem sem rolar) baixam a foto na frente
export function CardLoja({ p, prioridade }: { p: Product; prioridade?: boolean }) {
  return <CardGrafica p={p} prioridade={prioridade} />;
}
