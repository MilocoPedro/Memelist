import type { VercelRequest, VercelResponse } from "@vercel/node";

// Catalog importado directamente como modulo para que Vercel lo incluya en el bundle
import catalog from "./catalog.json";

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const raw = (req.query.q as string || "").trim();
  if (!raw) return res.status(400).json({ products: [] });

  const words = normalize(raw).split(/\s+/).filter(Boolean);

  const products = (catalog as any[])
    .filter((p: any) => {
      if (!p.name) return false;
      const normalized = normalize(p.name);
      return words.every((w: string) => normalized.includes(w));
    })
    .slice(0, 50);

  console.log("[search] query='" + raw + "' resultados=" + products.length + " de " + (catalog as any[]).length);
  return res.status(200).json({ products, source: "static_catalog" });
}
