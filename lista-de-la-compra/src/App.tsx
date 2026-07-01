import { useState, useEffect } from 'react';
import { isFirebaseConfigured, auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useShoppingData } from './hooks/useShoppingData';
import { AuthBar } from './components/AuthBar';
import { ListSelector } from './components/ListSelector';
import { ShoppingListDashboard } from './components/ShoppingListDashboard';
import { ListSettingsDialog } from './components/ListSettingsDialog';
import { LoginScreen } from './components/LoginScreen';
import { ShoppingList, ShoppingItem } from './types';
import { BookOpenCheck, ShoppingBag, Menu, X, Share2, ClipboardList, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [mockUser, setMockUser] = useState<any>(() => {
    const isExplicitSignOut = localStorage.getItem('meme_list_explicit_signout') === 'true';
    if (isExplicitSignOut) return null;

    const saved = localStorage.getItem('meme_list_sim_user');
    return saved ? JSON.parse(saved) : {
      uid: 'mock_user_1',
      email: 'miloco3d@gmail.com',
      displayName: 'Miguel (Tú)',
    };
  });
  // Guardamos solo el ID, no el objeto: así el diálogo de ajustes siempre lee
  // la versión más reciente de la lista (sincronizada con Firestore) en cada render,
  // en vez de quedarse con una foto fija del momento en que se abrió.
  const [activeSettingsListId, setActiveSettingsListId] = useState<string | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Subscribe to real Firebase authentication states
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsub = onAuthStateChanged(auth, (user) => {
        if (user) {
          setFirebaseUser({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0],
            photoURL: user.photoURL || undefined,
          });
          setMockUser(null);
        } else {
          setFirebaseUser(null);
          // Only auto-restore mock user if we didn't explicitly sign out
          const isExplicitSignOut = localStorage.getItem('meme_list_explicit_signout') === 'true';
          if (!isExplicitSignOut) {
            const saved = localStorage.getItem('meme_list_sim_user');
            setMockUser(saved ? JSON.parse(saved) : {
              uid: 'mock_user_1',
              email: 'miloco3d@gmail.com',
              displayName: 'Miguel (Tú)',
            });
          } else {
            setMockUser(null);
          }
        }
      });
      return unsub;
    }
  }, []);

  const activeUser = firebaseUser || mockUser;

  // Shopping list data fetch and actions hooks
  const {
    lists,
    activeListId,
    setActiveListId,
    items,
    loading,
    createList,
    updateList,
    deleteList,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    clearCheckedItems,
    isLocalMode,
    dbError,
    debugInfo,
  } = useShoppingData(activeUser, !firebaseUser);

  const activeList = lists.find((l) => l.id === activeListId) || null;
  const activeSettingsList = lists.find((l) => l.id === activeSettingsListId) || null;

  const handleSetMockUser = (user: any) => {
    setMockUser(user);
    if (!user) {
      setFirebaseUser(null);
      localStorage.setItem('meme_list_explicit_signout', 'true');
      localStorage.removeItem('meme_list_sim_user');
    } else {
      localStorage.removeItem('meme_list_explicit_signout');
    }
  };

  const handleUpdateUser = (updatedUser: any) => {
    if (firebaseUser) {
      setFirebaseUser(updatedUser);
    } else {
      setMockUser(updatedUser);
    }
  };

  // Login Wall Interceptor
  if (!activeUser) {
    return <LoginScreen onSetUser={handleSetMockUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans antialiased text-sm">
      {/* Interactive Mobile Top Header Bar */}
      <header className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 md:px-8 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Mobile Sidebar Hamburger selector */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition md:hidden cursor-pointer"
              title="Ver listas"
            >
              {mobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>

            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-xs">
                <ShoppingBag className="w-5.5 h-5.5 text-white stroke-[2.5]" />
              </div>
              <div>
                <h1 className="font-black text-slate-800 text-base md:text-lg tracking-tight select-none">
                  MemeList <span className="text-pink-600 text-[10px] font-bold bg-pink-50 px-2 py-0.5 rounded-full ml-1 uppercase">Shopping</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-medium leading-none select-none">
                  Lista de la compra inteligente
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDebugPanel(v => !v)}
              className={`select-none text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-full cursor-pointer ${
                isLocalMode
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
              title={
                isLocalMode
                  ? 'Modo Local: tus cambios solo se guardan en este navegador, NO se comparten con otros usuarios. Toca para ver diagnóstico.'
                  : 'Modo Nube: tus cambios se sincronizan en tiempo real con Firebase. Toca para ver diagnóstico.'
              }
            >
              {isLocalMode ? '🚀 Local' : '☁️ Nube'}
            </button>
            <span className="hidden select-none sm:inline-block text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              {activeUser ? `Conectado: ${activeUser.email}` : 'No identificado'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Body Grid Layout */}
      {isLocalMode && dbError && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-4">
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-xs font-semibold text-purple-800 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-purple-105 text-purple-600 rounded-lg text-sm">📡</span>
              <span>
                <strong>Modo Despensa Resiliente Activo:</strong> Se detectaron restricciones de red en Firebase ({dbError.error?.toLowerCase().includes('permission') ? 'permisos' : 'pruebas'}). Tus listas se guardan en tu navegador con persistencia 100% segura.
              </span>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-2.5 py-1 bg-purple-900/10 text-purple-900 rounded-lg hover:bg-purple-900/15 transition shrink-0"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          
          {/* 1. Sidebar Panel (ListSelector) - Responsive design */}
          <div className="md:col-span-1 hidden md:block h-[calc(100vh-180px)] sticky top-[80px]">
            <ListSelector
              lists={lists}
              activeListId={activeListId}
              onSelect={(id) => {
                setActiveListId(id);
                setMobileMenuOpen(false);
              }}
              onCreateList={createList}
              items={items}
              onOpenSettings={(l) => setActiveSettingsListId(l.id)}
              currentUserEmail={activeUser?.email}
            />
          </div>

          {/* Mobile menu responsive slide-out */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="w-4/5 max-w-xs h-full bg-slate-900 shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-4 flex h-full flex-col">
                    <ListSelector
                      lists={lists}
                      activeListId={activeListId}
                      onSelect={(id) => {
                        setActiveListId(id);
                        setMobileMenuOpen(false);
                      }}
                      onCreateList={createList}
                      items={items}
                      onOpenSettings={(l) => {
                        setActiveSettingsListId(l.id);
                        setMobileMenuOpen(false);
                      }}
                      currentUserEmail={activeUser?.email}
                    />
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* 2. Main Dashboard panel */}
          <div className="md:col-span-3 space-y-6">
            
            {/* Sync credentials controller */}
            <AuthBar 
              user={activeUser}
              onSetMockUser={handleSetMockUser}
              onUpdateUser={handleUpdateUser}
            />

            {/* List Detail View */}
            {loading ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-full border-t-2 border-purple-500 border-r-2 animate-spin mb-3"></div>
                <p className="text-sm font-semibold text-slate-500">Sincronizando con la nube...</p>
              </div>
            ) : activeList ? (
              <ShoppingListDashboard
                list={activeList}
                items={items}
                onAddItem={addShoppingItem}
                onUpdateItem={updateShoppingItem}
                onDeleteItem={deleteShoppingItem}
                onClearChecked={clearCheckedItems}
              />
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4">
                <ClipboardList className="w-12 h-12 text-slate-350 mx-auto" />
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg">Crea tu primera lista</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed mt-1">
                    Crea una lista desde la barra izquierda en tu ordenador, o mediante el menú desplegable en tu dispositivo móvil, para catalogar productos en tiempo real.
                  </p>
                </div>
                {/* Visual Quick Helper trigger on mobile */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 md:hidden transition cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Crear lista</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* List Settings Overlay Modal Dial */}
      <AnimatePresence>
        {activeSettingsList && (
          <ListSettingsDialog
            list={activeSettingsList}
            onUpdate={updateList}
            onDelete={deleteList}
            onClose={() => setActiveSettingsListId(null)}
            currentUserEmail={activeUser?.email}
          />
        )}
      </AnimatePresence>

      {/* Panel de diagnóstico: se abre pulsando el badge Nube/Local, útil en móvil sin DevTools */}
      {showDebugPanel && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowDebugPanel(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 text-xs space-y-2 font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-slate-800">🔍 Diagnóstico</h3>
              <button onClick={() => setShowDebugPanel(false)} className="text-slate-400 text-lg leading-none cursor-pointer">✕</button>
            </div>
            <div><span className="text-slate-400">Modo:</span> {isLocalMode ? '🚀 Local (NO sincroniza)' : '☁️ Nube (Firebase)'}</div>
            <div><span className="text-slate-400">Email autenticado:</span> {activeUser?.email || '(ninguno)'}</div>
            <div><span className="text-slate-400">UID:</span> {activeUser?.uid || '(ninguno)'}</div>
            <div><span className="text-slate-400">Email usado en la query:</span> {debugInfo.queryEmail || '(ninguno)'}</div>
            <div><span className="text-slate-400">Listas propias encontradas:</span> {debugInfo.ownedCount}</div>
            <div><span className="text-slate-400">Listas compartidas encontradas:</span> {debugInfo.sharedCount}</div>
            <div><span className="text-slate-400">Total listas visibles:</span> {lists.length}</div>
            {dbError && (
              <div className="mt-2 p-2 bg-red-50 text-red-700 rounded-lg break-words">
                <div className="font-bold">⚠️ Último error Firestore:</div>
                <div>Código: {dbError.code || 'N/A'}</div>
                <div>Mensaje: {dbError.error || 'N/A'}</div>
              </div>
            )}
            {!dbError && (
              <div className="mt-2 p-2 bg-emerald-50 text-emerald-700 rounded-lg">✅ Sin errores registrados</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
