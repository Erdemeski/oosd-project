import express from 'express';
import { 

    createAdvert, 
    getAllAdverts, 
    getAdvertsByCampaign,
    getAdvertById,
    updateAdvert,
    deleteAdvert,
    updateActualCost,
    addScheduleToAdvert
} from '../controllers/advert.controller.js';
import { verifyToken, verifyAdminOrManager } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/', verifyToken, getAllAdverts);
router.get('/campaign/:campaignId', verifyToken, getAdvertsByCampaign);
router.get('/:id', verifyToken, getAdvertById);
router.post('/', verifyToken, verifyAdminOrManager, createAdvert);
router.put('/:id', verifyToken, verifyAdminOrManager, updateAdvert);
router.delete('/:id', verifyToken, verifyAdminOrManager, deleteAdvert);
router.patch('/:id/actual-cost', verifyToken, updateActualCost);
router.post('/:id/schedule', addScheduleToAdvert); // Madde 11

// İŞTE HATAYI ÇÖZEN KISIM BURASI:
export default router;

