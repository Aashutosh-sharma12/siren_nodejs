"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin_1 = __importDefault(require("../../models/admin"));
async function saveLogoutSessionORPanicTime(userId, body, headers) {
    try {
        const { logoutSession, panicDay = 0, panicHour = 0, panicMinute = 0 } = body;
        if (logoutSession) {
            const savedValue = await admin_1.default.findOneAndUpdate({ _id: userId }, { logoutSession: logoutSession }, { new: true, upsert: true }).select({ password: 0, token: 0 });
            return (savedValue);
        }
        else {
            const totalSeconds = (panicDay * 24 * 60 * 60) + (panicHour * 60 * 60) + (panicMinute * 60);
            body.totalSeconds = totalSeconds;
            const savedValue = await admin_1.default.findOneAndUpdate({ _id: userId }, { panicTime: body }, { new: true, upsert: true }).select({ password: 0, token: 0 });
            return (savedValue);
        }
    }
    catch (error) {
        throw error;
    }
}
async function getLastAddedValue(userId, query, headers) {
    try {
        const data = await admin_1.default.findOne({ _id: userId }).select({ password: 0, token: 0 });
        return (data);
    }
    catch (error) {
        throw error;
    }
}
exports.default = {
    saveLogoutSessionORPanicTime,
    getLastAddedValue
};
