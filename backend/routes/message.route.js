import express from "express";
 import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { getMessage, sendMessage, deleteMessage, updateMessage, addMessageReaction, getUserConversations } from "../controllers/message.controller.js";

const router = express.Router();

router.route('/conversations').get(isAuthenticated, getUserConversations);
router.route('/send/:id').post(isAuthenticated, sendMessage);
router.route('/all/:id').get(isAuthenticated, getMessage);
router.route('/:id').delete(isAuthenticated, deleteMessage);
router.route('/:id').put(isAuthenticated, updateMessage);
router.route('/:id/react').post(isAuthenticated, addMessageReaction);
 
export default router;