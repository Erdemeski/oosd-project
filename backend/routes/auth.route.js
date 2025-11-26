import express from 'express';
import { signin, signup, refreshSession } from '../controllers/auth.controller.js';
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/signup', verifyToken, verifyAdmin, signup);
router.post('/signin', signin);
router.post('/refresh', verifyToken, refreshSession);

export default router;
