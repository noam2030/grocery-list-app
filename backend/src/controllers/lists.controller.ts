import { Request, Response, NextFunction } from 'express';
import { getDataStore } from '../config/firestore';
import { createListSchema, updateListSchema } from '../models/schema';

export async function getLists(_req: Request, res: Response, next: NextFunction) {
  try {
    const store = getDataStore();
    const lists = await store.getLists();
    return res.status(200).json(lists);
  } catch (error) {
    next(error);
  }
}

export async function getListById(req: Request, res: Response, next: NextFunction) {
  try {
    const { listId } = req.params;
    const store = getDataStore();
    const list = await store.getListById(listId);
    if (!list) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `List with id '${listId}' not found`
        }
      });
    }
    return res.status(200).json(list);
  } catch (error) {
    next(error);
  }
}

export async function createList(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createListSchema.parse(req.body);
    const store = getDataStore();
    const created = await store.createList({
      name: data.name,
      description: data.description || '',
      isDefault: false
    });
    return res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

export async function updateList(req: Request, res: Response, next: NextFunction) {
  try {
    const { listId } = req.params;
    const data = updateListSchema.parse(req.body);
    const store = getDataStore();
    const updated = await store.updateList(listId, data);
    if (!updated) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `List with id '${listId}' not found`
        }
      });
    }
    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteList(req: Request, res: Response, next: NextFunction) {
  try {
    const { listId } = req.params;
    const store = getDataStore();
    const success = await store.deleteList(listId);
    if (!success) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `List with id '${listId}' not found`
        }
      });
    }
    return res.status(200).json({
      success: true,
      deletedListId: listId
    });
  } catch (error) {
    next(error);
  }
}
