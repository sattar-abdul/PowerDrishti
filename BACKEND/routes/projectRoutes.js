import { Router } from 'express';
const ProjectRouter = Router();
import { createProject, getProjects, updateProjectPhase } from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

ProjectRouter.route('/').post(protect, createProject).get(protect, getProjects);
ProjectRouter.route('/:id/phase').patch(protect, updateProjectPhase);

export { ProjectRouter };
