import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const query = req.query.q;
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.json({ products: [] });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const prompt = `Eres un experto en productos de Mercadona España. 
El usuario busca: "${query}"

Devuelve EXACTAMENTE un JSON con este formato, sin texto adicional, sin markdown, sin bloques de código:
{
  "products": [
    {
      "id": "string único",
      "name": "nombre exacto del producto en Mercadona",
      "price": número con decimales,
      "priceString": "X.XX €",
      "pricePerUnitString": "X.XX €/kg o €/L o €/ud.",
      "unit": "uds|kg|g|l|pack",
      "imageUrl": ""
    }
  ]
}

Reglas:
- Devuelve entre 8 y 12 productos relevantes para la búsqueda
- Usa nombres reales de productos Hacendado, Bosque Verde, Deliplus u otras marcas de Mercadona
- Los precios deben ser realistas y actuales de Mercadona España (2024-2025)
- Si hay varias variantes (entera, semidesnatada, etc.) inclúyelas todas
- imageUrl siempre vacío ""
- Solo JSON, nada más`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini error:', err);
      return res.status(500).json({ error: 'Gemini API error', detail: err });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Limpiar respuesta — eliminar markdown si lo hay
    const clean = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      console.error('Parse error, raw text:', clean.substring(0, 300));
      return res.status(500).json({ error: 'Invalid JSON from Gemini', raw: clean.substring(0, 200) });
    }

    const products = (parsed.products ?? []).map((p: any, i: number) => ({
      id: p.id ?? `gemini_${i}`,
      name: p.name ?? '',
      price: typeof p.price === 'number' ? p.price : null,
      priceString: p.priceString ?? (p.price ? `${p.price.toFixed(2)} €` : ''),
      pricePerUnitString: p.pricePerUnitString ?? '',
      unit: p.unit ?? 'uds',
      imageUrl: '',
    })).filter((p: any) => p.name.length > 0);

    return res.json({ products, source: 'gemini' });

  } catch (err: any) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}