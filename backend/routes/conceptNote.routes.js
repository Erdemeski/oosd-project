import express from 'express';
import { 
    createConceptNote, 
    getConceptNotesByCampaign, 
    getAllConceptNotes,
    updateConceptNote,
    deleteConceptNote 
} from '../controllers/conceptNote.controller.js';
import { verifyToken, verifyCreativeStaff, verifyAnyStaff, verifyAdminOrManager } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/', verifyToken, verifyCreativeStaff, createConceptNote);
router.get('/:campaignId', verifyToken, verifyAnyStaff, getConceptNotesByCampaign);
router.get('/', verifyToken, verifyAdminOrManager, getAllConceptNotes);
router.put('/:id', verifyToken, updateConceptNote);
router.delete('/:id', verifyToken, deleteConceptNote);

export default router;
