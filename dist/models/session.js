"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const sessionSchema = new mongoose_1.Schema({
    userId: { type: String },
    role: { type: String, default: 'user' },
    deviceToken: { type: String, default: '' },
    deviceIp: { type: String, default: "" },
    language: { type: String, default: "en" },
    deviceType: { type: String, default: "web" },
    timezone: { type: String },
    refreshToken: { type: String, default: "" },
    accessToken: { type: String, default: "" },
    status: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    versionKey: false
});
const sessionModel = (0, mongoose_1.model)('sessions', sessionSchema);
exports.default = sessionModel;
