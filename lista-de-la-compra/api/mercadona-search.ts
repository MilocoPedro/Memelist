import type { VercelRequest, VercelResponse } from '@vercel/node';

// IDs de CATEGORÍAS PADRE válidas de Mercadona (no subcategorías)
// Fuente: /api/v1_1/categories/?lang=es
const ALL_PARENT_CATS = [12,18,15,13,9,24,19,8,3,7,4,17,14,21,20,23,1,6,26,22,2,25,5,16,11,10];

// Mapa término → IDs de categoría padre
// IMPORTANTE: solo coincidencia exacta de palabra completa, no substring
const TERM_TO_CATS: Record<string, number[]> = {
  // Leche y lácteos (cat 6)
  leche: [6], lacteo: [6], lacteos: [6], batido: [6], horchata: [6],
  yogur: [11], yogures: [11], bifidus: [11], natillas: [11], flan: [11], postre: [11],
  mantequilla: [6], margarina: [6], nata: [6], huevo: [6], huevos: [6],
  // Frutas y verduras (cat 1)
  fruta: [1], frutas: [1], verdura: [1], verduras: [1],
  manzana: [1], platano: [1], naranja: [1], pera: [1], fresa: [1], fresas: [1],
  kiwi: [1], melocoton: [1], uva: [1], sandia: [1], melon: [1], cereza: [1],
  mandarina: [1], limon: [1], lima: [1], pomelo: [1], aguacate: [1],
  mango: [1], pina: [1], ciruela: [1], granada: [1],
  tomate: [1,14], lechuga: [1], ensalada: [1], zanahoria: [1], cebolla: [1],
  patata: [1], pimiento: [1], brocoli: [1], coliflor: [1], espinaca: [1],
  acelga: [1], apio: [1], pepino: [1], calabacin: [1], berenjena: [1],
  alcachofa: [1], esparragos: [1], puerro: [1], ajo: [1],
  // Carne (cat 3)
  pollo: [3], pechuga: [3], muslo: [3], alita: [3],
  ternera: [3], vacuno: [3], bistec: [3], filete: [3], entrecot: [3],
  cerdo: [3], costilla: [3], panceta: [3],
  cordero: [3], conejo: [3],
  hamburguesa: [3], picada: [3], albondiga: [3],
  nugget: [3], croqueta: [3], empanado: [3],
  carne: [3], carnes: [3],
  // Charcutería y quesos (cat 4)
  jamon: [4], serrano: [4], cocido: [4],
  chorizo: [4], salchichon: [4], fuet: [4], embutido: [4],
  bacon: [4], salchicha: [4], frankfurt: [4],
  pate: [4], sobrasada: [4], chopped: [4], mortadela: [4],
  queso: [4], quesos: [4], rallado: [4], untable: [4],
  // Panadería (cat 5)
  pan: [5], baguette: [5], hogaza: [5], molde: [5],
  tostada: [5], biscote: [5], pico: [5], rosquilleta: [5],
  croissant: [5], bolleria: [5], magdalena: [5], bizcocho: [5],
  muffin: [5], donut: [5], tarta: [5], pastel: [5],
  harina: [5], levadura: [5],
  // Huevos leche mantequilla ya cubierto en cat 6
  // Cereales y galletas (cat 7)
  galleta: [7], galletas: [7], maria: [7], oreo: [7],
  cereal: [7], cereales: [7], muesli: [7],
  tortita: [7], tortitas: [7],
  // Cacao café (cat 8)
  cafe: [8], capsula: [8], nespresso: [8],
  soluble: [8], molido: [8],
  cacao: [8], colacao: [8], nesquik: [8],
  infusion: [8], manzanilla: [8], poleo: [8], rooibos: [8],
  // Azucar caramelos (cat 9)
  chocolate: [9], tableta: [9], bombon: [9],
  azucar: [9], edulcorante: [9], stevia: [9],
  caramelo: [9], chicle: [9], chuche: [9], gominola: [9],
  mermelada: [9], miel: [9], nocilla: [9], nutella: [9],
  // Zumos (cat 10)
  zumo: [10], zumos: [10],
  // Yogures postres (cat 11 ya cubierto)
  // Aceites salsas especias (cat 12)
  aceite: [12], oliva: [12], girasol: [12], vinagre: [12], sal: [12],
  pimienta: [12], oregano: [12], especias: [12], condimento: [12],
  ketchup: [12], mostaza: [12], mayonesa: [12], salsa: [12],
  // Arroz legumbres pasta (cat 13)
  arroz: [13], macarron: [13], macarrones: [13], espagueti: [13],
  pasta: [13], fideos: [13], tallarines: [13], lasana: [13],
  lenteja: [13], lentejas: [13], garbanzo: [13], garbanzos: [13],
  alubia: [13], judias: [13], guisante: [13],
  // Conservas (cat 14)
  conserva: [14], lata: [14], atun: [14], sardina: [14],
  mejillon: [14], berberecho: [14], anchoa: [14],
  gazpacho: [14], salmorejo: [14], sopa: [14], caldo: [14],
  tomarofrito: [14], triturado: [14],
  // Aperitivos (cat 15)
  patatasfrita: [15], chips: [15], snack: [15], pipas: [15],
  aceitunas: [15], encurtidos: [15], pepinillo: [15],
  frutoseco: [15], almendra: [15], nuez: [15], anacardo: [15], cacahuete: [15],
  // Pizzas platos (cat 16)
  pizza: [16], pizzas: [16], plato: [16], precocinado: [16],
  // Congelados (cat 17)
  congelado: [17], congelada: [17], helado: [17], helados: [17],
  // Agua refrescos (cat 18)
  agua: [18], aguas: [18], mineral: [18],
  refresco: [18], cocacola: [18], fanta: [18], sprite: [18],
  tonica: [18], isotonica: [18], energetica: [18],
  // Bodega (cat 19)
  cerveza: [19], birra: [19],
  vino: [19], tinto: [19], blanco: [19], rosado: [19],
  cava: [19], sidra: [19], champan: [19],
  licor: [19], whisky: [19], ron: [19], vodka: [19], ginebra: [19],
  // Cuidado facial corporal (cat 20)
  gel: [20], jabon: [20], jabonmanos: [20],
  crema: [20], hidratante: [20], locion: [20],
  desodorante: [20], antiperspirant: [20],
  afeitado: [20], maquinilla: [20],
  colonia: [20], perfume: [20],
  solar: [20], protectorsolar: [20],
  // Cuidado cabello (cat 21)
  champu: [21], acondicionador: [21], mascarilla: [21], tinte: [21],
  // Maquillaje (cat 22)
  rimmel: [22], labial: [22], colorete: [22], base: [22], corrector: [22],
  // Fitoterapia (cat 23)
  vitamina: [23], complemento: [23], suplemento: [23], melatonina: [23],
  // Bebé (cat 24)
  bebe: [24], papilla: [24], toallitabebe: [24], panal: [24], biberon: [24],
  // Mascotas (cat 25)
  perro: [25], gato: [25], pienso: [25], mascota: [25],
  // Limpieza hogar (cat 26)
  detergente: [26], suavizante: [26], quitamanchas: [26],
  fregasuelos: [26], multiusos: [26], limpiador: [26],
  lejia: [26], amoniaco: [26], limpiacristal: [26],
  lavavajillas: [26], bayeta: [26], estropajo: [26],
  insecticida: [26], ambientador: [26],
  bolsabasura: [26], pilas: [26],
  papel: [26], higienico: [26], celulosa: [26], servilleta: [26],
  quitagrasa: [26], desengrasante: [26], friegasuelos: [26],
  limpiabanos: [26], limpiacacos: [26], wc: [26],
};

function getCategoryIds(query: string): number[] {
  // Normalizar: minúsculas, quitar acentos, quitar caracteres especiales
  const normalized = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();

  const words = normalized.split(/\s+/).filter(w => w.length >= 3);
  const ids = new Set<number>();

  for (const word of words) {
    // Coincidencia EXACTA de palabra (no substring)
    if (TERM_TO_CATS[word]) {
      TERM_TO_CATS[word].forEach(id => ids.add(id));
      continue;
    }
    // Coincidencia por prefijo de 4+ letras (ej: "toall" → toallita)
    if (word.length >= 4) {
      for (const [key, catIds] of Object.entries(TERM_TO_CATS)) {
        if (key.startsWith(word) || word.startsWith(key)) {
          catIds.forEach(id => ids.add(id));
        }
      }
    }
  }

  return Array.from(ids);
}

function mapProduct(item: any) {
  let price: number | null = null;
  let pricePerUnitString = '';
  if (item.price_instructions) {
    const raw = item.price_instructions.unit_price ?? item.price_instructions.bulk_price ?? item.price_instructions.price;
    price = raw !== null && raw !== undefined ? parseFloat(raw) : null;
    pricePerUnitString = item.price_instructions.price_per_unit_string ?? '';
    // Construir pricePerUnitString si no existe
    if (!pricePerUnitString && item.price_instructions.reference_price && item.price_instructions.reference_format) {
      pricePerUnitString = `${parseFloat(item.price_instructions.reference_price).toFixed(2)} €/${item.price_instructions.reference_format}`;
    }
  } else if (item.price) {
    price = parseFloat(item.price);
  }

  let unit = 'uds';
  const unitName = (item.price_instructions?.unit_name ?? '').toLowerCase();
  if (unitName.includes('litro') || unitName === 'l') unit = 'l';
  else if (unitName.includes('kilo') || unitName === 'kg') unit = 'kg';
  else if (unitName.includes('gram') || unitName === 'g') unit = 'g';
  else if (unitName.includes('pack') || unitName.includes('paquet')) unit = 'pack';

  const imgUrl: string = item.thumbnail ?? item.image_url ?? '';

  return {
    id: String(item.id ?? Math.random()),
    name: item.display_name ?? item.name ?? '',
    price: price !== null && !isNaN(price) ? price : null,
    priceString: price !== null && !isNaN(price) ? `${price.toFixed(2)} €` : '',
    pricePerUnitString,
    imageUrl: imgUrl,
    unit,
  };
}

async function fetchParentCategory(catId: number): Promise<any[]> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 5000);
  try {
    const url = `https://tienda.mercadona.es/api/v1_1/categories/${catId}/?lang=es`;
    console.log(`[Mercadona] Fetching category ${catId}: ${url}`);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'es-ES,es;q=0.9',
        'referer': 'https://tienda.mercadona.es/',
      },
    });
    clearTimeout(t);
    console.log(`[Mercadona] Category ${catId} status: ${res.status}`);
    if (!res.ok) return [];
    const data = await res.json();
    const products: any[] = [];
    if (Array.isArray(data.categories)) {
      for (const sub of data.categories) {
        if (Array.isArray(sub.products)) products.push(...sub.products);
      }
    }
    if (Array.isArray(data.products)) products.push(...data.products);
    console.log(`[Mercadona] Category ${catId} returned ${products.length} products`);
    return products;
  } catch (err: any) {
    clearTimeout(t);
    console.error(`[Mercadona] Category ${catId} error: ${err.message}`);
    return [];
  }
}

function scoreAndFilter(products: any[], queryWords: string[]): any[] {
  const seen = new Set<string>();
  return products
    .map(item => {
      const name = item.display_name ?? item.name ?? '';
      const nameLower = name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      let score = 0;
      for (const word of queryWords) {
        const wordNFD = word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (nameLower === wordNFD) score += 20;
        else if (nameLower.startsWith(wordNFD)) score += 10;
        else if (nameLower.includes(wordNFD)) score += 5;
      }
      return { item, score, name };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .filter(x => {
      // Deduplicar por nombre similar
      const key = x.name.toLowerCase().substring(0, 30);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(x => x.item);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const query = req.query.q;
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.json({ products: [] });
  }

  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/).filter(w => w.length >= 2);

  // Obtener categorías relevantes
  let categoryIds = getCategoryIds(normalizedQuery);

  // Si no hay match, buscar en categorías más comunes
  if (categoryIds.length === 0) {
    categoryIds = [1, 3, 6, 7, 13, 14, 18, 26];
  }

  // Limitar a 4 categorías para no superar timeout de Vercel (10s)
  const catsToFetch = categoryIds.slice(0, 4);

  try {
    const allProductArrays = await Promise.all(catsToFetch.map(fetchParentCategory));
    const allProducts = allProductArrays.flat();

    if (allProducts.length > 0) {
      const filtered = scoreAndFilter(allProducts, queryWords);

      if (filtered.length > 0) {
        const mapped = filtered.slice(0, 15).map(mapProduct).filter(p => p.name.length > 0);
        if (mapped.length > 0) {
          return res.json({ products: mapped, source: 'category_mercadona' });
        }
      }

      // Hay productos en la categoría pero ninguno coincide con el término exacto
      // Devolver los primeros de la categoría más relevante
      const firstBatch = allProductArrays[0]?.slice(0, 10) ?? [];
      if (firstBatch.length > 0) {
        const mapped = firstBatch.map(mapProduct).filter(p => p.name.length > 0);
        return res.json({ products: mapped, source: 'category_mercadona_broad' });
      }
    }
  } catch (_) { /* fall through */ }

  return res.json({
    products: [],
    source: 'no_results',
    message: 'No se encontraron productos. Intenta con otro término de búsqueda.'
  });
}
