import { Router } from 'express';
import {
  getLists,
  getListById,
  createList,
  updateList,
  deleteList
} from '../controllers/lists.controller';

const router = Router();

router.get('/', getLists);
router.post('/', createList);
router.get('/:listId', getListById);
router.patch('/:listId', updateList);
router.delete('/:listId', deleteList);

export default router;
