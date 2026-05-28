import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Step 1: Get warehouse ID from postal code
    const postalCode = (req.query.cp as string) || '45600';
    
    const ctrl1 = new AbortController();
    const t1 = setTimeout(() => ctrl1.abort(), 5000);
    
    const warehouseRes = await fetch('https://tienda.mercadona.es/api/postal-codes/actions/change-pc/', {
      method: 'PUT',
      signal: ctrl1.signal,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'es-ES,es;q=0.9',
        'referer': 'https://tienda.mercadona.es/',
        'origin': 'https://tienda.mercadona.es',
      },
      body: JSON.stringify({ new_postal_code: postalCode }),
    });
    clearTimeout(t1);

    const warehouseId = warehouseRes.headers.get('x-customer-wh');
    const warehouseStatus = warehouseRes.status;

    if (!warehouseId) {
      return res.json({ 
        step: 'warehouse', 
        status: warehouseStatus,
        error: 'No warehouse ID in response headers',
        headers: Object.fromEntries(warehouseRes.headers.entries())
      });
    }

    // Step 2: Try to fetch category 6 (leche) with warehouse context
    const ctrl2 = new AbortController();
    const t2 = setTimeout(() => ctrl2.abort(), 5000);

    const catRes = await fetch(`https://tienda.mercadona.es/api/v1_1/categories/6/?lang=es&wh=${warehouseId}`, {
      signal: ctrl2.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'es-ES,es;q=0.9',
        'referer': 'https://tienda.mercadona.es/',
        'origin': 'https://tienda.mercadona.es',
        'x-customer-wh': warehouseId,
      },
    });
    clearTimeout(t2);

    const catStatus = catRes.status;
    let catData: any = null;
    let productCount = 0;

    if (catRes.ok) {
      catData = await catRes.json();
      // Count products across subcategories
      if (Array.isArray(catData.categories)) {
        for (const sub of catData.categories) {
          if (Array.isArray(sub.products)) productCount += sub.products.length;
        }
      }
    } else {
      const errorText = await catRes.text();
      return res.json({
        step: 'category',
        warehouseId,
        warehouseStatus,
        catStatus,
        error: errorText.substring(0, 200),
      });
    }

    // Step 3: Try first product thumbnail
    const firstProduct = catData?.categories?.[0]?.products?.[0];

    return res.json({
      success: true,
      warehouseId,
      categoryName: catData?.name,
      productCount,
      firstProduct: firstProduct ? {
        name: firstProduct.display_name,
        price: firstProduct.price_instructions?.unit_price,
        thumbnail: firstProduct.thumbnail,
      } : null,
    });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}