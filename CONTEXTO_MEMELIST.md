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
| Búsqueda catálogo Mercadona | ✅ OK | Client-side: fetch('/catalog.json'), cache en useRef, ~3923 productos. api/mercadona-search.ts queda como legacy/sin uso |
| Captura productos (extensión) | ✅ OK | Chrome/Brave, tienda.mercadona.es → mercadona_catalog |
| Export catálogo | ✅ OK | scripts/export-catalog.mjs (Firestore REST + pageToken, pageSize 300) → public/catalog.json |
| Sincronización tiempo real | ⚠️ Sin probar | — |

---

### Cambios recientes
| Archivo | Cambio | Estado |
|---|---|---|
| lista-de-la-compra/public/catalog.json | Catálogo estático, 3923 productos Mercadona | ✅ (2026-06-24) |
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

---

### Próximos pasos
1. Confirmar escritura end-to-end desde la UI (primera lista creada en el proyecto Firebase nuevo)
2. Probar sincronización en tiempo real entre usuarios/dispositivos
3. Refactor isValidList con hasAll()/hasOnly()
4. Decidir si limpiar archivos duplicados de la raíz del repo

---

### Config crítica
| Clave | Valor |
|---|---|
| Firebase Project ID | memelist-95059 |
| Auth domain | memelist-95059.firebaseapp.com |
| Cuenta Firebase | miloco3d@gmail.com |
| Extensión | Brave/Chrome, captura tienda.mercadona.es → mercadona_catalog |
| Catálogo | ~3923 productos, servido como public/catalog.json (no vía Firestore en runtime) |
| Export catálogo | node scripts/export-catalog.mjs → public/catalog.json |
