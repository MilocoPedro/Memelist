/**
 * sync-mercadona.mjs
 * Descarga el catálogo completo de Mercadona y lo guarda en Firestore.
 * Ejecutar con: node sync-mercadona.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(readFileSync(join(__dirname, 'service-account.json'), 'utf8'));

const POSTAL_CODE = '45600';
const PARENT_CATEGORY_IDS = [12, 18, 15, 13, 9, 24, 19, 8, 3, 7, 4, 17, 14, 21, 20, 23, 1, 6, 26, 22, 2, 25, 5, 16, 11, 10];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function mapProduct(item, parentCatName, subCatName) {
  let price = null;
  let pricePerUnitString = '';
  if (item.price_instructions) {
    const raw = item.price_instructions.unit_price ?? item.price_instructions.bulk_price;
    price = raw != null ? parseFloat(raw) : null;
    if (item.price_instructions.reference_price && item.price_instructions.reference_format) {
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

  const name = item.display_name ?? item.name ?? '';
  return {
    id: String(item.id),
    name,
    price: price !== null && !isNaN(price) ? price : null,
    priceString: price !== null && !isNaN(price) ? `${price.toFixed(2)} €` : '',
    pricePerUnitString,
    imageUrl: item.thumbnail ?? '',
    unit,
    parentCategory: parentCatName,
    subCategory: subCatName,
    searchTerms: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/\s+/).filter(t => t.length >= 2),
    updatedAt: new Date().toISOString(),
  };
}

async function fetchCategory(catId, cookieString, warehouseId) {
  await sleep(400);
  try {
    const res = await fetch(`https://tienda.mercadona.es/api/v1_1/categories/${catId}/?lang=es`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'es-ES,es;q=0.9',
        'referer': 'https://tienda.mercadona.es/',
        'origin': 'https://tienda.mercadona.es',
        'x-customer-wh': warehouseId,
        'Cookie': cookieString,
      },
    });
    if (!res.ok) { console.log(`  ⚠️  Cat ${catId} → HTTP ${res.status}`); return null; }
    return await res.json();
  } catch (err) {
    console.log(`  ❌ Cat ${catId} → ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('🔄 Sync catálogo Mercadona → Firestore\n');

  // 1. Obtener warehouse y cookies
  console.log(`📍 Obteniendo warehouse CP ${POSTAL_CODE}...`);
  const whRes = await fetch('https://tienda.mercadona.es/api/postal-codes/actions/change-pc/', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'es-ES,es;q=0.9',
      'referer': 'https://tienda.mercadona.es/',
      'origin': 'https://tienda.mercadona.es',
    },
    body: JSON.stringify({ new_postal_code: POSTAL_CODE }),
  });

  const warehouseId = whRes.headers.get('x-customer-wh');
  const setCookie = whRes.headers.get('set-cookie');
  const cookieString = setCookie ? setCookie.split(',').map(c => c.split(';')[0].trim()).join('; ') : '';

  if (!warehouseId) { console.error('❌ No warehouse ID'); process.exit(1); }
  console.log(`✅ Warehouse: ${warehouseId}\n`);

  // 2. Conectar Firebase Admin
  console.log('🔑 Conectando Firebase Admin...');
  initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore();
  console.log('✅ Firebase conectado\n');

  let totalProducts = 0;
  let totalSaved = 0;

  // 3. Descargar cada categoría
  for (const catId of PARENT_CATEGORY_IDS) {
    console.log(`📦 Categoría ${catId}...`);
    const catData = await fetchCategory(catId, cookieString, warehouseId);
    if (!catData) continue;

    const parentName = catData.name ?? `Cat_${catId}`;
    const products = [];

    for (const sub of (catData.categories ?? [])) {
      for (const p of (sub.products ?? [])) {
        const m = mapProduct(p, parentName, sub.name ?? '');
        if (m.name) products.push(m);
      }
    }
    for (const p of (catData.products ?? [])) {
      const m = mapProduct(p, parentName, '');
      if (m.name) products.push(m);
    }

    console.log(`  → ${products.length} productos en "${parentName}"`);
    totalProducts += products.length;

    // Guardar en lotes de 400
    for (let i = 0; i < products.length; i += 400) {
      const batch = db.batch();
      const chunk = products.slice(i, i + 400);
      for (const p of chunk) {
        batch.set(db.collection('mercadona_catalog').doc(p.id), p);
      }
      await batch.commit();
      totalSaved += chunk.length;
    }
    console.log(`  ✅ Guardados ${products.length}`);
  }

  // 4. Metadata
  await db.collection('mercadona_catalog').doc('_metadata').set({
    lastSync: new Date().toISOString(),
    totalProducts,
    warehouseId,
    postalCode: POSTAL_CODE,
  });

  console.log(`\n🎉 Sync completado: ${totalSaved} productos guardados en Firestore`);
  process.exit(0);
}

main().catch(err => { console.error('❌', err); process.exit(1); });
