# MemeList — Contexto del Proyecto

## Proyecto: MemeList
**Stack:** React 19 + TS + Vite + Tailwind | Firebase Auth (Google) + Firestore | Vercel Serverless Functions | Gemini API
**Deploy:** Vercel (root: `lista-de-la-compra/`) | **Repo:** github.com/MilocoPedro/Memelist | **Prod:** memelist.vercel.app

---

### Estado actual
| Componente | Estado | Notas |
|---|---|---|
| Firebase Auth | ✅ OK | Proyecto memelist-95059, dominio Vercel autorizado |
| Firestore | ✅ OK | Reglas publicadas, mercadona_catalog con read: true |
| Búsqueda catálogo Mercadona | ✅ OK | Client-side: fetch('/catalog.json'), cache en useRef, ~3923 productos (pendiente re-export tras captura de 4272) |
| Captura productos (extensión) | ✅ OK | Chrome/Brave (E:\memelist-extension), tienda.mercadona.es → chrome.storage.local → mercadona_catalog. IDs por producto/variante ya no colisionan. Captura completa de 4272 productos realizada y sincronizándose con Firestore |
| Export catálogo | ⚠️ Pendiente | scripts/export-catalog.mjs (Firestore REST + pageToken, pageSize 300) → public/catalog.json. Falta re-ejecutar tras sync de los 4272 productos nuevos |
| Sincronización tiempo real | ⚠️ Sin probar | — |

---

### Cambios recientes
| Archivo | Cambio | Estado |
|---|---|---|
| E:\memelist-extension\content.js | Fix: capturaba menos productos de los reales (ej. 28 de 36) por colisión de `id` — se generaba solo desde el nombre, y variantes del mismo producto (distinto formato/tamaño) comparten nombre y se sobrescribían en `chrome.storage.local`. Fix: selectores migrados a `[data-testid="product-cell"]`/`[data-testid="product-cell-name"]`/`[data-testid="product-price"]`; `id` ahora se genera desde el `aria-label` del botón `[data-testid="open-product-detail"]`, que incluye nombre+formato+precio/unidad y es único por variante. Se añade campo `format` extraído del aria-label | ✅ (2026-07-02) |
| Captura completa Mercadona | Extensión corregida usada para recapturar catálogo completo: 4272 productos capturados sin colisiones | ✅ (2026-07-02) |
| lista-de-la-compra/public/catalog.json | Catálogo estático, 3923 productos Mercadona (versión previa a la recaptura de 4272) | ✅ (2026-06-24) |
| lista-de-la-compra/src/components/ShoppingListDashboard.tsx | Búsqueda Firestore → fetch('/catalog.json') | ✅ (2026-06-24) |
| Vercel | Fix ruta absoluta /var/task/public/catalog.json | ✅ (2026-06-24) |
| firestore.rules | isValidItem con hasAll()+hasOnly(), mercadona_catalog read: true | ✅ |

---

### Problemas conocidos
| Prioridad | Problema | Causa | Acción |
|---|---|---|---|
| 🟡 Media | isValidList usa size() en vez de hasAll/hasOnly | Patrón frágil | Refactor pendiente |
| 🟢 Baja | Archivos duplicados en raíz del repo (api/, src/) fuera de lista-de-la-compra/ | Restos previos a fijar subdirectorio como root Vercel | Limpiar si molesta, no afecta deploy |
| 🟡 Media | api/mercadona/search sigue dando 404 | Rutas Express no migradas a Vercel API Routes (ya no es bloqueante: búsqueda usa catalog.json) | Revisar si aún se necesita |
| 🟢 Baja | Caché local vieja de la extensión (IDs por nombre, pre-fix) puede seguir en chrome.storage.local de otras sesiones/equipos | IDs antiguos con colisiones | Borrar caché local ("🗑️ Borrar caché local") antes de resincronizar en cada equipo donde se use la extensión |
| 🟢 Baja | Pedro pidió que la Firebase API Key del popup no se pierda al volver a abrir la extensión | popup.js ya la persiste vía chrome.storage.local (`firebase_api_key`), se recupera en loadState(). Solo se pierde si se reinstala la extensión desde cero (nuevo ID) o se borran datos de apps alojadas en Chrome | Explicado a Pedro; declinó hardcodear la key en el código. Sin cambios de código pendientes salvo que vuelva a perderse |

---

### Próximos pasos
1. Confirmar escritura end-to-end desde la UI (primera lista creada en el proyecto Firebase nuevo)
2. Probar sincronización en tiempo real entre usuarios/dispositivos
3. Refactor isValidList con hasAll()/hasOnly()
4. Decidir si limpiar archivos duplicados de la raíz del repo
5. Tras terminar la sincronización de los 4272 productos a Firestore: ejecutar `node scripts/export-catalog.mjs`, commit + push de public/catalog.json, verificar deploy en Vercel
6. Evaluar usar el nuevo campo `format` (tamaño/formato de producto) en la búsqueda del frontend

---

### Config crítica
| Clave | Valor |
|---|---|
| Firebase Project ID | memelist-95059 |
| Auth domain | memelist-95059.firebaseapp.com |
| Cuenta Firebase | miloco3d@gmail.com |
| Extensión | E:\memelist-extension — Brave/Chrome, captura tienda.mercadona.es → mercadona_catalog. Selectores: [data-testid="product-cell"|"product-cell-name"|"product-price"|"open-product-detail"] |
| Extensión: API Key sync | Se pega manualmente en popup, Firebase Console → memelist-95059 → ⚙️ Configuración del proyecto → General → Tus apps → apiKey. Persiste en chrome.storage.local entre sesiones |
| Catálogo | 4272 productos capturados (2026-07-02), pendiente re-export a public/catalog.json |
| Export catálogo | node scripts/export-catalog.mjs → public/catalog.json |
