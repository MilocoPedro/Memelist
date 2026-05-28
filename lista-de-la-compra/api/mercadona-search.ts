import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mapa completo: término normalizado → IDs de subcategoría de Mercadona
const TERM_TO_CATS: Record<string, number[]> = {
  // Leche y lácteos
  leche: [343,344,342,347,350,348,799], lacteo: [343,344,342], lacteos: [343,344,342],
  semidesnatada: [343], desnatada: [344], entera: [342],
  sinlactosa: [343,344,342], avena: [347], soja: [347], almendra: [347], arroz: [118,347],
  batido: [350], horchata: [347], condensada: [799], evaporada: [799],
  nata: [75], mantequilla: [75], margarina: [75],
  // Huevos
  huevo: [77], huevos: [77],
  // Yogures y postres
  yogur: [103,104,105,106,107,108,109], bifidus: [105], yogures: [103,104],
  flan: [110], natillas: [110], gelatina: [111], postre: [110,111],
  // Quesos y charcutería
  queso: [54,56,53], quesos: [54,56], rallado: [56], lonchas: [56], untable: [53],
  jamon: [50,48], serrano: [50], cocido: [48], pavo: [48],
  chorizo: [51], salchichon: [51], fuet: [51], lomo: [51], embutido: [51],
  bacon: [52], salchicha: [52], frankfurt: [52],
  pate: [58], sobrasada: [58], chopped: [49], mortadela: [49],
  // Frutas
  fruta: [27], frutas: [27], manzana: [27], platano: [27], naranja: [27],
  pera: [27], fresa: [27], fresas: [27], kiwi: [27], melocoton: [27],
  uva: [27], sandia: [27], melon: [27], cereza: [27], ciruela: [27],
  mandarina: [27], limon: [27], lima: [27], pomelo: [27], aguacate: [27],
  mango: [27], pina: [27], granada: [27], higo: [27],
  // Verduras
  verdura: [29], verduras: [29], tomate: [29,126], lechuga: [28], ensalada: [28],
  zanahoria: [29], cebolla: [29], patata: [29], pimiento: [29], brocoli: [29],
  coliflor: [29], espinaca: [29], acelga: [29], apio: [29], pepino: [29],
  calabacin: [29], berenjena: [29], alcachofa: [29], esparragos: [29],
  puerro: [29], nabo: [29], rabano: [29], gustos: [29],
  // Carne
  pollo: [38], pechuga: [38], muslo: [38], alita: [38], entero: [38],
  ternera: [40], vacuno: [40], bistec: [40], filete: [40], entrecot: [40],
  cerdo: [37], lomo: [37,51], costilla: [37], panceta: [37],
  cordero: [42], conejo: [42],
  hamburguesa: [44], picada: [44], albondiga: [44],
  empanado: [45], nugget: [45], croqueta: [45],
  carne: [37,38,40,42,44],
  // Pescado y marisco
  pescado: [31], salmon: [31], merluza: [31], lubina: [31], dorada: [31],
  bacalao: [31], trucha: [31], rape: [31], rodaballo: [31],
  atun: [122], sardina: [122], mejillon: [123], berberecho: [123],
  marisco: [32], gamba: [32], langostino: [32], almeja: [32], calamar: [32],
  pulpo: [32], sepia: [32], navaja: [32],
  ahumado: [36], salmoneado: [36],
  // Congelados
  congelado: [145,148,149,150,151,152], congelada: [145,148,149],
  pizza: [138,151], pizzas: [138,151],
  helado: [154], helados: [154], hielo: [155],
  // Agua y bebidas
  agua: [156], aguas: [156], mineral: [156],
  refresco: [158,159,161,162], coca: [158], fanta: [159], sprite: [159],
  tonica: [161], bitter: [161], te: [88,162], limonada: [159],
  isotonica: [163], energetica: [163], bebida: [156,158,159,163],
  cerveza: [164], birra: [164], cervezasin: [165],
  vino: [169,170,171,172], tinto: [169], blanco: [170], rosado: [171],
  cava: [174], sidra: [174], champan: [174],
  licor: [181], whisky: [181], ron: [181], vodka: [181], gin: [181],
  // Zumos
  zumo: [98,99,100,143], zumos: [98,99,100,143], naranjazumo: [143],
  // Panadería
  pan: [59,60,62,64], baguette: [59], hogaza: [59], molde: [60],
  tostada: [62], tostado: [62], biscote: [62], regañá: [64], pico: [64],
  croissant: [65], bolleria: [65,66], magdalena: [66], bizcocho: [66],
  muffin: [66], donut: [66], tarta: [68], pastel: [68],
  harina: [69], levadura: [69], preparado: [69],
  // Cereales y galletas
  galleta: [80], galletas: [80], maria: [80], oreo: [80], digestive: [80],
  cereal: [78], cereales: [78], corn: [78], muesli: [78], avena: [78,347],
  tortita: [79], tortitas: [79],
  // Arroz legumbres pasta
  macarron: [120], macarrones: [120], espagueti: [120], pasta: [120],
  fideos: [120], tallarines: [120], lasana: [120], canelones: [120],
  lenteja: [121], lentejas: [121], garbanzo: [121], garbanzos: [121],
  alubia: [121], judias: [121], guisante: [121,127],
  // Aceites salsas especias
  aceite: [112], oliva: [112], girasol: [112], vinagre: [112], sal: [112],
  pimienta: [115], oregano: [115], especias: [115], condimento: [115],
  ketchup: [116], mostaza: [116], mayonesa: [116],
  salsa: [117], soja: [117,347], tabasco: [117], bbq: [117],
  // Conservas
  conserva: [122,123,126,127], lata: [122,123],
  tomarito: [126], tomarofrito: [126], tomarotriturado: [126], frito: [126],
  gazpacho: [130], salmorejo: [130], crema: [129,130], sopa: [129], caldo: [129],
  // Snacks dulces
  patatasfrita: [132], chips: [132], snack: [132], pipas: [132],
  aceitunas: [135], encurtidos: [135], pepinillo: [135],
  frutoseco: [133], almendras: [133], nuez: [133], anacardo: [133],
  chocolate: [92], tableta: [92], bombones: [92],
  azucar: [89], edulcorante: [89], stevia: [89],
  caramelo: [95], chicle: [95], chuche: [97], gominola: [97],
  mermelada: [90], miel: [90], nocilla: [90], nutella: [90],
  // Cacao café
  cafe: [83,84,81], capsula: [81], nespresso: [81], dolce: [81],
  soluble: [84], molido: [83], grano: [83],
  cacao: [86], colacao: [86], nesquik: [86], chocolate_bebida: [86],
  infusion: [88], manzanilla: [88], poleo: [88],
  // Higiene y cuidado
  champu: [199], acondicionador: [201], mascarilla: [201], tinte: [203],
  gel: [187,189], jabonmanos: [187], jabon: [187],
  dentifrico: [186], cepillo: [186], enjuague: [186], hilo: [186],
  desodorante: [188], antiperspirant: [188],
  crema: [185,189], hidratante: [189], locion: [189],
  afeitado: [192], maquinilla: [192], espuma: [192],
  colonia: [196], perfume: [196],
  protectorsolar: [198], solar: [198],
  // Limpieza hogar
  detergente: [226], suavizante: [226], quitamanchas: [226],
  fregasuelos: [233], multiusos: [232], limpiador: [232,233],
  lejia: [234], amoniaco: [234],
  limpiacristal: [235], cristales: [235],
  lavavajillas: [229], bayeta: [237], estropajo: [237], guante: [237],
  insecticida: [241], ambientador: [241],
  bolsabasura: [239], pilas: [239], bolsa: [239],
  papelcocina: [238], higienico: [238], celulosa: [238], servilleta: [238],
  // Bebés
  bebe: [216,217,218,219], infantil: [216], papilla: [216],
  toallita: [217], panal: [217], pañal: [217],
  biberon: [219], chupete: [219],
  // Mascotas
  perro: [221], pienso: [221,222], pellet: [221,222],
  gato: [222], gatofood: [222],
  mascota: [221,222,225],
  // Maquillaje
  rimmel: [210], mascara: [210], sombra: [210], eyeliner: [210],
  pintalabios: [208], labial: [208], gloss: [208],
  colorete: [207], polvos: [207], base: [206], corrector: [206],
  pincel: [212], brocha: [212],
  // Fitoterapia
  vitamina: [213,214], complemento: [213,214], suplemento: [213],
  melatonina: [213], magnesio: [213],
};

// Categorías "generales" para búsquedas sin coincidencia exacta
const GENERAL_CATS = [342, 343, 344, 27, 29, 38, 31, 118, 120, 80, 78, 132, 156, 164, 226, 238];

function getCategoryIds(query: string): number[] {
  const normalized = query.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '');
  const terms = normalized.split(/\s+/).filter(t => t.length > 2);
  const ids = new Set<number>();

  for (const term of terms) {
    for (const [key, catIds] of Object.entries(TERM_TO_CATS)) {
      const keyNorm = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (term.includes(keyNorm) || keyNorm.includes(term) || keyNorm.startsWith(term)) {
        catIds.forEach(id => ids.add(id));
      }
    }
  }
  return Array.from(ids);
}

function mapProduct(item: any) {
  let price: number | null = null;
  let pricePerUnitString = '';
  if (item.price_instructions) {
    price = parseFloat(item.price_instructions.unit_price ?? item.price_instructions.price);
    pricePerUnitString = item.price_instructions.price_per_unit_string ?? '';
  } else if (item.price) {
    price = parseFloat(item.price);
  }

  let unit = 'uds';
  const unitName = (item.price_instructions?.unit_name ?? '').toLowerCase();
  if (unitName.includes('litro') || unitName === 'l') unit = 'l';
  else if (unitName.includes('kilo') || unitName === 'kg') unit = 'kg';
  else if (unitName.includes('gram') || unitName === 'g') unit = 'g';
  else if (unitName.includes('pack') || unitName.includes('paquet')) unit = 'pack';

  let imgUrl: string = item.thumbnail ?? item.image_url ?? '';
  if (imgUrl && !imgUrl.startsWith('http')) {
    imgUrl = `https://prod-mercadona.imgix.net/images/${imgUrl}`;
  }

  return {
    id: String(item.id ?? Math.random()),
    name: item.display_name ?? item.name ?? '',
    price: price !== null && !isNaN(price) ? price : null,
    priceString: price !== null ? `${price.toFixed(2)} €` : '',
    pricePerUnitString,
    imageUrl: imgUrl,
    unit,
  };
}

async function fetchCategory(catId: number): Promise<any[]> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 5000);
  try {
    const res = await fetch(
      `https://tienda.mercadona.es/api/v1_1/categories/${catId}/?lang=es`,
      {
        signal: ctrl.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'es-ES,es;q=0.9',
          'referer': 'https://tienda.mercadona.es/',
        },
      }
    );
    clearTimeout(t);
    if (!res.ok) return [];
    const data = await res.json();
    const products: any[] = [];
    if (Array.isArray(data.categories)) {
      for (const sub of data.categories) {
        if (Array.isArray(sub.products)) products.push(...sub.products);
      }
    }
    if (Array.isArray(data.products)) products.push(...data.products);
    return products;
  } catch {
    clearTimeout(t);
    return [];
  }
}

function scoreProducts(products: any[], queryTerms: string[]): any[] {
  return products
    .map(item => {
      const nameLower = (item.display_name ?? item.name ?? '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      let score = 0;
      for (const term of queryTerms) {
        const termNFD = term.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (nameLower.startsWith(termNFD)) score += 10;
        else if (nameLower.includes(termNFD)) score += 5;
      }
      return { item, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.item);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const query = req.query.q;
  if (!query || typeof query !== 'string' || !query.trim()) return res.json({ products: [] });

  const normalizedQuery = query.toLowerCase().trim();
  const queryTerms = normalizedQuery.split(/\s+/).filter(t => t.length > 1);

  // ── Intento 1: API de categorías con detección inteligente ────────────────
  try {
    let categoryIds = getCategoryIds(normalizedQuery);

    // Si no hay coincidencia exacta, usar categorías generales
    if (categoryIds.length === 0) {
      categoryIds = GENERAL_CATS;
    }

    // Limitar a máximo 5 categorías para no exceder el tiempo de respuesta
    const catsToFetch = categoryIds.slice(0, 5);

    const allProductArrays = await Promise.all(catsToFetch.map(fetchCategory));
    const allProducts = allProductArrays.flat();

    if (allProducts.length > 0) {
      let filtered = scoreProducts(allProducts, queryTerms);

      // Si no hay coincidencias exactas pero hay productos, devolver los primeros
      if (filtered.length === 0 && categoryIds !== GENERAL_CATS) {
        filtered = allProducts.slice(0, 15);
      }

      const mapped = filtered.slice(0, 15).map(mapProduct).filter(p => p.name.length > 0);
      if (mapped.length > 0) {
        return res.json({ products: mapped, source: 'category_mercadona' });
      }
    }
  } catch (_) { /* fall through */ }

  // ── Fallback estático mínimo ──────────────────────────────────────────────
  return res.json({
    products: [],
    source: 'no_results',
    message: 'No se encontraron productos. Intenta con otro término.'
  });
}
