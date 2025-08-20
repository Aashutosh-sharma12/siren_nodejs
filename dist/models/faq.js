"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    que: { type: String, required: true },
    lower_que: { type: String, required: true },
    ans: { type: String, required: true },
    lower_ans: { type: String, required: true },
    role: { type: String, default: "admin" },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});
const faqModel = (0, mongoose_1.model)('faq', schema);
exports.default = faqModel;
