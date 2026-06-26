import React, { useState } from 'react';
import { ShoppingList, ShoppingItem } from '../types';
import { ItemRow } from './ItemRow';
import { Plus, Search, Smile, CheckCircle, Check } from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';
import { motion, AnimatePresence } from 'motion/react';

interface ShoppingListDashboardProps {
  list: ShoppingList;
  items: ShoppingItem[];
  onAddItem: (
    name: string,
    presetCategory?: string,
    presetUnit?: string,
    presetPrice?: number | null,
    presetImageUrl?: string
  ) => Promise<void>;
  onUpdateItem: (itemId: string, updates: Partial<ShoppingItem>) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
  onClearChecked: () => Promise<void>;
}

const guessCategoryLocally = (name: string): string => {
  const text = name.toLowerCase().trim();
  if (text.includes('platano') || text.includes('manzana') || text.includes('tomate') || text.includes('aguacate') || text.includes('verdura') || text.includes('ensalada') || text.includes('cebolla') || text.includes('limon') || text.includes('zanahoria') || text.includes('brocoli') || text.includes('patata') || text.includes('fresa') || text.includes('naranja') || text.includes('fruta')) return 'Frutas y Verduras';
  if (text.includes('leche') || text.includes('queso') || text.includes('yogur') || text.includes('mantequilla') || text.includes('huevo') || text.includes('lacteo') || text.includes('nata')) return 'Lácteos y Huevos';
  if (text.includes('pan') || text.includes('croissant') || text.includes('muffin') || text.includes('donuts') || text.includes('magdalena') || text.includes('pasteleria') || text.includes('bollo')) return 'Panadería y Pastelería';
  if (text.includes('pechuga') || text.includes('pollo') || text.includes('ternera') || text.includes('cerdo') || text.includes('carne') || text.includes('embutido') || text.includes('bistec') || text.includes('pavo') || text.includes('jamon') || text.includes('hamburguesa') || text.includes('panceta')) return 'Carnes y Aves';
  if (text.includes('pescado') || text.includes('salmon') || text.includes('atun') || text.includes('merluza') || text.includes('bacalao') || text.includes('marisco') || text.includes('gamba') || text.includes('mejillon') || text.includes('langostinos')) return 'Pescados y Mariscos';
  if (text.includes('congelado') || text.includes('helado') || text.includes('croqueta') || text.includes('gofre')) return 'Congelados';
  if (text.includes('agua') || text.includes('refresco') || text.includes('fanta') || text.includes('coca') || text.includes('zumo') || text.includes('cerveza') || text.includes('vino') || text.includes('bebida') || text.includes('cafe') || text.includes('te') || text.includes('infusion')) return 'Bebidas y Refrescos';
  if (text.includes('arroz') || text.includes('pasta') || text.includes('macarron') || text.includes('espagueti') || text.includes('cereal') || text.includes('avena') || text.includes('harina') || text.includes('garbanzo') || text.includes('lenteja') || text.includes('alubia')) return 'Cereales, Legumbres y Pastas';
  if (text.includes('aceite') || text.includes('sal') || text.includes('conserva') || text.includes('lata') || text.includes('mayonesa') || text.includes('especias') || text.includes('vinagre') || text.includes('salsa') || text.includes('caldo')) return 'Despensa y Conservas';
  if (text.includes('chocolate') || text.includes('chuches') || text.includes('snack') || text.includes('galleta') || text.includes('caramelo') || text.includes('bombon') || text.includes('patatitas') || text.includes('palomita')) return 'Snacks y Dulces';
  if (text.includes('bebe') || text.includes('pañal') || text.includes('toallitas bebe') || text.includes('potito') || text.includes('chupete')) return 'Bebés';
  if (text.includes('perro') || text.includes('gato') || text.includes('mascota') || text.includes('pienso')) return 'Mascotas';
  return 'Otros';
};

const renderMyProductIcon = (name: string, remoteUrl?: string) => {
  const normalized = name.toLowerCase();
  const isFallbackOrStock = !remoteUrl || remoteUrl.includes('unsplash.com') || remoteUrl === '';

  if (!isFallbackOrStock) {
    return (
      <img
        src={remoteUrl}
        alt={name}
        className="w-full h-full object-contain select-none pointer-events-none"
        referrerPolicy="no-referrer"
        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
      />
    );
  }

  if (normalized.includes('leche')) {
    let colorClass = 'bg-blue-500'; let tColor = 'text-blue-600'; let label = 'SEMI';
    if (normalized.includes('entera')) { colorClass = 'bg-red-500'; tColor = 'text-red-600'; label = 'ENTERA'; }
    else if (normalized.includes('sin lactosa')) { colorClass = 'bg-violet-500'; tColor = 'text-violet-600'; label = 'SIN LAC'; }
    else if (normalized.includes('desnatada')) { colorClass = 'bg-pink-500'; tColor = 'text-pink-600'; label = 'DESNAT'; }
    const isPack = normalized.includes('pack') || normalized.includes('6');
    return (
      <div className="relative w-full h-full flex flex-col justify-between items-center rounded-lg overflow-hidden border border-slate-200 bg-white">
        <div className={`w-full h-3 ${colorClass} flex items-center justify-center text-[7px] text-white font-black leading-none uppercase`}>Hacendado</div>
        <div className="flex-1 flex flex-col justify-center items-center px-0.5 select-none font-sans">
          <span className={`text-[8px] font-black tracking-tight leading-none ${tColor} text-center`}>{label}</span>
          {isPack && <span className="text-[5px] font-bold text-slate-400 bg-slate-100 px-1 rounded-sm mt-0.5 shrink-0">PACK 6</span>}
        </div>
        <div className="w-full h-1.5 bg-slate-100 flex items-center justify-around overflow-hidden shrink-0">
          <div className="w-0.5 h-full bg-slate-400"></div><div className="w-0.5 h-full bg-slate-400"></div>
          <div className="w-0.5 h-full bg-slate-400"></div><div className="w-0.5 h-full bg-slate-400"></div>
        </div>
      </div>
    );
  }

  const emojiMap: [string[], string, string][] = [
    [['toallitas wc'], '🧻', 'WC'],
    [['ensalada'], '🥗', 'Ensalada'],
    [['helado'], '🍨', 'Helado'],
    [['galletas'], '🍪', 'Galleta'],
    [['plátano', 'platano'], '🍌', 'Plátano'],
    [['manzana'], '🍎', 'Manzana'],
    [['aguacate'], '🥑', 'Aguacate'],
    [['huevos', 'huevo'], '🥚', 'Huevos'],
    [['tomate'], '🍅', 'Tomate'],
  ];

  for (const [keys, emoji, label] of emojiMap) {
    if (keys.some(k => normalized.includes(k))) {
      return (
        <div className="w-full h-full rounded-lg bg-slate-50 border border-slate-100 flex flex-col justify-center items-center p-1 select-none">
          <span className="text-sm">{emoji}</span>
          <span className="text-[6px] text-slate-600 font-black uppercase tracking-tight text-center mt-0.5">{label}</span>
        </div>
      );
    }
  }

  return (
    <div className="w-full h-full rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center select-none">
      <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
      </svg>
    </div>
  );
};

export const ShoppingListDashboard: React.FC<ShoppingListDashboardProps> = ({
  list, items, onAddItem, onUpdateItem, onDeleteItem, onClearChecked,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [mercadonaQuery, setMercadonaQuery] = useState('');
  const [mercadonaResults, setMercadonaResults] = useState<any[]>([]);
  const [zoomImage, setZoomImage] = useState<{url: string, name: string} | null>(null);
  const [loadingMercadona, setLoadingMercadona] = useState(false);
  const [mercadonaError, setMercadonaError] = useState('');
  const [postalCode, setPostalCode] = useState(() => localStorage.getItem('mercadona_postal_code') || '45600');
  const [isEditingCP, setIsEditingCP] = useState(false);
  const [cpTempInput, setCpTempInput] = useState(postalCode);

  const catalogRef = React.useRef<any[] | null>(null);

  const loadCatalog = async (): Promise<any[]> => {
    if (catalogRef.current) return catalogRef.current;
    const resp = await fetch('/catalog.json');
    if (!resp.ok) throw new Error('Error cargando catálogo');
    catalogRef.current = await resp.json();
    return catalogRef.current!;
  };

  const normalize = (str: string) =>
    str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  const fetchMercadonaProducts = async (q: string) => {
    if (!q.trim()) return;
    setLoadingMercadona(true);
    setMercadonaError('');
    setMercadonaQuery(''); // Limpiar campo tras buscar
    try {
      const catalog = await loadCatalog();
      const words = normalize(q).split(/\s+/).filter(Boolean);
      const q0 = normalize(q);
      const products = catalog
        .filter((p: any) => {
          if (!p.name) return false;
          const n = ' ' + normalize(p.name) + ' ';
          return words.every((w: string) => {
            if (w.length <= 3) return n.includes(' ' + w + ' ');
            return n.indexOf(' ' + w) !== -1;
          });
        })
        .sort((a: any, b: any) => {
          const na = normalize(a.name); const nb = normalize(b.name);
          const aExact = na.startsWith(q0) ? 0 : 1;
          const bExact = nb.startsWith(q0) ? 0 : 1;
          if (aExact !== bExact) return aExact - bExact;
          return na.localeCompare(nb);
        })
        .slice(0, 50);
      setMercadonaResults(products);
      if (products.length === 0) setMercadonaError('Sin resultados. Prueba con otro término.');
    } catch (err) {
      setMercadonaError('Error al cargar el catálogo.');
      console.error(err);
    } finally {
      setLoadingMercadona(false);
    }
  };

  const handleSuggestionClick = async (name: string, category?: string, unit?: string, price?: number | null, imageUrl?: string) => {
    setIsAdding(true);
    await onAddItem(name, category || guessCategoryLocally(name), unit, price, imageUrl);
    setIsAdding(false);
  };

  const activeItems = items.filter(item => !item.checked);
  const checkedItems = items.filter(item => item.checked);

  const activeItemsByCategory: Record<string, ShoppingItem[]> = {};
  activeItems.forEach(item => {
    const cat = item.category || 'Otros';
    if (!activeItemsByCategory[cat]) activeItemsByCategory[cat] = [];
    activeItemsByCategory[cat].push(item);
  });

  const calculateCost = (itemsList: ShoppingItem[]) =>
    itemsList.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);

  const activeCost = calculateCost(activeItems);
  const checkedCost = calculateCost(checkedItems);
  const totalCost = activeCost + checkedCost;
  const totalCount = items.length;
  const completedCount = checkedItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">

      {/* BANNER PRINCIPAL — Buscador Mercadona */}
      <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-5 shadow-sm border border-pink-300 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute left-0 bottom-0 -translate-x-12 translate-y-12 w-32 h-32 rounded-full bg-purple-600/10 blur-lg"></div>

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between mb-1">
          <h3 className="font-extrabold text-white tracking-tight text-lg select-none">{list.name}</h3>
          {/* CP inline */}
          {!isEditingCP ? (
            <button
              type="button"
              onClick={() => { setCpTempInput(postalCode); setIsEditingCP(true); }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-xl transition text-[10px] font-bold cursor-pointer"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2a8 8 0 00-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 00-8-8z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              CP {postalCode}
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                type="text" maxLength={5} value={cpTempInput}
                onChange={(e) => setCpTempInput(e.target.value.replace(/\D/g, ''))}
                className="w-16 px-2 py-1 bg-white rounded-lg text-slate-800 font-bold text-center text-xs focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { const v = cpTempInput.trim(); if (v) { setPostalCode(v); localStorage.setItem('mercadona_postal_code', v); setIsEditingCP(false); } }
                }}
              />
              <button type="button" onClick={() => { const v = cpTempInput.trim(); if (v) { setPostalCode(v); localStorage.setItem('mercadona_postal_code', v); setIsEditingCP(false); } }}
                className="px-2 py-1 bg-white text-pink-600 font-black rounded-lg text-[10px] cursor-pointer">OK</button>
              <button type="button" onClick={() => setIsEditingCP(false)}
                className="px-2 py-1 bg-white/20 text-white font-black rounded-lg text-[10px] cursor-pointer">✕</button>
            </div>
          )}
        </div>

        <p className="text-pink-100 text-xs font-semibold mb-3 opacity-95 relative z-10 select-none">
          Busca en el catálogo de Mercadona y añade productos directamente a tu lista.
        </p>

        {/* Input búsqueda */}
        <div className="relative z-10 flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-3.5">
              <Search className="w-4 h-4 text-slate-400 stroke-[2.5]" />
            </span>
            <input
              type="text"
              value={mercadonaQuery}
              onChange={(e) => setMercadonaQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); fetchMercadonaProducts(mercadonaQuery); } }}
              placeholder="Buscar en Mercadona (ej. leche entera, fideos, agua...)"
              className="w-full text-xs font-semibold text-slate-800 bg-white border-2 border-white focus:border-slate-900 rounded-2xl pl-9 pr-4 py-3 placeholder-slate-400 focus:outline-none transition shadow-xs"
            />
          </div>
          <button
            type="button"
            disabled={loadingMercadona}
            onClick={() => fetchMercadonaProducts(mercadonaQuery)}
            className="px-5 bg-slate-900 text-pink-300 font-extrabold text-xs tracking-wide rounded-2xl flex items-center justify-center hover:bg-slate-800 transition cursor-pointer shrink-0 shadow-xs"
          >
            {loadingMercadona ? '...' : <Search className="w-4 h-4 stroke-[3]" />}
          </button>
        </div>
      </div>

      {/* Resultados búsqueda */}
      {(mercadonaResults.length > 0 || mercadonaError || loadingMercadona) && (
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs space-y-3">
          {mercadonaError && (
            <p className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-2 rounded-xl border border-rose-100">{mercadonaError}</p>
          )}
          {loadingMercadona ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <div className="w-6 h-6 rounded-full border-t-2 border-purple-500 border-r-2 animate-spin mb-2"></div>
              <span className="text-xs font-semibold">Buscando en Mercadona...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[600px] overflow-y-auto pr-1">
              {mercadonaResults.map((prod) => {
                const isAlreadyAdded = items.some(i => i.name.toLowerCase() === prod.name.toLowerCase() && !i.checked);
                return (
                  <div
                    key={prod.name}
                    className={`flex items-center gap-2.5 p-2 rounded-2xl border transition ${
                      isAlreadyAdded ? 'bg-pink-50/40 border-pink-200' : 'bg-slate-50/50 hover:bg-white hover:border-slate-300 border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div
                      className="w-11 h-11 bg-white rounded-xl overflow-hidden shrink-0 border border-slate-150 flex items-center justify-center p-0.5 cursor-zoom-in hover:border-purple-300 transition"
                      onClick={(e) => { e.stopPropagation(); if (prod.imageUrl) setZoomImage({url: prod.imageUrl, name: prod.name}); }}
                    >
                      {renderMyProductIcon(prod.name, prod.imageUrl)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-extrabold text-xs text-slate-800 block truncate" title={prod.name}>{prod.name}</span>
                      <div className="flex gap-1.5 items-baseline">
                        <span className="text-xs font-black text-purple-600">{prod.price ? `${prod.price.toFixed(2)} €` : 'N/D'}</span>
                        {prod.pricePerUnitString && <span className="text-[9px] text-slate-400 font-semibold truncate max-w-[80px]">{prod.pricePerUnitString}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isAdding}
                      onClick={() => handleSuggestionClick(prod.name, undefined, prod.unit, prod.price, prod.imageUrl)}
                      className={`p-1.5 rounded-xl shrink-0 transition cursor-pointer ${
                        isAlreadyAdded ? 'bg-pink-500 text-white' : 'bg-slate-100 hover:bg-pink-500 text-slate-600 hover:text-white'
                      }`}
                    >
                      {isAlreadyAdded ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4 stroke-[2]" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Progreso y costes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Progreso de compra</span>
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>{completedCount} de {totalCount} productos</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div className="bg-pink-500 h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
        <div className="flex md:border-l md:border-slate-100 md:pl-5 flex-col justify-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Cesta actual</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-800">{checkedCost.toFixed(2)} €</span>
            <span className="text-[10px] text-slate-400 font-medium">ya comprados</span>
          </div>
        </div>
        <div className="flex md:border-l md:border-slate-100 md:pl-5 flex-col justify-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Coste Total Estimado</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-pink-600">{totalCost.toFixed(2)} €</span>
            {totalCost > 0 && <span className="text-[10px] text-slate-400 font-medium">({activeCost.toFixed(2)} € por comprar)</span>}
          </div>
        </div>
      </div>

      {/* Lista de la compra */}
      <div className="space-y-6">
        {totalCount === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl p-6">
            <Smile className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="font-extrabold text-slate-800 text-base mb-1">¡Esta lista está vacía!</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Busca un producto en el catálogo de Mercadona y añádelo a tu lista.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {Object.keys(activeItemsByCategory).map((catName) => {
                const groupItems = activeItemsByCategory[catName];
                return (
                  <motion.div key={catName} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-2.5">
                    <div className="flex items-center justify-between pb-1 px-1 border-b border-slate-50">
                      <CategoryBadge categoryKey={catName} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{groupItems.length} {groupItems.length === 1 ? 'artículo' : 'artículos'}</span>
                    </div>
                    <div className="space-y-2">
                      {groupItems.map(item => <ItemRow key={item.id} item={item} onUpdate={onUpdateItem} onDelete={onDeleteItem} />)}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {checkedItems.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between px-1">
                  <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5 select-none">
                    <CheckCircle className="w-4 h-4 text-pink-500" /> Artículos comprados ({checkedItems.length})
                  </h4>
                  <button onClick={onClearChecked} className="text-[10px] text-red-500 hover:text-red-700 font-extrabold cursor-pointer transition hover:underline">
                    Vaciar comprados
                  </button>
                </div>
                <div className="space-y-2 bg-slate-50/40 p-3 rounded-2xl border border-slate-100/60">
                  <AnimatePresence mode="popLayout">
                    {checkedItems.map(item => <ItemRow key={item.id} item={item} onUpdate={onUpdateItem} onDelete={onDeleteItem} />)}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal zoom imagen */}
      {zoomImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setZoomImage(null)}>
          <div className="relative bg-white rounded-3xl p-4 max-w-sm w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setZoomImage(null)} className="absolute top-3 right-3 bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center text-slate-600 text-lg font-bold transition">×</button>
            <img src={zoomImage.url} alt={zoomImage.name} className="w-full h-64 object-contain rounded-2xl" />
            <p className="text-center text-sm font-semibold text-slate-700 mt-3 px-2">{zoomImage.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};
