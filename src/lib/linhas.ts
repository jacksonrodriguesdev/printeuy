// PRINTE UY vende uma única linha: peças para veículos (tabela `pecas`).
// TABELA_LEGADA fica sempre false: os trechos que ela ainda protege são de um segundo
// catálogo que não existe mais neste site.
export const TABELA_LEGADA = false;

export type Linha = "AUTOMOTIVA";

// Normaliza a linha pedida: o site só tem a linha automotiva.
export function linhaPermitida(_linha?: string | null): Linha {
  return "AUTOMOTIVA";
}
