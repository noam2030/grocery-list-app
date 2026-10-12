import { useState, useEffect, useCallback, useMemo } from 'react';
import { api, isHtmlResponseError } from '../api/client';
import { GroceryItem, GroceryList, StatusFilter, SortOption } from '../types';

export function suggestCategory(name: string): string {
  const q = name.toLowerCase().trim();
  if (!q) return 'Other';

  const keywords: Record<string, string[]> = {
    'Produce': ['apple', 'banana', 'orange', 'lemon', 'lime', 'tomato', 'potato', 'onion', 'garlic', 'lettuce', 'spinach', 'kale', 'avocado', 'berry', 'strawberry', 'blueberry', 'carrot', 'broccoli', 'cucumber', 'pepper', 'grape', 'mushroom', 'herb', 'cilantro', 'parsley', 'salad'],
    'Dairy & Eggs': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg', 'cheddar', 'mozzarella', 'parmesan', 'sour cream', 'curd', 'ghee'],
    'Bakery': ['bread', 'bagel', 'croissant', 'muffin', 'bun', 'baguette', 'pita', 'tortilla', 'pastry', 'loaf', 'toast'],
    'Meat & Seafood': ['chicken', 'beef', 'steak', 'pork', 'bacon', 'salmon', 'tuna', 'shrimp', 'fish', 'turkey', 'sausage', 'lamb', 'meat', 'ham'],
    'Pantry': ['rice', 'pasta', 'flour', 'sugar', 'oil', 'olive oil', 'salt', 'pepper', 'spice', 'sauce', 'vinegar', 'canned', 'bean', 'beans', 'soup', 'cereal', 'oats', 'honey', 'peanut butter', 'jam'],
    'Frozen': ['ice cream', 'frozen', 'pizza', 'popsicle', 'waffles', 'fries', 'peas', 'frozen berries'],
    'Beverages': ['coffee', 'tea', 'juice', 'soda', 'coke', 'water', 'sparkling', 'beer', 'wine', 'kombucha', 'lemonade', 'cider'],
    'Household': ['soap', 'detergent', 'paper towel', 'toilet paper', 'trash bag', 'sponge', 'cleaner', 'shampoo', 'conditioner', 'foil', 'ziploc', 'bleach'],
    'Snacks': ['chip', 'chips', 'cookie', 'cookies', 'chocolate', 'nut', 'nuts', 'popcorn', 'cracker', 'candy', 'pretzel', 'granola bar']
  };

  for (const [category, words] of Object.entries(keywords)) {
    if (words.some((w) => q.includes(w))) {
      return category;
    }
  }

  return 'Other';
}

const DEFAULT_DEMO_LIST: GroceryList = {
  id: 'demo_list_weekly',
  name: 'Weekly Groceries (Demo)',
  description: 'Interactive offline sample list',
  isDefault: true,
  itemCount: 4,
  completedCount: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const DEFAULT_DEMO_ITEMS: GroceryItem[] = [
  {
    id: 'demo_item_1',
    listId: 'demo_list_weekly',
    name: 'Organic Whole Milk',
    quantity: 1,
    unit: 'gallon',
    category: 'Dairy & Eggs',
    priority: 'high',
    notes: 'Check expiration date',
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo_item_2',
    listId: 'demo_list_weekly',
    name: 'Honeycrisp Apples',
    quantity: 6,
    unit: 'pcs',
    category: 'Produce',
    priority: 'medium',
    notes: 'Crisp and red',
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo_item_3',
    listId: 'demo_list_weekly',
    name: 'Artisan Sourdough Bread',
    quantity: 1,
    unit: 'loaf',
    category: 'Bakery',
    priority: 'medium',
    notes: 'Freshly baked',
    isCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'demo_item_4',
    listId: 'demo_list_weekly',
    name: 'Extra Virgin Olive Oil',
    quantity: 1,
    unit: 'bottle',
    category: 'Pantry',
    priority: 'low',
    notes: 'Cold pressed',
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function useGroceryList() {
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [activeListId, setActiveListId] = useState<string>('');
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Diagnostic states
  const [isHtmlError, setIsHtmlError] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // Filters & Views
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('aisle');
  const [isAisleView, setIsAisleView] = useState<boolean>(true);

  // Activate Demo Mode
  const activateDemoMode = useCallback(() => {
    setIsDemoMode(true);
    setLists([DEFAULT_DEMO_LIST]);
    setActiveListId(DEFAULT_DEMO_LIST.id);
    setItems(DEFAULT_DEMO_ITEMS);
  }, []);

  // Fetch Lists
  const loadLists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setIsHtmlError(false);

      const fetchedLists = await api.getLists();
      setIsDemoMode(false);
      setLists(fetchedLists);

      if (fetchedLists.length > 0) {
        setActiveListId((prev) => {
          if (prev && fetchedLists.some((l) => l.id === prev)) {
            return prev;
          }
          return fetchedLists[0].id;
        });
      }
    } catch (err: any) {
      const htmlErr = isHtmlResponseError(err);
      setIsHtmlError(htmlErr);
      setError(err.message || 'Failed to load grocery lists');

      // Fallback to Demo Mode so the user can immediately interact with the UI
      if (lists.length === 0) {
        activateDemoMode();
      }
    } finally {
      setLoading(false);
    }
  }, [lists.length, activateDemoMode]);

  // Fetch Items for active list
  const loadItems = useCallback(async (listId: string) => {
    if (!listId) return;
    if (isDemoMode) return;

    try {
      setError(null);
      const fetchedItems = await api.getItems({ listId });
      setItems(fetchedItems);
    } catch (err: any) {
      const htmlErr = isHtmlResponseError(err);
      setIsHtmlError(htmlErr);
      setError(err.message || 'Failed to load grocery items');
    }
  }, [isDemoMode]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  useEffect(() => {
    if (activeListId && !isDemoMode) {
      loadItems(activeListId);
    }
  }, [activeListId, isDemoMode, loadItems]);

  const activeList = useMemo(() => {
    return lists.find((l) => l.id === activeListId) || null;
  }, [lists, activeListId]);

  // Optimistic Toggle Complete
  const toggleComplete = async (itemId: string) => {
    const prevItems = [...items];
    const target = items.find((i) => i.id === itemId);
    if (!target) return;

    const newCompleted = !target.isCompleted;
    setItems((curr) =>
      curr.map((i) => (i.id === itemId ? { ...i, isCompleted: newCompleted } : i))
    );

    // Update list counts
    setLists((curr) =>
      curr.map((l) =>
        l.id === activeListId
          ? {
              ...l,
              completedCount: Math.max(0, (l.completedCount || 0) + (newCompleted ? 1 : -1))
            }
          : l
      )
    );

    if (isDemoMode) return;

    try {
      await api.updateItem(itemId, { isCompleted: newCompleted });
    } catch (err: any) {
      setItems(prevItems);
      setIsHtmlError(isHtmlResponseError(err));
      setError('Failed to update item completion: ' + err.message);
    }
  };

  // Optimistic Quantity Change
  const updateQuantity = async (itemId: string, delta: number) => {
    const prevItems = [...items];
    const target = items.find((i) => i.id === itemId);
    if (!target) return;

    const newQty = Math.max(1, target.quantity + delta);
    if (newQty === target.quantity) return;

    setItems((curr) =>
      curr.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i))
    );

    if (isDemoMode) return;

    try {
      await api.updateItem(itemId, { quantity: newQty });
    } catch (err: any) {
      setItems(prevItems);
      setIsHtmlError(isHtmlResponseError(err));
      setError('Failed to update quantity: ' + err.message);
    }
  };

  // Add Item
  const addItem = async (data: {
    name: string;
    quantity: number;
    unit: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    notes?: string;
  }) => {
    if (!activeListId) return;

    const tempId = 'item_' + Date.now();
    const newItem: GroceryItem = {
      id: tempId,
      listId: activeListId,
      name: data.name,
      quantity: data.quantity,
      unit: data.unit,
      category: data.category,
      priority: data.priority,
      notes: data.notes || '',
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setItems((curr) => [newItem, ...curr]);
    setLists((curr) =>
      curr.map((l) =>
        l.id === activeListId
          ? { ...l, itemCount: (l.itemCount || 0) + 1 }
          : l
      )
    );

    if (isDemoMode) return;

    try {
      const created = await api.createItem({
        ...data,
        listId: activeListId
      });
      setItems((curr) => curr.map((i) => (i.id === tempId ? created : i)));
    } catch (err: any) {
      setItems((curr) => curr.filter((i) => i.id !== tempId));
      setLists((curr) =>
        curr.map((l) =>
          l.id === activeListId
            ? { ...l, itemCount: Math.max(0, (l.itemCount || 0) - 1) }
            : l
        )
      );
      setIsHtmlError(isHtmlResponseError(err));
      setError('Failed to add item: ' + err.message);
    }
  };

  // Delete Item
  const deleteItem = async (itemId: string) => {
    const prevItems = [...items];
    const itemToDelete = items.find((i) => i.id === itemId);
    setItems((curr) => curr.filter((i) => i.id !== itemId));

    if (itemToDelete) {
      setLists((curr) =>
        curr.map((l) =>
          l.id === activeListId
            ? {
                ...l,
                itemCount: Math.max(0, (l.itemCount || 0) - 1),
                completedCount: itemToDelete.isCompleted
                  ? Math.max(0, (l.completedCount || 0) - 1)
                  : l.completedCount
              }
            : l
        )
      );
    }

    if (isDemoMode) return;

    try {
      await api.deleteItem(itemId);
    } catch (err: any) {
      setItems(prevItems);
      setIsHtmlError(isHtmlResponseError(err));
      setError('Failed to delete item: ' + err.message);
    }
  };

  // Clear Completed Items
  const clearCompleted = async () => {
    if (!activeListId) return;
    const prevItems = [...items];
    const completedCount = items.filter((i) => i.isCompleted).length;
    setItems((curr) => curr.filter((i) => !i.isCompleted));

    setLists((curr) =>
      curr.map((l) =>
        l.id === activeListId
          ? {
              ...l,
              itemCount: Math.max(0, (l.itemCount || 0) - completedCount),
              completedCount: 0
            }
          : l
      )
    );

    if (isDemoMode) return;

    try {
      await api.clearCompleted(activeListId);
    } catch (err: any) {
      setItems(prevItems);
      setIsHtmlError(isHtmlResponseError(err));
      setError('Failed to clear completed items: ' + err.message);
    }
  };

  // Create List
  const createList = async (name: string, description?: string) => {
    if (isDemoMode) {
      const demoId = 'list_' + Date.now();
      const newList: GroceryList = {
        id: demoId,
        name: name.trim(),
        description: description?.trim() || '',
        isDefault: false,
        itemCount: 0,
        completedCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setLists((curr) => [...curr, newList]);
      setActiveListId(demoId);
      return newList;
    }

    try {
      const newList = await api.createList(name, description);
      setLists((curr) => [...curr, newList]);
      setActiveListId(newList.id);
      return newList;
    } catch (err: any) {
      setIsHtmlError(isHtmlResponseError(err));
      setError('Failed to create list: ' + err.message);
      throw err;
    }
  };

  // Delete List
  const deleteList = async (listId: string) => {
    if (isDemoMode) {
      const remaining = lists.filter((l) => l.id !== listId);
      setLists(remaining);
      if (remaining.length > 0) {
        setActiveListId(remaining[0].id);
      } else {
        activateDemoMode();
      }
      return;
    }

    try {
      await api.deleteList(listId);
      const remaining = lists.filter((l) => l.id !== listId);
      setLists(remaining);
      if (remaining.length > 0) {
        setActiveListId(remaining[0].id);
      } else {
        await loadLists();
      }
    } catch (err: any) {
      setIsHtmlError(isHtmlResponseError(err));
      setError('Failed to delete list: ' + err.message);
    }
  };

  // Filtered & Sorted items computation
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Status filter
    if (statusFilter === 'active') {
      result = result.filter((i) => !i.isCompleted);
    } else if (statusFilter === 'completed') {
      result = result.filter((i) => i.isCompleted);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((i) => i.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) => i.name.toLowerCase().includes(q) || i.notes.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortOption === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'priority') {
      const pMap = { high: 1, medium: 2, low: 3 };
      result.sort((a, b) => pMap[a.priority] - pMap[b.priority]);
    } else if (sortOption === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOption === 'aisle') {
      result.sort((a, b) => a.category.localeCompare(b.category));
    }

    return result;
  }, [items, statusFilter, categoryFilter, searchQuery, sortOption]);

  // Grouped items by category for Aisle View
  const groupedItems = useMemo(() => {
    const groups: Record<string, GroceryItem[]> = {};
    for (const item of filteredItems) {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    }
    return groups;
  }, [filteredItems]);

  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((i) => i.isCompleted).length;
    const active = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, active, percent };
  }, [items]);

  return {
    lists,
    activeList,
    activeListId,
    setActiveListId,
    items,
    filteredItems,
    groupedItems,
    stats,
    loading,
    error,
    setError,
    isHtmlError,
    setIsHtmlError,
    isDemoMode,
    setIsDemoMode,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    isAisleView,
    setIsAisleView,
    toggleComplete,
    updateQuantity,
    addItem,
    deleteItem,
    clearCompleted,
    createList,
    deleteList,
    refresh: loadLists
  };
}
