"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    uniqueId: { type: String, required: true, unique: true },
    userId: { type: mongoose_1.Types.ObjectId, required: true, ref: 'users' },
    subscription_details: {
        subId: { type: String, required: true }, // Unique identifierId
        title: { type: String, required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        subscriptionType: { type: String, required: true, enum: ['monthly', 'yearly', '6-months'] }, // e.g., monthly, yearly,6-months
        features: [],
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    start_timeStamp: { type: Number, required: true },
    end_timeStamp: { type: Number, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'active', 'expired', 'cancelled'] }, // e.g., pending, active, expired, cancelled
    purchase_by: { type: String, default: 'user' }, // who purchased the subscription, e.g., user, admin
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});
schema.index({ userId: 1 });
const user_subscriptionModel = (0, mongoose_1.model)('user_subscriptions', schema);
exports.default = user_subscriptionModel;
