# MemeList — Contexto del Proyecto y Cambios Realizados

## Descripción de la app
Lista de la compra inteligente y colaborativa. Permite a varios miembros de una familia añadir productos a diferentes listas compartidas, cada uno con su usuario y contraseña. Desplegada en Vercel, con Firebase como backend.

## Stack tecnológico
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Base de datos:** Firebase Firestore
- **Autenticación:** Firebase Authentication (Google)
- **Despliegue:** Vercel
- **Repositorio:** https://github.com/MilocoPedro/Memelist
- **URL producción:** https://memelist.vercel.app

## Proyecto Firebase
- **Proyecto:** MemeList
- **Project ID:** memelist-95059
- **Auth domain:** memelist-95059.firebaseapp.com
- **Cuenta:** miloco3d@gmail.com

---

## Problemas identificados y estado

### ✅ RESUELTO — Schema de items incompatible con Firestore
**Problema:** La regla `isValidItem` en `firestore.rules` exigía exactamente 10 campos (`data.keys().size() == 10`), pero el código enviaba también `addedByName` e `imageUrl`, causando que Firestore rechazara todas las escrituras con `permission-denied` y la app cayera al modo local silenciosamente.

**Solución aplicada:**
- Modificado `firestore.rules`: reemplazado `size() == 10` por sistema de campos requeridos + opcionales usando `hasAll()` y `hasOnly()`
- Modificado `src/hooks/useShoppingData.ts`: construcción de objeto `firestoreItem` limpio antes de enviar a Firestore, incluyendo `addedByName` e `imageUrl` solo si tienen valor real
- Las reglas se aplicaron directamente desde la consola web de Firebase (no CLI por permisos)

### ✅ RESUELTO — Config Firebase apuntaba al proyecto antiguo
**Problema:** La app usaba el proyecto `just-chord-5s7sz` generado por Google AI Studio, sobre el que no había permisos de administrador. Imposible añadir dominios OAuth autorizados.

**Solución aplicada:**
- Creado nuevo proyecto Firebase `memelist-95059` con cuenta propia
- Activado Authentication con Google
- Activado Firestore en modo producción, región `eur3 (europe-west)`
- Añadido dominio `memelist.vercel.app` en Authentication → Dominios autorizados
- Añadido `https://memelist.vercel.app` en Orígenes JS autorizados de Google Cloud OAuth
- Añadido `https://memelist.vercel.app/__/auth/handler` en URIs de redireccionamiento autorizados
- Modificado `src/firebase.ts`: reemplazado `import firebaseConfig from '../firebase-applet-config.json'` por config embebida directamente en el código

### ✅ RESUELTO — Compartir listas por email no funcionaba (permission-denied silencioso)
**Problema:** Al añadir un correo en Ajustes de una lista, `sharedWith` se guardaba correctamente en Firestore (verificado en consola), pero la persona invitada nunca veía la lista. El panel de diagnóstico integrado en la app mostraba siempre `permission-denied: Missing or insufficient permissions` para la query de listas compartidas, aunque el email autenticado coincidía exactamente (verificado carácter a carácter) con el guardado en `sharedWith`.

**Causa raíz real (comportamiento oficial y documentado de Firestore, no un bug de código):**
En una consulta `list`/de colección, Firestore exige que el propio filtro `.where()` de la consulta del cliente demuestre por sí solo que se cumple la condición de la regla — **no evalúa la regla contra los datos reales de cada documento para decidir si permite la consulta completa**. La app hace 2 queries separadas: una filtrada por `ownerId` (listas propias) y otra filtrada por `sharedWith array-contains email` (listas compartidas). Como la regla `allow list` tenía una única condición `ownerId == uid || email in sharedWith`, para la query de "compartidas" (que solo filtra por `sharedWith`) Firestore no podía demostrar nada sobre el campo `ownerId` referenciado en la otra rama del OR, y rechazaba la consulta entera con el error `Property ownerId is undefined on object`, camuflado como un simple `permission-denied`. Doc oficial: *"No puedes escribir una consulta para todos los documentos de una colección y esperar que Firestore devuelva solo los que el cliente tiene permiso de ver"* — el filtro debe coincidir exactamente con la condición de la regla.

**Nota importante sobre el proceso de diagnóstico:** El emulador de Firestore (`@firebase/rules-unit-testing`) **no reproduce fielmente esta restricción** — varias versiones de la regla que pasaban todos los tests en el emulador local seguían fallando en producción real. El emulador es útil para detectar errores de sintaxis/lógica básica, pero no es fiable al 100% para validar reglas `list` con condiciones `OR` sobre múltiples campos: hay que probar directamente en Firebase Console/producción para tener certeza total en estos casos.

**Solución aplicada:** Separar `allow list` en **dos reglas independientes** (Firestore las combina con OR automáticamente), cada una dependiendo de un único campo — coincidiendo exactamente con lo que cada query real del cliente filtra:
```
allow list: if isSignedIn() && resource.data.ownerId == request.auth.uid;
allow list: if isSignedIn() && request.auth.token.email in resource.data.sharedWith;
```
**Nunca fusionar estas dos condiciones en una sola con `||`** — es la causa exacta del bug.

**Herramientas creadas durante el diagnóstico (quedan disponibles para el futuro):**
- Panel de diagnóstico integrado en la app (pulsar el badge ☁️ Nube / 🚀 Local en la cabecera): muestra email autenticado, UID, listas propias/compartidas encontradas, `sharedWith` de las listas visibles, y el último error real de Firestore — sin necesitar DevTools, útil para depurar desde el móvil.
- Carpeta `rules-test/` (no versionada en git, usada de forma puntual): monta un test con el emulador de Firestore (`@firebase/rules-unit-testing`) que siembra un documento de lista real y prueba múltiples variantes de reglas contra `get`, `list` (query `array-contains`) y `update`, mostrando el mensaje de error real. Requiere Java instalado (`winget install --id EclipseAdoptium.Temurin.21.JRE -e`). Recordar su limitación: útil para detectar errores obvios, pero no concluyente para reglas `list` con OR multi-campo — la prueba definitiva es siempre producción real.


**Problema:** El servidor backend (`server.ts`) usa Express y llama a la API de Mercadona. Vercel solo sirve frontend estático — no ejecuta servidores Node.js de esta forma. Todas las llamadas a `/api/mercadona/search` dan 404.

**Causa:** Vercel necesita funciones serverless (API Routes) en lugar de un servidor Express monolítico.

**Solución pendiente:** Convertir los endpoints de `server.ts` a Vercel API Routes (archivos en carpeta `/api/`).

### ⚠️ PENDIENTE — Captura de imágenes y precios no funciona
**Problema:** El apartado de captura de imágenes y precios da problemas. Pendiente de analizar en detalle una vez resuelto el problema de la API de Mercadona.

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/firebase.ts` | Config Firebase embebida directamente, apunta a `memelist-95059` |
| `src/hooks/useShoppingData.ts` | Construcción limpia de `firestoreItem` sin campos undefined; `updateList` relanza errores en vez de tragarlos en silencio |
| `firestore.rules` | `isValidItem` acepta campos opcionales `addedByName` e `imageUrl`; `allow list` separado en 2 reglas (una por `ownerId`, otra por `sharedWith`) para arreglar el bug de listas compartidas |
| `src/App.tsx` | `activeSettingsListId` (antes objeto fijo) para que el diálogo de ajustes siempre lea la lista en vivo; badge ☁️/🚀 pulsable con panel de diagnóstico |
| `src/components/ListSettingsDialog.tsx` | Muestra alertas si falla el guardado del nombre o al compartir/quitar un email |

---

## Herramientas instaladas durante el proceso
- **Node.js** — instalado desde nodejs.org (necesario para npm)
- **Firebase CLI** — `npm install -g firebase-tools` (tras activar `Set-ExecutionPolicy RemoteSigned`)
- **Git** — instalado para VS Code
- Git configurado con: `git config --global user.name "Miguel"` y `git config --global user.email "miloco3d@gmail.com"`

---

## Próximos pasos recomendados
1. Aplicar reglas `firestore.rules` corregidas al nuevo proyecto Firebase
2. Convertir `server.ts` a Vercel API Routes para que funcione la búsqueda de Mercadona
3. Revisar y arreglar el apartado de captura de imágenes y precios
4. Probar sincronización en tiempo real entre varios usuarios/dispositivos
