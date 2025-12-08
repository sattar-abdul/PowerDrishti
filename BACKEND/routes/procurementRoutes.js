import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createOrder,
    getOrdersByProject,
    getAllOrders,
    updateOrderStatus,
    getHighPriorityMaterials
} from '../controllers/procurementController.js';

const router = express.Router();

// All routes are protected
router.post('/order', protect, createOrder);
router.get('/orders', protect, getAllOrders);
router.get('/high-priority', protect, getHighPriorityMaterials);
router.get('/orders/:projectId', protect, getOrdersByProject);
router.patch('/orders/:orderId/status', protect, updateOrderStatus);

export { router as ProcurementRouter };
