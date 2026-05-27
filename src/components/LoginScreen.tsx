import React, { useState, useEffect } from 'react';
import { isFirebaseConfigured, auth, googleProvider } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup
} from 'firebase/auth';
import { 
  ShoppingBag, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  AlertCircle, 
  ShieldAlert, 
  ArrowRight,
  UserCheck,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';

interface LoginScreenProps {
  onSetUser: (user: any) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSetUser }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [useSimulation, setUseSimulation] = useState(!isFirebaseConfigured);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);

  const mockUsers = [
    { uid: 'mock_user_1', email: 'miloco3d@gmail.com', displayName: 'Miguel (Tú)' },
    { uid: 'mock_user_2', email: 'miloco3d_familia@gmail.com', displayName: 'Familia' },
    { uid: 'mock_user_3', email: 'compra_compartida@gmail.com', displayName: 'Compañero de piso' }
  ];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorType(null);
    setLoading(true);

    try {
      if (isFirebaseConfigured && auth && !useSimulation) {
        if (isRegister) {
          if (!name.trim()) {
            throw new Error('Por favor, introduce tu nombre.');
          }
          const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
          await updateProfile(userCredential.user, {
            displayName: name.trim(),
          });
          onSetUser({
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: name.trim(),
          });
        } else {
          const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
          onSetUser({
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName || userCredential.user.email?.split('@')[0],
          });
        }
      } else {
        // Local simulation login
        if (isRegister && !name.trim()) {
          throw new Error('Por favor, añade tu nombre completo para la demo.');
        }

        const simulatedUser = {
          uid: 'sim_user_' + Date.now(),
          email: email.trim() || 'miloco3d@gmail.com',
          displayName: isRegister ? name.trim() : email.split('@')[0] || 'Miguel (Tú)',
        };

        localStorage.setItem('meme_list_sim_user', JSON.stringify(simulatedUser));
        onSetUser(simulatedUser);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed' || (err.message && err.message.includes('operation-not-allowed'))) {
        setErrorType('operation-not-allowed');
        setError('El proveedor designado para inicio de sesión está desactivado en tu Consola de Firebase.');
      } else {
        setError(err.message || 'Error de autenticación. Verifica la información.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      setError("Firebase no está conectado. Usa las cuentas de simulación rápido abajo.");
      return;
    }
    setError(null);
    setErrorType(null);
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      onSetUser({
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || res.user.email?.split('@')[0],
        photoURL: res.user.photoURL || undefined,
      });
    } catch (e: any) {
      console.error(e);
      if (e.code === 'auth/operation-not-allowed' || (e.message && e.message.includes('operation-not-allowed'))) {
        setErrorType('operation-not-allowed');
        setError("El proveedor seleccionado está desactivado en la Consola de Firebase.");
      } else {
        setError("Fallo en Google Login: " + (e.message || e));
      }
    } finally {
      setLoading(false);
    }
  };

  const forceSandboxLogin = () => {
    const backupUser = {
      uid: 'mock_user_1',
      email: email.trim() || 'miloco3d@gmail.com',
      displayName: name.trim() || email.split('@')[0] || 'Miguel (Tú)',
    };
    localStorage.setItem('meme_list_sim_user', JSON.stringify(backupUser));
    onSetUser(backupUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-pink-300 to-purple-400 opacity-20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-gradient-to-tr from-purple-300 to-pink-400 opacity-20 blur-3xl pointer-events-none"></div>

      {/* Main Container Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-pink-100/50 z-10"
      >
        {/* Upper Color Banner */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-8 text-white text-center relative">
          <div className="inline-flex p-3 bg-white/10 backdrop-blur-md rounded-2xl shadow-inner mb-4">
            <ShoppingBag className="w-8 h-8 text-white stroke-[2.5]" />
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Sparkles className="w-4 h-4 text-pink-200 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-pink-200">
              {isFirebaseConfigured ? 'MemeList Realtime Synchronized' : 'MemeList Sandbox Mode'}
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight leading-tight">
            MemeList
          </h1>
          <p className="text-xs text-pink-100/90 font-medium max-w-xs mx-auto mt-1.5">
            La lista de la compra inteligente y compartida en tiempo real que se sincroniza perfectamente para adaptarse a las necesidades de tu hogar.
          </p>
        </div>

        {/* Credentials Form Box */}
        <div className="p-6 space-y-5">
          {/* Environment Toggler Tab */}
          {isFirebaseConfigured && (
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/60 shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setUseSimulation(false);
                  setError(null);
                  setErrorType(null);
                }}
                className={`flex-1 py-2 text-center text-xs font-extrabold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                  !useSimulation
                    ? 'bg-white text-pink-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>☁️ Nube Firebase</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setUseSimulation(true);
                  setError(null);
                  setErrorType(null);
                }}
                className={`flex-1 py-2 text-center text-xs font-extrabold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                  useSimulation
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>🚀 Simulación Local</span>
              </button>
            </div>
          )}

          {/* Mode Alert Box */}
          {useSimulation ? (
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-3 flex items-start gap-2.5 text-[11px] text-purple-800 leading-normal">
              <ShieldAlert className="w-4 h-4 text-purple-500 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <strong className="font-extrabold block text-purple-950">Modo Simulación Local Activo</strong>
                No requiere ninguna configuración ni base de datos en la nube. Introduce cualquier correo o nombre y accede inmediatamente de forma autónoma.
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex items-start gap-2.5 text-[11px] text-emerald-800 leading-normal">
              <span className="text-xs shrink-0 select-none">🔐</span>
              <div>
                <strong className="font-bold block text-emerald-950">Autenticación Firebase Nube</strong>
                Los datos se sincronizan y actualizan en tiempo real directamente con tu servidor Firestore para mantener tu cuenta privada y compartida.
              </div>
            </div>
          )}

          {error && (
            <div className="space-y-3">
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>{error}</p>
                  {errorType === 'operation-not-allowed' && (
                    <div className="mt-2 text-[11px] font-normal text-rose-750 leading-relaxed space-y-2">
                      <p>
                        <strong>¿Cómo solucionarlo?</strong>
                      </p>
                      <ol className="list-decimal pl-4 space-y-1">
                        <li>Ve a tu consola web de Firebase.</li>
                        <li>Entra en la sección <b>Authentication</b> &gt; pestaña <b>Sign-in method</b>.</li>
                        <li>Haz clic en <b>Agregar nuevo proveedor</b> y selecciona <b>Correo electrónico/contraseña</b>.</li>
                        <li>Sálvalo y actívalo. Luego vuelve a intentar.</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>

              {errorType === 'operation-not-allowed' && (
                <button
                  type="button"
                  onClick={forceSandboxLogin}
                  className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🔧 Ignorar e iniciar en Modo Simulación Local</span>
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">Nombre Completo</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400">
                    <User className="w-4 h-4 stroke-[2.5]" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Clara Martín"
                    className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-3 focus:outline-hidden focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">Correo Electrónico</label>
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
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">Contraseña</label>
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
                  placeholder="Ingresa tu clave de acceso"
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
                <>
                  <span>{isRegister ? 'Registrar Cuenta' : 'Entrar a la Aplicación'}</span>
                  <ArrowRight className="w-4 h-4 text-pink-200" />
                </>
              )}
            </button>
          </form>

          {/* Alternar formulario */}
          <div className="text-center">
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
                : '¿No tienes cuenta aún? Regístrate aquí gratis'
              }
            </button>
          </div>

          {/* Google Sign In Option */}
          {isFirebaseConfigured && !useSimulation && (
            <div className="space-y-3 pt-2">
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider">O accede con</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                <span>Iniciar sesión con Google</span>
              </button>
            </div>
          )}


        </div>
      </motion.div>
    </div>
  );
};
