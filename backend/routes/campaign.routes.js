import express from 'express';
import { createCampaign, getCampaigns, updateCampaign, deleteCampaign, checkCampaignBudgetAndStatus } from '../controllers/campaign.controller.js';
import { verifyToken, verifyAdminOrManager, verifyAccountantOrManager } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/get-campaigns', verifyToken, getCampaigns);
router.post('/create-campaign', verifyToken, verifyAdminOrManager, createCampaign);
router.put('/update-campaign/:id', verifyToken, verifyAdminOrManager, updateCampaign);
router.delete('/delete-campaign/:id', verifyToken, verifyAdminOrManager, deleteCampaign);
router.get('/:campaignId/budget-check', verifyToken, verifyAccountantOrManager, checkCampaignBudgetAndStatus);

export default router;
