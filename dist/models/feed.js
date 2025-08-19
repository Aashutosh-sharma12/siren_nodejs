"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const feedSchema = new mongoose_1.Schema({
    uniqueId: { type: String },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    lastMessage: {}, // {message: String, created_timeStamp: Number} In seconds
    created_timeStamp: { type: Number, required: true },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    versionKey: false
});
feedSchema.index({ uniqueId: 1 });
const feedModel = (0, mongoose_1.model)('feeds', feedSchema);
exports.default = feedModel;
