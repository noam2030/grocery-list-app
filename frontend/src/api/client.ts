import { GroceryItem, GroceryList } from '../types';

/**
 * Authoritative deployed Cloud Run service URL for project 'ai-learning-499409'
 */
export const DEFAULT_PRODUCTION_API_URL = 'https://grocery-list-app-api-bdxnar4rza-uc.a.run.app';

/**
 * Resolves the active backend API base URL with graceful fallback precedence:
 * 1. User manual override stored in localStorage ('grocery_api_url' or 'freshcart_api_url')
 * 2. Vite environment variable import.meta.env.VITE_API_URL
 * 3. Localhost development fallback (http://localhost:8080)
 * 4. Authoritative production Cloud Run fallback (DEFAULT_PRODUCTION_API_URL)
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const userOverride = localStorage.getItem('grocery_api_url') || localStorage.getItem('freshcart_api_url');
    if (userOverride && userOverride.trim()) {
      return userOverride.trim().replace(/\/+$/, '');
    }
  }

  const rawEnvUrl = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL;
  if (rawEnvUrl && rawEnvUrl.trim()) {
    return rawEnvUrl.trim().replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8080';
    }
  }

  return DEFAULT_PRODUCTION_API_URL;
}

export function setApiBaseUrl(url: string | null): void {
  if (typeof window === 'undefined') return;
  if (!url || !url.trim()) {
    localStorage.removeItem('freshcart_api_url');
    localStorage.removeItem('grocery_api_url');
  } else {
    const cleaned = url.trim().replace(/\/+$/, '');
    localStorage.setItem('freshcart_api_url', cleaned);
    localStorage.setItem('grocery_api_url', cleaned);
  }
}

// Authoritative exports for compatibility
export const API_BASE = getApiBaseUrl();
export const API_BASE_URL = API_BASE;

export class HtmlResponseError extends Error {
  public readonly isHtmlError = true;
  constructor(message: string) {
    super(message);
    this.name = 'HtmlResponseError';
  }
}

export function isHtmlResponseError(err: unknown): boolean {
  if (!err) return false;
  if (err instanceof HtmlResponseError) return true;
  const msg = (err as Error).message || String(err);
  return (
    msg.toLowerCase().includes('<!doctype') ||
    msg.toLowerCase().includes('returned html instead of json') ||
    msg.toLowerCase().includes('is not valid json')
  );
}

/**
 * Defensive response handler:
 * Inspects Content-Type and body text before JSON parsing to completely eliminate
 * "SyntaxError: Unexpected token '<', '<!doctype '... is not valid JSON" crashes.
 */
async function handleResponse<T>(res: Response, endpointUrl: string): Promise<T> {
  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  const rawText = await res.text();

  // Detect HTML responses (Vercel SPA index.html rewrites, web server error pages, etc.)
  const isHtml =
    contentType.includes('text/html') ||
    rawText.trim().toLowerCase().startsWith('<!doctype') ||
    rawText.includes('<html') ||
    rawText.includes('<body');

  if (isHtml) {
    throw new HtmlResponseError(
      `Backend returned HTML instead of JSON for '${endpointUrl}'. This typically happens when VITE_API_URL is unconfigured or points to the static frontend host, causing Vercel's SPA rewrite to return index.html.`
    );
  }

  let data: any;
  if (rawText && rawText.trim()) {
    try {
      data = JSON.parse(rawText);
    } catch (parseErr: any) {
      throw new Error(
        `Failed to parse response from '${endpointUrl}' as JSON: ${parseErr.message}. Content preview: ${rawText.slice(0, 120)}`
      );
    }
  } else {
    data = {};
  }

  if (!res.ok) {
    const errMsg =
      data?.error?.message ||
      `Request to '${endpointUrl}' failed with status ${res.status}: ${res.statusText}`;
    throw new Error(errMsg);
  }

  return data as T;
}

function resolveUrl(path: string): string {
  const base = getApiBaseUrl();
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return base ? `${base}${path}` : path;
}

export async function checkBackendHealth(targetUrl?: string): Promise<{ ok: boolean; status: number; message: string; latencyMs: number }> {
  const startTime = Date.now();
  const base = (targetUrl !== undefined ? targetUrl : getApiBaseUrl()).replace(/\/+$/, '');
  const url = base ? `${base}/health` : '/health';
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    const latencyMs = Date.now() - startTime;
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    const text = await res.text();
    if (text.trim().toLowerCase().startsWith('<!doctype') || ct.includes('text/html')) {
      return { ok: false, status: res.status, message: 'Server returned HTML instead of JSON (static host SPA rewrite).', latencyMs };
    }
    if (res.ok) {
      return { ok: true, status: res.status, message: 'Connected successfully to Cloud Run API!', latencyMs };
    }
    return { ok: false, status: res.status, message: `Server returned HTTP ${res.status}: ${text.slice(0, 100)}`, latencyMs };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return { ok: false, status: 0, message: err.message || 'Network connection failed.', latencyMs };
  }
}

export const api = {
  getApiBaseUrl,
  setApiBaseUrl,
  checkBackendHealth,

  async checkHealth(targetUrl?: string): Promise<{ ok: boolean; status: number; message: string; latencyMs: number }> {
    return checkBackendHealth(targetUrl);
  },

  // Lists
  async getLists(): Promise<GroceryList[]> {
    const url = resolveUrl('/api/lists');
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    return handleResponse<GroceryList[]>(res, url);
  },

  async createList(name: string, description?: string): Promise<GroceryList> {
    const url = resolveUrl('/api/lists');
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, description })
    });
    return handleResponse<GroceryList>(res, url);
  },

  async deleteList(listId: string): Promise<{ success: boolean; deletedListId: string }> {
    const url = resolveUrl(`/api/lists/${listId}`);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { Accept: 'application/json' }
    });
    return handleResponse<{ success: boolean; deletedListId: string }>(res, url);
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

    const queryString = query.toString();
    const url = resolveUrl(`/api/items${queryString ? `?${queryString}` : ''}`);
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    return handleResponse<GroceryItem[]>(res, url);
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
    const url = resolveUrl('/api/items');
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item)
    });
    return handleResponse<GroceryItem>(res, url);
  },

  async updateItem(id: string, updates: Partial<GroceryItem>): Promise<GroceryItem> {
    const url = resolveUrl(`/api/items/${id}`);
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    return handleResponse<GroceryItem>(res, url);
  },

  async deleteItem(id: string): Promise<{ success: boolean; deletedItemId: string }> {
    const url = resolveUrl(`/api/items/${id}`);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { Accept: 'application/json' }
    });
    return handleResponse<{ success: boolean; deletedItemId: string }>(res, url);
  },

  async clearCompleted(listId: string): Promise<{ success: boolean; clearedCount: number }> {
    const url = resolveUrl('/api/items/clear-completed');
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ listId })
    });
    return handleResponse<{ success: boolean; clearedCount: number }>(res, url);
  }
};
