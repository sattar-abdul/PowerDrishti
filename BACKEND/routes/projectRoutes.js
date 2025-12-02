import { Router } from 'express';
const ProjectRouter = Router();
import { createProject, getProjects } from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

ProjectRouter.route('/').post(protect, createProject).get(protect, getProjects);

export {ProjectRouter};
