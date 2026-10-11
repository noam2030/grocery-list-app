import { Router } from 'express';
import {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  clearCompleted
} from '../controllers/items.controller';

const router = Router();

router.get('/', getItems);
router.post('/', createItem);
router.post('/clear-completed', clearCompleted);
router.get('/:id', getItemById);
router.patch('/:id', updateItem);
router.delete('/:id', deleteItem);

export default router;
