import fetch from 'node-fetch';

async function testLoadAll() {
  const start = Date.now();
  console.log(`Starting concurrent catalog loader...`);
  try {
    const rootUrl = 'https://huggingface.co/datasets/datania/mercadona-catalog/resolve/main/categories.json';
    const rootResp = await fetch(rootUrl);
    if (rootResp.status !== 200) {
      throw new Error(`Failed to load root categories: ${rootResp.status}`);
    }
    const rootData: any = await rootResp.json();
    const subCategoryIds: number[] = [];

    if (rootData.results && Array.isArray(rootData.results)) {
      for (const cat of rootData.results) {
        if (Array.isArray(cat.categories)) {
          for (const sub of cat.categories) {
            subCategoryIds.push(sub.id);
          }
        }
      }
    }

    console.log(`Found ${subCategoryIds.length} subcategories. Fetching details concurrently...`);
    
    // Fetch all subcategories concurrently in batches
    const products: any[] = [];
    const batchSize = 15;
    for (let i = 0; i < subCategoryIds.length; i += batchSize) {
      const batch = subCategoryIds.slice(i, i + batchSize);
      await Promise.all(batch.map(async (id) => {
        try {
          const subUrl = `https://huggingface.co/datasets/datania/mercadona-catalog/resolve/main/categories/${id}.json`;
          const subResp = await fetch(subUrl);
          if (subResp.status === 200) {
            const subData: any = await subResp.json();
            if (subData.categories && Array.isArray(subData.categories)) {
              for (const deepSub of subData.categories) {
                if (Array.isArray(deepSub.products)) {
                  products.push(...deepSub.products);
                }
              }
            }
          }
        } catch (err) {
          // Ignore individual category errors
        }
      }));
    }

    const elapsed = Date.now() - start;
    console.log(`\nSuccessfully loaded ${products.length} products in ${elapsed}ms!`);
    if (products.length > 0) {
      console.log(`First product:`, products[0].display_name);
      console.log(`Price:`, products[0].price_instructions?.unit_price, `€`);
      console.log(`Image:`, products[0].thumbnail);
    }
  } catch (err: any) {
    console.error(`Error loading catalog:`, err.message);
  }
}

testLoadAll();
