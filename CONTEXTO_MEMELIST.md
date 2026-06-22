# MemeList — Contexto del Proyecto

## Proyecto: MemeList
**Stack:** React 19 + TS + Vite + Tailwind | Firebase Auth (Google) + Firestore | Vercel Serverless Functions | Gemini API
**Deploy:** Vercel | **Repo:** github.com/MilocoPedro/Memelist | **Prod:** memelist.vercel.app

---

### Estado actual
| Componente | Estado | Notas |
|---|---|---|
| Firebase Auth | ✅ OK | Proyecto memelist-95059, dominio Vercel autorizado |
| Firestore | ✅ OK | Reglas publicadas, mercadona_catalog con read/write: true |
| Búsqueda catálogo Mercadona | ✅ OK | api/mercadona-search.ts lee de Firestore, filtra en memoria |
| Scroll resultados búsqueda | ✅ OK | max-h-[600px], hasta 50 resultados |
| Captura productos (extensión) | ✅ OK | ~3900+ productos en mercadona_catalog |
| Sincronización tiempo real | ⚠️ Sin probar | — |

---

### Cambios recientes
| Archivo | Cambio | Estado |
|---|---|---|
| src/firebase.ts | Config embebida, apunta a memelist-95059 | ✅ |
| src/hooks/useShoppingData.ts | firestoreItem limpio sin campos undefined | ✅ |
| firestore.rules | isValidItem con hasAll()+hasOnly(), mercadona_catalog read/write: true | ✅ |
| api/mercadona-search.ts | Reescrito: lee Firestore REST API, sin filtro WHERE, slice(0,50), parseFirestoreNumber() robusto | ✅ |
| src/components/ShoppingListDashboard.tsx | max-h-[300px] → max-h-[600px], pr-1 → pr-2 | ✅ |

---

### Problemas conocidos
| Prioridad | Problema | Causa | Acción |
|---|---|---|---|
| 🟡 Media | useEffect busca toallitas wc al cambiar CP | Búsqueda automática con query vacía | Condicionar a mercadonaQuery.trim() |
| 🟡 Media | isValidItem size() == 10 aún fragil | No usa hasOnly() completo | Refactor pendiente |

---

### Próximos pasos
1. Corregir useEffect del código postal (bug #4)
2. Probar sincronización en tiempo real entre usuarios
3. Revisar isValidItem con hasOnly() completo

---

### Config crítica
| Clave | Valor |
|---|---|
| Firebase Project ID | memelist-95059 |
| Auth domain | memelist-95059.firebaseapp.com |
| Cuenta Firebase | miloco3d@gmail.com |
| Extensión | Brave/Chrome, captura tienda.mercadona.es → mercadona_catalog |
| Catálogo | ~3900+ productos en Firestore |
