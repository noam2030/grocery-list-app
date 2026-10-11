import { z } from 'zod';

export const CATEGORIES = [
  'Produce',
  'Dairy & Eggs',
  'Bakery',
  'Meat & Seafood',
  'Pantry',
  'Frozen',
  'Beverages',
  'Household',
  'Snacks',
  'Other'
] as const;

export type Category = typeof CATEGORIES[number] | string;

export const PRIORITY_LEVELS = ['low', 'medium', 'high'] as const;
export type PriorityLevel = typeof PRIORITY_LEVELS[number];

export const createListSchema = z.object({
  name: z.string().trim().min(1, 'List name is required').max(100),
  description: z.string().trim().max(300).optional().default('')
});

export const updateListSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(300).optional()
});

export const createItemSchema = z.object({
  listId: z.string().trim().min(1, 'listId is required'),
  name: z.string().trim().min(1, 'Item name is required').max(150),
  quantity: z.number().positive('Quantity must be greater than 0').default(1),
  unit: z.string().trim().default('pcs'),
  category: z.string().trim().default('Other'),
  priority: z.enum(PRIORITY_LEVELS).default('medium'),
  notes: z.string().trim().max(500).optional().default(''),
  isCompleted: z.boolean().default(false)
});

export const updateItemSchema = z.object({
  listId: z.string().trim().optional(),
  name: z.string().trim().min(1).max(150).optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().trim().optional(),
  category: z.string().trim().optional(),
  priority: z.enum(PRIORITY_LEVELS).optional(),
  notes: z.string().trim().max(500).optional(),
  isCompleted: z.boolean().optional()
});

export const clearCompletedSchema = z.object({
  listId: z.string().trim().min(1, 'listId is required')
});

export interface GroceryList {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  itemCount?: number;
  completedCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroceryItem {
  id: string;
  listId: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  priority: PriorityLevel;
  notes: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
