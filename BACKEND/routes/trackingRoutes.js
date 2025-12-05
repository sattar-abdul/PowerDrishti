import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getTrackingByOrder,
    getTrackingByTrackingId,
    getTrackingByProject,
    getActiveTrackings,
    updateTrackingLocation,
    startTracking
} from '../controllers/trackingController.js';

const router = express.Router();

// All routes are protected
router.get('/active', protect, getActiveTrackings);
router.get('/order/:orderId', protect, getTrackingByOrder);
router.get('/project/:projectId', protect, getTrackingByProject);
router.get('/:trackingId', protect, getTrackingByTrackingId);
router.patch('/:trackingId/location', protect, updateTrackingLocation);
router.post('/:trackingId/start', protect, startTracking);

export { router as TrackingRouter };
