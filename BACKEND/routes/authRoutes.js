import { Router } from 'express';
const authrouter = Router();
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

authrouter.post('/register', registerUser);
authrouter.post('/login', loginUser);
authrouter.get('/me', protect, getMe);

export  {authrouter};
