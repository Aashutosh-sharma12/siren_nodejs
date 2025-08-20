"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const chat_room_messageSchema = new mongoose_1.Schema({
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
const chat_room_messageModel = (0, mongoose_1.model)('chat_room_messages', chat_room_messageSchema);
exports.default = chat_room_messageModel;
