import React, { useState } from 'react';
import { ShoppingList, ShoppingItem, CATEGORIES, CategoryKey } from '../types';
import { ItemRow } from './ItemRow';
import * as LucideIcons from 'lucide-react';
import { Plus, CheckSquare, Search, Sparkles, Smile, ArrowDown, HelpCircle, CheckCircle, BookOpen, ChevronDown, ChevronUp, ShoppingBag, Check } from 'lucide-react';
import { CategoryBadge } from './CategoryBadge';
import { motion, AnimatePresence } from 'motion/react';
import { CATALOG } from '../data/catalog';

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

// Local Predictor Category Helper to map Mercadona items seamlessly
const guessCategoryLocally = (name: string): CategoryKey => {
  const text = name.toLowerCase().trim();
  if (text.includes('platano') || text.includes('manzana') || text.includes('tomate') || text.includes('aguacate') || text.includes('verdura') || text.includes('ensalada') || text.includes('cebolla') || text.includes('limon') || text.includes('zanahoria') || text.includes('brocoli') || text.includes('patata') || text.includes('fresa') || text.includes('naranja') || text.includes('fruta')) return 'Frutas y Verduras';
  if (text.includes('leche') || text.includes('queso') || text.includes('yogur') || text.includes('mantequilla') || text.includes('huevo') || text.includes('lacteo') || text.includes('nata')) return 'Lácteos y Huevos';
  if (text.includes('pan') || text.includes('croissant') || text.includes('muffin') || text.includes('donuts') || text.includes('magdalena') || text.includes('pasteleria') || text.includes('bollo')) return 'Panadería y Pastelería';
  if (text.includes('pechuga') || text.includes('pollo') || text.includes('ternera') || text.includes('cerdo') || text.includes('carne') || text.includes('embutido') || text.includes('bistec') || text.includes('pavo') || text.includes('jamon') || text.includes('hamburguesa') || text.includes('panceta')) return 'Carnes y Aves';
  if (text.includes('pescado') || text.includes('salmon') || text.includes('atun') || text.includes('merluza') || text.includes('bacalao') || text.includes('marisco') || text.includes('gamba') || text.includes('mejillon') || text.includes('langostinos')) return 'Pescados y Mariscos';
  if (text.includes('congelado') || text.includes('helado') || text.includes('pizza congelada') || text.includes('croqueta') || text.includes('gofre')) return 'Congelados';
  if (text.includes('agua') || text.includes('refresco') || text.includes('fanta') || text.includes('coca') || text.includes('zumo') || text.includes('cerveza') || text.includes('vino') || text.includes('bebida') || text.includes('cafe') || text.includes('te') || text.includes('infusion')) return 'Bebidas y Refrescos';
  if (text.includes('arroz') || text.includes('pasta') || text.includes('macarron') || text.includes('espagueti') || text.includes('cereal') || text.includes('avena') || text.includes('harina') || text.includes('garbanzo') || text.includes('lenteja') || text.includes('alubia')) return 'Cereales, Legumbres y Pastas';
  if (text.includes('aceite') || text.includes('sal') || text.includes('conserva') || text.includes('lata') || text.includes('mayonesa') || text.includes('especias') || text.includes('vinagre') || text.includes('salsa') || text.includes('caldo')) return 'Despensa y Conservas';
  if (text.includes('patata frita') || text.includes('chocolate') || text.includes('chuches') || text.includes('snack') || text.includes('galleta') || text.includes('caramelo') || text.includes('bombon') || text.includes('patatitas') || text.includes('palomita')) return 'Snacks y Dulces';
  if (text.includes('bebe') || text.includes('pañal') || text.includes('toallitas bebe') || text.includes('potito') || text.includes('chupete')) return 'Bebés';
  if (text.includes('perro') || text.includes('gato') || text.includes('mascota') || text.includes('pienso') || text.includes('comida gato') || text.includes('comida perro')) return 'Mascotas';
  return 'Otros';
};

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
            <span className="text-[5px] font-bold text-slate-400 bg-slate-100 px-1 py-0.2 rounded-sm mt-0.5 shrink-0 scale-90">
              PACK 6
            </span>
          )}
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

  if (normalized.includes('suavizante')) {
    return (
      <div className="w-full h-full rounded-lg bg-blue-55 border border-blue-200 flex flex-col justify-between p-1 select-none items-center">
        <div className="w-2 h-1.5 rounded-t-sm bg-blue-500"></div>
        <div className="flex-1 w-full bg-blue-400/20 rounded-xs flex flex-col justify-center items-center">
          <span className="text-[7px] text-blue-800 font-black text-center leading-none">SUAVIZANTE</span>
          <span className="text-[5px] text-blue-500 font-bold leading-none">AZUL</span>
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
        <div className="w-7 h-7 rounded-full bg-yellow-200 border-2 border-dashed border-yellow-400 flex items-center justify-center font-black text-[6px] text-yellow-800">
          MARÍA
        </div>
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
        <span className="text-[6px] text-amber-800 font-black uppercase tracking-tight text-center mt-0.5 animate-pulse">Huevos</span>
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