import type { VercelRequest, VercelResponse } from "@vercel/node";

const FIRESTORE_PROJECT = "memelist-95059";
const FIREBASE_API_KEY = "AIzaSyCll51GiaeJo0VzpTJPG-lyxelF_oeUbms";
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents:runQuery?key=${FIREBASE_API_KEY}`;

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function parseFirestoreNumber(field: any): number | null {
  if (!field) return null;
  if ("doubleValue" in field) return parseFloat(field.doubleValue);
  if ("integerValue" in field) return parseFloat(field.integerValue);
  return null;
}

async function fetchPage(offset: number, limit: number): Promise<any[]> {
  const body = {
    structuredQuery: {
      from: [{ collectionId: "mercadona_catalog" }],
      limit,
      offset,
    },
  };

  const resp = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) return [];

  const data = await resp.json();
  return data.filter((row: any) => row.document).map((row: any) => {
    const f = row.document.fields || {};
    return {
      name: f.name?.stringValue || "",
      price: parseFirestoreNumber(f.price),
      pricePerUnitString: f.pricePerUnitString?.stringValue || "",
      unit: f.unit?.stringValue || "ud",
      imageUrl: f.imageUrl?.stringValue || "",
    };
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const raw = (req.query.q as string || "").trim();
  if (!raw) return res.status(400).json({ products: [] });

  const query = normalize(raw);
  const words = query.split(/\s+/).filter(Boolean);

  try {
    // Fetch 8 páginas de 500 en paralelo = 4000 documentos totales
    const pages = await Promise.all([
      fetchPage(0, 500),
      fetchPage(500, 500),
      fetchPage(1000, 500),
      fetchPage(1500, 500),
      fetchPage(2000, 500),
      fetchPage(2500, 500),
      fetchPage(3000, 500),
      fetchPage(3500, 500),
    ]);

    const all = pages.flat();

    const products = all
      .filter((p: any) => {
        if (!p.name) return false;
        const normalized = normalize(p.name);
        return words.every((w: string) => normalized.includes(w));
      })
      .slice(0, 50);

    console.log(`[search] query="${raw}" → ${products.length} resultados de ${all.length} productos`);
    return res.status(200).json({ products, source: "firestore_catalog" });

  } catch (err) {
    console.error("[search] Error:", err);
    return res.status(200).json({ products: [], source: "error", error: String(err) });
  }
}
