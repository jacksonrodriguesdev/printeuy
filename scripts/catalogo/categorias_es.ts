// Passa os nomes das categorias para espanhol (o site é só em espanhol do Uruguai) e atualiza o
// texto `categoria` das peças ("Principal > Subcategoria"), que a loja usa nos filtros.
// Rodar depois de importar_pellegrino.cjs:
//   npx tsx --env-file=.env scripts/catalogo/categorias_es.ts
import { PrismaClient } from "@prisma/client";
import { nomeEs } from "../../src/lib/pecas-es";

// Categorias principais: tradução feita à mão
const PRINCIPAIS: Record<string, string> = {
  MOTOR: "Motor",
  ALIMENTACAO: "Inyección y Combustible",
  FREIO: "Frenos",
  SUSPENSAO: "Suspensión",
  TRANSMISSAO: "Transmisión",
  ACESSORIOS: "Accesorios",
  BORRACHA: "Gomas y Soportes",
  ROLAMENTOS: "Rodamientos",
  DIVERSOS: "Varios",
  ARREFECIMENTO: "Refrigeración",
  DIRECAO: "Dirección",
  EMBREAGEM: "Embrague",
  ELETRICA: "Eléctrica",
  MOTO: "Motos",
  LUBRIFICACAO: "Lubricación",
  FERRAGEM: "Ferretería",
  ESCAPE: "Escape",
  RODAS: "Ruedas",
  FERRAMENTAS: "Herramientas",
  SEGURANCA: "Seguridad",
  PNEUS: "Neumáticos",
};

// Subcategorias que o glossário não cobre bem
const SUB: Record<string, string> = {
  "PECA TECNICA MECANICA": "Piezas técnicas mecánicas",
  "PECA TECNICA ELETRONICA": "Piezas técnicas electrónicas",
  "PECAS TECNICA": "Piezas técnicas",
  "PECAS SOBRESSALENTES - OUTROS": "Otros repuestos",
  "BOMBA DAGUA": "Bomba de agua",
  "OLEO DE MOTOR": "Aceite de motor",
  "OLEO CAMBIO": "Aceite de caja",
  OLEO: "Aceite",
  "SEMI EIXO": "Semieje",
  "SEMI-EIXO": "Semieje",
  "FAIXA REFLETIVA": "Cinta reflectiva",
  "CUBO DE RODA": "Maza de rueda",
  "JUNTA HOMOCINETICA": "Junta homocinética",
  "SONDA LAMBDA": "Sonda lambda",
  "VELA AQUECEDORA": "Bujía de precalentamiento",
  VELA: "Bujía",
  CABECOTE: "Tapa de cilindros",
  VIRABREQUIM: "Cigüeñal",
  "COMANDO DE VALVULAS": "Árbol de levas",
  BRONZINA: "Cojinete",
  PASTILHA: "Pastillas de freno",
  LONA: "Cintas de freno",
  "LONA FREIO": "Cintas de freno",
  "TAMBOR FREIO": "Campana de freno",
  "DISCO FREIO": "Disco de freno",
  "SERVO FREIO": "Servofreno",
  AMORTECEDOR: "Amortiguador",
  BANDEJA: "Parrilla de suspensión",
  COXIM: "Soporte de motor",
  CORREIA: "Correa",
  MANGUEIRA: "Manguera",
  RADIADOR: "Radiador",
  RESERVATORIO: "Depósito",
  FAROL: "Faro",
  "FAROL AUXILIAR": "Faro auxiliar",
  LANTERNA: "Farol trasero",
  "LANTERNAS AUXILIARES": "Faroles auxiliares",
  RETROVISOR: "Espejo retrovisor",
  PALHETA: "Escobilla limpiaparabrisas",
  TAPETE: "Alfombra",
  BAGAGEIRO: "Portaequipaje",
  "ALTO FALANTE": "Parlante",
  "CAIXA DE SOM": "Caja de sonido",
  ESCAPE: "Escape",
  TUNNING: "Tuning",
  MIUDEZAS: "Pequeños accesorios",
  "ITENS DIVERSOS": "Artículos varios",
  DIVERSOS: "Varios",
  QUIMICOS: "Químicos",
  QUIMICO: "Químicos",
  PNEU: "Neumático",
  RODA: "Rueda",
  CAMBIO: "Caja de cambios",
  "CAMBIO COMPLETO": "Caja de cambios completa",
  CAPACETE: "Casco",
  VESTUARIO: "Indumentaria",
  GUIDAO: "Manubrio",
  MANETE: "Maneta",
  CARENAGEM: "Carenado",
  PEDAL: "Pedal",
  KIT: "Kit",
  BUZINA: "Bocina",
  LATARIA: "Chapería",
  CAVALETE: "Caballete",
  COLUNA: "Columna",
  INDUZIDO: "Inducido",
  CONDUITE: "Conducto",
  MULTIMIDIA: "Multimedia",
  FAROLA: "Faro",
  "DISCO TACOGRAFO": "Disco de tacógrafo",
  SEDE: "Asiento de válvula",
  PLATINADO: "Platino",
};

const tituloFrase = (s: string) => {
  const t = s.trim().toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};
const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().trim();

const db = new PrismaClient();
(async () => {
  const cats = await db.categories.findMany();
  let n = 0;
  for (const c of cats) {
    const k = semAcento(c.nome);
    const novo = c.parent_id == null ? PRINCIPAIS[k] : (SUB[k] ?? tituloFrase(nomeEs(k)));
    if (novo && novo !== c.nome) {
      await db.categories.update({ where: { id: c.id }, data: { nome: novo } });
      n++;
    }
  }
  // Subcategorias com o mesmo nome dentro da mesma principal: junta numa só
  const todas = await db.categories.findMany({ where: { parent_id: { not: null } } });
  const vistas = new Map<string, number>();
  let juntadas = 0;
  for (const c of todas) {
    const k = `${c.parent_id}|${c.nome}`;
    const destino = vistas.get(k);
    if (destino == null) {
      vistas.set(k, c.id);
      continue;
    }
    await db.pecas.updateMany({ where: { category_id: c.id }, data: { category_id: destino } });
    await db.categories.delete({ where: { id: c.id } });
    juntadas++;
  }
  await db.$executeRawUnsafe(`
    UPDATE pecas p JOIN categories c ON c.id = p.category_id LEFT JOIN categories pai ON pai.id = c.parent_id
       SET p.categoria = IF(pai.id IS NULL, c.nome, CONCAT(pai.nome, ' > ', c.nome))`);
  console.log(`${n} categorias traduzidas, ${juntadas} subcategorias repetidas juntadas`);
  await db.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
