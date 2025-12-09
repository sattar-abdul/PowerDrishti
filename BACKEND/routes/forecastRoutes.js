import express from 'express';
import { getActualConsumption, saveActualConsumption, forecastNextMonth } from '../controllers/forecastController.js';
import { protect } from '../middleware/authMiddleware.js';

const ForecastRouter = express.Router();

// Get actual consumption data for a project
ForecastRouter.route('/consumption/:projectId')
    .get(protect, getActualConsumption)
    .post(protect, saveActualConsumption);

// Generate forecast for next month
ForecastRouter.route('/predict/:projectId')
    .post(protect, forecastNextMonth);

export { ForecastRouter };
