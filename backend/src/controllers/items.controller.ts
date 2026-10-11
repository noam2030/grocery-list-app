import { Request, Response, NextFunction } from 'express';
import { getDataStore } from '../config/firestore';
import { clearCompletedSchema, createItemSchema, updateItemSchema } from '../models/schema';

export async function getItems(req: Request, res: Response, next: NextFunction) {
  try {
    const { listId, category, isCompleted, search, sort } = req.query;
    const store = getDataStore();

    let completedFilter: boolean | undefined = undefined;
    if (isCompleted === 'true') completedFilter = true;
    if (isCompleted === 'false') completedFilter = false;

    let items = await store.getItems({
      listId: typeof listId === 'string' ? listId : undefined,
      category: typeof category === 'string' ? category : undefined,
      isCompleted: completedFilter,
      search: typeof search === 'string' ? search : undefined
    });

    if (sort === 'name') {
      items.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'priority') {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sort === 'aisle' || sort === 'category') {
      items.sort((a, b) => a.category.localeCompare(b.category));
    }

    return res.status(200).json(items);
  } catch (error) {
    next(error);
  }
}

export async function getItemById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const store = getDataStore();
    const item = await store.getItemById(id);
    if (!item) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Item with id '${id}' not found`
        }
      });
    }
    return res.status(200).json(item);
  } catch (error) {
    next(error);
  }
}

export async function createItem(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createItemSchema.parse(req.body);
    const store = getDataStore();

    // Verify list exists, or if not create default
    let list = await store.getListById(data.listId);
    if (!list) {
      const lists = await store.getLists();
      if (lists.length > 0) {
        data.listId = lists[0].id;
      } else {
        const defaultList = await store.createList({
          name: 'Weekly Groceries',
          description: 'Standard household essentials',
          isDefault: true
        });
        data.listId = defaultList.id;
      }
    }

    const created = await store.createItem({
      listId: data.listId,
      name: data.name,
      quantity: data.quantity ?? 1,
      unit: data.unit || 'pcs',
      category: data.category || 'Other',
      priority: data.priority || 'medium',
      notes: data.notes || '',
      isCompleted: data.isCompleted ?? false
    });

    return res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = updateItemSchema.parse(req.body);
    const store = getDataStore();
    const updated = await store.updateItem(id, data);
    if (!updated) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Item with id '${id}' not found`
        }
      });
    }
    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const store = getDataStore();
    const success = await store.deleteItem(id);
    if (!success) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Item with id '${id}' not found`
        }
      });
    }
    return res.status(200).json({
      success: true,
      deletedItemId: id
    });
  } catch (error) {
    next(error);
  }
}

export async function clearCompleted(req: Request, res: Response, next: NextFunction) {
  try {
    const listId = req.body?.listId || req.query?.listId;
    const data = clearCompletedSchema.parse({ listId });
    const store = getDataStore();
    const count = await store.clearCompleted(data.listId);
    return res.status(200).json({
      success: true,
      clearedCount: count,
      listId: data.listId
    });
  } catch (error) {
    next(error);
  }
}
