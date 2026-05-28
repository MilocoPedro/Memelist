import type { VercelRequest, VercelResponse } from '@vercel/node';

const MERCADONA_STATIC_CATALOG = [
  { name: 'Toallitas WC húmedas Bosque Verde', price: 1.25, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=120&q=50', pricePerUnitString: '0.02 €/ud.' },
  { name: 'Leche semidesnatada Hacendado (6 briks x 1 L)', price: 5.04, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=120&q=50', pricePerUnitString: '0.84 €/L' },
  { name: 'Leche entera Hacendado (6 briks x 1 L)', price: 5.76, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=120&q=50', pricePerUnitString: '0.96 €/L' },
  { name: 'Leche semidesnatada sin lactosa Hacendado (6 briks x 1 L)', price: 5.64, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1528750994863-10af4dd98e32?w=120&q=50', pricePerUnitString: '0.94 €/L' },
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
  { name: 'Champú clásico anticaspa Deliplus', price: 1.80, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=120&q=50', pricePerUnitString: '4.50 €/L' },
  { name: 'Detergente líquido perfume jabón de marsella', price: 4.50, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=120&q=50', pricePerUnitString: '0.15 €/lavado' },
  { name: 'Comida húmeda gato buey en salsa Hacendado', price: 0.45, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=120&q=50', pricePerUnitString: '4.50 €/kg' },
  { name: 'Pienso para carne de perro adulto Hacendado', price: 6.99, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=120&q=50', pricePerUnitString: '1.75 €/kg' },
  { name: 'Pañales bebé talla 4 Deliplus secos', price: 8.50, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=120&q=50', pricePerUnitString: '0.18 €/pañal' },
  { name: 'Zanahorias bolsa 1kg', price: 0.79, unit: 'kg', imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=120&q=50', pricePerUnitString: '0.79 €/kg' },
  { name: 'Cebolla dulce 1kg', price: 1.45, unit: 'kg', imageUrl: 'https://images.unsplash.com/photo-1508747702-f89e0f59ceda?w=120&q=50', pricePerUnitString: '1.45 €/kg' },
  { name: 'Yogur desnatado bífidus fresa Hacendado', price: 1.15, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=120&q=50', pricePerUnitString: '2.30 €/kg' },
  { name: 'Queso mezcla semicurado Hacendado cuña', price: 3.40, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1486887396183-f11c5f5a608a?w=120&q=50', pricePerUnitString: '8.50 €/kg' },
  { name: 'Patatas fritas extra crujientes Hacendado', price: 1.10, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d22?w=120&q=50', pricePerUnitString: '7.33 €/kg' },
  { name: 'Croissants de mantequilla pack de 4', price: 1.95, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=120&q=50', pricePerUnitString: '0.49 €/ud.' },
  { name: 'Chocolate negro 85% Hacendado tableta', price: 1.25, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92ca8a7a72?w=120&q=50', pricePerUnitString: '12.50 €/kg' },
  { name: 'Café soluble nescafé classic', price: 3.65, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=120&q=50', pricePerUnitString: '36.50 €/kg' },
  { name: 'Naranjas de zumo bolsa 3kg', price: 2.99, unit: 'kg', imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=120&q=50', pricePerUnitString: '1.00 €/kg' },
  { name: 'Fresas de Huelva tarrina', price: 2.15, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=120&q=50', pricePerUnitString: '4.30 €/kg' },
  { name: 'Gel de baño dermo protector Deliplus', price: 1.25, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=120&q=50', pricePerUnitString: '1.25 €/L' },
  { name: 'Detergente cápsulas lavadora Bosque Verde', price: 3.99, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=120&q=50', pricePerUnitString: '0.20 €/dosis' },
  { name: 'Toallitas de Bebé Deliplus cremosa piel delicada', price: 1.45, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=120&q=50', pricePerUnitString: '0.02 €/ud.' },
  { name: 'Ensalada jamón de pavo y queso', price: 2.89, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=120&q=50', pricePerUnitString: '14.45 €/kg' },
  { name: 'Helado de cookies Hacendado', price: 2.90, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=120&q=50', pricePerUnitString: '5.80 €/L' },
  { name: 'Helado de vainilla y macadamia Hacendado', price: 2.90, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1501443762994-12905442d5b8?w=120&q=50', pricePerUnitString: '5.80 €/L' },
  { name: 'Suavizante azul Bosque Verde concentrado', price: 1.90, unit: 'l', imageUrl: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=120&q=50', pricePerUnitString: '0.05 €/dosis' },
  { name: 'Muffins de chocolate Hacendado', price: 1.85, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=120&q=50', pricePerUnitString: '0.46 €/ud.' },
  { name: 'Mermelada de fresa Hacendado', price: 1.15, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=120&q=50', pricePerUnitString: '2.30 €/kg' },
  { name: 'Mantequilla Hacendado sin sal', price: 1.85, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=120&q=50', pricePerUnitString: '9.25 €/kg' },
  { name: 'Jamón serrano loncheado Hacendado', price: 2.45, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=120&q=50', pricePerUnitString: '16.33 €/kg' },
  { name: 'Chorizo extra picante loncheado Hacendado', price: 1.95, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=120&q=50', pricePerUnitString: '13.00 €/kg' },
  { name: 'Espaguetis Hacendado nº3', price: 0.80, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=120&q=50', pricePerUnitString: '1.60 €/kg' },
  { name: 'Lentejas cocidas Hacendado bote', price: 0.95, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=120&q=50', pricePerUnitString: '1.90 €/kg' },
  { name: 'Garbanzos cocidos Hacendado bote', price: 0.95, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=120&q=50', pricePerUnitString: '1.90 €/kg' },
  { name: 'Brócoli fresco bolsa', price: 1.29, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=120&q=50', pricePerUnitString: '2.58 €/kg' },
  { name: 'Pimiento rojo fresco', price: 1.99, unit: 'kg', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=120&q=50', pricePerUnitString: '1.99 €/kg' },
  { name: 'Pimiento verde fresco', price: 1.49, unit: 'kg', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=120&q=50', pricePerUnitString: '1.49 €/kg' },
  { name: 'Limones malla 500g', price: 0.89, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=120&q=50', pricePerUnitString: '1.78 €/kg' },
  { name: 'Zumo de naranja brick Hacendado 1L', price: 1.35, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=120&q=50', pricePerUnitString: '1.35 €/L' },
  { name: 'Coca-Cola lata 33cl pack 8', price: 5.99, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=120&q=50', pricePerUnitString: '0.75 €/lata' },
  { name: 'Agua con gas Hacendado 1.5L', price: 0.45, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=120&q=50', pricePerUnitString: '0.30 €/L' },
  { name: 'Leche de avena Hacendado brick 1L', price: 1.25, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=120&q=50', pricePerUnitString: '1.25 €/L' },
  { name: 'Nata líquida para cocinar Hacendado', price: 0.85, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=120&q=50', pricePerUnitString: '2.83 €/L' },
  { name: 'Queso rallado mezcla cuatro quesos Hacendado', price: 1.95, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1486887396183-f11c5f5a608a?w=120&q=50', pricePerUnitString: '9.75 €/kg' },
  { name: 'Pan de molde integral Hacendado', price: 1.35, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=120&q=50', pricePerUnitString: '2.70 €/kg' },
  { name: 'Pan de molde blanco Hacendado', price: 1.15, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=120&q=50', pricePerUnitString: '2.30 €/kg' },
  { name: 'Tortitas de arroz Hacendado', price: 0.95, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=120&q=50', pricePerUnitString: '4.75 €/kg' },
  { name: 'Cereales de maíz Hacendado', price: 1.45, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=120&q=50', pricePerUnitString: '2.90 €/kg' },
  { name: 'Pasta de dientes blanqueadora Deliplus', price: 1.10, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=120&q=50', pricePerUnitString: '5.50 €/L' },
  { name: 'Jabón de manos liquido Deliplus', price: 0.95, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=120&q=50', pricePerUnitString: '1.90 €/L' },
  { name: 'Servilletas Hacendado 33x33 pack 100', price: 1.15, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=120&q=50', pricePerUnitString: '0.01 €/ud.' },
  { name: 'Bolsas de basura Bosque Verde 30L', price: 1.25, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=120&q=50', pricePerUnitString: '0.04 €/ud.' },
  { name: 'Lavavajillas líquido Bosque Verde limón', price: 1.35, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=120&q=50', pricePerUnitString: '2.70 €/L' },
  { name: 'Lejía perfumada Bosque Verde', price: 0.95, unit: 'uds', imageUrl: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=120&q=50', pricePerUnitString: '0.63 €/L' },
  { name: 'Papel de cocina Bosque Verde 2 rollos', price: 1.05, unit: 'pack', imageUrl: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=120&q=50', pricePerUnitString: '0.53 €/rollo' },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const query = req.query.q;
  const postalCode = (req.query.postalCode as string) || '45600';

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.json({ products: [] });
  }

  const normalizedQuery = query.toLowerCase().trim();
  const queryTerms = normalizedQuery.split(/\s+/).filter(t => t.length > 0);

  // Intentar API live de Mercadona
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    // Paso 1: obtener warehouse ID por código postal
    const warehouseRes = await fetch(
      `https://tienda.mercadona.es/api/v1_1/stores/?postal_code=${postalCode}`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'es-ES,es;q=0.9',
          'referer': 'https://tienda.mercadona.es/',
          'origin': 'https://tienda.mercadona.es',
        }
      }
    );

    clearTimeout(timeoutId);

    if (warehouseRes.ok) {
      const warehouseData = await warehouseRes.json();
      const warehouseId = warehouseData?.id || warehouseData?.[0]?.id || null;

      if (warehouseId) {
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 3000);

        const searchRes = await fetch(
          `https://tienda.mercadona.es/api/v1_1/search/?query=${encodeURIComponent(query)}&lang=es&wh=${warehouseId}`,
          {
            signal: controller2.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/json',
              'Accept-Language': 'es-ES,es;q=0.9',
              'referer': 'https://tienda.mercadona.es/',
              'origin': 'https://tienda.mercadona.es',
            }
          }
        );

        clearTimeout(timeoutId2);

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

          const mapped = rawProducts.map((item: any) => {
            let price = null;
            let pricePerUnitString = '';
            if (item.price_instructions) {
              price = parseFloat(item.price_instructions.unit_price || item.price_instructions.price);
              pricePerUnitString = item.price_instructions.price_per_unit_string || '';
            } else if (item.price) {
              price = parseFloat(item.price);
            }

            let unit = 'uds';
            if (item.price_instructions?.unit_name) {
              const u = item.price_instructions.unit_name.toLowerCase();
              if (u.includes('litro') || u === 'l') unit = 'l';
              else if (u.includes('kilo') || u === 'kg') unit = 'kg';
              else if (u.includes('gram') || u === 'g') unit = 'g';
              else if (u.includes('pack') || u.includes('paquet')) unit = 'pack';
            }

            let imgUrl = item.thumbnail || item.image_url || '';
            if (imgUrl && !imgUrl.startsWith('http')) {
              imgUrl = `https://prod-mercadona.imgix.net/images/${imgUrl}`;
            }

            return {
              id: item.id || Math.random().toString(),
              name: item.display_name || item.name || '',
              price: price !== null && !isNaN(price) ? price : null,
              priceString: price !== null ? `${price.toFixed(2)} €` : '',
              pricePerUnitString,
              imageUrl: imgUrl,
              unit,
            };
          }).filter((p: any) => p.name.length > 0);

          if (mapped.length > 0) {
            return res.json({ products: mapped.slice(0, 15), source: 'live_mercadona' });
          }
        }
      }
    }
  } catch (_) {
    // Silently fall through to local fallback
  }

  // Fallback local con búsqueda fuzzy mejorada
  const scored = MERCADONA_STATIC_CATALOG.map(item => {
    const itemLower = item.name.toLowerCase();
    let score = 0;
    if (itemLower.startsWith(normalizedQuery)) score += 10;
    const matchedTerms = queryTerms.filter(t => itemLower.includes(t));
    score += matchedTerms.length * 3;
    if (itemLower.includes(normalizedQuery)) score += 5;
    return { ...item, score };
  }).filter(item => item.score > 0);

  scored.sort((a, b) => b.score - a.score);

  const results = scored.slice(0, 15).map(item => ({
    id: 'fallback_' + Math.random().toString(36).substr(2, 9),
    name: item.name,
    price: item.price,
    priceString: `${item.price.toFixed(2)} €`,
    pricePerUnitString: item.pricePerUnitString,
    imageUrl: item.imageUrl,
    unit: item.unit,
  }));

  return res.json({ products: results, source: 'local_fallback', recovered: true });
}
