import React, { useState } from 'react';
import { isFirebaseConfigured, auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { LogIn, LogOut, UserCheck, Settings, User } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { UserProfileMenu } from './UserProfileMenu';
import { AnimatePresence } from 'motion/react';

interface AuthBarProps {
  user: { uid: string; email: string; displayName?: string; photoURL?: string } | null;
  onSetMockUser: (mockUser: { uid: string; email: string; displayName: string } | null) => void;
  onUpdateUser: (updatedUser: any) => void;
}

export const AuthBar: React.FC<AuthBarProps> = ({
  user,
  onSetMockUser,
  onUpdateUser,
}) => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      alert("Firebase no está configurado aún. Utiliza el Simulador de Invitados abajo.");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      console.error(e);
      alert("Fallo al iniciar sesión: " + (e.message || e));
    }
  };

  const handleSignOut = async () => {
    setProfileMenuOpen(false);
    // Always trigger resetting of local simulated user and enabling explicit sign out
    onSetMockUser(null);
    
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.error("Error signing out from Firebase:", e);
      }
    }
  };

  const mockUsers = [
    { uid: 'mock_user_1', email: 'miloco3d@gmail.com', displayName: 'Miguel (Tú)' },
    { uid: 'mock_user_2', email: 'miloco3d_familia@gmail.com', displayName: 'Familia' },
    { uid: 'mock_user_3', email: 'compra_compartida@gmail.com', displayName: 'Compañero de piso' }
  ];

  return (
    <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 relative">
      {/* Configuration Status Badge */}
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${isFirebaseConfigured ? 'bg-pink-500 animate-pulse' : 'bg-pink-400 animate-pulse'}`}></div>
        <span className="text-xs font-bold text-slate-600 select-none">
          Sincronización: {isFirebaseConfigured ? 'Firebase Realtime [ACTIVO]' : 'Local Offline / Demo [ACTIVO]'}
        </span>
      </div>

      {user ? (
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end relative">
          {/* User profile avatar and details toggler details */}
          <div 
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1.5 rounded-2xl transition select-none group border border-transparent hover:border-pink-100"
            title="Haga clic para gestionar usuario"
          >
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName} 
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border border-slate-200" 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-pink-100 group-hover:ring-pink-300 transition shrink-0">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-left">
              <div className="flex items-center gap-1">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {user.displayName || user.email.split('@')[0]}
                </p>
                <Settings className="w-3 h-3 text-slate-400 group-hover:text-pink-500 transition shrink-0" />
              </div>
              <p className="text-[10px] text-slate-400 leading-none">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>

          {/* User Profile Collapsible Dropdown Menu */}
          <AnimatePresence>
            {profileMenuOpen && (
              <UserProfileMenu 
                user={user}
                onClose={() => setProfileMenuOpen(false)}
                onUpdateUser={(updated) => {
                  onUpdateUser(updated);
                }}
                onSwitchUser={(newUser) => {
                  onSetMockUser(newUser);
                  setProfileMenuOpen(false);
                }}
              />
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Main customized login button + simulated lists */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-center w-full">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md border border-transparent"
            >
              <LogIn className="w-4 h-4 text-white" />
              <span>Iniciar Sesión / Registro</span>
            </button>

            {isFirebaseConfigured && (
              <button
                onClick={handleGoogleSignIn}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <span>Google Login</span>
              </button>
            )}
          </div>

          {!isFirebaseConfigured && (
            <div className="flex flex-wrap justify-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block w-full text-center sm:text-left mb-1">
                Iniciar como (Simulador de correos para compartir):
              </span>
              {mockUsers.map((mu) => (
                <button
                   key={mu.uid}
                   onClick={() => onSetMockUser(mu)}
                   className="px-2.5 py-1 text-[11px] bg-white hover:bg-purple-100/35 hover:border-purple-400 border border-slate-200 text-slate-700 font-semibold rounded-lg transition cursor-pointer flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>{mu.displayName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Authenticator slide-up dialog */}
      <AnimatePresence>
        {authModalOpen && (
          <AuthModal 
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            onSetMockUser={(mu) => {
              onSetMockUser(mu);
              setAuthModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
