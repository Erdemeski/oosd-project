import express from 'express';
import { /* google, */ signin, signup, refreshSession } from '../controllers/auth.controller.js';
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js';


const router = express.Router();

router.post('/signup', verifyToken, verifyAdmin, signup);
router.post('/signin', signin);
router.post('/refresh', verifyToken, refreshSession);
/* router.post('/google', google);
 */

export default router;