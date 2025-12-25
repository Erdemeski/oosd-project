import express from 'express';
import { createCampaign, getCampaigns, updateCampaign, deleteCampaign, checkCampaignBudgetAndStatus, generateCampaignOperationsSummary, getStaffForAssignment, assignStaffToCampaign } from '../controllers/campaign.controller.js';
import { verifyToken, verifyAdminOrManager, verifyAccountantOrManager } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/get-campaigns', verifyToken, getCampaigns);
router.post('/create-campaign', verifyToken, verifyAdminOrManager, createCampaign);
router.put('/update-campaign/:id', verifyToken, verifyAdminOrManager, updateCampaign);
router.delete('/delete-campaign/:id', verifyToken, verifyAdminOrManager, deleteCampaign);
router.post('/:campaignId/operations-summary', verifyToken, verifyAdminOrManager, generateCampaignOperationsSummary);
router.get('/:campaignId/budget-check', verifyToken, verifyAccountantOrManager, checkCampaignBudgetAndStatus);
router.get('/staff-for-assignment', verifyToken, verifyAdminOrManager, getStaffForAssignment);
router.post('/:campaignId/assign-staff', verifyToken, verifyAdminOrManager, assignStaffToCampaign);

export default router;
