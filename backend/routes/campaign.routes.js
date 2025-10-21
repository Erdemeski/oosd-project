import express from 'express';
import { createCampaign, getCampaigns } from '../controllers/campaign.controller.js';

const router = express.Router();

router.route('/').post(createCampaign).get(getCampaigns);

export default router;