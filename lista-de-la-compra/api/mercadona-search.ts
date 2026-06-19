import type { VercelRequest, VercelResponse } from "@vercel/node";

// Obtiene el precio medio de un producto en España via Open Prices API
async function getPriceForBarcode(barcode: string): Promise<number | null> {
  try {
    const url = `https://prices.openfoodfacts.org/api/v1/prices?product_code=${barcode}&currency=EUR&country=es&page_size=10&order_by=-date`;
    const res = await fetch(url, {
      headers: { "User-Agent": "MemeList/1.0 (https://memelist.vercel.app)" }
    });
    if (!res.ok) return null;
    const data = await res.json();
    const items: any[] = data.items || [];
    if (items.length === 0) return null;
    // Media de los precios disponibles
    const prices = items.map((p: any) => parseFloat(p.price)).filter((p: number) => !isNaN(p) && p > 0);
    if (prices.length === 0) return null;
    const avg = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
    return Math.round(avg * 100) / 100;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const query = (req.query.q as string || "").trim();
  if (!query) return res.status(400).json({ products: [] });

  try {
    // 1. Buscar productos con Search-a-licious
    const searchUrl = `https://search.openfoodfacts.org/search?q=${encodeURIComponent(query)}&langs=es&page_size=12&fields=product_name,brands,quantity,image_front_small_url,image_url,code`;

    const upstream = await fetch(searchUrl, {
      headers: {
        "User-Agent": "MemeList/1.0 (https://memelist.vercel.app)",
        "Accept": "application/json",
      },
    });

    if (!upstream.ok) {
      return res.status(200).json({ products: [], source: "error", error: upstream.status });
    }

    const data = await upstream.json();
    const results: any[] = data.hits || [];

    // 2. Para cada producto, intentar obtener precio de Open Prices (en paralelo)
    const products = await Promise.all(
      results.map(async (item: any) => {
        const name = String(item.product_name || "");
        const brandRaw = item.brands;
        const brand = Array.isArray(brandRaw) ? brandRaw.join(", ") : String(brandRaw || "");
        const fullName = brand && !name.toLowerCase().includes(brand.toLowerCase())
          ? `${name} ${brand}`.trim()
          : name;

        const imageUrl = item.image_front_small_url || item.image_url || "";
        const barcode = item.code || "";

        // Obtener precio si hay barcode
        const price = barcode ? await getPriceForBarcode(barcode) : null;
        const priceString = price ? `${price.toFixed(2)} €` : "";

        return {
          name: fullName || name,
          quantity: String(item.quantity || ""),
          price,
          priceString,
          pricePerUnitString: "",
          unit: "ud",
          imageUrl,
          barcode,
        };
      })
    );

    const filtered = products.filter((p: any) => p.name.length > 2);
    return res.status(200).json({ products: filtered, source: "openfoodfacts" });

  } catch (err) {
    return res.status(200).json({ products: [], source: "error", error: String(err) });
  }
}
