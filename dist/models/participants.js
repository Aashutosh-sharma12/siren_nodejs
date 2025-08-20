"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const chat_room_participantSchema = new mongoose_1.Schema({
    roomId: { type: String, required: true },
    addBy: { type: String, required: true },
    participantId: { type: String, required: true },
    isGroup: { type: Boolean, default: false },
    joined_timeStamp: { type: Number, required: true },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    versionKey: false
});
chat_room_participantSchema.index({ isGroup: 1, participantId: 1, isDelete: 1 });
chat_room_participantSchema.index({ isGroup: 1 });
chat_room_participantSchema.index({ roomId: 1, participantId: 1 });
chat_room_participantSchema.index({ roomId: 1 });
const chat_room_participantModel = (0, mongoose_1.model)('chat_room_participants', chat_room_participantSchema);
exports.default = chat_room_participantModel;
