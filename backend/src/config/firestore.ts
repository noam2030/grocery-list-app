import { Firestore } from '@google-cloud/firestore';
import { env } from './env';
import { GroceryItem, GroceryList } from '../models/schema';

export interface DataStore {
  // Lists
  getLists(): Promise<GroceryList[]>;
  getListById(id: string): Promise<GroceryList | null>;
  createList(data: Omit<GroceryList, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<GroceryList>;
  updateList(id: string, data: Partial<GroceryList>): Promise<GroceryList | null>;
  deleteList(id: string): Promise<boolean>;

  // Items
  getItems(filter?: { listId?: string; category?: string; isCompleted?: boolean; search?: string }): Promise<GroceryItem[]>;
  getItemById(id: string): Promise<GroceryItem | null>;
  createItem(data: Omit<GroceryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<GroceryItem>;
  updateItem(id: string, data: Partial<GroceryItem>): Promise<GroceryItem | null>;
  deleteItem(id: string): Promise<boolean>;
  clearCompleted(listId: string): Promise<number>;
}

// In-Memory Fallback Store for offline testing and development
class InMemoryStore implements DataStore {
  private lists: Map<string, GroceryList> = new Map();
  private items: Map<string, GroceryItem> = new Map();

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    const defaultList: GroceryList = {
      id: 'list_weekly_groceries',
      name: 'Weekly Groceries',
      description: 'Standard household essentials',
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.lists.set(defaultList.id, defaultList);

    const initialItems: Array<Omit<GroceryItem, 'id' | 'createdAt' | 'updatedAt'>> = [
      {
        listId: defaultList.id,
        name: 'Organic Whole Milk',
        quantity: 1,
        unit: 'gallon',
        category: 'Dairy & Eggs',
        priority: 'high',
        notes: 'Check expiration date',
        isCompleted: false
      },
      {
        listId: defaultList.id,
        name: 'Fresh Honeycrisp Apples',
        quantity: 6,
        unit: 'pcs',
        category: 'Produce',
        priority: 'medium',
        notes: 'Crisp and red',
        isCompleted: false
      },
      {
        listId: defaultList.id,
        name: 'Sourdough Bread',
        quantity: 1,
        unit: 'loaf',
        category: 'Bakery',
        priority: 'medium',
        notes: 'Bakery counter',
        isCompleted: true
      },
      {
        listId: defaultList.id,
        name: 'Eggs (Grade A Large)',
        quantity: 12,
        unit: 'pcs',
        category: 'Dairy & Eggs',
        priority: 'high',
        notes: 'Free range preferred',
        isCompleted: false
      }
    ];

    for (const item of initialItems) {
      const id = 'item_' + Math.random().toString(36).substring(2, 10);
      const now = new Date().toISOString();
      this.items.set(id, { ...item, id, createdAt: now, updatedAt: now });
    }
  }

  async getLists(): Promise<GroceryList[]> {
    if (this.lists.size === 0) {
      this.seedDefaultData();
    }
    const result: GroceryList[] = [];
    for (const list of this.lists.values()) {
      const allItems = Array.from(this.items.values()).filter((i) => i.listId === list.id);
      result.push({
        ...list,
        itemCount: allItems.length,
        completedCount: allItems.filter((i) => i.isCompleted).length
      });
    }
    return result.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
  }

  async getListById(id: string): Promise<GroceryList | null> {
    const list = this.lists.get(id);
    if (!list) return null;
    const allItems = Array.from(this.items.values()).filter((i) => i.listId === list.id);
    return {
      ...list,
      itemCount: allItems.length,
      completedCount: allItems.filter((i) => i.isCompleted).length
    };
  }

  async createList(data: Omit<GroceryList, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<GroceryList> {
    const id = data.id || 'list_' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();
    const newList: GroceryList = {
      ...data,
      id,
      description: data.description || '',
      isDefault: data.isDefault ?? false,
      itemCount: 0,
      completedCount: 0,
      createdAt: now,
      updatedAt: now
    };
    this.lists.set(id, newList);
    return newList;
  }

  async updateList(id: string, data: Partial<GroceryList>): Promise<GroceryList | null> {
    const existing = this.lists.get(id);
    if (!existing) return null;
    const updated: GroceryList = {
      ...existing,
      ...data,
      id: existing.id,
      updatedAt: new Date().toISOString()
    };
    this.lists.set(id, updated);
    return this.getListById(id);
  }

  async deleteList(id: string): Promise<boolean> {
    if (!this.lists.has(id)) return false;
    this.lists.delete(id);
    // Cascade delete items
    for (const [itemId, item] of this.items.entries()) {
      if (item.listId === id) {
        this.items.delete(itemId);
      }
    }
    return true;
  }

  async getItems(filter?: { listId?: string; category?: string; isCompleted?: boolean; search?: string }): Promise<GroceryItem[]> {
    let result = Array.from(this.items.values());

    if (filter?.listId) {
      result = result.filter((i) => i.listId === filter.listId);
    }
    if (filter?.category) {
      result = result.filter((i) => i.category.toLowerCase() === filter.category!.toLowerCase());
    }
    if (filter?.isCompleted !== undefined) {
      result = result.filter((i) => i.isCompleted === filter.isCompleted);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q) || i.notes.toLowerCase().includes(q));
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getItemById(id: string): Promise<GroceryItem | null> {
    return this.items.get(id) || null;
  }

  async createItem(data: Omit<GroceryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<GroceryItem> {
    const id = 'item_' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();
    const newItem: GroceryItem = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.items.set(id, newItem);
    return newItem;
  }

  async updateItem(id: string, data: Partial<GroceryItem>): Promise<GroceryItem | null> {
    const existing = this.items.get(id);
    if (!existing) return null;
    const updated: GroceryItem = {
      ...existing,
      ...data,
      id: existing.id,
      updatedAt: new Date().toISOString()
    };
    this.items.set(id, updated);
    return updated;
  }

  async deleteItem(id: string): Promise<boolean> {
    return this.items.delete(id);
  }

  async clearCompleted(listId: string): Promise<number> {
    let count = 0;
    for (const [itemId, item] of this.items.entries()) {
      if (item.listId === listId && item.isCompleted) {
        this.items.delete(itemId);
        count++;
      }
    }
    return count;
  }
}

// Google Cloud Firestore Store
class FirestoreStore implements DataStore {
  private db: Firestore;
  private listsCollection: FirebaseFirestore.CollectionReference;
  private itemsCollection: FirebaseFirestore.CollectionReference;

  constructor(db: Firestore) {
    this.db = db;
    const rootName = env.FIRESTORE_COLLECTION;
    this.listsCollection = this.db.collection(`${rootName}_lists`);
    this.itemsCollection = this.db.collection(`${rootName}_items`);
  }

  async getLists(): Promise<GroceryList[]> {
    const snapshot = await this.listsCollection.get();
    if (snapshot.empty) {
      // Auto seed default list
      const defaultList = await this.createList({
        id: 'list_weekly_groceries',
        name: 'Weekly Groceries',
        description: 'Standard household essentials',
        isDefault: true
      });
      return [defaultList];
    }

    const itemsSnap = await this.itemsCollection.get();
    const items = itemsSnap.docs.map((doc) => doc.data() as GroceryItem);

    const lists: GroceryList[] = snapshot.docs.map((doc) => {
      const data = doc.data() as GroceryList;
      const listItems = items.filter((i) => i.listId === doc.id);
      return {
        ...data,
        id: doc.id,
        itemCount: listItems.length,
        completedCount: listItems.filter((i) => i.isCompleted).length
      };
    });

    return lists.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
  }

  async getListById(id: string): Promise<GroceryList | null> {
    const doc = await this.listsCollection.doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data() as GroceryList;
    const itemsSnap = await this.itemsCollection.where('listId', '==', id).get();
    const items = itemsSnap.docs.map((d) => d.data() as GroceryItem);
    return {
      ...data,
      id: doc.id,
      itemCount: items.length,
      completedCount: items.filter((i) => i.isCompleted).length
    };
  }

  async createList(data: Omit<GroceryList, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<GroceryList> {
    const id = data.id || 'list_' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();
    const listData: GroceryList = {
      id,
      name: data.name,
      description: data.description || '',
      isDefault: data.isDefault ?? false,
      itemCount: 0,
      completedCount: 0,
      createdAt: now,
      updatedAt: now
    };
    await this.listsCollection.doc(id).set(listData);
    return listData;
  }

  async updateList(id: string, data: Partial<GroceryList>): Promise<GroceryList | null> {
    const docRef = this.listsCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    await docRef.update(updateData);
    return this.getListById(id);
  }

  async deleteList(id: string): Promise<boolean> {
    const docRef = this.listsCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return false;
    await docRef.delete();

    // Cascade delete items
    const batch = this.db.batch();
    const items = await this.itemsCollection.where('listId', '==', id).get();
    items.forEach((itemDoc) => {
      batch.delete(itemDoc.ref);
    });
    await batch.commit();
    return true;
  }

  async getItems(filter?: { listId?: string; category?: string; isCompleted?: boolean; search?: string }): Promise<GroceryItem[]> {
    let query: FirebaseFirestore.Query = this.itemsCollection;

    if (filter?.listId) {
      query = query.where('listId', '==', filter.listId);
    }
    if (filter?.category) {
      query = query.where('category', '==', filter.category);
    }
    if (filter?.isCompleted !== undefined) {
      query = query.where('isCompleted', '==', filter.isCompleted);
    }

    const snapshot = await query.get();
    let items = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<GroceryItem, 'id'>) }));

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q) || (i.notes && i.notes.toLowerCase().includes(q)));
    }

    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getItemById(id: string): Promise<GroceryItem | null> {
    const doc = await this.itemsCollection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...(doc.data() as Omit<GroceryItem, 'id'>) };
  }

  async createItem(data: Omit<GroceryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<GroceryItem> {
    const id = 'item_' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();
    const newItem: GroceryItem = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    await this.itemsCollection.doc(id).set(newItem);
    return newItem;
  }

  async updateItem(id: string, data: Partial<GroceryItem>): Promise<GroceryItem | null> {
    const docRef = this.itemsCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    await docRef.update(updateData);
    const updated = await docRef.get();
    return { id: updated.id, ...(updated.data() as Omit<GroceryItem, 'id'>) };
  }

  async deleteItem(id: string): Promise<boolean> {
    const docRef = this.itemsCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return false;
    await docRef.delete();
    return true;
  }

  async clearCompleted(listId: string): Promise<number> {
    const snapshot = await this.itemsCollection.where('listId', '==', listId).where('isCompleted', '==', true).get();
    if (snapshot.empty) return 0;
    const batch = this.db.batch();
    snapshot.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    return snapshot.size;
  }
}

// Factory function with fallback logic
let storeInstance: DataStore | null = null;

export function getDataStore(): DataStore {
  if (storeInstance) return storeInstance;

  const hasGcpCredentials =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.K_SERVICE || // Google Cloud Run indicator
    process.env.GAE_ENV;

  if (hasGcpCredentials) {
    try {
      const firestore = new Firestore({
        projectId: env.GCP_PROJECT_ID,
        databaseId: '(default)'
      });
      storeInstance = new FirestoreStore(firestore);
      console.log(`[Firestore] Connected to Google Cloud Firestore (Project: ${env.GCP_PROJECT_ID})`);
      return storeInstance;
    } catch (err) {
      console.warn('[Firestore] Failed to initialize Firestore SDK, falling back to In-Memory store:', err);
    }
  }

  console.log('[Store] Using In-Memory fallback store with auto-seeding');
  storeInstance = new InMemoryStore();
  return storeInstance;
}

export function resetDataStoreForTesting(): InMemoryStore {
  const store = new InMemoryStore();
  storeInstance = store;
  return store;
}
