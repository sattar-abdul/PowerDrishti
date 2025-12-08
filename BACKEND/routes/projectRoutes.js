import { Router } from 'express';
const ProjectRouter = Router();
import { createProject, getProjects, updateProjectPhase, updateProjectLocation, parseProjectFile } from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';

// Configure multer for file uploads (store in memory)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'text/csv',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, CSV, and XLSX files are allowed.'));
        }
    }
});

ProjectRouter.route('/').post(protect, createProject).get(protect, getProjects);
ProjectRouter.route('/:id/phase').patch(protect, updateProjectPhase);
ProjectRouter.route('/:id/location').patch(protect, updateProjectLocation);
ProjectRouter.route('/parse-file').post(protect, upload.single('file'), parseProjectFile);

export { ProjectRouter };
