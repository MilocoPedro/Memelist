import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured, LocalPersistenceEngine, handleFirestoreError, OperationType } from '../firebase';
import { ShoppingList, ShoppingItem, CategoryKey } from '../types';

export function useShoppingData(user: { uid: string; email: string; displayName?: string } | null, isMockUser = false) {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [useLocalOverride, setUseLocalOverride] = useState(false);
  const [dbError, setDbError] = useState<any>(null);

  // Keep references to prevent stale closures in async listeners
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Handle Firestore errors gracefully and trigger automatic recovery to Local Storage mode
  useEffect(() => {
    const handleE = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.warn("Activating resilient Local Storage fallback due to handled Firestore event:", detail);
      setDbError(detail);
      setUseLocalOverride(true);
    };
    window.addEventListener('firestore-error-handled', handleE);
    return () => window.removeEventListener('firestore-error-handled', handleE);
  }, []);

  const isLocalMode = isMockUser || useLocalOverride;

  // 1. Subscribe or load shopping LISTS
  useEffect(() => {
    if (!user) {
      console.log("ℹ️ [useShoppingData] No active user specified. Resetting lists.");
      setLists([]);
      setActiveListId(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (isFirebaseConfigured && db && !isLocalMode) {
      console.log(`📡 [useShoppingData] Subscribing to Firestore query for lists of user: ${user.email} (ID: ${user.uid})`);
      const uidsKey = 'lists';
      // Query 1: Lists owned by user
      const ownedQuery = query(
        collection(db, 'lists'),
        where('ownerId', '==', user.uid)
      );

      const userEmail = (user.email || '').toLowerCase().trim();
      let sharedQuery: any = null;
      if (userEmail) {
        // Query 2: Lists shared with user's email
        sharedQuery = query(
          collection(db, 'lists'),
          where('sharedWith', 'array-contains', userEmail)
        );
      }

      let ownedLists: ShoppingList[] = [];
      let sharedLists: ShoppingList[] = [];

      const updateCombinedLists = () => {
        const combined = [...ownedLists];
        sharedLists.forEach(sl => {
          if (!combined.some(ol => ol.id === sl.id)) {
            combined.push(sl);
          }
        });
        // Sort by updatedAt descending
        combined.sort((a, b) => {
          const tA = a.updatedAt?.seconds ? a.updatedAt.seconds : new Date(a.updatedAt || 0).getTime() / 1000;
          const tB = b.updatedAt?.seconds ? b.updatedAt.seconds : new Date(b.updatedAt || 0).getTime() / 1000;
          return tB - tA;
        });
        console.log(`📋 [useShoppingData] Lists collection updated. Total merged: ${combined.length} (Owned: ${ownedLists.length}, Shared: ${sharedLists.length})`);
        setLists(combined);

        // If no active list selected, auto-select the first one
        if (combined.length > 0) {
          setActiveListId(prev => {
            const chosen = (prev && combined.some(l => l.id === prev) ? prev : combined[0].id);
            console.log(`🎯 [useShoppingData] Selected Active List ID: "${chosen}"`);
            return chosen;
          });
        } else {
          console.log("⚠️ [useShoppingData] Selected Active List ID: null (No lists available)");
          setActiveListId(null);
        }
        setLoading(false);
      };

      // Subscribe to owned
      const unsubOwned = onSnapshot(ownedQuery, (snapshot) => {
        console.log(`🟢 [useShoppingData] Received owned lists snapshot: ${snapshot.size} documents`);
        ownedLists = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        } as ShoppingList));
        updateCombinedLists();
      }, (error) => {
        console.error("🔴 [useShoppingData] Error on snapshot subscription 'lists/owned'", error);
        handleFirestoreError(error, OperationType.LIST, 'lists/owned');
      });

      // Subscribe to shared if query exists
      let unsubShared = () => {};
      if (sharedQuery) {
        unsubShared = onSnapshot(sharedQuery, (snapshot) => {
          console.log(`🟢 [useShoppingData] Received shared lists snapshot: ${snapshot.size} documents`);
          sharedLists = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          } as ShoppingList));
          updateCombinedLists();
        }, (error) => {
          console.error("🔴 [useShoppingData] Error on snapshot subscription 'lists/shared'", error);
          handleFirestoreError(error, OperationType.LIST, 'lists/shared');
        });
      }

      return () => {
        console.log("🔌 [useShoppingData] Unsubscribing from lists query listeners");
        unsubOwned();
        unsubShared();
      };
    } else {
      console.log(`💾 [useShoppingData] Falling back to LocalPersistenceEngine. (isLocalMode=${isLocalMode}, isFirebaseConfigured=${isFirebaseConfigured})`);
      // Local fallback
      const localLists = LocalPersistenceEngine.getLists();
      console.log(`📋 [useShoppingData] Loaded lists from Local Storage: ${localLists.length} entries`);
      setLists(localLists);
      if (localLists.length > 0) {
        console.log(`🎯 [useShoppingData] Auto-selecting initial local list: "${localLists[0].id}"`);
        setActiveListId(localLists[0].id);
      } else {
        setActiveListId(null);
      }
      setLoading(false);
    }
  }, [user, isLocalMode]);

  // 2. Subscribe or load shopping ITEMS under the selected active list
  useEffect(() => {
    if (!activeListId || !user) {
      console.log(`ℹ️ [useShoppingData] Resetting items: activeListId="${activeListId}", userEmail="${user?.email || 'none'}"`);
      setItems([]);
      return;
    }

    if (isFirebaseConfigured && db && !isLocalMode) {
      const itemsPath = `lists/${activeListId}/items`;
      console.log(`📡 [useShoppingData] Subscribing to items query for path: "${itemsPath}"`);
      const itemsQuery = query(
        collection(db, 'lists', activeListId, 'items'),
        orderBy('createdAt', 'asc')
      );

      const unsubItems = onSnapshot(itemsQuery, (snapshot) => {
        console.log(`🟢 [useShoppingData] Received items snapshot for list "${activeListId}": ${snapshot.size} items`);
        const fetchedItems = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        } as ShoppingItem));
        setItems(fetchedItems);
      }, (error) => {
        console.error(`🔴 [useShoppingData] Error on snapshot subscription for items of list "${activeListId}":`, error);
        handleFirestoreError(error, OperationType.LIST, itemsPath);
      });

      return () => {
        console.log(`🔌 [useShoppingData] Unsubscribing from items query listener for list "${activeListId}"`);
        unsubItems();
      };
    } else {
      console.log(`💾 [useShoppingData] Loading items from local storage for list "${activeListId}"`);
      // Local Storage load
      const localItems = LocalPersistenceEngine.getItems(activeListId);
      console.log(`📋 [useShoppingData] Loaded ${localItems.length} items from Local Storage for list "${activeListId}"`);
      setItems(localItems);
    }
  }, [activeListId, user, isLocalMode]);

  // --- ACTIONS ON SHOPPING LISTS ---

  const createList = async (name: string) => {
    if (!user) return;
    const newId = 'list_' + Math.random().toString(36).substr(2, 9);
    const newList: ShoppingList = {
      id: newId,
      name,
      ownerId: user.uid,
      ownerEmail: user.email.toLowerCase().trim(),
      sharedWith: [],
      createdAt: (isFirebaseConfigured && !isLocalMode) ? Timestamp.now() : new Date().toISOString(),
      updatedAt: (isFirebaseConfigured && !isLocalMode) ? Timestamp.now() : new Date().toISOString(),
      isArchived: false,
    };

    if (isFirebaseConfigured && db && !isLocalMode) {
      const path = `lists/${newId}`;
      try {
        await setDoc(doc(db, 'lists', newId), newList);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    } else {
      const current = LocalPersistenceEngine.getLists();
      const updated = [newList, ...current];
      LocalPersistenceEngine.saveLists(updated);
      setLists(updated);
      setActiveListId(newId);
    }
  };

  const updateList = async (listId: string, updates: Partial<ShoppingList>) => {
    if (!user) return;
    const updatedAt = (isFirebaseConfigured && !isLocalMode) ? Timestamp.now() : new Date().toISOString();
    const listUpdates = { ...updates, updatedAt };

    if (isFirebaseConfigured && db && !isLocalMode) {
      const path = `lists/${listId}`;
      try {
        await updateDoc(doc(db, 'lists', listId), listUpdates);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    } else {
      const current = LocalPersistenceEngine.getLists();
      const updated = current.map(l => (l.id === listId ? { ...l, ...listUpdates } : l));
      LocalPersistenceEngine.saveLists(updated);
      setLists(updated);
    }
  };

  const deleteList = async (listId: string) => {
    if (!user) return;
    if (isFirebaseConfigured && db && !isLocalMode) {
      const path = `lists/${listId}`;
      try {
        await deleteDoc(doc(db, 'lists', listId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    } else {
      const current = LocalPersistenceEngine.getLists();
      const updated = current.filter(l => l.id !== listId);
      LocalPersistenceEngine.saveLists(updated);
      setLists(updated);
      if (activeListId === listId) {
        setActiveListId(updated.length > 0 ? updated[0].id : null);
      }
    }
  };

  // --- ACTIONS ON ITEMS IN SELECTED LIST ---

  const addShoppingItem = async (
    itemName: string,
    presetCategory?: string,
    presetUnit?: string,
    presetPrice?: number | null,
    presetImageUrl?: string
  ) => {
    if (!activeListId || !user || !itemName.trim()) return;

    const itemId = 'item_' + Math.random().toString(36).substr(2, 9);
    const creationTime = (isFirebaseConfigured && !isLocalMode) ? Timestamp.now() : new Date().toISOString();

    const newItem: ShoppingItem = {
      id: itemId,
      name: itemName.trim(),
      category: presetCategory || 'Otros', // Default, we will update automatically after calling Gemini unless preset
      quantity: 1,
      unit: presetUnit || 'uds',
      price: presetPrice !== undefined ? presetPrice : null,
      checked: false,
      createdAt: creationTime,
      updatedAt: creationTime,
      addedBy: user.uid,
      addedByName: (user as any).displayName || user.email.split('@')[0],
      imageUrl: presetImageUrl || undefined,
    };

    // 1. OPTIMISTIC UPDATE: add immediately on client for rapid experience
    setItems(prev => [...prev, newItem]);

    if (isLocalMode) {
      const localCurrent = LocalPersistenceEngine.getItems(activeListId);
      const updated = [...localCurrent, newItem];
      LocalPersistenceEngine.saveItems(activeListId, updated);
    }

    // 2. FIRESTORE PERSIST: write to DB
    // Build a clean object: remove undefined fields (Firestore rejects them on strict rules)
    if (isFirebaseConfigured && db && !isLocalMode) {
      const path = `lists/${activeListId}/items/${itemId}`;
      try {
        const firestoreItem: Record<string, any> = {
          id: newItem.id,
          name: newItem.name,
          category: newItem.category,
          quantity: newItem.quantity,
          unit: newItem.unit,
          price: newItem.price,
          checked: newItem.checked,
          createdAt: newItem.createdAt,
          updatedAt: newItem.updatedAt,
          addedBy: newItem.addedBy,
        };
        // Only include optional fields if they have a real value
        if (newItem.addedByName) firestoreItem.addedByName = newItem.addedByName;
        if (newItem.imageUrl) firestoreItem.imageUrl = newItem.imageUrl;

        await setDoc(doc(db, 'lists', activeListId, 'items', itemId), firestoreItem);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    }

    // 3. ASYNC AUTO-CATEGORIZATION VIA GEMINI Backend route
    if (!presetCategory) {
      try {
        const response = await fetch('/api/categorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: itemName.trim() }),
        });
        if (response.ok) {
          const result = await response.json();
          const { category, unit } = result;

          // Perform async update in DB / local storage
          if (category) {
            const updateObj = { 
              category, 
              unit: unit || 'uds', 
              updatedAt: (isFirebaseConfigured && !isLocalMode) ? Timestamp.now() : new Date().toISOString() 
            };

            if (isFirebaseConfigured && db && !isLocalMode) {
              await updateDoc(doc(db, 'lists', activeListId, 'items', itemId), updateObj);
            } else {
              const localCurrent = LocalPersistenceEngine.getItems(activeListId);
              const updated = localCurrent.map(itm => (itm.id === itemId ? { ...itm, ...updateObj } : itm));
              LocalPersistenceEngine.saveItems(activeListId, updated);
              setItems(updated);
            }
          }
        }
      } catch (e) {
        console.warn("Could not categorize product automatically:", e);
      }
    }
  };

  const updateShoppingItem = async (itemId: string, updates: Partial<ShoppingItem>) => {
    if (!activeListId || !user) return;
    const updatedAt = (isFirebaseConfigured && !isLocalMode) ? Timestamp.now() : new Date().toISOString();
    const itemUpdates = { ...updates, updatedAt };

    // Optimistic state
    setItems(prev => prev.map(itm => (itm.id === itemId ? { ...itm, ...itemUpdates } : itm)));

    if (isFirebaseConfigured && db && !isLocalMode) {
      const path = `lists/${activeListId}/items/${itemId}`;
      try {
        await updateDoc(doc(db, 'lists', activeListId, 'items', itemId), itemUpdates);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    } else {
      const localCurrent = LocalPersistenceEngine.getItems(activeListId);
      const updated = localCurrent.map(itm => (itm.id === itemId ? { ...itm, ...itemUpdates } : itm));
      LocalPersistenceEngine.saveItems(activeListId, updated);
    }
  };

  const deleteShoppingItem = async (itemId: string) => {
    if (!activeListId || !user) return;

    // Optimistic state
    setItems(prev => prev.filter(itm => itm.id !== itemId));

    if (isFirebaseConfigured && db && !isLocalMode) {
      const path = `lists/${activeListId}/items/${itemId}`;
      try {
        await deleteDoc(doc(db, 'lists', activeListId, 'items', itemId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    } else {
      const localCurrent = LocalPersistenceEngine.getItems(activeListId);
      const updated = localCurrent.filter(itm => itm.id !== itemId);
      LocalPersistenceEngine.saveItems(activeListId, updated);
    }
  };

  const clearCheckedItems = async () => {
    if (!activeListId || !user) return;

    const checkedItems = items.filter(itm => itm.checked);
    
    // Optimistic UI
    setItems(prev => prev.filter(itm => !itm.checked));

    if (isFirebaseConfigured && db && !isLocalMode) {
      for (const item of checkedItems) {
        const path = `lists/${activeListId}/items/${item.id}`;
        try {
          await deleteDoc(doc(db, 'lists', activeListId, 'items', item.id));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, path);
        }
      }
    } else {
      const localCurrent = LocalPersistenceEngine.getItems(activeListId);
      const updated = localCurrent.filter(itm => !itm.checked);
      LocalPersistenceEngine.saveItems(activeListId, updated);
    }
  };

  return {
    lists,
    activeListId,
    setActiveListId,
    items,
    loading,
    createList,
    updateList,
    deleteList,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    clearCheckedItems,
    isLocalMode,
    dbError,
  };
}
