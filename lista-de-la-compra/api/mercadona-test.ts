import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const postalCode = (req.query.cp as string) || '45600';
    
    // Step 1: Get warehouse ID AND cookies from postal code endpoint
    const ctrl1 = new AbortController();
    const t1 = setTimeout(() => ctrl1.abort(), 5000);
    
    const warehouseRes = await fetch('https://tienda.mercadona.es/api/postal-codes/actions/change-pc/', {
      method: 'PUT',
      signal: ctrl1.signal,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'es-ES,es;q=0.9',
        'referer': 'https://tienda.mercadona.es/',
        'origin': 'https://tienda.mercadona.es',
        'x-version': 'v8451',
      },
      body: JSON.stringify({ new_postal_code: postalCode }),
    });
    clearTimeout(t1);

    const warehouseId = warehouseRes.headers.get('x-customer-wh');
    const setCookieHeader = warehouseRes.headers.get('set-cookie');
    
    // Extract cookie values
    let cookieString = '';
    if (setCookieHeader) {
      const cookies = setCookieHeader.split(',').map(c => c.split(';')[0].trim());
      cookieString = cookies.join('; ');
    }

    if (!warehouseId) {
      return res.json({ error: 'No warehouse ID', status: warehouseRes.status });
    }

    // Step 2: Try categories list (not individual category)
    const ctrl2 = new AbortController();
    const t2 = setTimeout(() => ctrl2.abort(), 5000);

    const catListRes = await fetch(`https://tienda.mercadona.es/api/categories/?lang=es`, {
      signal: ctrl2.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'es-ES,es;q=0.9',
        'referer': 'https://tienda.mercadona.es/',
        'origin': 'https://tienda.mercadona.es',
        'x-customer-wh': warehouseId,
        'x-version': 'v8451',
        'Cookie': cookieString,
      },
    });
    clearTimeout(t2);

    const catListStatus = catListRes.status;
    let catCount = 0;
    
    if (catListRes.ok) {
      const catListData = await catListRes.json();
      catCount = catListData?.count || catListData?.results?.length || 0;
    }

    // Step 3: Try individual category WITH cookies
    const ctrl3 = new AbortController();
    const t3 = setTimeout(() => ctrl3.abort(), 5000);

    const catRes = await fetch(`https://tienda.mercadona.es/api/v1_1/categories/6/?lang=es`, {
      signal: ctrl3.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'es-ES,es;q=0.9',
        'referer': 'https://tienda.mercadona.es/',
        'origin': 'https://tienda.mercadona.es',
        'x-customer-wh': warehouseId,
        'x-version': 'v8451',
        'Cookie': cookieString,
      },
    });
    clearTimeout(t3);

    const catStatus = catRes.status;
    let productCount = 0;
    let firstProduct = null;

    if (catRes.ok) {
      const catData = await catRes.json();
      if (Array.isArray(catData.categories)) {
        for (const sub of catData.categories) {
          if (Array.isArray(sub.products)) productCount += sub.products.length;
        }
      }
      firstProduct = catData?.categories?.[0]?.products?.[0] ? {
        name: catData.categories[0].products[0].display_name,
        thumbnail: catData.categories[0].products[0].thumbnail,
        price: catData.categories[0].products[0].price_instructions?.unit_price,
      } : null;
    }

    return res.json({
      warehouseId,
      cookieObtained: !!cookieString,
      catListStatus,
      catListCount: catCount,
      catV1Status: catStatus,
      productCount,
      firstProduct,
    });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
