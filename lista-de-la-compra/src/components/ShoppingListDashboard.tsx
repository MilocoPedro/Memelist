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

// Adivina categoría a partir del nombre del producto
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
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  if (normalized.includes('leche')) {
    let colorClass = 'bg-blue-500';
    let tColor = 'text-blue-600';
    let label = 'SEMI';
    if (normalized.includes('entera')) { colorClass = 'bg-red-500'; tColor = 'text-red-600'; label = 'ENTERA'; }
    else if (normalized.includes('sin lactosa')) { colorClass = 'bg-violet-500'; tColor = 'text-violet-600'; label = 'SIN LAC'; }
    else if (normalized.includes('desnatada')) { colorClass = 'bg-pink-500'; tColor = 'text-pink-600'; label = 'DESNAT'; }
    const isPack = normalized.includes('pack') || normalized.includes('6');
    return (
      <div className="relative w-full h-full flex flex-col justify-between items-center rounded-lg overflow-hidden border border-slate-200 bg-white">
        <div className={`w-full h-3 ${colorClass} flex items-center justify-center text-[7px] text-white font-black leading-none uppercase`}>Hacendado</div>
        <div className="flex-1 flex flex-col justify-center items-center px-0.5 select-none font-sans">
          <span className={`text-[8px] font-black tracking-tight leading-none ${tColor} text-center`}>{label}</span>
          {isPack && <span className="text-[5px] font-bold text-slate-400 bg-slate-100 px-1 py-0.2 rounded-sm mt-0.5 shrink-0 scale-90">PACK 6</span>}
        </div>
        <div className="w-full h-1.5 bg-slate-100 flex items-center justify-around overflow-hidden shrink-0">
          <div className="w-0.5 h-full bg-slate-400"></div>
          <div className="w-0.5 h-full bg-slate-400"></div>
          <div className="w-0.5 h-full bg-slate-400"></div>
          <div className="w-0.5 h-full bg-slate-400"></div>
        </div>
      </div>
    );
  }

  if (normalized.includes('toallitas wc')) {
    return (
      <div className="w-full h-full rounded-lg bg-cyan-55 border border-cyan-200 flex flex-col justify-between p-1 select-none">
        <div className="text-[7px] text-cyan-600 font-extrabold leading-tight">Bosque<br/>Verde</div>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[7px] text-cyan-700 font-black tracking-tight text-center leading-none">Toallitas WC</span>
        </div>
        <div className="w-2 h-0.5 rounded-full bg-cyan-300 mx-auto"></div>
      </div>
    );
  }

  if (normalized.includes('higiénico') || normalized.includes('papel')) {
    return (
      <div className="w-full h-full rounded-lg bg-pink-100/40 border border-pink-200 flex flex-col justify-between p-1 select-none">
        <div className="text-[7px] text-pink-600 font-extrabold leading-tight">Bosque Rosa</div>
        <div className="flex-1 flex items-center justify-center gap-0.5">
          <span className="w-3.5 h-4 rounded-xs border-2 border-slate-200 bg-white flex items-center justify-center font-bold text-[7px] text-slate-400">🧻</span>
          <span className="w-3.5 h-4 rounded-xs border-2 border-slate-200 bg-white flex items-center justify-center font-bold text-[7px] text-slate-400">🧻</span>
        </div>
      </div>
    );
  }

  if (normalized.includes('tomato') || normalized.includes('tomate')) {
    return (
      <div className="w-full h-full rounded-lg bg-rose-50 border border-rose-150 flex flex-col justify-between p-1 select-none">
        <div className="text-[6px] text-rose-500 font-extrabold text-center uppercase tracking-wide">Hacendado</div>
        <div className="flex-1 flex flex-col justify-center items-center">
          <span className="text-[7px] text-rose-800 font-black text-center leading-none">TOMATE</span>
          <span className="text-[6px] text-rose-500 font-bold leading-none">FRITO</span>
        </div>
        <div className="w-full h-1 bg-rose-500 rounded-b-xs"></div>
      </div>
    );
  }

  if (normalized.includes('ensalada')) {
    return (
      <div className="w-full h-full rounded-lg bg-lime-50 border border-lime-200 flex flex-col justify-center items-center p-1 select-none">
        <span className="text-sm">🥗</span>
        <span className="text-[6px] text-lime-700 font-black uppercase tracking-tight text-center mt-0.5">Ensalada</span>
      </div>
    );
  }

  if (normalized.includes('helado')) {
    return (
      <div className="w-full h-full rounded-lg bg-amber-50 border border-amber-200 flex flex-col justify-center items-center p-1 select-none">
        <span className="text-sm">🍨</span>
        <span className="text-[6px] text-amber-700 font-black uppercase tracking-tight text-center mt-0.5 font-bold">Helado</span>
      </div>
    );
  }

  if (normalized.includes('galletas')) {
    return (
      <div className="w-full h-full rounded-lg bg-yellow-50 border border-yellow-250 flex flex-col justify-center items-center p-0.5 select-none">
        <div className="w-7 h-7 rounded-full bg-yellow-200 border-2 border-dashed border-yellow-400 flex items-center justify-center font-black text-[6px] text-yellow-800">MARÍA</div>
      </div>
    );
  }

  if (normalized.includes('plátano') || normalized.includes('platano')) {
    return (
      <div className="w-full h-full rounded-lg bg-amber-50 border border-amber-200 flex flex-col justify-center items-center p-1 select-none">
        <span className="text-sm">🍌</span>
        <span className="text-[6px] text-amber-600 font-black uppercase tracking-tight text-center mt-0.5">Plátano</span>
      </div>
    );
  }

  if (normalized.includes('manzana')) {
    return (
      <div className="w-full h-full rounded-lg bg-red-50 border border-red-200 flex flex-col justify-center items-center p-1 select-none">
        <span className="text-sm">🍎</span>
        <span className="text-[6px] text-red-600 font-black uppercase tracking-tight text-center mt-0.5">Manzana</span>
      </div>
    );
  }

  if (normalized.includes('aguacate')) {
    return (
      <div className="w-full h-full rounded-lg bg-pink-50 border border-pink-200 flex flex-col justify-center items-center p-1 select-none">
        <span className="text-sm">🥑</span>
        <span className="text-[6px] text-pink-700 font-black uppercase tracking-tight text-center mt-0.5">Aguacate</span>
      </div>
    );
  }

  if (normalized.includes('huevos') || normalized.includes('huevo')) {
    return (
      <div className="w-full h-full rounded-lg bg-amber-55 border border-amber-200 flex flex-col justify-center items-center p-1 select-none">
        <span className="text-sm">🥚</span>
        <span className="text-[6px] text-amber-800 font-black uppercase tracking-tight text-center mt-0.5">Huevos</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center select-none">
      <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    </div>
  );
};

export const ShoppingListDashboard: React.FC<ShoppingListDashboardProps> = ({
  list,
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onClearChecked,
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Mercadona states
  const [mercadonaQuery, setMercadonaQuery] = useState('');
  const [mercadonaResults, setMercadonaResults] = useState<any[]>([]);
  const [zoomImage, setZoomImage] = useState<{url: string, name: string} | null>(null);
  const [loadingMercadona, setLoadingMercadona] = useState(false);
  const [mercadonaError, setMercadonaError] = useState('');
  const [postalCode, setPostalCode] = useState(() => localStorage.getItem('mercadona_postal_code') || '45600');
  const [isEditingCP, setIsEditingCP] = useState(false);
  const [cpTempInput, setCpTempInput] = useState(postalCode);

  // Catálogo cargado una vez en memoria desde /public/catalog.json
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
    try {
      const catalog = await loadCatalog();
      const words = normalize(q).split(/\s+/).filter(Boolean);
      const products = catalog
        .filter((p: any) => {
          if (!p.name) return false;
          const n = normalize(p.name);
          return words.every((w: string) => n.includes(w));
        })
        .slice(0, 50);
      setMercadonaResults(products);
      if (products.length === 0) {
        setMercadonaError('Sin resultados. Prueba con otro término.');
      }
    } catch (err) {
      setMercadonaError('Error al cargar el catálogo.');
      console.error(err);
    } finally {
      setLoadingMercadona(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newItemName.trim();
    if (!clean) return;
    setIsAdding(true);
    await onAddItem(clean);
    setNewItemName('');
    setIsAdding(false);
  };

  const handleSuggestionClick = async (
    name: string,
    category?: string,
    unit?: string,
    price?: number | null,
    imageUrl?: string
  ) => {
    setIsAdding(true);
    const targetCategory = category || guessCategoryLocally(name);
    await onAddItem(name, targetCategory, unit, price, imageUrl);
    setIsAdding(false);
  };

  // Agrupar items
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

      {/* Barra de añadir producto */}
      <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-5 shadow-sm border border-pink-300 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute left-0 bottom-0 -translate-x-12 translate-y-12 w-32 h-32 rounded-full bg-purple-600/10 blur-lg"></div>

        <h3 className="font-extrabold text-white tracking-tight text-lg mb-1 relative z-10 select-none flex items-center gap-1.5">
          Lista: {list.name}
        </h3>
        <p className="text-pink-100 text-xs font-semibold mb-4 opacity-95 relative z-10 select-none">
          Escribe un producto para añadirlo. Nuestra Inteligencia Artificial (Gemini) lo clasificará automáticamente dentro de su sección adecuada.
        </p>

        <form onSubmit={handleSubmit} className="relative z-10 flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-3.5 text-slate-400">
              <Search className="w-4 h-4 text-slate-500 stroke-[2.5]" />
            </span>
            <input
              type="text"
              required
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Escribe producto (ej. leche de soja desnatada, friegasuelos, sandía...)"
              className="w-full text-xs font-semibold text-slate-800 bg-white border-2 border-white focus:border-slate-900 rounded-2xl pl-9 pr-4 py-3 placeholder-slate-400 focus:outline-hidden transition shadow-xs"
            />
          </div>
          <button
            type="submit"
            disabled={isAdding}
            className="px-5 bg-slate-900 text-pink-300 font-extrabold text-xs tracking-wide rounded-2xl flex items-center justify-center hover:bg-slate-800 transition cursor-pointer shrink-0 shadow-xs"
          >
            {isAdding ? 'Añadiendo...' : <Plus className="w-5 h-5 text-pink-300 stroke-[3]" />}
          </button>
        </form>
      </div>

      {/* Buscador Mercadona */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-pink-50 rounded-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Catálogo Mercadona</span>
            <span className="text-[10px] text-slate-400 leading-none">Busca productos reales con precios actualizados</span>
          </div>
        </div>

        {/* Selector código postal */}
        <div className="bg-pink-50/50 border border-pink-100 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-pink-100 text-pink-700 rounded-lg shrink-0">
              <svg className="w-4 h-4 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2a8 8 0 00-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 00-8-8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-extrabold text-pink-950 leading-tight">CP: <span className="underline decoration-wavy decoration-pink-500 font-extrabold text-sm text-pink-700">{postalCode}</span></p>
              <p className="text-[10px] text-pink-600 font-medium">Mercadona España</p>
            </div>
          </div>

          {!isEditingCP ? (
            <button
              type="button"
              onClick={() => { setCpTempInput(postalCode); setIsEditingCP(true); }}
              className="px-3 py-1.5 bg-white hover:bg-pink-100/30 text-pink-700 border border-pink-200 font-bold rounded-xl transition cursor-pointer self-start sm:self-center shrink-0 uppercase tracking-wide text-[10px]"
            >
              Cambiar CP
            </button>
          ) : (
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <input
                type="text"
                maxLength={5}
                value={cpTempInput}
                onChange={(e) => setCpTempInput(e.target.value.replace(/\D/g, ''))}
                placeholder="45600"
                className="w-20 px-2 py-1 bg-white border border-pink-300 rounded-lg text-pink-800 font-bold text-center focus:outline-hidden text-xs focus:ring-1 focus:ring-pink-500 shrink-0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const v = cpTempInput.trim();
                    if (v) { setPostalCode(v); localStorage.setItem('mercadona_postal_code', v); setIsEditingCP(false); }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const v = cpTempInput.trim();
                  if (v) { setPostalCode(v); localStorage.setItem('mercadona_postal_code', v); setIsEditingCP(false); }
                }}
                className="px-2.5 py-1 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg transition cursor-pointer text-[10px] shrink-0"
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => setIsEditingCP(false)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg transition cursor-pointer text-[10px] shrink-0"
              >
                X
              </button>
            </div>
          )}
        </div>

        {/* Input búsqueda */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-slate-400">
              <Search className="w-4 h-4 text-pink-500 stroke-[2.5]" />
            </span>
            <input
              type="text"
              value={mercadonaQuery}
              onChange={(e) => setMercadonaQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); fetchMercadonaProducts(mercadonaQuery); }
              }}
              placeholder="Buscar en Mercadona (ej. leche entera, suavizante, agua...)"
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-pink-500 rounded-xl pl-9 pr-3 py-2 focus:outline-hidden transition"
            />
          </div>
          <button
            type="button"
            disabled={loadingMercadona}
            onClick={() => fetchMercadonaProducts(mercadonaQuery)}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-black rounded-xl transition cursor-pointer shrink-0 shadow-2xs"
          >
            {loadingMercadona ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {/* Error */}
        {mercadonaError && (
          <p className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-2 rounded-xl border border-rose-100">{mercadonaError}</p>
        )}

        {/* Resultados */}
        {loadingMercadona ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <div className="w-6 h-6 rounded-full border-t-2 border-purple-500 border-r-2 animate-spin mb-2"></div>
            <span className="text-xs font-semibold">Buscando productos y precios de Mercadona...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 px-0.5 max-h-[600px] overflow-y-auto pr-2">
            {mercadonaResults.map((prod) => {
              const isAlreadyAdded = items.some(
                i => i.name.toLowerCase() === prod.name.toLowerCase() && !i.checked
              );
              return (
                <div
                  key={prod.name}
                  className={`flex items-center gap-2.5 p-2 rounded-2xl border transition ${
                    isAlreadyAdded
                      ? 'bg-pink-50/40 border-pink-200'
                      : 'bg-slate-50/50 hover:bg-white hover:border-slate-350 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div
                    className="w-11 h-11 bg-white rounded-xl overflow-hidden shrink-0 border border-slate-150 flex items-center justify-center p-0.5 cursor-zoom-in hover:border-purple-300 transition"
                    onClick={(e) => { e.stopPropagation(); if (prod.imageUrl) setZoomImage({url: prod.imageUrl, name: prod.name}); }}
                    title="Ver imagen ampliada"
                  >
                    {renderMyProductIcon(prod.name, prod.imageUrl)}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="font-extrabold text-xs text-slate-800 block truncate" title={prod.name}>
                      {prod.name}
                    </span>
                    <div className="flex gap-1.5 items-baseline">
                      <span className="text-xs font-black text-purple-600">
                        {prod.price ? `${prod.price.toFixed(2)} €` : 'N/D'}
                      </span>
                      {prod.pricePerUnitString && (
                        <span className="text-[9px] text-slate-400 font-semibold truncate max-w-[80px]">
                          {prod.pricePerUnitString}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isAdding}
                    onClick={() => handleSuggestionClick(prod.name, undefined, prod.unit, prod.price, prod.imageUrl)}
                    className={`p-1.5 rounded-xl shrink-0 transition cursor-pointer ${
                      isAlreadyAdded
                        ? 'bg-pink-500 text-white'
                        : 'bg-slate-250 hover:bg-pink-500 text-slate-600 hover:text-white'
                    }`}
                    title={isAlreadyAdded ? 'Añadir otro' : 'Añadir a la lista'}
                  >
                    {isAlreadyAdded ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4 stroke-[2]" />}
                  </button>
                </div>
              );
            })}
            {mercadonaResults.length === 0 && !loadingMercadona && (
              <div className="col-span-full py-8 text-center text-slate-400 text-xs font-medium bg-slate-50/30 rounded-2xl border border-dashed border-slate-150">
                Escribe un producto y pulsa Buscar para ver los precios de Mercadona.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progreso y costes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-xs">
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Progreso de compra</span>
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>{completedCount} de {totalCount} productos</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-pink-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
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
            {totalCost > 0 && (
              <span className="text-[10px] text-slate-400 font-medium">
                ({activeCost.toFixed(2)} € por comprar)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lista de la compra */}
      <div className="space-y-6">
        {totalCount === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl p-6">
            <Smile className="w-10 h-10 text-slate-350 mx-auto mb-3" />
            <h4 className="font-extrabold text-slate-800 text-base mb-1">¡Esta lista está vacía!</h4>
            <p className="text-xs text-slate-405 leading-relaxed max-w-xs mx-auto">
              Busca un producto en el catálogo de Mercadona y añádelo a tu lista.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {Object.keys(activeItemsByCategory).map((catName) => {
                const groupItems = activeItemsByCategory[catName];
                return (
                  <motion.div
                    key={catName}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-2.5"
                  >
                    <div className="flex items-center justify-between pb-1 px-1 border-b border-slate-50">
                      <CategoryBadge categoryKey={catName} />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {groupItems.length} {groupItems.length === 1 ? 'artículo' : 'artículos'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {groupItems.map(item => (
                        <ItemRow
                          key={item.id}
                          item={item}
                          onUpdate={onUpdateItem}
                          onDelete={onDeleteItem}
                        />
                      ))}
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
                  <button
                    onClick={onClearChecked}
                    className="text-[10px] text-red-500 hover:text-red-700 font-extrabold cursor-pointer transition hover:underline"
                  >
                    Vaciar comprados
                  </button>
                </div>
                <div className="space-y-2 bg-slate-50/40 p-3 rounded-2xl border border-slate-100/60">
                  <AnimatePresence mode="popLayout">
                    {checkedItems.map(item => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        onUpdate={onUpdateItem}
                        onDelete={onDeleteItem}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal zoom imagen */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setZoomImage(null)}
        >
          <div
            className="relative bg-white rounded-3xl p-4 max-w-sm w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomImage(null)}
              className="absolute top-3 right-3 bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center text-slate-600 text-lg font-bold transition"
            >
              ×
            </button>
            <img
              src={zoomImage.url}
              alt={zoomImage.name}
              className="w-full h-64 object-contain rounded-2xl"
            />
            <p className="text-center text-sm font-semibold text-slate-700 mt-3 px-2">{zoomImage.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};
