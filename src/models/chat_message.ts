import { model, Schema } from "mongoose";

interface chat_room_message {
    uniqueId: string;
    roomId: string;
    senderId: string;
    actionId: string;
    message: string;
    messageType: string; // text, image, video, voice, doc, sticker , left , removed, added
    seen_details: [];
    readStatus: boolean;
    send_timeStamp: number;    // In seconds
    isDelete: boolean;
    isActive: boolean
}

const chat_room_messageSchema = new Schema<chat_room_message>({
    uniqueId: { type: String },
    roomId: { type: String, required: true },
    senderId: { type: String, required: true },
    actionId: { type: String, required: false, default: '' },
    message: { type: String, required: true },
    messageType: { type: String, required: true },
    seen_details: [], // [{paticipantId: String,status:String, seen_timeStamp: Number}]  // status might be delivered,seen,unseen
    readStatus: { type: Boolean, default: false }, // true if read all participants
    send_timeStamp: { type: Number, required: true },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    versionKey: false
});
chat_room_messageSchema.index({ roomId: 1 });
const chat_room_messageModel = model<chat_room_message>('chat_room_messages', chat_room_messageSchema);
export default chat_room_messageModel;