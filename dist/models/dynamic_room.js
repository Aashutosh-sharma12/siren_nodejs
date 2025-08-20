"use strict";
/***
 * Schema for room during joining a room and delete a room after disconnect or leave room
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const dynamic_roomSchema = new mongoose_1.Schema({
    joinedBy: { type: String, required: true }, // user uniqueId
    roomId: { type: String, required: true },
    last_online_timeStamp: { type: Number, required: true },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    versionKey: false
});
dynamic_roomSchema.index({ uniqueId: 1 });
const dynamic_roomModel = (0, mongoose_1.model)('dynamic_rooms', dynamic_roomSchema);
exports.default = dynamic_roomModel;
