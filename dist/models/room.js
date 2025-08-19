"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const chat_roomSchema = new mongoose_1.Schema({
    uniqueId: { type: String },
    chat_encryptedId: { type: String, required: false },
    created_by: { type: String, required: false },
    groupName: { type: String, required: false, default: '' },
    isGroup: { type: Boolean, default: false },
    image: { type: String, default: '' },
    lastMessage: {}, // {message: String, created_timeStamp: Number} In seconds
    created_timeStamp: { type: Number, required: true },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    versionKey: false
});
chat_roomSchema.index({ uniqueId: 1 });
const chat_roomModel = (0, mongoose_1.model)('chat_rooms', chat_roomSchema);
exports.default = chat_roomModel;
