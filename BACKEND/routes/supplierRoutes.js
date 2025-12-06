import express from 'express';
import {
    getAllSuppliers,
    getSuppliersByCategory,
    getSuppliersByMaterial,
    createSupplier
} from '../controllers/supplierController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
    .get(getAllSuppliers)
    .post(createSupplier);

router.get('/category/:category', getSuppliersByCategory);
router.get('/material/:materialId', getSuppliersByMaterial);

export default router;
