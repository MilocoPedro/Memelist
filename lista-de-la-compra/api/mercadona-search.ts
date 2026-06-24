import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readFileSync } from "fs";

let catalog: any[] | null = null;

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getCatalog(): any[] {
  if (catalog) return catalog;
  // Vercel expone /public como /var/task/public en funciones serverless
  const p = "/var/task/public/catalog.json";
  catalog = JSON.parse(readFileSync(p, "utf-8"));
  console.log("[catalog] OK, productos:", catalog!.length);
  return catalog!;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const raw = (req.query.q as string || "").trim();
  if (!raw) return res.status(400).json({ products: [] });

  const words = normalize(raw).split(/\s+/).filter(Boolean);

  try {
    const all = getCatalog();
    const products = all
      .filter((p: any) => {
        if (!p.name) return false;
        return words.every((w: string) => normalize(p.name).includes(w));
      })
      .slice(0, 50);

    console.log("[search] '" + raw + "' -> " + products.length + " de " + all.length);
    return res.status(200).json({ products, source: "static_catalog" });
  } catch (err) {
    console.error("[search] Error:", String(err));
    return res.status(500).json({ products: [], source: "error", error: String(err) });
  }
}
