import type { VercelRequest, VercelResponse } from "@vercel/node";

const FIRESTORE_PROJECT = 'memelist-95059';
const FIREBASE_API_KEY = 'AIzaSyCll51GiaeJo0VzpTJPG-lyxelF_oeUbms';

// Normaliza texto para busqueda (quita acentos, minusculas)
function normalize(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Descarga todos los docs de mercadona_catalog paginando
async function getAllProducts(): Promise<any[]> {
  const all: any[] = [];
  let pageToken: string | null = null;

  do {
    const url = new URL(`https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents/mercadona_catalog`);
    url.searchParams.set('key', FIREBASE_API_KEY);
    url.searchParams.set('pageSize', '300');
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url.toString());
    if (!res.ok) break;

    const data = await res.json();
    const docs: any[] = data.documents || [];
    all.push(...docs);
    pageToken = data.nextPageToken || null;
  } while (pageToken);

  return all;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const query = (req.query.q as string || '').trim();
  if (!query) return res.status(400).json({ products: [] });

  try {
    const docs = await getAllProducts();
    const words = normalize(query).split(/\s+/).filter(Boolean);

    const products = docs
      .map((doc: any) => {
        const f = doc.fields || {};
        return {
          name: f.name?.stringValue || '',
          price: f.price?.doubleValue ?? (f.price?.integerValue ? parseFloat(f.price.integerValue) : null),
          pricePerUnitString: f.pricePerUnitString?.stringValue || '',
          unit: f.unit?.stringValue || 'ud',
          imageUrl: f.imageUrl?.stringValue || '',
        };
      })
      .filter((p: any) => {
        if (!p.name) return false;
        const name = normalize(p.name);
        return words.every((w: string) => name.includes(w));
      })
      .slice(0, 25);

    return res.status(200).json({ products, source: 'firestore_catalog', total: docs.length });

  } catch (err) {
    console.error('[mercadona-search] Error:', err);
    return res.status(200).json({ products: [], source: 'error', error: String(err) });
  }
}
