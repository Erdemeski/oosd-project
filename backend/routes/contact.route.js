import express from "express";
import { verifyToken, verifyAdminOrManager } from "../utils/verifyUser.js";
import { createContact, /* deleteContact, */ getContacts, /* updateContact */ } from "../controllers/contact.controller.js";

const router = express.Router();

router.post('/createContact', createContact);
router.get('/getContacts', verifyToken, verifyAdminOrManager, getContacts);
/* router.delete('/deleteContact/:contactId/:userId', verifyToken, deleteContact);
router.put('/updateContact/:contactId/:userId', verifyToken, updateContact);
 */
export default router;