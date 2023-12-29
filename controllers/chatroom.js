import makeValidation from "@withvoid/make-validation";
import ChatRoomModel, { CHAT_ROOM_TYPES } from "../models/chatroom.js";
import UserModel from "../models/user.js";
import ChatMessageModel from "../models/chatmessage.js";

export default {
    initiate: async (req, res) => {
        try {
            const validation = makeValidation(types => ({
                payload: req.body,
                checks: {
                    userIds: {
                        type: types.array,
                        options: {
                            unique: true,
                            empty: false,
                            stringOnly: true
                        }
                    }
                }
            }))
            if (!validation.success) {
                return res.status(400).json({ ...validation });
            }
            const { userIds } = req.body;
            const chatInitiator = req.user._id;
            const allUserIds = [...userIds, chatInitiator];
            const chatRoom = await ChatRoomModel.initiateChat(allUserIds, chatInitiator);
            const room = await ChatRoomModel.getChatRoomByRoomId(chatRoom.chatRoomId);
            return res.status(200).json({
                success: true,
                chatRoom,
                room
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error
            })
        }
    },
    postMessage: async (req, res) => {
        try {
            const { roomId } = req.params;
            const validation = makeValidation(types => ({
                payload: req.body,
                checks: {
                    messageText: {
                        type: types.string
                    }
                }
            }));
            if (!validation.success) {
                return res.status(400).json({ ...validation });
            }
            const messagePayload = {
                messageText: req.body.messageText
            }
            const currentLoggedUser = req.user._id;
            const post = await ChatMessageModel.createPostInChatRoom(roomId, messagePayload, currentLoggedUser);
            const options = {
                page: parseInt(req.query.page) || 0,
                limit: parseInt(req.query.limit) || 10,
            };
            const message = await ChatMessageModel.getMessageById(post.postId, options);
            global.io.sockets.in(roomId).emit('new message', {message});
            return res.status(200).json({
                success: true,
                post,
                message
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error
            })
        }
    },
    getRecentConversation: async (req, res) => {
        try {
            const currentLoggedUser = req.user._id;
            const options = {
                page: parseInt(req.query.page) || 0,
                limit: parseInt(req.query.limit) || 10
            };
            const rooms = await ChatRoomModel.getChatRoomsByUserId(currentLoggedUser);
            const roomIds = rooms.map(room => room._id);
            const recentConversation = await ChatMessageModel.getRecentConversation(
                roomIds, options, currentLoggedUser
            );
            return res.status(200).json({
                success: true,
                recentConversation,
                rooms
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error
            })
        }
    },
    getUserIdsInfo: async (req, res) => {
        try {
            const currentLoggedUser = req.user._id;
            const options = {
                page: parseInt(req.query.page) || 0,
                limit: parseInt(req.query.limit) || 10
            };
            const rooms = await ChatRoomModel.getChatRoomsByUserId(currentLoggedUser);
            const roomsInfo = rooms.map(room => {
                const id = room.userIds.find(id => id !== currentLoggedUser);
                return {roomId: room._id, id: id}
            });
            const users = await UserModel.find({});
            const roomsInfoWithName = roomsInfo.map(room => {
                const user = users.find({_id: room.id});
                return {roomId: room.roomId, id: room.id, name: user.name}
            })

            return res.status(200).json({
                success: true,
                rooms
            });
            

        }
        catch (error) {
            return res.status(500).json({
                success: false,
                error: error
            })
        }
    },
    getConversationByRoomId: async (req, res) => {
        try {
            const { roomId } = req.params;
            const room = await ChatRoomModel.getChatRoomByRoomId(roomId);
            console.log(123);
            if (!room) {
                return res.status(400).json({
                    success: false,
                    message: 'No room exists for this id'
                })
            }
            const users = await UserModel.getUserByIds(room.userIds);
            const options = {
                page: parseInt(req.query.page) || 0,
                limit: parseInt(req.query.limit) || 10,
            };
            const conversation = await ChatMessageModel.getConversationByRoomId(roomId, options);
            return res.status(200).json({
                success: true,
                conversation,
                users
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error
            })
        }
    },
    markConversationReadByRoomId: async (req, res) => {
        try {
            const { roomId } = req.params;
            const room = await ChatRoomModel.getChatRoomByRoomId(roomId);
            if (!room) {
                return res.status(400).json({
                    success: false,
                    message: 'No room exists for this id'
                })
            }
            const currentLoggedUser = req.user._id;
            const result = await ChatMessageModel.markMessageRead(roomId, currentLoggedUser);
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error
            })
        }
    }
}