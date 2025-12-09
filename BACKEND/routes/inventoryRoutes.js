import { Router } from 'express';
const InventoryRouter = Router();
import { getInventory, updateInventory, getAllInventories } from '../controllers/inventoryController.js';
import { protect } from '../middleware/authMiddleware.js';

InventoryRouter.route('/').get(protect, getAllInventories);
InventoryRouter.route('/:projectId')
    .get(protect, getInventory)
    .put(protect, updateInventory);

export { InventoryRouter };
