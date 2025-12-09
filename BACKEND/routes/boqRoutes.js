import express from 'express';
import { getBOQByProject, getMonthlyBOQByProject, getAllBOQs, deleteBOQ, updateMonthlyMaterial, deleteMonthlyMaterial } from '../controllers/boqController.js';
import { protect } from '../middleware/authMiddleware.js';

const BOQRouter = express.Router();

BOQRouter.route('/')
    .get(protect, getAllBOQs);

BOQRouter.route('/project/:projectId')
    .get(protect, getBOQByProject);

BOQRouter.route('/monthly/:projectId')
    .get(protect, getMonthlyBOQByProject);

BOQRouter.route('/:id')
    .delete(protect, deleteBOQ);

BOQRouter.route('/monthly/:projectId/material')
    .patch(protect, updateMonthlyMaterial)
    .delete(protect, deleteMonthlyMaterial);

export { BOQRouter };
