"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const adminSchema = new mongoose_1.Schema({
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    password: { type: String, required: true, trim: true },
    logoutSession: { type: Number, default: 0 },
    panicTime: {
        panicDay: { type: Number, default: 0 },
        panicHour: { type: Number, default: 0 },
        panicMinute: { type: Number, default: 0 },
        totalSeconds: { type: Number, default: 0 },
    },
    countryCode: { type: String, trim: true },
    phoneNumber: { type: String },
    token: { type: String, default: "" },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    versionKey: false
});
adminSchema.index({ email: 1 }, { unique: true });
const adminModal = (0, mongoose_1.model)('admin', adminSchema);
exports.default = adminModal;
