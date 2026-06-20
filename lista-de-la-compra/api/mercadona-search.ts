import type { VercelRequest, VercelResponse } from "@vercel/node";

const FIRESTORE_PROJECT = "memelist-95059";
const FIREBASE_API_KEY = "AIzaSyCll51GiaeJo0VzpTJPG-lyxelF_oeUbms";
const BASE = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents`;

function normalize(str: string): string {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const query = normalize((req.query.q as string || "").trim());
  if (!query) return res.status(400).json({ products: [] });

  const words = query.split(/\s+/).filter(Boolean);

  try {
    const allProducts: any[] = [];
    let pageToken: string | undefined;

    // Paginar toda la colección (hasta 4000 docs)
    do {
      const url = `${BASE}/mercadona_catalog?key=${FIREBASE_API_KEY}&pageSize=300${pageToken ? `&pageToken=${pageToken}` : ""}`;
      const resp = await fetch(url);
      if (!resp.ok) break;
      const data = await resp.json();
      const docs: any[] = data.documents || [];

      for (const doc of docs) {
        const f = doc.fields || {};
        const name = f.name?.stringValue || "";
        if (!name) continue;
        const nameLower = normalize(name);
        if (words.every(w => nameLower.includes(w))) {
          allProducts.push({
            name,
            price: f.price?.doubleValue ?? (f.price?.integerValue ? parseFloat(f.price.integerValue) : null),
            pricePerUnitString: f.pricePerUnitString?.stringValue || "",
            unit: f.unit?.stringValue || "ud",
            imageUrl: f.imageUrl?.stringValue || "",
          });
        }
      }

      pageToken = data.nextPageToken;
    } while (pageToken && allProducts.length < 50);

    return res.status(200).json({ products: allProducts.slice(0, 20), source: "firestore_catalog" });

  } catch (err) {
    console.error("[mercadona-search]", err);
    return res.status(200).json({ products: [], source: "error", error: String(err) });
  }
}
