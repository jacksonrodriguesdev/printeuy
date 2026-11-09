// Nomes dos produtos gráficos em espanhol (Uruguai), a partir do nome em português da Printi.
// Primeiro as expressões (várias palavras), depois palavra por palavra. Palavra fora da lista
// (marcas, nomes de modelo, siglas) fica como está. Mantém a capitalização de cada palavra.

const EXPRESSOES = [
  ["cartão de visita", "tarjeta de presentación"],
  ["cartões de visita", "tarjetas de presentación"],
  ["porta garrafa", "portabotella"],
  ["porta copos", "portavasos"],
  ["porta copo", "portavaso"],
  ["porta canetas", "portalápices"],
  ["porta caneta", "portalápiz"],
  ["porta retrato", "portarretrato"],
  ["porta crachá", "porta credencial"],
  ["porta documentos", "portadocumentos"],
  ["porta celular", "soporte para celular"],
  ["porta treco", "organizador"],
  ["porta", "porta"],
  ["bloco de notas", "block de notas"],
  ["bloco para rascunho", "block borrador"],
  ["mouse pad", "mouse pad"],
  ["guarda chuva", "paraguas"],
  ["guarda-chuva", "paraguas"],
  ["saca rolhas", "sacacorchos"],
  ["abridor de garrafa", "destapador"],
  ["fone de ouvido", "auriculares"],
  ["bolsa térmica", "bolso térmico"],
  ["hot stamping", "hot stamping"],
  ["save the date", "save the date"],
  ["take one", "take one"],
  ["bem casado", "bem casado"],
  ["batata frita", "papas fritas"],
  ["marca página", "señalador"],
  ["jogo americano", "individual"],
  ["lambe lambe", "afiche lambe"],
  ["anti stress", "antiestrés"],
  ["dupla face", "doble faz"],
  ["capa dura", "tapa dura"],
  ["carteira de vacinação", "carné de vacunación"],
  ["papel timbrado", "hoja membretada"],
  ["cantos arredondados", "esquinas redondeadas"],
  ["in mold", "in mold"],
  ["stand up pouch", "stand up pouch"],
  ["corte especial", "troquelado especial"],
  ["sem fundo", "sin fondo"],
  ["ímã de geladeira", "imán de heladera"],
  ["cartão postal", "postal"],
  ["couro sintético", "cuero sintético"],
  ["bico de pato", "pico de pato"],
];

const PALAVRAS = {
  de: "de", do: "del", da: "de la", dos: "de los", das: "de las", e: "y", com: "con", sem: "sin",
  em: "en", para: "para", "p/": "para", ou: "o", no: "en el", na: "en la",
  personalizado: "personalizado", personalizada: "personalizada", personalizados: "personalizados",
  personalizadas: "personalizadas", personalizável: "personalizable",
  embalagem: "envase", embalagens: "envases", adesivo: "adhesivo", adesivos: "adhesivos",
  caneta: "bolígrafo", canetas: "bolígrafos", cartão: "tarjeta", cartões: "tarjetas", papel: "papel",
  sacola: "bolsa", sacolas: "bolsas", rótulo: "etiqueta", rótulos: "etiquetas", etiqueta: "etiqueta",
  etiquetas: "etiquetas", garrafa: "botella", chaveiro: "llavero", copo: "vaso", copos: "vasos",
  mesa: "mesa", bambu: "bambú", mochila: "mochila", plástica: "plástica", plástico: "plástico",
  calendário: "calendario", tampa: "tapa", corte: "corte", especial: "especial", alumínio: "aluminio",
  convite: "invitación", capa: "tapa", caneca: "taza", eleitoral: "electoral", térmico: "térmico",
  térmica: "térmica", econômico: "económico", econômica: "económica", esportiva: "deportiva",
  esportivo: "deportivo", dobra: "pliegue", dobras: "pliegues", vinho: "vino", viagem: "viaje",
  envelope: "sobre", envelopes: "sobres", cardápio: "menú", parede: "pared", paredes: "paredes",
  carro: "auto", carros: "autos", vidro: "vidrio", retangular: "rectangular", segurança: "seguridad",
  agenda: "agenda", agendas: "agendas", bolsa: "bolso", abridor: "destapador", reciclado: "reciclado",
  reciclada: "reciclada", celular: "celular", pasta: "carpeta", tapete: "alfombra",
  transporte: "transporte", fundo: "fondo", visita: "presentación", básico: "básico", básica: "básica",
  placa: "placa", caixa: "caja", caixas: "cajas", caixinha: "cajita", bloco: "block", alça: "asa",
  lápis: "lápiz", toalha: "toalla", impressão: "impresión", impressa: "impresa", revista: "revista",
  cinta: "cinta", camiseta: "remera", camisa: "camisa", redondo: "redondo", redonda: "redonda",
  redondos: "redondos", cerveja: "cerveza", dobrável: "plegable", caderneta: "libreta",
  caderno: "cuaderno", cadernos: "cuadernos", algodão: "algodón", ouvido: "oído", saco: "bolsa",
  protetor: "protector", catálogo: "catálogo", livreto: "folleto", bijuteria: "bijouterie",
  basculante: "basculante", panetone: "pan dulce", gaveta: "cajón", correios: "envíos",
  interna: "interna", externa: "externa", postal: "postal", casamento: "casamiento",
  presente: "regalo", geladeira: "heladera", piso: "piso", fechar: "cerrar", quadrado: "cuadrado",
  quadrada: "cuadrada", cartela: "plancha", pôster: "póster", permanente: "perpetua",
  retrátil: "retráctil", mala: "valija", notas: "notas", espelho: "espejo", grande: "grande",
  grandes: "grandes", som: "sonido", microfone: "micrófono", carregador: "cargador",
  conjunto: "conjunto", estojo: "estuche", marmita: "vianda", fibra: "fibra", livro: "libro",
  cubo: "cubo", almofada: "almohadón", páscoa: "pascua", padrão: "estándar", folheto: "folleto",
  panfleto: "volante", crachá: "credencial", agradecimento: "agradecimiento", vale: "vale",
  aniversário: "cumpleaños", feminina: "femenina", tempero: "condimento", pote: "frasco",
  bandeira: "bandera", moldura: "marco", faixa: "pasacalle", bolacha: "posavasos", ímã: "imán",
  ecológica: "ecológica", suporte: "soporte", portátil: "portátil", executivo: "ejecutivo",
  chinelo: "chancleta", cortiça: "corcho", madeira: "madera", churrasco: "asado", fio: "hilo",
  comprimidos: "pastillas", lata: "lata", latas: "latas", bola: "pelota", viseira: "visera",
  triangular: "triangular", maleta: "maletín", bandeja: "bandeja", cesta: "canasta", doces: "dulces",
  ovo: "huevo", página: "página", aviso: "aviso", cartaz: "cartel", jogo: "juego",
  americano: "individual", régua: "regla", borracha: "goma", rascunho: "borrador", canudo: "pajita",
  clássica: "clásica", unissex: "unisex", crédito: "crédito", oval: "oval", tapume: "valla",
  perfurado: "perforado", vinil: "vinilo", manuscrito: "manuscrito", preço: "precio",
  lacres: "precintos", lacre: "precinto", bisnaga: "pomo", frasco: "frasco", gargalo: "cuello",
  suco: "jugo", creme: "crema", bolso: "bolsillo", base: "base", rígida: "rígida",
  planner: "planner", semanal: "semanal", cobre: "cubre", flâmula: "banderín", lona: "lona",
  promocional: "promocional", tipo: "tipo", fotos: "fotos", pirulito: "chupetín", tecido: "tela",
  avental: "delantal", azulejo: "azulejo", balões: "globos", baralho: "mazo de cartas",
  bolinha: "pelotita", litros: "litros", dupla: "doble", face: "faz", pequena: "pequeña",
  pequeno: "pequeño", desenho: "dibujo", cônica: "cónica", preta: "negra", escolar: "escolar",
  canivete: "navaja", capacho: "felpudo", indução: "inducción", cavalete: "caballete",
  chapéu: "sombrero", couro: "cuero", sintético: "sintético", lapiseira: "portaminas",
  descanso: "apoya", panela: "olla", natural: "natural", maquiagem: "maquillaje", simples: "simple",
  ajustável: "ajustable", auricular: "auricular", cabo: "cable", lixas: "limas", manicure: "manicura",
  resina: "resina", lixeira: "papelera", manta: "manta", hermética: "hermética", máscara: "antifaz",
  dormir: "dormir", óculos: "lentes", sol: "sol", pantufa: "pantufla", pingente: "dije",
  silicone: "silicona", divisórias: "divisiones", integrado: "integrado", retrato: "retrato",
  tábua: "tabla", servir: "servir", automotivo: "para auto", comedouro: "comedero",
  tirante: "tirante", praia: "playa", microfibra: "microfibra", xícara: "taza", futebol: "fútbol",
  vôlei: "vóley", quadro: "cuadro", decorativo: "decorativo", decorativa: "decorativa",
  tela: "lienzo", apostila: "apunte", apostilas: "apuntes", brochura: "rústica",
  fotolivro: "fotolibro", quadrinhos: "historietas", chão: "piso", expositor: "exhibidor",
  expositora: "exhibidora", balcão: "mostrador", bolo: "torta", bolsinha: "bolsita",
  chanfrada: "biselada", cone: "cono", comida: "comida", explosão: "explosión", lanche: "merienda",
  salgados: "saladitos", fatia: "porción", frituras: "frituras", hambúrguer: "hamburguesa",
  envio: "envío", colher: "cuchara", retornável: "retornable", bolha: "burbuja",
  gargaleira: "collarín", largo: "ancho", palmas: "palmas", flexível: "flexible", roupas: "ropa",
  cor: "color", filipeta: "volante", mapa: "mapa", guia: "guía", casinha: "casita", gato: "gato",
  bandeirola: "banderín", carnê: "chequera", cordão: "cordón", retrovisor: "retrovisor",
  folha: "hoja", máquina: "máquina", solar: "solar", pulseiras: "pulseras",
  identificação: "identificación", urna: "urna", prateleiras: "estantes", fidelidade: "fidelidad",
  elástico: "elástico", blocado: "en block", contra: "contra", dura: "dura", ultra: "ultra",
  grosso: "grueso", duplo: "doble", carteira: "carnet", vacinação: "vacunación",
  certificado: "certificado", garantia: "garantía", credencial: "credencial", embrulho: "envoltorio",
  timbrado: "membretado", chave: "llave", hotel: "hotel", receituário: "recetario", recibo: "recibo",
  manual: "manual", padrinhos: "padrinos", cortador: "cortador", santinho: "estampita",
  colete: "chaleco", refletivo: "reflectivo", acrílico: "acrílico", transparente: "transparente",
  moderno: "moderno", inox: "inoxidable", fumê: "ahumado", borossilicato: "borosilicato",
  polo: "polo", folder: "folleto", flyer: "flyer", banner: "banner", display: "display",
  totem: "tótem", ecobag: "ecobag", necessaire: "neceser", kit: "kit", mini: "mini",
  pizza: "pizza", doce: "dulce", kraft: "kraft", reutilizável: "reutilizable",
  // Configurador (atributos e opções)
  impressão: "impresión", cores: "colores", tamanho: "tamaño", acabamento: "terminación",
  enobrecimento: "terminación especial", substrato: "sustrato", serrilha: "troquel",
  miolo: "interior", encadernação: "encuadernación", vias: "copias", número: "número",
  quantidade: "cantidad", fechado: "cerrado", aberto: "abierto", frente: "frente",
  costas: "espalda", mangas: "mangas", lados: "lados", lado: "lado", páginas: "páginas",
  colorido: "color", colorida: "color", branco: "blanco", branca: "blanca", brilho: "brillo",
  brilhante: "brillante", fosco: "mate", fosca: "mate", laminação: "laminado", verso: "dorso",
  pauta: "renglones", folhas: "hojas", gravação: "grabado", entrega: "entrega",
  individual: "individual", bobina: "bobina", unidades: "unidades", cinza: "gris", azul: "azul",
  vermelho: "rojo", vermelha: "roja", verde: "verde", amarelo: "amarillo", amarela: "amarilla",
  preto: "negro", rosa: "rosa", roxo: "violeta", laranja: "naranja", marrom: "marrón",
  dourado: "dorado", prata: "plateado", prateado: "plateado", cobre: "cobre",
  personalização: "personalización", local: "localizado", linha: "línea", mais: "más",
  vendida: "vendida", vendido: "vendido", recomendada: "recomendada", verniz: "barniz", visível: "visible", vísivel: "visible",
  dianteiros: "delanteros", traseiros: "traseros", fechamento: "cierre", revestimento: "revestimiento",
  cartas: "cartas", conectora: "conectora", itens: "ítems", utensílios: "utensilios",
  orientação: "orientación", arte: "arte", horizontal: "horizontal", vertical: "vertical",
  retrato: "vertical", paisagem: "horizontal", opcional: "opcional", adicionais: "adicionales",
  borda: "borde", haste: "varilla", estrutura: "estructura", tiras: "tiras", tira: "tira",
  mídia: "medio", visor: "visor", precisão: "precisión", modos: "modos", logo: "logo",
  escolha: "elegí", seu: "tu", sua: "tu", serviço: "servicio", veludo: "terciopelo",
  ponteira: "puntera", clipe: "clip", bexiga: "globo", fita: "cinta", angulo: "ángulo",
  "4x0": "4x0", "4x4": "4x4", "1x0": "1x0", frente_verso: "frente y dorso",
};

function capitalizarComo(modelo, palavra) {
  if (modelo === modelo.toUpperCase() && modelo.length > 1) return palavra.toUpperCase();
  if (modelo[0] === modelo[0].toUpperCase()) return palavra.charAt(0).toUpperCase() + palavra.slice(1);
  return palavra;
}

function nomeEspanhol(nome) {
  let s = ` ${nome} `;
  for (const [pt, es] of EXPRESSOES) {
    const re = new RegExp(`(?<=[\\s(])${pt.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=[\\s),])`, "gi");
    s = s.replace(re, (m) => {
      // "Corte Especial" (todas as palavras maiúsculas) -> "Troquelado Especial"
      const titulo = m.split(/\s+/).every((w) => w[0] === w[0].toUpperCase());
      const out = titulo
        ? es.replace(/(^|\s)(\p{L})/gu, (x, sp, l) => sp + l.toUpperCase()).replace(/ (De|Del|Para|Con|Sin|En) /g, (x) => x.toLowerCase())
        : capitalizarComo(m, es);
      return out.replace(/\s/g, "\u0000");
    });
  }
  s = s
    .trim()
    .split(/(\s+)/)
    .map((w) => {
      if (/^\s+$/.test(w) || w.includes("\u0000")) return w;
      const m = w.match(/^([(\[]?)(.*?)([)\],.:;]?)$/);
      const nucleo = m[2];
      const es = PALAVRAS[nucleo.toLowerCase()];
      return es ? m[1] + capitalizarComo(nucleo, es) + m[3] : w;
    })
    .join("")
    .replace(/\u0000/g, " ");
  // "de el" -> "del" quando a tradução gera isso
  return s.replace(/\b([Dd])e el\b/g, "$1el").replace(/\s{2,}/g, " ");
}

module.exports = { nomeEspanhol };
