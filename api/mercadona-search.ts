import type { VercelRequest, VercelResponse } from "@vercel/node";

function cpToWarehouse(cp: string): string {
  const code = parseInt(cp, 10);
  if (isNaN(code)) return "mad1";
  if (code >= 28000 && code <= 28999) return "mad1";
  if (code >= 8000  && code <= 8999)  return "bcn1";
  if (code >= 46000 && code <= 46999) return "vlc1";
  if (code >= 41000 && code <= 41999) return "svq1";
  if (code >= 29000 && code <= 29999) return "agp1";
  if (code >= 3000  && code <= 3999)  return "alc1";
  if (code >= 50000 && code <= 50999) return "zaz1";
  if (code >= 15000 && code <= 15999) return "scq1";
  if (code >= 45000 && code <= 45999) return "mad1";
  return "mad1";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const query = (req.query.q as string || "").trim();
  const postalCode = (req.query.postalCode as string || "28001").trim();
  if (!query) return res.status(400).json({ products: [] });

  const wh = cpToWarehouse(postalCode);

  // Intentar múltiples endpoints en orden
  const endpoints = [
    `https://tienda.mercadona.es/api/search/?query=${encodeURIComponent(query)}&lang=es&wh=${wh}`,
    `https://tienda.mercadona.es/api/v1_1/search/?query=${encodeURIComponent(query)}&lang=es&wh=${wh}`,
    `https://tienda.mercadona.es/api/search/?query=${encodeURIComponent(query)}&lang=es`,
  ];

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "es-ES,es;q=0.9",
    "Referer": "https://tienda.mercadona.es/",
    "Origin": "https://tienda.mercadona.es",
  };

  for (const url of endpoints) {
    try {
      console.log(`[mercadona-proxy] Trying: ${url}`);
      const upstream = await fetch(url, { headers });
      console.log(`[mercadona-proxy] Status: ${upstream.status} for ${url}`);

      if (!upstream.ok) continue;

      const data = await upstream.json();
      const results: any[] = data.results || [];
      console.log(`[mercadona-proxy] Got ${results.length} results, first item keys: ${results[0] ? Object.keys(results[0]).join(',') : 'none'}`);
      if (results.length > 0) {
        console.log(`[mercadona-proxy] First item thumbnail: ${results[0].thumbnail}, photos: ${JSON.stringify(results[0].photos)}`);
      }

      const products = results
        .map((item: any) => {
          const pi = item.price_instructions || {};
          const unitPrice = pi.unit_price ? parseFloat(pi.unit_price) : null;
          const refPrice  = pi.reference_price ? parseFloat(pi.reference_price) : null;
          const refFormat = pi.reference_format || pi.size_format || "";
          const pricePerUnitString = refPrice && refFormat ? `${refPrice.toFixed(2)} €/${refFormat}` : "";
          const unit = pi.selling_method === 1 ? "ud" : (pi.size_format || "kg");
          const imageUrl = item.thumbnail || item.photos?.[0]?.zoom || item.photos?.[0]?.regular || "";

          return { name: item.display_name || "", price: unitPrice, pricePerUnitString, unit, imageUrl };
        })
        .filter((p: any) => p.name.length > 0);

      return res.status(200).json({ products, wh, source: "mercadona_live" });
    } catch (err) {
      console.error(`[mercadona-proxy] Error on ${url}:`, err);
    }
  }

  // Todos los endpoints fallaron — devolver error claro sin datos falsos
  console.error(`[mercadona-proxy] All endpoints failed for query: ${query}`);
  return res.status(200).json({ products: [], wh, source: "all_failed", error: "mercadona_unreachable" });
}
