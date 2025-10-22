import express from 'express';
import { createClient, getClients, updateClient, deleteClient } from '../controllers/client.controller.js';
import { verifyToken, verifyAdminOrManager } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/get-clients', verifyToken, getClients);
router.post('/create-client', verifyToken, verifyAdminOrManager, createClient);
router.put('/update-client/:id', verifyToken, verifyAdminOrManager, updateClient);
router.delete('/delete-client/:id', verifyToken, verifyAdminOrManager, deleteClient);

export default router;