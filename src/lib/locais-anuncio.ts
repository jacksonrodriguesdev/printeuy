// Classificação do visitante pelo local onde anunciamos (departamento do Uruguai ou outros).
// Usada pelo resumo diário das análises e pelo Criador de anúncios.
// Perfil automotivo de cada departamento do Uruguai (conhecimento geral, não dado do site).
// "maquinas" = veículos típicos (nome do campo mantido para o código que já o usa)
export const PERFIL_DEPTO: Record<string, { perfil: string; maquinas: string }> = {
  Artigas: {
    perfil: "Frontera norte, rutas largas",
    maquinas: "camionetas, autos particulares y motos",
  },
  Canelones: {
    perfil: "Gran parque automotor, muchos viajes a Montevideo",
    maquinas: "autos familiares, utilitarios de trabajo",
  },
  "Cerro Largo": {
    perfil: "Frontera con Brasil, rutas y caminos rurales",
    maquinas: "camionetas, autos particulares",
  },
  Colonia: {
    perfil: "Turismo, transporte al puerto",
    maquinas: "autos particulares, camionetas, camiones",
  },
  Durazno: { perfil: "Centro del país, rutas 5 y 14", maquinas: "camiones, camionetas" },
  Flores: { perfil: "Rutas nacionales", maquinas: "camionetas, autos particulares" },
  Florida: { perfil: "Rutas y transporte", maquinas: "autos, camionetas, camiones" },
  Lavalleja: { perfil: "Rutas de sierra", maquinas: "autos particulares, camionetas" },
  Maldonado: {
    perfil: "Temporada turística, alquileres",
    maquinas: "autos particulares, camionetas, autos de alquiler",
  },
  Montevideo: {
    perfil: "Capital: mayor parque automotor, talleres y flotas",
    maquinas: "autos particulares, taxis, aplicaciones, utilitarios de reparto",
  },
  Paysandú: {
    perfil: "Litoral, transporte de carga",
    maquinas: "autos particulares, camionetas, camiones",
  },
  "Río Negro": { perfil: "Forestal y transporte de carga", maquinas: "camionetas, camiones" },
  Rivera: {
    perfil: "Frontera con Brasil, mucho auto particular",
    maquinas: "autos particulares, camionetas",
  },
  Rocha: {
    perfil: "Costa y rutas largas, temporada de verano",
    maquinas: "autos particulares, camionetas",
  },
  Salto: {
    perfil: "Litoral, ciudad grande del norte",
    maquinas: "autos particulares, camionetas, motos",
  },
  "San José": {
    perfil: "Cerca de Montevideo, reparto",
    maquinas: "utilitarios, camionetas, camiones",
  },
  Soriano: { perfil: "Litoral, trabajo rural y transporte", maquinas: "camionetas, camiones" },
  Tacuarembó: { perfil: "Rutas largas, transporte forestal", maquinas: "camionetas, camiones" },
  "Treinta y Tres": { perfil: "Caminos rurales, rutas", maquinas: "camionetas, camiones" },
};
export const DEPTOS = Object.keys(PERFIL_DEPTO);
export const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export const DEPTO_POR_CHAVE = new Map(DEPTOS.map((d) => [semAcento(d), d]));

// Onde está o visitante, no nível em que anunciamos
export type Local = { chave: string; nome: string; pais: "UY" | "RS" | "BR" | "OUTRO" | "?" };
export function localDe(l: {
  region: string | null;
  city: string | null;
  country_code: string | null;
}): Local {
  const cc = (l.country_code || "").toUpperCase();
  const reg = (l.region || "")
    .replace(/^Departamento de /i, "")
    .replace(/ Department$/i, "")
    .trim();
  if (cc === "UY") {
    const d = DEPTO_POR_CHAVE.get(semAcento(reg)) ?? (reg || "Uruguai (sem departamento)");
    return { chave: `UY:${d}`, nome: d, pais: "UY" };
  }
  if (cc === "BR")
    return /grande do sul/i.test(reg)
      ? { chave: "RS", nome: "Rio Grande do Sul", pais: "RS" }
      : { chave: "BR", nome: "Brasil (outros estados)", pais: "BR" };
  if (cc) return { chave: "OUTRO", nome: "Outros países", pais: "OUTRO" };
  return { chave: "?", nome: "Sem localização", pais: "?" };
}
