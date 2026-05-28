import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mapa de términos de búsqueda → IDs de categoría de Mercadona
const CATEGORY_MAP: Record<string, number[]> = {
  leche: [72], lacteo: [72], lacteos: [72],
  huevo: [77], huevos: [77],
  mantequilla: [75], margarina: [75], nata: [75],
  fruta: [27], manzana: [27], platano: [27], naranja: [27], fresa: [27], pera: [27], limon: [27], aguacate: [27],
  verdura: [29], tomate: [29], lechuga: [29], zanahoria: [29], cebolla: [29], patata: [29], pimiento: [29], brocoli: [29],
  pollo: [38], pechuga: [38], pavo: [38],
  carne: [37, 38, 40], ternera: [40], cerdo: [37], jamon: [50], chorizo: [51], embutido: [51],
  pescado: [31], salmon: [31], merluza: [31], atun: [122], marisco: [32], gamba: [32],
  agua: [156], refresco: [158, 159], cocacola: [158], cerveza: [164], vino: [169, 170, 171],
  yogur: [103, 104, 105], bifidus: [105],
  queso: [54, 56], quesos: [54, 56],
  arroz: [118], pasta: [120], macarrones: [120], espagueti: [120], legumbre: [121], lenteja: [121], garbanzo: [121],
  galleta: [80], galletas: [80], cereal: [78], cereales: [78], tortita: [79],
  pan: [59, 60], croissant: [65], bolleria: [65, 66], magdalena: [66],
  chocolate: [92], dulce: [92, 95, 97], caramelo: [95], mermelada: [90],
  cafe: [83, 84], infusion: [88], te: [88],
  aceite: [112], vinagre: [112], sal: [112], salsa: [117], tomate_frito: [126],
  conserva: [122, 123, 126, 127], atun_lata: [122], berberecho: [123],
  congelado: [145, 148, 149, 150], helado: [154],
  champu: [199], gel: [187], jabon: [187], dentifrico: [186], pasta_dientes: [186],
  detergente: [226], suavizante: [226], lejia: [234], lavavajillas: [229],
  papel: [238], higienico: [238], celulosa: [238], servilleta: [238],
  bolsa: [239], basura: [239],
  toallita: [217], panal: [217], bebe: [216, 217, 218],
  perro: [221], gato: [222], mascota: [221, 222], pienso: [221, 222],
};

function getCategoryIds(query: string): number[] {
  const terms = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/\s+/);
  const ids = new Set<number>();
  for (const term of terms) {
    for (const [key, catIds] of Object.entries(CATEGORY_MAP)) {
      if (term.includes(key) || key.includes(term)) {
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
  const unitName = item.price_instructions?.unit_name?.toLowerCase() ?? '';
  if (unitName.includes('litro') || unitName === 'l') unit = 'l';
  else if (unitName.includes('kilo') || unitName === 'kg') unit = 'kg';
  else if (unitName.includes('gram') || unitName === 'g') unit = 'g';
  else if (unitName.includes('pack') || unitName.includes('paquet')) unit = 'pack';

  let imgUrl: string = item.thumbnail ?? item.image_url ?? '';
  if (imgUrl && !imgUrl.startsWith('http')) {
    imgUrl = `https://prod-mercadona.imgix.net/images/${imgUrl}`;
  }

  return {
    id: item.id ?? Math.random().toString(),
    name: item.display_name ?? item.name ?? '',
    price: price !== null && !isNaN(price) ? price : null,
    priceString: price !== null ? `${price.toFixed(2)} €` : '',
    pricePerUnitString,
    imageUrl: imgUrl,
    unit,
  };
}

const MERCADONA_STATIC_CATALOG = [
  { name: 'Toallitas WC húmedas Bosque Verde', price: 1.25, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=120&q=50', pricePerUnitString: '0.02 €/ud.' },
  { name: 'Leche semidesnatada Hacendado (6 briks x 1 L)', price: 5.04, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=120&q=50', pricePerUnitString: '0.84 €/L' },
  { name: 'Leche entera Hacendado (6 briks x 1 L)', price: 5.76, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=120&q=50', pricePerUnitString: '0.96 €/L' },
  { name: 'Leche semidesnatada sin lactosa Hacendado', price: 5.64, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1528750994863-10af4dd98e32?w=120&q=50', pricePerUnitString: '0.94 €/L' },
  { name: 'Leche desnatada Hacendado (6 briks x 1 L)', price: 4.92, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1628114264639-577e7f6423cc?w=120&q=50', pricePerUnitString: '0.82 €/L' },
  { name: 'Leche semidesnatada Hacendado (Brik 1 L)', price: 0.84, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=120&q=50', pricePerUnitString: '0.84 €/ud.' },
  { name: 'Leche entera Hacendado (Brik 1 L)', price: 0.96, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=120&q=50', pricePerUnitString: '0.96 €/ud.' },
  { name: 'Tomate frito Hacendado', price: 1.20, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=120&q=50', pricePerUnitString: '2.40 €/kg' },
  { name: 'Papel higiénico Bosque Verde doble rollo', price: 2.85, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=120&q=50', pricePerUnitString: '0.24 €/rollo' },
  { name: 'Galletas María Hacendado', price: 1.40, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=120&q=50', pricePerUnitString: '1.75 €/kg' },
  { name: 'Plátano de Canarias', price: 1.59, unit: 'kg', imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=120&q=50', pricePerUnitString: '1.59 €/kg' },
  { name: 'Manzana Golden Hacendado', price: 1.85, unit: 'kg', imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=120&q=50', pricePerUnitString: '1.85 €/kg' },
  { name: 'Lechuga iceberg fresca', price: 0.99, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1622484211148-717498c0b0b8?w=120&q=50', pricePerUnitString: '0.99 €/ud.' },
  { name: 'Tomate pera ensalada', price: 1.89, unit: 'kg', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=120&q=50', pricePerUnitString: '1.89 €/kg' },
  { name: 'Aguacate maduro Hacendado', price: 2.49, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=120&q=50', pricePerUnitString: '4.98 €/kg' },
  { name: 'Huevos camperos clase L Hacendado', price: 2.35, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=120&q=50', pricePerUnitString: '0.20 €/ud.' },
  { name: 'Pechuga de pollo fileteada Hacendado', price: 6.49, unit: 'kg', imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=120&q=50', pricePerUnitString: '6.49 €/kg' },
  { name: 'Bistec de ternera blanca Hacendado', price: 9.95, unit: 'kg', imageUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=120&q=50', pricePerUnitString: '9.95 €/kg' },
  { name: 'Salmón fresco en rodajas Hacendado', price: 14.99, unit: 'kg', imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=120&q=50', pricePerUnitString: '14.99 €/kg' },
  { name: 'Atún claro en aceite de oliva Hacendado', price: 2.80, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=120&q=50', pricePerUnitString: '11.20 €/kg' },
  { name: 'Arroz redondo Hacendado 1kg', price: 1.30, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=120&q=50', pricePerUnitString: '1.30 €/kg' },
  { name: 'Macarrones Hacendado pasta de trigo', price: 0.85, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=120&q=50', pricePerUnitString: '1.70 €/kg' },
  { name: 'Aceite de oliva virgen extra Hacendado 1L', price: 8.50, unit: 'l', imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=120&q=50', pricePerUnitString: '8.50 €/L' },
  { name: 'Agua mineral natural Hacendado 1.5L', price: 0.35, unit: 'l', imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=120&q=50', pricePerUnitString: '0.23 €/L' },
  { name: 'Cerveza clásica Steinburg lata 33cl', price: 0.38, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=120&q=50', pricePerUnitString: '1.15 €/L' },
  { name: 'Vino tinto Rioja Hacendado', price: 4.50, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=120&q=50', pricePerUnitString: '6.00 €/L' },
  { name: 'Yogur desnatado bífidus fresa Hacendado', price: 1.15, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=120&q=50', pricePerUnitString: '2.30 €/kg' },
  { name: 'Queso mezcla semicurado Hacendado cuña', price: 3.40, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1486887396183-f11c5f5a608a?w=120&q=50', pricePerUnitString: '8.50 €/kg' },
  { name: 'Patatas fritas extra crujientes Hacendado', price: 1.10, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d22?w=120&q=50', pricePerUnitString: '7.33 €/kg' },
  { name: 'Croissants de mantequilla pack de 4', price: 1.95, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=120&q=50', pricePerUnitString: '0.49 €/ud.' },
  { name: 'Chocolate negro 85% Hacendado tableta', price: 1.25, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92ca8a7a72?w=120&q=50', pricePerUnitString: '12.50 €/kg' },
  { name: 'Café soluble nescafé classic', price: 3.65, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=120&q=50', pricePerUnitString: '36.50 €/kg' },
  { name: 'Naranjas de zumo bolsa 3kg', price: 2.99, unit: 'kg', imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=120&q=50', pricePerUnitString: '1.00 €/kg' },
  { name: 'Fresas de Huelva tarrina', price: 2.15, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=120&q=50', pricePerUnitString: '4.30 €/kg' },
  { name: 'Detergente cápsulas lavadora Bosque Verde', price: 3.99, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=120&q=50', pricePerUnitString: '0.20 €/dosis' },
  { name: 'Pañales bebé talla 4 Deliplus secos', price: 8.50, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=120&q=50', pricePerUnitString: '0.18 €/pañal' },
  { name: 'Zanahorias bolsa 1kg', price: 0.79, unit: 'kg', imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=120&q=50', pricePerUnitString: '0.79 €/kg' },
  { name: 'Cebolla dulce 1kg', price: 1.45, unit: 'kg', imageUrl: 'https://images.unsplash.com/photo-1508747702-f89e0f59ceda?w=120&q=50', pricePerUnitString: '1.45 €/kg' },
  { name: 'Pienso para carne de perro adulto Hacendado', price: 6.99, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=120&q=50', pricePerUnitString: '1.75 €/kg' },
  { name: 'Comida húmeda gato buey en salsa Hacendado', price: 0.45, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=120&q=50', pricePerUnitString: '4.50 €/kg' },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const query = req.query.q;
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.json({ products: [] });
  }

  const normalizedQuery = query.toLowerCase().trim();
  const queryTerms = normalizedQuery.split(/\s+/).filter((t) => t.length > 0);

  // ── Intento 1: API live de búsqueda (suele estar bloqueada en Vercel) ──────
  try {
    const postalCode = (req.query.postalCode as string) || '45600';
    const ctrl1 = new AbortController();
    const t1 = setTimeout(() => ctrl1.abort(), 3000);

    const warehouseRes = await fetch(
      `https://tienda.mercadona.es/api/v1_1/stores/?postal_code=${postalCode}`,
      {
        signal: ctrl1.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'es-ES,es;q=0.9',
          'referer': 'https://tienda.mercadona.es/',
          'origin': 'https://tienda.mercadona.es',
        },
      }
    );
    clearTimeout(t1);

    if (warehouseRes.ok) {
      const warehouseData = await warehouseRes.json();
      const warehouseId: string | null = warehouseData?.id ?? warehouseData?.[0]?.id ?? null;

      if (warehouseId) {
        const ctrl2 = new AbortController();
        const t2 = setTimeout(() => ctrl2.abort(), 3000);
        const searchRes = await fetch(
          `https://tienda.mercadona.es/api/v1_1/search/?query=${encodeURIComponent(query)}&lang=es&wh=${warehouseId}`,
          {
            signal: ctrl2.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/json',
              'Accept-Language': 'es-ES,es;q=0.9',
              'referer': 'https://tienda.mercadona.es/',
              'origin': 'https://tienda.mercadona.es',
            },
          }
        );
        clearTimeout(t2);

        if (searchRes.ok) {
          const body = await searchRes.json();
          let rawProducts: any[] = [];
          if (Array.isArray(body.products)) rawProducts = body.products;
          else if (Array.isArray(body.results)) rawProducts = body.results;
          else if (Array.isArray(body.sections)) {
            for (const sec of body.sections) {
              if (Array.isArray(sec.products)) rawProducts.push(...sec.products);
              if (Array.isArray(sec.categories)) {
                for (const cat of sec.categories) {
                  if (Array.isArray(cat.products)) rawProducts.push(...cat.products);
                }
              }
            }
          }
          const mapped = rawProducts.map(mapProduct).filter((p) => p.name.length > 0);
          if (mapped.length > 0) {
            return res.json({ products: mapped.slice(0, 15), source: 'live_mercadona' });
          }
        }
      }
    }
  } catch (_) { /* fall through */ }

  // ── Intento 2: API de categorías (no bloqueada, imágenes reales) ───────────
  try {
    const categoryIds = getCategoryIds(normalizedQuery);
    if (categoryIds.length > 0) {
      const allProducts: any[] = [];

      await Promise.all(
        categoryIds.slice(0, 3).map(async (catId) => {
          try {
            const ctrl = new AbortController();
            const t = setTimeout(() => ctrl.abort(), 4000);
            const catRes = await fetch(
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

            if (catRes.ok) {
              const catData = await catRes.json();
              // Extraer productos de subcategorías
              if (Array.isArray(catData.categories)) {
                for (const subcat of catData.categories) {
                  if (Array.isArray(subcat.products)) {
                    allProducts.push(...subcat.products);
                  }
                }
              }
              if (Array.isArray(catData.products)) {
                allProducts.push(...catData.products);
              }
            }
          } catch (_) { /* ignore individual category failures */ }
        })
      );

      if (allProducts.length > 0) {
        // Filtrar por términos de búsqueda y puntuar
        const normalizedNFD = normalizedQuery.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const scored = allProducts
          .map((item) => {
            const nameLower = (item.display_name ?? item.name ?? '').toLowerCase()
              .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            let score = 0;
            if (nameLower.startsWith(normalizedNFD)) score += 10;
            if (nameLower.includes(normalizedNFD)) score += 5;
            const matchedTerms = queryTerms.filter((t) => {
              const tNFD = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
              return nameLower.includes(tNFD);
            });
            score += matchedTerms.length * 3;
            return { item, score };
          })
          .filter((x) => x.score > 0)
          .sort((a, b) => b.score - a.score);

        if (scored.length > 0) {
          const mapped = scored.slice(0, 15).map((x) => mapProduct(x.item)).filter((p) => p.name.length > 0);
          if (mapped.length > 0) {
            return res.json({ products: mapped, source: 'category_mercadona' });
          }
        }
      }
    }
  } catch (_) { /* fall through to static */ }

  // ── Fallback estático con búsqueda fuzzy ──────────────────────────────────
  const scored = MERCADONA_STATIC_CATALOG.map((item) => {
    const itemLower = item.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const qNFD = normalizedQuery.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let score = 0;
    if (itemLower.startsWith(qNFD)) score += 10;
    if (itemLower.includes(qNFD)) score += 5;
    const matchedTerms = queryTerms.filter((t) => itemLower.includes(t.normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
    score += matchedTerms.length * 3;
    return { ...item, score };
  }).filter((item) => item.score > 0);

  scored.sort((a, b) => b.score - a.score);

  const results = scored.slice(0, 15).map((item) => ({
    id: 'fallback_' + Math.random().toString(36).substring(2, 9),
    name: item.name,
    price: item.price,
    priceString: `${item.price.toFixed(2)} €`,
    pricePerUnitString: item.pricePerUnitString,
    imageUrl: item.imageUrl,
    unit: item.unit,
  }));

  return res.json({ products: results, source: 'local_fallback', recovered: true });
}