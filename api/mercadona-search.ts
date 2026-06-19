import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const query = (req.query.q as string || "").trim();
  if (!query) return res.status(400).json({ products: [] });

  try {
    // Open Food Facts — API pública, sin bloqueos de IP, con imágenes reales
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=15&lc=es&cc=es&fields=product_name,brands,quantity,image_front_small_url,image_url,nutriments,categories_tags,stores_tags`;

    const upstream = await fetch(url, {
      headers: {
        "User-Agent": "MemeList/1.0 (https://memelist.vercel.app; contact@memelist.app)",
        "Accept": "application/json",
      },
    });

    if (!upstream.ok) {
      console.error(`[openfoodfacts] Error: ${upstream.status}`);
      return res.status(200).json({ products: [], source: "error", error: upstream.status });
    }

    const data = await upstream.json();
    const results: any[] = data.products || [];

    console.log(`[openfoodfacts] Query: "${query}" → ${results.length} results`);

    const products = results
      .map((item: any) => {
        const name = item.product_name || "";
        const brand = item.brands || "";
        const quantity = item.quantity || "";
        // Nombre completo: producto + marca si no está incluida ya
        const fullName = brand && !name.toLowerCase().includes(brand.toLowerCase())
          ? `${name} ${brand}`.trim()
          : name;

        // Imagen real del producto
        const imageUrl = item.image_front_small_url || item.image_url || "";

        // Open Food Facts no tiene precios — dejamos null para que la UI lo maneje
        return {
          name: fullName || name,
          quantity,
          price: null,
          pricePerUnitString: "",
          unit: "ud",
          imageUrl,
        };
      })
      .filter((p: any) => p.name.length > 2);

    return res.status(200).json({ products, source: "openfoodfacts" });

  } catch (err) {
    console.error("[openfoodfacts] Error:", err);
    return res.status(200).json({ products: [], source: "error", error: String(err) });
  }
}
