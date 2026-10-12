import { GroceryItem, GroceryList } from '../types';

const rawApiUrl = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || import.meta.env?.VITE_API_URL || '';
const API_BASE = rawApiUrl ? rawApiUrl.replace(/\/+$/, '') : '';


async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMsg = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data?.error?.message) {
        errMsg = data.error.message;
      }
    } catch {
      // Ignore JSON parse error on non-JSON response
    }
    throw new Error(errMsg);
  }
  return res.json();
}

export const api = {
  // Lists
  async getLists(): Promise<GroceryList[]> {
    const res = await fetch(`${API_BASE}/api/lists`);
    return handleResponse<GroceryList[]>(res);
  },

  async createList(name: string, description?: string): Promise<GroceryList> {
    const res = await fetch(`${API_BASE}/api/lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });
    return handleResponse<GroceryList>(res);
  },

  async deleteList(listId: string): Promise<{ success: boolean; deletedListId: string }> {
    const res = await fetch(`${API_BASE}/api/lists/${listId}`, {
      method: 'DELETE'
    });
    return handleResponse<{ success: boolean; deletedListId: string }>(res);
  },

  // Items
  async getItems(params: {
    listId?: string;
    category?: string;
    isCompleted?: boolean;
    search?: string;
    sort?: string;
  }): Promise<GroceryItem[]> {
    const query = new URLSearchParams();
    if (params.listId) query.set('listId', params.listId);
    if (params.category) query.set('category', params.category);
    if (params.isCompleted !== undefined) query.set('isCompleted', String(params.isCompleted));
    if (params.search) query.set('search', params.search);
    if (params.sort) query.set('sort', params.sort);

    const res = await fetch(`${API_BASE}/api/items?${query.toString()}`);
    return handleResponse<GroceryItem[]>(res);
  },

  async createItem(item: {
    listId: string;
    name: string;
    quantity: number;
    unit: string;
    category: string;
    priority: string;
    notes?: string;
  }): Promise<GroceryItem> {
    const res = await fetch(`${API_BASE}/api/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return handleResponse<GroceryItem>(res);
  },

  async updateItem(id: string, updates: Partial<GroceryItem>): Promise<GroceryItem> {
    const res = await fetch(`${API_BASE}/api/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleResponse<GroceryItem>(res);
  },

  async deleteItem(id: string): Promise<{ success: boolean; deletedItemId: string }> {
    const res = await fetch(`${API_BASE}/api/items/${id}`, {
      method: 'DELETE'
    });
    return handleResponse<{ success: boolean; deletedItemId: string }>(res);
  },

  async clearCompleted(listId: string): Promise<{ success: boolean; clearedCount: number }> {
    const res = await fetch(`${API_BASE}/api/items/clear-completed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listId })
    });
    return handleResponse<{ success: boolean; clearedCount: number }>(res);
  }
};
