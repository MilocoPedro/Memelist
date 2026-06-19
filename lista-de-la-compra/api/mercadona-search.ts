import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const query = (req.query.q as string || "").trim();
  if (!query) return res.status(400).json({ products: [] });

  try {
    // Search-a-licious — nuevo endpoint oficial de Open Food Facts (el legacy /cgi/search.pl está caído)
    const url = `https://search.openfoodfacts.org/search?q=${encodeURIComponent(query)}&langs=es&page_size=15&fields=product_name,brands,quantity,image_front_small_url,image_url,countries_tags`;

    const upstream = await fetch(url, {
      headers: {
        "User-Agent": "MemeList/1.0 (https://memelist.vercel.app)",
        "Accept": "application/json",
      },
    });

    console.log(`[search-a-licious] status: ${upstream.status} for query: ${query}`);

    if (!upstream.ok) {
      return res.status(200).json({ products: [], source: "error", error: upstream.status });
    }

    const data = await upstream.json();
    // Search-a-licious devuelve { hits: [...] }
    const results: any[] = data.hits || [];

    console.log(`[search-a-licious] ${results.length} results`);
    if (results[0]) console.log(`[search-a-licious] first keys: ${Object.keys(results[0]).join(',')}`);

    const products = results
      .map((item: any) => {
        const name = item.product_name || "";
        const brand = item.brands || "";
        const fullName = brand && !name.toLowerCase().includes(brand.toLowerCase())
          ? `${name} ${brand}`.trim()
          : name;
        const imageUrl = item.image_front_small_url || item.image_url || "";
        return {
          name: fullName || name,
          quantity: item.quantity || "",
          price: null,
          priceString: "",
          pricePerUnitString: "",
          unit: "ud",
          imageUrl,
        };
      })
      .filter((p: any) => p.name.length > 2);

    return res.status(200).json({ products, source: "openfoodfacts" });

  } catch (err) {
    console.error("[search-a-licious] Error:", err);
    return res.status(200).json({ products: [], source: "error", error: String(err) });
  }
}
