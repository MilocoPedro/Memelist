import React, { useState } from 'react';
import { ShoppingList, ShoppingItem } from '../types';
import { Plus, ListCollapse, BookOpenCheck, Settings, Trash, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface ListSelectorProps {
  lists: ShoppingList[];
  activeListId: string | null;
  onSelect: (id: string) => void;
  onCreateList: (name: string) => Promise<void>;
  items: ShoppingItem[]; // We will pass all lists items metadata or count them
  onOpenSettings: (list: ShoppingList) => void;
  currentUserEmail?: string;
}

export const ListSelector: React.FC<ListSelectorProps> = ({
  lists,
  activeListId,
  onSelect,
  onCreateList,
  onOpenSettings,
  currentUserEmail,
}) => {
  const [newListName, setNewListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    setIsCreating(true);
    await onCreateList(newListName.trim());
    setNewListName('');
    setIsCreating(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 p-5 rounded-3xl shadow-lg border border-slate-800">
      <div className="flex items-center gap-2 mb-6">
        <BookOpenCheck className="w-6 h-6 text-pink-400" />
        <h2 className="font-bold text-lg tracking-tight select-none">Mis Listas</h2>
      </div>

      {/* Form to Create List */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          <input
            type="text"
            required
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Nueva lista (ej. Mercadona)"
            className="w-full text-xs text-white bg-slate-800 border border-slate-700/60 rounded-xl px-3 py-2.5 pr-10 focus:outline-hidden focus:ring-2 focus:ring-pink-400 placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={isCreating}
            className="absolute right-1.5 top-1.5 p-1 bg-pink-500 hover:bg-pink-600 disabled:bg-slate-700 rounded-lg text-white flex items-center justify-center transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white font-bold" />
          </button>
        </div>
      </form>

      {/* Lists of selections */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {lists.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs text-slate-400 leading-relaxed">
            No tienes ninguna lista de compra creada.<br/>Comienza creando una arriba.
          </div>
        ) : (
          lists.map((list) => {
            const isActive = list.id === activeListId;
            const isShared = list.sharedWith && list.sharedWith.length > 0;
            const isOwner = list.ownerEmail === currentUserEmail?.toLowerCase();

            return (
              <div
                key={list.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 border-pink-400 text-white shadow-md font-semibold'
                    : 'bg-slate-800/80 border-slate-700/50 hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
                onClick={() => onSelect(list.id)}
              >
                <div className="flex items-center gap-2.5 truncate flex-1 min-w-0 mr-1.5">
                  <ListCollapse className={`w-4 h-4 shrink-0 ${isActive ? 'text-white font-bold' : 'text-slate-500'}`} />
                  <div className="truncate text-left">
                    <p className="text-sm font-semibold truncate leading-tight select-none">
                      {list.name}
                    </p>
                    <p className={`text-[10px] truncate leading-none mt-0.5 ${isActive ? 'text-pink-100 font-medium' : 'text-slate-500'}`}>
                      {isOwner ? 'Mía' : `Prop. ${list.ownerEmail}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Share badge indicator */}
                  {isShared && (
                    <div 
                      className={`p-1 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'}`}
                      title={`Compartida con ${list.sharedWith.length} usuario(s)`}
                    >
                      <Users className="w-3.5 h-3.5 shrink-0" />
                    </div>
                  )}

                  {/* Settings trigger */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenSettings(list);
                    }}
                    className={`p-1.5 rounded-lg transition shrink-0 ${
                      isActive 
                        ? 'text-white hover:bg-white/20' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                    title="Ajustes de la lista"
                  >
                    <Settings className="w-4 h-4 font-bold" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
