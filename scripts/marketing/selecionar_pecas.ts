// Escolhe as peças dos posts de Instagram/Facebook: 4 por montadora (motor, suspensão,
// embreagem/transmissão e uma "outra" que varia), só peças com foto própria no R2.
// Prioriza as peças com mais aplicações na montadora (as que mais servem = as mais procuradas).
// Uso: npx tsx --env-file=.env scripts/marketing/selecionar_pecas.ts [saida.json]
// Saída padrão: marketing/posts/pecas.json (pasta fora do git)
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { nomeProduto } from "../../src/lib/pecas-es";
import { codigoExibicao } from "../../src/lib/products";
import {
  resumirAplicacoes,
  fraseVeiculos,
  anosTexto,
  nomeMontadora,
} from "../../src/lib/aplicacoes-resumo";

const prisma = new PrismaClient();
const saida = process.argv[2] || "marketing/posts/pecas.json";

const MONTADORAS = [
  "VOLKSWAGEN",
  "CHEVROLET",
  "FIAT",
  "FORD",
  "RENAULT",
  "PEUGEOT",
  "TOYOTA",
  "CITROEN",
  "HYUNDAI",
  "NISSAN",
  "HONDA",
  "MERCEDES BENZ",
];
// 4 vagas por montadora; cada vaga aceita as categorias na ordem (a primeira que tiver peça)
const OUTRAS = [
  ["Frenos"],
  ["Eléctrica"],
  ["Dirección"],
  ["Refrigeración"],
  ["Inyección y Combustible"],
];
const vagas = (i: number) => [
  ["Motor"],
  ["Suspensión"],
  ["Embrague", "Transmisión"],
  OUTRAS[i % OUTRAS.length],
];
// As duas montadoras mais vendidas ganham uma peça a mais (48 + 2 = 50)
const EXTRAS: Record<string, string[][]> = {
  VOLKSWAGEN: [["Frenos", "Eléctrica"]],
  CHEVROLET: [["Eléctrica", "Frenos"]],
};

type Peca = Awaited<ReturnType<typeof detalhes>>;

// Peças que rendem um bom post (nome original, em português, sem acento): o que o cliente
// reconhece e procura. Arruela, lâmpada pequena, guia de válvula... ficam de fora.
const BOAS: Record<string, RegExp> = {
  Motor:
    /^(BOMBA (DE |D )?OLEO|PISTAO|JUNTA (DO )?CABECOTE|JOGO (DE )?JUNTAS|KIT CORREIA|CORREIA DENTADA|TENSOR|BOMBA (D[EA'] ?)?AGUA|FILTRO (DE )?OLEO|BRONZINA|KIT (DE )?PISTAO|POLIA|COXIM MOTOR|VALVULA (DE )?ADMISSAO|VALVULA (DE )?ESCAPE|TAMPA (DE )?VALVULA|CARTER)/,
  "Suspensión":
    /^(AMORTECEDOR|KIT AMORTECEDOR|BANDEJA|PIVO|BIELETA|KIT (DE )?SUSPENSAO|MOLA|BATENTE|COXIM (DO )?AMORTECEDOR|BUCHA (DA )?BANDEJA|BARRA ESTABILIZADORA)/,
  Embrague:
    /^(KIT EMBREAGEM|KIT (DE )?EMBREAGEM|PLATO|PLATOR|DISCO (DE )?EMBREAGEM|ROLAMENTO (DE )?EMBREAGEM|ATUADOR|CILINDRO (MESTRE|ESCRAVO)|CABO (DE )?EMBREAGEM)/,
  "Transmisión": /^(JUNTA HOMOCINETICA|JUNTA FIXA|JUNTA DESLIZANTE|SEMI ?EIXO|CRUZETA|TRIZETA|TRIPECA|COIFA|KIT HOMOCINETICA)/,
  Frenos: /^(PASTILHA|DISCO (DE )?FREIO|SAPATA|CILINDRO (DE )?RODA|KIT (DE )?FREIO|TAMBOR|CUBO (DE )?RODA|PINCA)/,
  "Eléctrica": /^(VELA|BOBINA|ALTERNADOR|MOTOR (DE )?PARTIDA|REGULADOR|CABO (DE )?VELA|JOGO (DE )?CABOS)/,
  "Dirección": /^(TERMINAL (DE )?DIRECAO|TERMINAL|BARRA AXIAL|AXIAL|CAIXA (DE )?DIRECAO|BOMBA (DE )?DIRECAO|ARTICULACAO AXIAL)/,
  "Refrigeración": /^(BOMBA (D[EA'] ?)?AGUA|RADIADOR|VALVULA TERMOSTATICA|RESERVATORIO|ELETROVENTILADOR|MANGUEIRA|TAMPA (DO )?RESERVATORIO)/,
  "Inyección y Combustible": /^(BICO INJETOR|BOMBA (DE )?COMBUSTIVEL|SONDA LAMBDA|CORPO (DE )?BORBOLETA|FILTRO (DE )?COMBUSTIVEL|SENSOR|VALVULA)/,
};
const semAcento = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();

async function candidatos(montadora: string, categoria: string) {
  const rows = await prisma.$queryRawUnsafe<Array<{ sku: string; n: bigint }>>(
    `SELECT a.sku, COUNT(*) n
       FROM pecas_aplicacao a JOIN pecas p ON p.sku = a.sku
      WHERE a.montadora = ? AND (p.categoria = ? OR p.categoria LIKE ?)
        AND p.imagem_principal LIKE '%r2.dev/fotos/%' AND p.duplicado_de IS NULL
        AND p.nome NOT REGEXP '^[0-9]'
      GROUP BY a.sku ORDER BY n DESC LIMIT 400`,
    montadora,
    categoria,
    `${categoria} > %`,
  );
  const nomes = new Map(
    (
      await prisma.pecas.findMany({
        where: { sku: { in: rows.map((r) => r.sku) } },
        select: { sku: true, nome: true },
      })
    ).map((p) => [p.sku, semAcento(p.nome)]),
  );
  const re = BOAS[categoria];
  // Sem nenhuma "boa" (montadora com poucas peças na categoria): usa as mais aplicadas
  const boas = re ? rows.filter((r) => re.test(nomes.get(r.sku) ?? "")) : rows;
  return boas.length ? boas : rows;
}

async function detalhes(sku: string, montadora: string) {
  const p = await prisma.pecas.findUniqueOrThrow({ where: { sku } });
  const aps = await prisma.pecas_aplicacao.findMany({
    where: { sku },
    select: { montadora: true, veiculo: true, ano: true },
  });
  const daMarca = resumirAplicacoes(
    aps.filter((a) => a.montadora === montadora),
    6,
  );
  const [principal, sub] = (p.categoria || "").split(" > ");
  return {
    sku: p.sku,
    nome: nomeProduto(p),
    codigo: codigoExibicao(p),
    marca: p.marca_confirmada === false ? null : p.marca,
    foto: p.imagem_principal!,
    categoria: principal,
    subcategoria: sub ?? null,
    montadora,
    montadoraNome: nomeMontadora(montadora),
    modelos: daMarca.map((v) => ({ modelo: v.modelo, anos: anosTexto(v) })),
    fraseVeiculos: fraseVeiculos(daMarca, 3),
    url: `https://autopiezasuy.com/produto/${encodeURIComponent(p.sku)}`,
  };
}

(async () => {
  const usados = new Set<string>();
  // Nomes repetidos (ex.: 4 "Junta") deixam o feed monótono: evita o mesmo tipo de peça 3+ vezes
  const tipos = new Map<string, number>();
  const pecas: Peca[] = [];
  for (const [i, m] of MONTADORAS.entries()) {
    const tiposDaMarca = new Set<string>();
    for (const opcoes of [...vagas(i), ...(EXTRAS[m] ?? [])]) {
      let escolhida: string | null = null;
      // Categoria sem nenhuma peça com foto nessa montadora: tenta as outras
      const reserva = ["Frenos", "Dirección", "Refrigeración", "Eléctrica", "Inyección y Combustible"];
      for (const cat of [...opcoes, ...reserva]) {
        const lista = await candidatos(m, cat);
        // Começa num ponto diferente para cada montadora: não pega sempre as mesmas peças universais
        const ini = (i * 3) % Math.max(lista.length, 1);
        const ordem = [...lista.slice(ini), ...lista.slice(0, ini)];
        for (const c of ordem) {
          if (usados.has(c.sku)) continue;
          const p = await prisma.pecas.findUnique({
            where: { sku: c.sku },
            select: { nome: true, nome_es: true },
          });
          const tipo = nomeProduto(p!).split(/\s+/)[0].toLowerCase();
          if ((tipos.get(tipo) ?? 0) >= 2 || tiposDaMarca.has(tipo)) continue;
          tiposDaMarca.add(tipo);
          tipos.set(tipo, (tipos.get(tipo) ?? 0) + 1);
          escolhida = c.sku;
          break;
        }
        if (escolhida) break;
      }
      if (!escolhida) {
        console.warn(`sem peça: ${m} ${opcoes.join("/")}`);
        continue;
      }
      usados.add(escolhida);
      const d = await detalhes(escolhida, m);
      pecas.push(d);
      console.log(`${m.padEnd(14)} ${d.categoria.padEnd(24)} ${d.codigo.padEnd(14)} ${d.nome}`);
    }
  }
  fs.mkdirSync(path.dirname(saida), { recursive: true });
  fs.writeFileSync(saida, JSON.stringify(pecas, null, 2));
  console.log(`\n${pecas.length} peças em ${saida}`);
  await prisma.$disconnect();
})();
