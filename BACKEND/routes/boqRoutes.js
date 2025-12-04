import express from 'express';
import { getBOQByProject, getAllBOQs, deleteBOQ } from '../controllers/boqController.js';
import { protect } from '../middleware/authMiddleware.js';

const BOQRouter = express.Router();

BOQRouter.route('/')
    .get(protect, getAllBOQs);

BOQRouter.route('/project/:projectId')
    .get(protect, getBOQByProject);

BOQRouter.route('/:id')
    .delete(protect, deleteBOQ);

export { BOQRouter };
