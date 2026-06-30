import React, { useState } from 'react';
import { ShoppingList } from '../types';
import { Users, Trash2, X, Plus, UserPlus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ListSettingsDialogProps {
  list: ShoppingList;
  onUpdate: (listId: string, updates: Partial<ShoppingList>) => Promise<void>;
  onDelete: (listId: string) => Promise<void>;
  onClose: () => void;
  currentUserEmail?: string;
}

export const ListSettingsDialog: React.FC<ListSettingsDialogProps> = ({
  list,
  onUpdate,
  onDelete,
  onClose,
  currentUserEmail,
}) => {
  const [name, setName] = useState(list.name);
  const [newEmail, setNewEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [savingMsg, setSavingMsg] = useState('');

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setSavingMsg('Guardando...');
    try {
      await onUpdate(list.id, { name: name.trim() });
      setSavingMsg('Guardado ✅');
    } catch (error) {
      console.error('Error al guardar el nombre de la lista:', error);
      setSavingMsg('❌ Error al guardar (revisa la conexión o permisos)');
    }
    setTimeout(() => setSavingMsg(''), 3000);
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail) return;

    if (list.sharedWith.includes(cleanEmail)) {
      alert('Esta lista ya está compartida con este correo.');
      return;
    }
    if (cleanEmail === list.ownerEmail) {
      alert('Tú eres el propietario de esta lista.');
      return;
    }

    const updatedSharedWith = [...list.sharedWith, cleanEmail];
    try {
      await onUpdate(list.id, { sharedWith: updatedSharedWith });
      setNewEmail('');
    } catch (error) {
      console.error('Error al compartir la lista:', error);
      alert(
        'No se ha podido compartir la lista. Puede ser un problema de permisos o de conexión con Firebase.\n\n' +
        'Revisa la consola del navegador (F12) para más detalles, o inténtalo de nuevo en unos segundos.'
      );
    }
  };

  const handleRemoveEmail = async (emailToRemove: string) => {
    const updatedSharedWith = list.sharedWith.filter(email => email !== emailToRemove);
    try {
      await onUpdate(list.id, { sharedWith: updatedSharedWith });
    } catch (error) {
      console.error('Error al quitar el correo compartido:', error);
      alert('No se ha podido actualizar la lista. Inténtalo de nuevo.');
    }
  };

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar esta lista de la compra? Esta operación es definitiva.')) {
      await onDelete(list.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative border border-slate-100"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold text-slate-800 text-lg">Ajustes de la lista</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Edit Name */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Nombre de la lista
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-pink-400 text-slate-800 text-sm font-medium"
                placeholder="Ej. Compra semanal"
              />
              <button
                onClick={handleSaveName}
                disabled={name === list.name}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:bg-slate-200 text-white rounded-xl text-sm font-semibold transition"
              >
                Guardar
              </button>
            </div>
            {savingMsg && <span className="text-xs text-slate-500">{savingMsg}</span>}
          </div>

          {/* Share Block */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Compartir en Tiempo Real (Firebase)
            </label>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cualquier usuario que inicie sesión con este correo podrá ver, añadir y marcar productos en tiempo real.
            </p>

            <form onSubmit={handleAddEmail} className="flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="introduce_email@gmail.com"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-pink-400 text-slate-800 text-sm"
              />
              <button
                type="submit"
                className="p-2 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl flex items-center justify-center transition"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            </form>

            <div className="space-y-2 max-h-40 overflow-y-auto pt-2">
              {/* Owner Display */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50/50 border border-purple-100 text-xs">
                <span className="font-semibold text-purple-950 truncate max-w-[200px]">
                  {list.ownerEmail} (Propietario)
                </span>
                <span className="text-purple-600 font-medium bg-white px-2 py-0.5 rounded border border-purple-100">
                  Creador
                </span>
              </div>

              {/* Shared Members List */}
              {list.sharedWith.length === 0 ? (
                <div className="text-center py-4 bg-slate-50 rounded-lg text-xs text-slate-400">
                  Lista privada. Compártela con otros correos.
                </div>
              ) : (
                list.sharedWith.map((email) => (
                  <div 
                    key={email}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700"
                  >
                    <span className="truncate max-w-[240px] font-medium">{email}</span>
                    <button
                      onClick={() => handleRemoveEmail(email)}
                      className="text-red-500 hover:text-red-700 font-semibold px-2 py-0.5"
                    >
                      Quitar
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Delete Action (only if owner) */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 rounded-xl text-sm font-semibold transition"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar esta lista
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
