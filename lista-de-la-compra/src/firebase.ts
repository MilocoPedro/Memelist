import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyCll51GiaeJo0VzpTJPG-lyxelF_oeUbms",
  authDomain: "memelist-95059.firebaseapp.com",
  projectId: "memelist-95059",
  storageBucket: "memelist-95059.firebasestorage.app",
  messagingSenderId: "795299984110",
  appId: "1:795299984110:web:0f77190e7d342287dd79ff",
  measurementId: "G-YRJYV54NTP"
}; 

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  code?: string;
  name?: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

const isConfigured = !!(firebaseConfig && firebaseConfig.apiKey);

let app;
let db: any = null;
let auth: any = null;
let googleProvider: any = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();

    // Verify Firestore connection online
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log("📡 [Firebase Connection] Successfully reached Firestore server!");
      } catch (error: any) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("🚨 [Firebase Connection Error] Firebase client is offline. Please check your network connection.");
        } else if (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') {
          console.log("ℹ️ [Firebase Connection] Firestore server is reachable (Permission denied on test/connection, which is expected under Fortress rules rules).");
        } else {
          console.warn("⚠️ [Firebase Connection Warning] Test connection status unknown:", error);
        }
      }
    };
    testConnection();
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
} else {
  console.log("Firebase not configured. Running in safe client-side persistent simulation mode.");
}

export { db, auth, googleProvider, isConfigured as isFirebaseConfigured };

export function handleFirestoreError(error: any, operationType: OperationType, path: string | null) {
  const errCode = error && typeof error === 'object' && 'code' in error ? String(error.code) : undefined;
  const errName = error && typeof error === 'object' && 'name' in error ? String(error.name) : undefined;
  const message = error instanceof Error ? error.message : String(error);

  const errInfo: FirestoreErrorInfo = {
    error: message,
    code: errCode,
    name: errName,
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  // Detailed visual log diagnostics for debugging
  console.group('%c🔥 FIRESTORE DIAGNOSTICS & SYSTEM STATUS', 'background: #fee2e2; color: #991b1b; padding: 6px 12px; border-radius: 6px; font-weight: bold;');
  console.error(`🚨 Operation: ${operationType.toUpperCase()}`);
  console.error(`📍 Path Target: "${path}"`);
  console.error(`🔑 Error Code: ${errCode || 'N/A'}`);
  console.error(`🏷️ Error Name: ${errName || 'N/A'}`);
  console.error(`💬 Error Message: "${message}"`);
  console.log('👤 Auth Context State:', {
    userId: auth?.currentUser?.uid,
    email: auth?.currentUser?.email,
    emailVerified: auth?.currentUser?.emailVerified,
    isAnonymous: auth?.currentUser?.isAnonymous,
  });
  console.log('💡 Diagnostics & Hints:');
  if (errCode === 'permission-denied') {
    console.log(' 👉 SUGGESTION: This is a RULES violation! Check your firestore.rules rules for lists and items, or verify if the field requirements match (e.g., matching length or keys size schema).');
  } else if (errCode === 'unavailable' || message.includes('offline')) {
    console.log(' 👉 SUGGESTION: Network disconnection or Firebase server could not be reached. Ensure your Firebase project database exists in the designated region.');
  } else {
    console.log(' 👉 SUGGESTION: General configuration mismatch. Verify list schema sizes & types match what you are trying to write or query.');
  }
  console.groupEnd();

  // We trigger a global custom event to notify our hook that it should gracefully fallback to localized engine
  const event = new CustomEvent('firestore-error-handled', { detail: errInfo });
  window.dispatchEvent(event);
  
  return errInfo;
}

// Simulated authentication and data store fallback with pre-populated experience
export class LocalPersistenceEngine {
  private static STORAGE_KEY = 'listonic_local_lists';
  private static ITEMS_PREFIX = 'listonic_local_items_';

  static getLists(): any[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) {
      // Return a beautiful default shopping list so first load is not blank and runs robustly!
      const defaultLists = [
        {
          id: 'list_def_1',
          name: '🛒 Compra Semanal Ensaladas',
          ownerId: 'mock_user_1',
          ownerEmail: 'miloco3d@gmail.com',
          sharedWith: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isArchived: false,
        }
      ];
      this.saveLists(defaultLists);
      
      // Save some default typical products to this initial list
      const defaultProducts = [
        {
          id: 'item_def_p1',
          name: 'Leche semidesnatada',
          category: 'Lácteos y Huevos',
          quantity: 2,
          unit: 'l',
          price: 0.95,
          checked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          addedBy: 'mock_user_1',
          addedByName: 'Miguel (Tú)',
        },
        {
          id: 'item_def_p2',
          name: 'Tomates de ensalada',
          category: 'Frutas y Verduras',
          quantity: 1,
          unit: 'kg',
          price: 1.99,
          checked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          addedBy: 'mock_user_2',
          addedByName: 'Familia',
        },
        {
          id: 'item_def_p3',
          name: 'Pechuga de pollo',
          category: 'Carnes y Aves',
          quantity: 1,
          unit: 'kg',
          price: 6.50,
          checked: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          addedBy: 'mock_user_3',
          addedByName: 'Compañero de piso',
        }
      ];
      this.saveItems('list_def_1', defaultProducts);
      return defaultLists;
    }
    return JSON.parse(data);
  }

  static saveLists(lists: any[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(lists));
  }

  static getItems(listId: string): any[] {
    const data = localStorage.getItem(this.ITEMS_PREFIX + listId);
    return data ? JSON.parse(data) : [];
  }

  static saveItems(listId: string, items: any[]) {
    localStorage.setItem(this.ITEMS_PREFIX + listId, JSON.stringify(items));
  }
}
