import React, { useState } from 'react';
import { ShoppingItem, CATEGORIES, CategoryKey } from '../types';
import { CategoryBadge } from './CategoryBadge';
import { Plus, Minus, Trash, Edit2, Check, X, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface ItemRowProps {
  item: ShoppingItem;
  onUpdate: (itemId: string, updates: Partial<ShoppingItem>) => Promise<void>;
  onDelete: (itemId: string) => Promise<void>;
}

const renderMyProductIcon = (name: string, remoteUrl?: string) => {
  const normalized = name.toLowerCase();
  
  // If we have a real, valid live image that represents the actual product (not a fallback placeholder), we can load it.
  const isFallbackOrStock = !remoteUrl || remoteUrl.includes('unsplash.com') || remoteUrl === '';

  if (!isFallbackOrStock) {
    return (
      <img
        src={remoteUrl}
        alt={name}
        className="w-full h-full object-contain select-none pointer-events-none"
        referrerPolicy="no-referrer"
        onError={(e) => {
          // If the official image fails to load, hide error and render beautiful custom fallback
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  // --- Beautiful Brand-specific custom visual graphics ---
  if (normalized.includes('leche')) {
    let colorClass = 'bg-blue-500'; // semidesnatada
    let tColor = 'text-blue-600';
    let label = 'SEMI';
    
    if (normalized.includes('entera')) {
      colorClass = 'bg-red-500';
      tColor = 'text-red-600';
      label = 'ENTERA';
    } else if (normalized.includes('sin lactosa')) {
      colorClass = 'bg-violet-500';
      tColor = 'text-violet-600';
      label = 'SIN LAC';
    } else if (normalized.includes('desnatada')) {
      colorClass = 'bg-pink-500';
      tColor = 'text-pink-600';
      label = 'DESNAT';
    }

    const isPack = normalized.includes('pack') || normalized.includes('6');

    return (
      <div className="relative w-full h-full flex flex-col justify-between items-center rounded-lg overflow-hidden border border-slate-200 bg-white">
        <div className={`w-full h-3 ${colorClass} flex items-center justify-center text-[7px] text-white font-black leading-none uppercase`}>
          Hacendado
        </div>
        <div className="flex-1 flex flex-col justify-center items-center px-0.5 select-none font-sans">
          <span className={`text-[8px] font-black tracking-tight leading-none ${tColor} text-center`}>
            {label}
          </span>
          {isPack && (
            <span className="text-[5px] font-bold text-slate-400 bg-slate-100 px-1 py-0.2 rounded-sm mt-0.5 shrink-0 scale-95">
              P. 6
            </span>
          )}
        </div>
        <div className="w-full h-1 bg-slate-100 flex items-center justify-around overflow-hidden shrink-0">
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
      <div className="w-full h-full rounded-lg bg-pink-100/40 border border-pink-200 flex flex-col justify-between p-1 select-none font-sans">
        <div className="text-[7px] text-pink-600 font-extrabold leading-tight">Bosque Rosa</div>
        <div className="flex-1 flex items-center justify-center gap-0.5">
          <span className="w-3.5 h-4 rounded-xs border border-slate-200 bg-white flex items-center justify-center font-bold text-[7px] text-slate-400">🧻</span>
        </div>
      </div>
    );
  }

  if (normalized.includes('suavizante')) {
    return (
      <div className="w-full h-full rounded-lg bg-blue-55 border border-blue-200 flex flex-col justify-between p-1 select-none items-center">
        <div className="w-2 h-1 rounded-t-sm bg-blue-500"></div>
        <div className="flex-1 w-full bg-blue-400/20 rounded-xs flex flex-col justify-center items-center">
          <span className="text-[7px] text-blue-800 font-black text-center leading-none">SUAVIZANTE</span>
        </div>
      </div>
    );
  }

  if (normalized.includes('tomato') || normalized.includes('tomate')) {
    return (
      <div className="w-full h-full rounded-lg bg-rose-50 border border-rose-150 flex flex-col justify-between p-1 select-none font-sans">
        <div className="text-[6px] text-rose-500 font-extrabold text-center uppercase tracking-wide">Hacendado</div>
        <div className="flex-1 flex flex-col justify-center items-center">
          <span className="text-[7px] text-rose-800 font-black text-center leading-none">TOMATE</span>
        </div>
        <div className="w-full h-1 bg-rose-500 rounded-b-xs"></div>
      </div>
    );
  }

  if (normalized.includes('ensalada')) {
    return (
      <div className="w-full h-full rounded-lg bg-lime-50 border border-lime-200 flex flex-col justify-center items-center p-1 select-none font-sans">
        <span className="text-sm">🥗</span>
      </div>
    );
  }

  if (normalized.includes('helado')) {
    return (
      <div className="w-full h-full rounded-lg bg-amber-50 border border-amber-200 flex flex-col justify-center items-center p-1 select-none font-sans">
        <span className="text-sm">🍨</span>
      </div>
    );
  }

  if (normalized.includes('galletas')) {
    return (
      <div className="w-full h-full rounded-lg bg-yellow-50 border border-yellow-250 flex flex-col justify-center items-center p-0.5 select-none font-sans">
        <div className="w-7 h-7 rounded-full bg-yellow-200 border border-yellow-400 flex items-center justify-center font-black text-[6px] text-yellow-800">
          MARÍA
        </div>
      </div>
    );
  }

  if (normalized.includes('plátano') || normalized.includes('platano')) {
    return (
      <div className="w-full h-full rounded-lg bg-amber-50 border border-amber-200 flex flex-col justify-center items-center p-1 select-none font-sans">
        <span className="text-sm">🍌</span>
      </div>
    );
  }

  if (normalized.includes('manzana')) {
    return (
      <div className="w-full h-full rounded-lg bg-red-50 border border-red-200 flex flex-col justify-center items-center p-1 select-none font-sans">
        <span className="text-sm">🍎</span>
      </div>
    );
  }

  if (normalized.includes('aguacate')) {
    return (
      <div className="w-full h-full rounded-lg bg-pink-50 border border-pink-200 flex flex-col justify-center items-center p-1 select-none font-sans">
        <span className="text-sm">🥑</span>
      </div>
    );
  }

  if (normalized.includes('huevos') || normalized.includes('huevo')) {
    return (
      <div className="w-full h-full rounded-lg bg-amber-55 border border-amber-200 flex flex-col justify-center items-center p-1 select-none font-sans">
        <span className="text-sm">🥚</span>
      </div>
    );
  }

  // Fallback default icon beautifully wrapped
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

export const ItemRow: React.FC<ItemRowProps> = ({
  item,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editCategory, setEditCategory] = useState(item.category);
  const [editUnit, setEditUnit] = useState(item.unit);
  const [editPrice, setEditPrice] = useState<string>(item.price ? item.price.toString() : '');

  const toggleCheck = () => {
    onUpdate(item.id, { checked: !item.checked });
  };

  const handleQtyChange = (delta: number) => {
    const nextQty = Math.max(1, item.quantity + delta);
    onUpdate(item.id, { quantity: nextQty });
  };

  const handleSave = async () => {
    const cleanName = editName.trim();
    if (!cleanName) return;

    const parsedPrice = parseFloat(editPrice);
    const finalPrice = isNaN(parsedPrice) || parsedPrice < 0 ? null : parsedPrice;

    await onUpdate(item.id, {
      name: cleanName,
      category: editCategory,
      unit: editUnit,
      price: finalPrice,
    });
    setIsEditing(false);
  };

  const cost = item.price ? (item.price * item.quantity).toFixed(2) : null;

  return (
    <motion.div
      layoutId={`item-${item.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative group flex flex-col md:flex-row md:items-center justify-between p-3.5 border rounded-2xl transition duration-155 gap-3 ${
        item.checked 
          ? 'bg-slate-50/70 border-slate-100 text-slate-400' 
          : 'bg-white hover:bg-slate-50/40 border-slate-100 shadow-xs'
      }`}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {/* Satisfying checkbox design */}
        <button
          onClick={toggleCheck}
          className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
            item.checked
              ? 'bg-pink-500 border-pink-500 text-white'
              : 'border-slate-300 hover:border-pink-400 bg-white'
          }`}
        >
          {item.checked && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Content item display */}
        {isEditing ? (
          <div className="flex-1 space-y-3 p-1">
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Nombre</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-pink-400 text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Categoría</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-800"
                >
                  {Object.keys(CATEGORIES).map((key) => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">P. Unit (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Unidad</label>
                <input
                  type="text"
                  placeholder="uds, kg, l..."
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-hidden text-slate-800"
                />
              </div>
            </div>

            <div className="flex gap-1.5 justify-end">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 text-slate-500 hover:bg-slate-100 rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="px-3 py-1 bg-pink-500 text-white hover:bg-pink-600 font-semibold rounded-lg text-xs"
              >
                Aceptar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {item.imageUrl && (
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-slate-150 shrink-0 flex items-center justify-center p-0.5 shadow-2xs">
                {renderMyProductIcon(item.name, item.imageUrl)}
              </div>
            )}
            <div className="flex-1 min-w-0" onDoubleClick={() => !item.checked && setIsEditing(true)}>
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className={`font-semibold text-sm transition-all truncate max-w-[200px] md:max-w-xs ${
                  item.checked ? 'line-through text-slate-400 font-normal' : 'text-slate-800'
                }`}>
                  {item.name}
                </p>
              {/* Unit display */}
              <span className={`text-xs px-1.5 py-0.5 rounded-sm font-bold bg-slate-100 ${
                item.checked ? 'text-slate-300' : 'text-slate-500'
              }`}>
                {item.quantity} {item.unit}
              </span>

              {cost && (
                <span className={`text-xs font-semibold ${item.checked ? 'text-slate-400' : 'text-purple-600'}`}>
                  ({cost} €)
                </span>
              )}
            </div>
            
            {/* Category and Author metadata row */}
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              {!item.checked && (
                <CategoryBadge categoryKey={item.category} className="scale-90 origin-left" />
              )}
              {item.addedByName && (
                <span className={`inline-flex items-center gap-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                  item.checked 
                    ? 'text-slate-400 bg-slate-100/30' 
                    : 'text-pink-700 bg-pink-50 border border-pink-100/60'
                }`}>
                  <span className={`w-1 h-1 rounded-full ${item.checked ? 'bg-slate-300' : 'bg-pink-500 animate-pulse'}`}></span>
                  <span>Añadido por: <span className="font-black text-slate-800">{item.addedByName}</span></span>
                </span>
              )}
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Action triggers */}
      {!isEditing && (
        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 border-t md:border-0 border-dashed border-slate-100 pt-2 md:pt-0">
          {/* Quick Increment Quantity buttons */}
          {!item.checked && (
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => handleQtyChange(-1)}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-slate-700 min-w-[20px] text-center select-none">
                {item.quantity}
              </span>
              <button
                onClick={() => handleQtyChange(1)}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Edit & delete buttons */}
          <div className="flex items-center gap-1">
            {!item.checked && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                title="Editar producto"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onDelete(item.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="Eliminar de la lista"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
