# MemeList — Contexto del Proyecto

## Proyecto: MemeList
**Stack:** React 19 + TS + Vite + Tailwind | Firebase Auth (Google) + Firestore | Express (server.ts) | Gemini API  
**Deploy:** Vercel | **Repo:** github.com/MilocoPedro/Memelist | **Prod:** memelist.vercel.app

---

### Estado actual
| Componente | Estado | Notas |
|---|---|---|
| Firebase Auth | ✅ OK | Proyecto memelist-95059, dominio Vercel autorizado |
| Firestore | ⚠️ Parcial | Reglas corregidas pendientes de aplicar en nuevo proyecto |
| API Mercadona | ❌ Roto | Express no funciona en Vercel — necesita Serverless Functions |
| Captura imágenes/precios | ❌ Roto | Pendiente tras resolver API Mercadona |
| Sincronización tiempo real | ⚠️ Sin probar | — |

---

### Cambios recientes
| Archivo | Cambio | Estado |
|---|---|---|
| src/firebase.ts | Config embebida, apunta a memelist-95059 | ✅ |
| src/hooks/useShoppingData.ts | firestoreItem limpio sin campos undefined | ✅ |
| firestore.rules | isValidItem con hasAll()+hasOnly(), acepta addedByName e imageUrl opcionales | ✅ pendiente publicar |

---

### Problemas conocidos
| Prioridad | Problema | Causa | Acción |
|---|---|---|---|
| 🔴 Alta | Reglas Firestore sin aplicar | Nuevo proyecto tiene reglas por defecto (todo denegado) | Copiar firestore.rules en consola Firebase → Publicar |
| 🔴 Alta | /api/mercadona/search da 404 | Vercel no ejecuta Express monolítico | Convertir server.ts a Vercel API Routes (/api/) |
| 🟡 Media | Captura imágenes/precios rota | Depende de API Mercadona | Analizar tras resolver API |

---

### Próximos pasos
1. Aplicar firestore.rules al proyecto memelist-95059
2. Convertir server.ts a Vercel API Routes
3. Revisar captura de imágenes y precios
4. Probar sincronización en tiempo real

---

### Config crítica
| Clave | Valor |
|---|---|
| Firebase Project ID | memelist-95059 |
| Auth domain | memelist-95059.firebaseapp.com |
| Cuenta Firebase | miloco3d@gmail.com |
| OAuth callback | memelist.vercel.app/__/auth/handler |
