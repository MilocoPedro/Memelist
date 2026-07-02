const FIRESTORE_PROJECT = "memelist-95059";
const FIREBASE_API_KEY = "AIzaSyCll51GiaeJo0VzpTJPG-lyxelF_oeUbms";
const BASE = `https://firestore.googleapis.com/v1/projects/${FIRESTORE_PROJECT}/databases/(default)/documents/mercadona_catalog`;

async function listAllDocNames() {
  let names = [];
  let pageToken = null;
  while (true) {
    const url = `${BASE}?key=${FIREBASE_API_KEY}&pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`;
    const resp = await fetch(url);
    const data = await resp.json();
    const docs = data.documents || [];
    names.push(...docs.map(d => d.name));
    if (!data.nextPageToken || docs.length === 0) break;
    pageToken = data.nextPageToken;
  }
  return names;
}

async function main() {
  console.log("Listando documentos existentes...");
  const names = await listAllDocNames();
  console.log(`Encontrados ${names.length} documentos. Borrando...`);

  let deleted = 0;
  for (const name of names) {
    const url = `https://firestore.googleapis.com/v1/${name}?key=${FIREBASE_API_KEY}`;
    const resp = await fetch(url, { method: "DELETE" });
    if (resp.ok) deleted++;
    if (deleted % 100 === 0) console.log(`${deleted}/${names.length}...`);
  }
  console.log(`✅ Borrados ${deleted}/${names.length} documentos.`);
}

main().catch(console.error);