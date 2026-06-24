const FIRESTORE_PROJECT = "memelist-95059";
const FIREBASE_API_KEY = "AIzaSyCll51GiaeJo0VzpTJPG-lyxelF_oeUbms";

async function fetchAllDocs() {
  let all = [];
  let pageToken = null;
  let page = 1;

  while (true) {
    const url = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents/mercadona_catalog?key=${FIREBASE_API_KEY}&pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`;
    
    process.stdout.write(`Página ${page}... `);
    const resp = await fetch(url);
    if (!resp.ok) { console.error(`Error HTTP ${resp.status}`); break; }
    
    const data = await resp.json();
    const docs = data.documents || [];
    console.log(`${docs.length} productos`);

    docs.forEach(doc => {
      const f = doc.fields || {};
      const price = f.price?.doubleValue
        ? parseFloat(f.price.doubleValue)
        : f.price?.integerValue
        ? parseFloat(f.price.integerValue)
        : null;
      const product = {
        name: f.name?.stringValue || "",
        price,
        pricePerUnitString: f.pricePerUnitString?.stringValue || "",
        unit: f.unit?.stringValue || "ud",
        imageUrl: f.imageUrl?.stringValue || "",
      };
      if (product.name) all.push(product);
    });

    if (!data.nextPageToken || docs.length === 0) {
      console.log("Última página alcanzada.");
      break;
    }

    pageToken = data.nextPageToken;
    page++;
  }

  return all;
}

async function main() {
  console.log("Exportando catálogo completo de Firestore...");
  const all = await fetchAllDocs();
  const unique = [...new Map(all.map(p => [p.name, p])).values()];
  console.log(`\nTotal: ${unique.length} productos únicos`);

  const { writeFileSync } = await import("fs");
  writeFileSync("public/catalog.json", JSON.stringify(unique));
  console.log("✅ Guardado en public/catalog.json");
}

main().catch(console.error);
