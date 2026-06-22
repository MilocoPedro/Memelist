import type { VercelRequest, VercelResponse } from "@vercel/node";

const FIRESTORE_PROJECT = "memelist-95059";
const FIREBASE_API_KEY = "AIzaSyCll51GiaeJo0VzpTJPG-lyxelF_oeUbms";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const raw = (req.query.q as string || "").trim();
  if (!raw) return res.status(400).json({ products: [] });

  const query = normalize(raw);
  const words = query.split(/\s+/).filter(Boolean);

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents:runQuery?key=${FIREBASE_API_KEY}`;

    const body = {
      structuredQuery: {
        from: [{ collectionId: "mercadona_catalog" }],
        limit: 1000,
      },
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const err = await resp.json();
      console.error("[search] Firestore error:", JSON.stringify(err));
      return res.status(200).json({ products: [], source: "error", error: JSON.stringify(err) });
    }

    const data = await resp.json();

    const products = data
      .filter((row: any) => row.document)
      .map((row: any) => {
        const f = row.document.fields || {};
        return {
          name: f.name?.stringValue || "",
          price: parseFirestoreNumber(f.price),
          pricePerUnitString: f.pricePerUnitString?.stringValue || "",
          unit: f.unit?.stringValue || "ud",
          imageUrl: f.imageUrl?.stringValue || "",
        };
      })
      .filter((p: any) => {
        if (!p.name) return false;
        const normalized = normalize(p.name);
        return words.every((w: string) => normalized.includes(w));
      })
      .slice(0, 50);

    console.log(`[search] query="${raw}" → ${products.length} results`);
    return res.status(200).json({ products, source: "firestore_catalog" });

  } catch (err) {
    console.error("[search] Unexpected error:", err);
    return res.status(200).json({ products: [], source: "error", error: String(err) });
  }
}