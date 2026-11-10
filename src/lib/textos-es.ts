// Textos dos produtos em espanhol (Uruguai). O catálogo veio da Printi com descrição, perguntas
// frequentes, características e textos das combinações em português (e falando de prazos e frete
// do Brasil). Aqui esses textos são GERADOS em espanhol a partir dos dados do próprio produto
// (nome, categoria, atributos e opções, quantidades), na hora de mostrar a página: vale para o
// banco local e para o da hospedagem, sem reimportar nada.
import type { DetalhesGrafica, ParteGrafica } from "./grafica";
import { FAQ_GERAL, categoriaImprentaPorNome } from "./seo-imprenta";

// Palavras que sobraram em português nos nomes de opções e atributos (as mais longas primeiro)
const PALAVRAS: Array<[RegExp, string]> = (
  [
    ["Não Contém Auxiliares", "Sin auxiliares"],
    ["Não Acompanha", "No incluye"],
    ["Saca-Rolhas", "Sacacorchos"],
    ["Porta-Cartão", "Tarjetero"],
    ["Sacos Higiênicos", "bolsas higiénicas"],
    ["São Francisco", "San Francisco"],
    ["à direita", "a la derecha"],
    ["à esquerda", "a la izquierda"],
    ["à Direita", "a la Derecha"],
    ["à Esquerda", "a la Izquierda"],
    ["de proteção", "de protección"],
    ["multifunções", "multifunción"],
    ["Mosquetão", "Mosquetón"],
    ["Termômetro", "Termómetro"],
    ["Gargantilha", "Collarín"],
    ["Sublimação", "Sublimación"],
    ["aplicação", "aplicación"],
    ["Espaçador", "Separador"],
    ["Gorgurão", "Grosgrain"],
    ["Reforçado", "Reforzado"],
    ["Fixação", "Fijación"],
    ["fixação", "fijación"],
    ["Fixador", "Fijador"],
    ["Duração", "Duración"],
    ["Funções", "Funciones"],
    ["Papelão", "Cartón"],
    ["Esquerdo", "Izquierdo"],
    ["Calçado", "Calzado"],
    ["Lombada", "Lomo"],
    ["Reforço", "Refuerzo"],
    ["Gôndola", "Góndola"],
    ["parafuso", "tornillo"],
    ["Bastão", "Bastón"],
    ["Pragão", "Prendedor"],
    ["Santão", "Estampita"],
    ["Botões", "Botones"],
    ["botão", "botón"],
    ["Salmão", "Salmón"],
    ["Limão", "Lima"],
    ["Branco/", "Blanco/"],
    ["Preto/", "Negro/"],
    ["Ovóide", "Ovoide"],
    ["Contém", "Contiene"],
    ["Latão", "Lata"],
    ["Peças", "Piezas"],
    ["Peça", "Pieza"],
    ["Alças", "Asas"],
    ["Ombro", "Hombro"],
    ["Bordô", "Bordó"],
    ["Furos", "Agujeros"],
    ["Furo", "Agujero"],
    ["Ilhós", "Ojal"],
    ["Rolha", "Tapón"],
    ["Faca", "Cuchillo"],
    ["Fone", "Auricular"],
    ["Pêra", "Pera"],
    ["pontos", "puntos"],
    ["categoria", "categoría"],
    ["Aço", "Acero"],
    [" Cru)", " Crudo)"],
  ] as Array<[string, string]>
).map(([a, b]) => [new RegExp(a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), b]);

export const limparPt = (s: string) => PALAVRAS.reduce((t, [a, b]) => t.replace(a, b), s ?? "");

const lista = (xs: string[]) =>
  xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}`;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fmt = (n: number) => n.toLocaleString("es-UY");

// Atributos que o cliente escolhe, com as opções (sem as internas)
function atributos(partes: ParteGrafica[]) {
  const out: Array<{ nome: string; opcoes: string[] }> = [];
  for (const pt of partes)
    for (const a of pt.atributos) {
      if (!a.visivel || !a.opcoes.length) continue;
      const nome = limparPt(a.nome.split(":")[0].trim());
      if (out.some((x) => x.nome === nome)) continue;
      const opcoes = [...new Set(a.opcoes.map((o) => limparPt(o.nome)))].filter(Boolean);
      out.push({ nome, opcoes });
    }
  return out;
}

// Texto da combinação pronta ("Económica", "Recomendada"…) + o que ela inclui
function textoCombinacao(nome: string, inclui: string) {
  const base = /^econ/i.test(nome)
    ? "Lo básico bien hecho: la opción más económica, con la misma calidad de impresión profesional. Ideal para grandes cantidades y materiales de uso diario."
    : /^(recomendada|más vendida)/i.test(nome)
      ? "La opción favorita de nuestros clientes: reúne las elecciones más frecuentes, con un resultado comprobado. Ideal si querés empezar sin dudas."
      : /(especial|premium)/i.test(nome)
        ? "Para cuando tu proyecto pide algo más: materiales y terminaciones especiales que elevan la percepción de tu marca."
        : /kit/i.test(nome)
          ? "Un kit listo con las piezas que más se usan juntas, para resolver todo en un solo pedido."
          : "";
  return [base, inclui && `Incluye: ${inclui}.`].filter(Boolean).join(" ");
}

export function detalhesEmEspanhol(
  d: DetalhesGrafica,
  prod: { nome: string; categoria: string | null },
): DetalhesGrafica {
  const nome = prod.nome;
  const cat = categoriaImprentaPorNome(prod.categoria);
  const partes: ParteGrafica[] = (d.partes ?? []).map((pt) => ({
    ...pt,
    nome: limparPt(pt.nome),
    atributos: pt.atributos.map(({ nomePt: _n, ...a }: any) => ({
      ...a,
      nome: limparPt(a.nome),
      opcoes: a.opcoes.map(({ nomePt: _n, ...o }: any) => ({ ...o, nome: limparPt(o.nome) })),
    })),
  }));
  const attrs = atributos(partes);
  const nomeAttr = new Map<string, string>();
  for (const pt of partes)
    for (const a of pt.atributos) nomeAttr.set(a.id, limparPt(a.nome.split(":")[0].trim()));
  const min = d.quantidadeMinima ?? d.combinacoes?.[0]?.precos?.[0]?.quantidade ?? null;
  const principais = attrs.slice(0, 4).map((a) => a.nome.toLowerCase());

  const curta = [
    `${nome} con tu diseño y calidad de impresión profesional.`,
    principais.length ? `Elegí ${lista(principais)}` : "Elegí las opciones",
    `y recibí tu pedido en cualquier punto de Uruguay.`,
  ].join(" ");

  const html = [
    `<p><strong>${esc(nome)}</strong> de PRINTE UY: ${esc(cat ? cat.intro[0].charAt(0).toLowerCase() + cat.intro[0].slice(1) : "impresos personalizados con tu marca, con calidad profesional.")}</p>`,
    attrs.length
      ? `<h3>Opciones para personalizar</h3><ul>${attrs
          .slice(0, 8)
          .map(
            (a) =>
              `<li><strong>${esc(a.nome)}:</strong> ${esc(lista(a.opcoes.slice(0, 6)))}${a.opcoes.length > 6 ? ` y ${a.opcoes.length - 6} opciones más` : ""}.</li>`,
          )
          .join("")}</ul>`
      : "",
    min
      ? `<h3>Cantidades y precios</h3><p>Podés pedir desde ${fmt(min)} unidades. Cuanto mayor la cantidad, menor el precio por unidad: mirá la tabla de cantidades para ver el descuento.</p>`
      : "",
    `<h3>Tu archivo</h3><p>Subí tu diseño en PDF, AI, PSD, CDR o JPG en alta resolución. Antes de imprimir revisamos medidas, márgenes y colores, y te avisamos si hay que ajustar algo. ¿No tenés diseño? Escribinos por WhatsApp y te ayudamos.</p>`,
    `<h3>Envío a todo Uruguay</h3><p>Enviamos a Montevideo, Canelones, Maldonado y a los 19 departamentos. El costo y el plazo de entrega se confirman junto con tu pedido.</p>`,
  ].join("");

  const caracteristicas = [
    ...attrs
      .filter((a) => a.opcoes.length > 1)
      .slice(0, 2)
      .map((a) => `${a.opcoes.length} opciones de ${a.nome.toLowerCase()}`),
    ...(min ? [`Desde ${fmt(min)} unidades`] : []),
    "Revisión del archivo antes de imprimir",
    "Envío a todo Uruguay",
  ].slice(0, 4);

  const faq = [
    ...(min
      ? [
          {
            pergunta: `¿Cuál es la cantidad mínima de ${nome.toLowerCase()}?`,
            resposta: `Podés pedir desde ${fmt(min)} unidades. En la tabla de cantidades ves el precio total y el precio por unidad de cada opción.`,
          },
        ]
      : []),
    ...(attrs[0]
      ? [
          {
            pergunta: `¿Qué opciones de ${attrs[0].nome.toLowerCase()} hay?`,
            resposta: `${lista(attrs[0].opcoes.slice(0, 8))}${attrs[0].opcoes.length > 8 ? ", entre otras" : ""}. Elegí la que prefieras en el configurador.`,
          },
        ]
      : []),
    ...(cat?.faq ?? []).map((f) => ({ pergunta: f.p, resposta: f.r })),
    ...FAQ_GERAL.map((f) => ({ pergunta: f.p, resposta: f.r })),
  ];

  const combinacoes = (d.combinacoes ?? []).map((c) => {
    const inclui = (c.opcoes ?? [])
      .flatMap((o) =>
        Object.entries(o.escolhas ?? {}).map(([k, v]) => {
          const n = nomeAttr.get(k);
          return n && v && !/^sin extras$/i.test(v) ? `${n}: ${limparPt(v)}` : null;
        }),
      )
      .filter(Boolean)
      .slice(0, 6) as string[];
    return {
      ...c,
      opcoes: (c.opcoes ?? []).map((o) => ({
        ...o,
        escolhas: Object.fromEntries(
          Object.entries(o.escolhas ?? {}).map(([k, v]) => [k, limparPt(v)]),
        ),
      })),
      descricao: textoCombinacao(c.nome, inclui.join(" · ")),
    };
  });

  // Classificações da Printi (categorias e campanhas de lá) não servem aqui
  const { classificacoes: _c, ...resto } = d as DetalhesGrafica & { classificacoes?: unknown };
  return {
    ...resto,
    partes,
    combinacoes,
    descricaoCurta: curta,
    descricaoHtml: html,
    caracteristicas,
    faq,
    formatosArquivo:
      (d.formatosArquivo ?? null)?.map((f) => ({
        ...f,
        name: /pdf/i.test(f.name)
          ? "Archivo PDF (cerrado, listo para imprimir)"
          : "Archivo AI, INDD, PSD, CDR o JPG (abierto)",
      })) ?? null,
    seo: {
      titulo: `${nome} con tu diseño en Uruguay | PRINTE UY`,
      descricao: curta,
    },
  };
}
