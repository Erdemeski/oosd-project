import express from 'express';
import { createClient, getClients } from '../controllers/client.controller.js';


const router = express.Router();

router.route('/').post(createClient).get(getClients);

export default router;