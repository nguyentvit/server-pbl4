import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

export const CHAT_ROOM_TYPES = {
    CONSUMER_TO_CONSUMER: "consumer-to-consumer",
    CONSUMER_TO_SUPPORT: "consumer-to-support"
}

const chatRoomSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: () => uuidv4().replace(/\-/g, "")
        },
        userIds: Array,
        type: {
            type: String,
            default: () => CHAT_ROOM_TYPES.CONSUMER_TO_CONSUMER
        },
        chatInitiator: String
    },
    {
        timestamps: true,
        collection: "chatrooms"
    }
);

chatRoomSchema.statics.getChatRoomsByUserId = async function(userId) {
    try {
        const rooms = await this.find({ userIds: { $all: [userId] } });
        return rooms;
    } catch (error) {
        throw error;
    }
}

chatRoomSchema.statics.initiateChat = async function (
    userIds,
    chatInitiator
) {
    try {
        const avaiableRoom = await this.findOne({
            userIds: {
                $size: userIds.length,
                $all: [...userIds]
            }
        });
        if (avaiableRoom) {
            return {
                isNew: false,
                message: 'retrieving an old chat room',
                chatRoomId: avaiableRoom._doc._id,
                type: avaiableRoom._doc.type,
                userIds: avaiableRoom.userIds
            }
        }
        const newRoom = await this.create({userIds, chatInitiator});
        return {
            isNew: true,
            message: 'creating a new chatroom',
            chatRoomId: newRoom._doc._id,
            type: newRoom._doc.type,
            userIds
        }
    } catch (error) {
        throw error;
    }
}

chatRoomSchema.statics.getChatRoomByRoomId = async function (roomId) {
    try {
        const room = await this.findOne({ _id: roomId });
        return room;
    } catch (error) {
        throw error;
    }
}


export default mongoose.model("ChatRoom", chatRoomSchema);