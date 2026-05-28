import React, { useState, useEffect } from 'react';
import { isFirebaseConfigured, auth } from '../firebase';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import { 
  User, 
  Mail, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  X, 
  Shield, 
  Users, 
  UserPlus, 
  Check, 
  Trash2, 
  UserCheck 
} from 'lucide-react';
import { motion } from 'motion/react';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  password?: string;
}

interface UserProfileMenuProps {
  user: any;
  onClose: () => void;
  onUpdateUser: (updatedUser: any) => void;
  onSwitchUser: (newUser: any) => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  user,
  onClose,
  onUpdateUser,
  onSwitchUser,
}) => {
  // Tabs: 'profile' (edit current) or 'accounts' (manage/switch accounts)
  const [activeTab, setActiveTab] = useState<'profile' | 'accounts'>('profile');

  // Tab 1 state: Edit current profile
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [email, setEmail] = useState(user.email || '');
  const [editPasswordState, setEditPasswordState] = useState('');
  
  // Tab 2 state: Registered profiles list and new account form
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileEmail, setNewProfileEmail] = useState('');
  const [newProfilePassword, setNewProfilePassword] = useState('');

  // Notifications
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load profiles from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('meme_list_profiles_v2');
    let profilesList: UserProfile[] = [];
    if (saved) {
      profilesList = JSON.parse(saved);
    } else {
      profilesList = [
        { uid: 'mock_user_1', email: 'miloco3d@gmail.com', displayName: 'Miguel (Tú)', password: 'password123' },
        { uid: 'mock_user_2', email: 'miloco3d_familia@gmail.com', displayName: 'Familia', password: 'password123' },
        { uid: 'mock_user_3', email: 'compra_compartida@gmail.com', displayName: 'Compañero de piso', password: 'password123' }
      ];
      localStorage.setItem('meme_list_profiles_v2', JSON.stringify(profilesList));
    }

    // Ensure currently active user is added to list if not already present
    const exists = profilesList.some(p => p.email.toLowerCase() === user.email.toLowerCase());
    if (!exists) {
      const activeProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        password: 'password123'
      };
      const updated = [...profilesList, activeProfile];
      localStorage.setItem('meme_list_profiles_v2', JSON.stringify(updated));
      setProfiles(updated);
    } else {
      setProfiles(profilesList);
    }
  }, [user]);

  // Handle Edit Profile Form
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      if (isFirebaseConfigured && auth && auth.currentUser) {
        // Firebase Auth Edit Row
        if (displayName.trim() !== auth.currentUser.displayName) {
          await updateProfile(auth.currentUser, {
            displayName: displayName.trim(),
          });
        }

        if (email.trim() !== auth.currentUser.email) {
          try {
            await updateEmail(auth.currentUser, email.trim());
          } catch (err: any) {
            if (err.code === 'auth/requires-recent-login') {
              throw new Error('Por seguridad, la modificación del correo electrónico requiere reautenticación recente. Cierra y vuelve a iniciar sesión.');
            }
            throw err;
          }
        }

        if (editPasswordState) {
          try {
            await updatePassword(auth.currentUser, editPasswordState);
          } catch (err: any) {
            if (err.code === 'auth/requires-recent-login') {
              throw new Error('La modificación de contraseña requiere sesión reciente.');
            }
            throw err;
          }
        }

        const updatedUser = {
          ...user,
          displayName: auth.currentUser.displayName || displayName.trim(),
          email: auth.currentUser.email || email.trim(),
        };
        onUpdateUser(updatedUser);

        // Update list in local store too
        updateProfileInLocalDb(user.uid, displayName.trim(), email.trim(), editPasswordState);
      } else {
        // Mock Mode Local Update
        const updatedSimulated = {
          ...user,
          displayName: displayName.trim(),
          email: email.trim(),
        };
        localStorage.setItem('meme_list_sim_user', JSON.stringify(updatedSimulated));
        onUpdateUser(updatedSimulated);

        // Update profile in list
        updateProfileInLocalDb(user.uid, displayName.trim(), email.trim(), editPasswordState);
      }

      setSuccessMsg('¡Los cambios han sido guardados con éxito!');
      setEditPasswordState('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Ocurrió un error al actualizar.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfileInLocalDb = (uid: string, name: string, mail: string, pwd?: string) => {
    const updated = profiles.map(p => {
      if (p.uid === uid) {
        return {
          ...p,
          displayName: name,
          email: mail,
          ...(pwd ? { password: pwd } : {})
        };
      }
      return p;
    });
    setProfiles(updated);
    localStorage.setItem('meme_list_profiles_v2', JSON.stringify(updated));
  };

  // Add a new user account profile to list
  const handleAddNewAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = newProfileName.trim();
    const cleanEmail = newProfileEmail.trim().toLowerCase();
    const cleanPassword = newProfilePassword;

    if (!cleanName || !cleanEmail || !cleanPassword) {
      setErrorMsg('Por favor completa todos los campos (nombre, correo y contraseña)');
      return;
    }

    if (profiles.some(p => p.email.toLowerCase() === cleanEmail)) {
      setErrorMsg('Ya existe un perfil registrado con ese correo electrónico');
      return;
    }

    const newProfile: UserProfile = {
      uid: 'mock_user_' + Date.now(),
      email: cleanEmail,
      displayName: cleanName,
      password: cleanPassword
    };

    const updated = [...profiles, newProfile];
    setProfiles(updated);
    localStorage.setItem('meme_list_profiles_v2', JSON.stringify(updated));

    // Reset Form
    setNewProfileName('');
    setNewProfileEmail('');
    setNewProfilePassword('');

    setSuccessMsg(`¡Cuenta para "${cleanName}" registrada correctamente!`);
  };

  // Delete simulated user profile
  const handleDeleteProfile = (uidToDelete: string, profileEmail: string) => {
    if (profileEmail.toLowerCase() === user.email.toLowerCase()) {
      setErrorMsg('No puedes eliminar el perfil que tienes activo actualmente');
      return;
    }

    const filtered = profiles.filter(p => p.uid !== uidToDelete);
    setProfiles(filtered);
    localStorage.setItem('meme_list_profiles_v2', JSON.stringify(filtered));
    setSuccessMsg('Cuenta eliminada del gestor correctamente.');
  };

  // Switch to selected account
  const handleSwitchTo = (targetProfile: UserProfile) => {
    onSwitchUser({
      uid: targetProfile.uid,
      email: targetProfile.email,
      displayName: targetProfile.displayName
    });
    setSuccessMsg(`Cambiado sesión a: ${targetProfile.displayName}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute right-0 top-full mt-2 w-full sm:w-96 bg-white rounded-3xl overflow-hidden shadow-2xl border border-pink-150 z-50 text-left"
    >
      {/* Banner header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-650 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-pink-200 animate-pulse" />
            <h4 className="font-extrabold text-xs uppercase tracking-wider">Gestión Multiusuarios</h4>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-pink-100/90 leading-tight mt-1">
          Configura tu perfil actual o intercambia entre cuentas para ver cómo se comparten y actualizan las listas.
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-100 bg-slate-50 p-1 gap-1">
        <button
          onClick={() => {
            setActiveTab('profile');
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`flex-1 py-1.5 text-center text-[11px] font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-white text-pink-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span>Mi Perfil Activo</span>
          </div>
        </button>
        <button
          onClick={() => {
            setActiveTab('accounts');
            setErrorMsg(null);
            setSuccessMsg(null);
          }}
          className={`flex-1 py-1.5 text-center text-[11px] font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'accounts'
              ? 'bg-white text-pink-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>Gestionar Cuentas ({profiles.length})</span>
          </div>
        </button>
      </div>

      <div className="p-4 space-y-3 max-h-[460px] overflow-y-auto">
        {successMsg && (
          <div className="p-2.5 bg-pink-50 border border-pink-100 text-pink-800 rounded-xl text-[11px] font-semibold flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-pink-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-[11px] font-semibold flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="leading-tight">{errorMsg}</span>
          </div>
        )}

        {activeTab === 'profile' ? (
          /* TAB 1: EDIT PROFILE FORM */
          <form onSubmit={handleUpdateProfile} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">Nombre Completo</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <User className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ej. Miguel"
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg pl-8.5 pr-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-pink-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">Correo Electrónico</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Mail className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg pl-8.5 pr-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-pink-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block ml-1">Nueva Contraseña</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
                <input
                  type="password"
                  value={editPasswordState}
                  onChange={(e) => setEditPasswordState(e.target.value)}
                  placeholder="Dejar vacío si no deseas cambiarla"
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg pl-8.5 pr-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-pink-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 rounded-full border-t border-white border-r animate-spin"></div>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 text-pink-200" />
                  <span>Guardar Mi Perfil</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* TAB 2: MULTIPLE ACCOUNTS LIST AND NEW PROFILE REGISTRATION */
          <div className="space-y-4">
            {/* Accounts profiles scrollable sublist */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Cuentas Registradas (Toca para Cambiar)</span>
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-0.5">
                {profiles.map((p) => {
                  const isActive = p.email.toLowerCase() === user.email.toLowerCase();
                  return (
                    <div 
                      key={p.uid}
                      className={`flex items-center justify-between p-2 rounded-xl border transition ${
                        isActive
                          ? 'bg-pink-50/60 border-pink-200 text-pink-900 font-bold'
                          : 'bg-slate-50 hover:bg-slate-100/80 border-slate-150 text-slate-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => !isActive && handleSwitchTo(p)}
                        className="flex items-center gap-2 flex-1 text-left min-w-0"
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isActive 
                            ? 'bg-pink-500 text-white' 
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isActive ? <Check className="w-3.5 h-3.5" /> : p.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <p className="text-xs leading-none font-bold">{p.displayName}</p>
                          <p className={`text-[9px] leading-tight ${isActive ? 'text-pink-650' : 'text-slate-400'}`}>{p.email}</p>
                        </div>
                      </button>

                      <div className="flex items-center gap-1">
                        {isActive ? (
                          <span className="text-[8px] bg-pink-500 text-white px-1.5 py-0.5 font-bold uppercase rounded-md tracking-wider">
                            Activo
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDeleteProfile(p.uid, p.email)}
                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                            title="Eliminar esta cuenta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* "Agregar Nueva Cuenta" Registration form panel */}
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-2 ml-1">
                <UserPlus className="w-3.5 h-3.5 text-pink-500" /> Registrar y Añadir Otra Cuenta
              </span>
              
              <form onSubmit={handleAddNewAccount} className="space-y-2.5">
                {/* Micro Input: Name */}
                <div className="space-y-0.5">
                  <input
                    type="text"
                    required
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="Nuevo Nombre (Ej. Clara)"
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-pink-400 text-slate-800"
                  />
                </div>

                {/* Micro Input: Email */}
                <div className="space-y-0.5">
                  <input
                    type="email"
                    required
                    value={newProfileEmail}
                    onChange={(e) => setNewProfileEmail(e.target.value)}
                    placeholder="Nuevo Correo (clara@familia.com)"
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-pink-400 text-slate-800"
                  />
                </div>

                {/* Micro Input: Password */}
                <div className="space-y-0.5">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newProfilePassword}
                    onChange={(e) => setNewProfilePassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-pink-400 text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-95 text-white font-extrabold text-[10px] uppercase tracking-wide rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <UserPlus className="w-3 h-3 text-pink-200" />
                  <span>Añadir Cuenta de Usuario</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
