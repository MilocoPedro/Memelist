import React, { useState } from 'react';
import { isFirebaseConfigured, auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { X, Mail, Lock, User, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetMockUser: (mockUser: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSetMockUser,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isFirebaseConfigured && auth) {
        // Real Firebase Auth
        if (isRegister) {
          if (!name.trim()) {
            throw new Error('Por favor, introduce tu nombre');
          }
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(userCredential.user, {
            displayName: name,
          });
        } else {
          await signInWithEmailAndPassword(auth, email, password);
        }
      } else {
        // Local Persistent Simulation mode
        if (isRegister && !name.trim()) {
          throw new Error('Por favor, introduce tu nombre');
        }
        
        const key = `mock_user_${isRegister ? 'registered_' + Date.now() : 'login'}`;
        const simulatedUser = {
          uid: key,
          email: email.trim() || 'usuario_demo@gmail.com',
          displayName: isRegister ? name.trim() : email.split('@')[0],
        };
        
        // Save to localStorage so they can test simulation with credentials
        localStorage.setItem('meme_list_sim_user', JSON.stringify(simulatedUser));
        onSetMockUser(simulatedUser);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ha ocurrido un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative border border-purple-100"
      >
        {/* Banner header top */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-pink-200 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-pink-200">
              {isFirebaseConfigured ? 'Firebase Auth' : 'Sandbox Demo'}
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight leading-tight">
            {isRegister ? 'Crea tu Cuenta' : 'Te damos la Bienvenida'}
          </h2>
          <p className="text-xs text-pink-100/95 font-medium mt-1">
            {isRegister 
              ? 'Únete para sincronizar tus listas de compra rosa en tiempo real.' 
              : 'Accede a tu panel personalizado en MemeList.'
            }
          </p>
        </div>

        {/* Sync Mode Notification Alert */}
        <div className="px-6 pt-5">
          {!isFirebaseConfigured ? (
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3 flex items-start gap-2.5 text-[11px] text-purple-800">
              <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-extrabold block">Herramienta de Simulación Activa</strong>
                Cuentas simuladas en el navegador de manera 100% interactiva para probar el compartir listas sin configurar base de datos externa.
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex items-start gap-2.5 text-[11px] text-emerald-800">
              <span className="text-xs shrink-0 bg-emerald-100 p-0.5 rounded-md">🔐</span>
              <div>
                <strong className="font-bold block">Conexión de Seguridad Activa</strong>
                Tu información está cifrada e integrada directamente con los servicios oficiales de Firebase.
              </div>
            </div>
          )}
        </div>

        {/* Formulation Area */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isRegister && (
            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">Nombre Completo</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-400">
                  <User className="w-4 h-4 stroke-[2.5]" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Miguel Ángel"
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-3 focus:outline-hidden focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition"
                />
              </div>
            </div>
          )}

          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">Correo Electrónico</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400">
                <Mail className="w-4 h-4 stroke-[2.5]" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-3 focus:outline-hidden focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block ml-1">Contraseña</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400">
                <Lock className="w-4 h-4 stroke-[2.5]" />
              </span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-3 focus:outline-hidden focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md disabled:bg-slate-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-t-2 border-white border-r-2 animate-spin"></div>
            ) : (
              <span>{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
            )}
          </button>

          {/* Toggle button */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setIsRegister(!isRegister);
              }}
              className="text-xs font-bold text-pink-600 hover:text-pink-700 transition cursor-pointer"
            >
              {isRegister 
                ? '¿Ya tienes una cuenta? Inicia sesión aquí' 
                : '¿No tienes una cuenta aún? Regístrate aquí'
              }
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
