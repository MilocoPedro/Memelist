import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readFileSync } from "fs";
import { join } from "path";

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
  // Vercel sirve /public como raiz del proyecto
  const paths = [
    join(process.cwd(), "public", "catalog.json"),
    join(__dirname, "..", "public", "catalog.json"),
    join(__dirname, "../../public", "catalog.json"),
    "/var/task/public/catalog.json",
  ];
  for (const p of paths) {
    try {
      const raw = readFileSync(p, "utf-8");
      catalog = JSON.parse(raw);
      console.log("[catalog] Cargado desde:", p, "productos:", catalog!.length);
      return catalog!;
    } catch {}
  }
  throw new Error("catalog.json no encontrado en ninguna ruta");
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
        const normalized = normalize(p.name);
        return words.every((w: string) => normalized.includes(w));
      })
      .slice(0, 50);

    console.log("[search] query='" + raw + "' resultados=" + products.length + " de " + all.length);
    return res.status(200).json({ products, source: "static_catalog" });
  } catch (err) {
    console.error("[search] Error:", err);
    return res.status(500).json({ products: [], source: "error", error: String(err) });
  }
}
