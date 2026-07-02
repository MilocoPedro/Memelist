# MemeList — Contexto del Proyecto

## Proyecto: MemeList
**Stack:** React 19 + TS + Vite + Tailwind | Firebase Auth (Google) + Firestore | Vercel Serverless Functions | Gemini API
**Deploy:** Vercel (root: `lista-de-la-compra/`) | **Repo:** github.com/MilocoPedro/Memelist | **Prod:** memelist.vercel.app

---

### Estado actual
| Componente | Estado | Notas |
|---|---|---|
| Firebase Auth | ✅ OK | Proyecto memelist-95059, dominio Vercel autorizado |
| Firestore | ✅ OK | Reglas publicadas, mercadona_catalog con read: true. Colección limpiada de duplicados y resincronizada (4272 docs) |
| Búsqueda catálogo Mercadona | ✅ OK | Client-side: fetch('/catalog.json'), cache en useRef, 4272 productos únicos (commit 62b862f, 2026-07-02) |
| Captura productos (extensión) | ✅ OK | Chrome/Brave (E:\memelist-extension), tienda.mercadona.es → chrome.storage.local → mercadona_catalog. IDs por producto/variante ya no colisionan |
| Export catálogo | ✅ OK | scripts/export-catalog.mjs (Firestore REST + pageToken, pageSize 300) → public/catalog.json. Ya NO deduplica por nombre (bug corregido, ver Cambios recientes) |
| Sincronización tiempo real | ⚠️ Sin probar | — |

---

### Cambios recientes
| Archivo | Cambio | Estado |
|---|---|---|
| lista-de-la-compra/scripts/export-catalog.mjs | Bug: deduplicaba productos por `name` al exportar (`new Map(all.map(p => [p.name, p]))`), colapsando variantes de un mismo producto (mismo problema que ya se había arreglado en la extensión, pero reintroducido en este paso). Fix: se eliminó la deduplicación — Firestore ya garantiza IDs únicos por variante, no hace falta deduplicar de nuevo | ✅ (2026-07-02) |
| Firestore mercadona_catalog | Se detectaron 8177 documentos tras la primera sincronización de la recaptura (4272 nuevos con ID correcto + ~3923 antiguos con ID basado en nombre, sin sobrescribirse por tener IDs distintos). Se creó scripts/wipe-catalog.mjs (lista+DELETE por REST, paginado) y se vació la colección completa, luego se resincronizó desde la extensión (4272 productos limpios) | ✅ (2026-07-02) |
| lista-de-la-compra/public/catalog.json | Regenerado tras limpieza: 4272 productos únicos, sin colisiones de variante. Commit 62b862f | ✅ (2026-07-02) |
| E:\memelist-extension\content.js | Fix: capturaba menos productos de los reales (ej. 28 de 36) por colisión de `id` generado solo desde el nombre. Fix: selectores migrados a `[data-testid="product-cell"|"product-cell-name"|"product-price"]`; `id` ahora se genera desde el `aria-label` de `[data-testid="open-product-detail"]` (nombre+formato+precio/unidad), único por variante. Añade campo `format` (NOTA: aún no se envía a Firestore, ver Próximos pasos) | ✅ (2026-07-02) |
| firestore.rules | isValidItem con hasAll()+hasOnly(), mercadona_catalog read: true | ✅ |

---

### Problemas conocidos
| Prioridad | Problema | Causa | Acción |
|---|---|---|---|
| 🟡 Media | isValidList usa size() en vez de hasAll/hasOnly | Patrón frágil | Refactor pendiente |
| 🟢 Baja | Archivos duplicados en raíz del repo (api/, src/) fuera de lista-de-la-compra/ | Restos previos a fijar subdirectorio como root Vercel | Limpiar si molesta, no afecta deploy |
| 🟡 Media | api/mercadona/search sigue dando 404 | Rutas Express no migradas a Vercel API Routes (ya no es bloqueante: búsqueda usa catalog.json) | Revisar si aún se necesita |
| 🟢 Baja | Campo `format` de la extensión no llega a Firestore ni a catalog.json | popup.js (syncToFirestore) no incluye `format` en el PATCH; export-catalog.mjs tampoco lo lee | Añadir `format` al body del PATCH en popup.js y al mapeo de fetchAllDocs() en export-catalog.mjs, si se decide usarlo en la búsqueda |

---

### Próximos pasos
1. Confirmar escritura end-to-end desde la UI (primera lista creada en el proyecto Firebase nuevo)
2. Probar sincronización en tiempo real entre usuarios/dispositivos
3. Refactor isValidList con hasAll()/hasOnly()
4. Decidir si limpiar archivos duplicados de la raíz del repo
5. Verificar deploy en Vercel del commit 62b862f y probar en memelist.vercel.app que aparecen las variantes (ej. las 4 de "Aceite de oliva virgen extra Hacendado")
6. Si se quiere usar `format` en la búsqueda: propagarlo en popup.js → Firestore → export-catalog.mjs → catalog.json

---

### Config crítica
| Clave | Valor |
|---|---|
| Firebase Project ID | memelist-95059 |
| Auth domain | memelist-95059.firebaseapp.com |
| Cuenta Firebase | miloco3d@gmail.com |
| Extensión | E:\memelist-extension — Brave/Chrome, captura tienda.mercadona.es → mercadona_catalog. Selectores: [data-testid="product-cell"|"product-cell-name"|"product-price"|"open-product-detail"] |
| Extensión: API Key sync | Se pega manualmente en popup, Firebase Console → memelist-95059 → ⚙️ Configuración del proyecto → General → Tus apps → apiKey. Persiste en chrome.storage.local entre sesiones |
| Catálogo | 4272 productos, public/catalog.json (commit 62b862f, 2026-07-02) |
| Export catálogo | node scripts/export-catalog.mjs → public/catalog.json (sin dedup por nombre) |
| Wipe catálogo Firestore | node scripts/wipe-catalog.mjs (borra todos los docs de mercadona_catalog vía REST, paginado) — usar con cuidado, solo si hay que resincronizar desde cero |
