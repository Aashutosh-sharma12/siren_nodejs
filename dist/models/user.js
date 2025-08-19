"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    uniqueId: { type: String },
    name: { type: String, required: true },
    image: { type: String, required: false, default: '' },
    email: { type: String, required: true },
    countryCode: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    password1: { type: String, required: true },
    password2: { type: String, required: true },
    dob: { type: String, required: true },
    onlineStatus: { type: Boolean, default: true },
    isNotification: { type: Boolean, default: true },
    subscribed: { type: Boolean, default: false },
    loginKey: { type: Number, required: true }, // 0 for signup, 1 for login with password 1, 2 for login with password 2
    socketId: { type: String, default: '' },
    loginTimeStamp: { type: Number, default: 0 }, // Timestamp in seconds
    blocked_TimeStamp: { type: Number, default: 0 }, // Timestamp in seconds
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    versionKey: false
});
const userModel = (0, mongoose_1.model)('users', userSchema);
exports.default = userModel;
