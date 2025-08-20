"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    uniqueId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    lowe_title: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    subscriptionType: { type: String, required: true, enum: ['monthly', 'yearly', '6-months'] }, // e.g., monthly, yearly,6-months
    features: [],
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});
// schema.index({ title: 1 }, { unique: true });
const subscriptionModel = (0, mongoose_1.model)('subscriptions', schema);
exports.default = subscriptionModel;
