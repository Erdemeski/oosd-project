import express from "express";
import { verifyToken, verifyAdminOrManager } from "../utils/verifyUser.js";
import { createContact, getContacts } from "../controllers/contact.controller.js";

const router = express.Router();

router.post('/createContact', createContact);
router.get('/getContacts', verifyToken, verifyAdminOrManager, getContacts);

export default router;
