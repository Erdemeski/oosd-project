import express from 'express';
import { 
  createAdvert, 
  getAdvertsByCampaign, 
  updateAdvert, 
  addScheduleToAdvert 
} from '../controllers/advert.controller.js';

const router = express.Router();

// URL tanımları
router.post('/', createAdvert);
router.get('/campaign/:campaignId', getAdvertsByCampaign);
router.put('/:id', updateAdvert);
router.post('/:id/schedule', addScheduleToAdvert); // Madde 11

// İŞTE HATAYI ÇÖZEN KISIM BURASI:
export default router;