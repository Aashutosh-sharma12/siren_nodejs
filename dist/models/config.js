"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    logoutSession: { type: String, default: "00:00" },
    panicTime: { type: String, default: "00:00" }
}, {
    timestamps: true
});
const configModel = (0, mongoose_1.model)('configuration', schema);
exports.default = configModel;
