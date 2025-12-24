import express from 'express';
import { 
    createConceptNote, 
    generateConceptIdeas,
    getConceptNotesByCampaign, 
    getAllConceptNotes,
    updateConceptNote,
    deleteConceptNote 
} from '../controllers/conceptNote.controller.js';
import { verifyToken, verifyCreativeStaff, verifyAnyStaff } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/', verifyToken, verifyCreativeStaff, createConceptNote);
router.post('/generate-ideas', verifyToken, verifyCreativeStaff, generateConceptIdeas);
router.get('/:campaignId', verifyToken, verifyAnyStaff, getConceptNotesByCampaign);
router.get('/', verifyToken, verifyAnyStaff, getAllConceptNotes);
router.put('/:id', verifyToken, updateConceptNote);
router.delete('/:id', verifyToken, deleteConceptNote);

export default router;
