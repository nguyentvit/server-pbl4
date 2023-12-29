import express from "express";

import chatRoomController from "../controllers/chatroom.js";

import { decode } from "../middlewares/jwt.js"

const router = express.Router();

router.get('/', decode, chatRoomController.getRecentConversation);

router.get('/:roomId', decode, chatRoomController.getConversationByRoomId);

router.post('/initiate', decode, chatRoomController.initiate);

router.post('/:roomId/message', decode, chatRoomController.postMessage);

router.put('/:roomId/mark-read', decode, chatRoomController.markConversationReadByRoomId);

router.get('/findUserInfo', decode, chatRoomController.getUserIdsInfo);

export default router;