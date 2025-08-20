"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const appVersionSchema = new mongoose_1.Schema({
    androidVersion: { type: String, default: "1" },
    iosVersion: { type: String, default: "1" },
    androidUpdate_Type: { type: String, default: "Force", enum: ["Force", "Normal"] },
    iosUpdate_Type: { type: String, default: "Force", enum: ["Force", "Normal"] },
}, {
    timestamps: true,
    versionKey: false
});
const appVersionModal = (0, mongoose_1.model)('appVersion', appVersionSchema);
exports.default = appVersionModal;
