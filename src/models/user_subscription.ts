import { model, Schema, Types } from "mongoose";

interface user_subscription {
    uniqueId: string,
    userId: any; // Assuming this is the ID of the user who owns the subscription
    subscription_details: any; // Assuming this is an object containing subscription details
    startDate: string;
    endDate: string;
    start_timeStamp: number;
    end_timeStamp: number;
    status: string; // e.g., pending, active, expired, cancelled
    purchase_by: string; // who purchased the subscription, e.g., user, admin
    isDelete: boolean;
    isActive: boolean;
}

const schema = new Schema<user_subscription>({
    uniqueId: { type: String, required: true, unique: true },
    userId: { type: Types.ObjectId, required: true, ref: 'users' },
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
},
    {
        timestamps: true
    });
schema.index({ userId: 1 });
const user_subscriptionModel = model<user_subscription>('user_subscriptions', schema);
export default user_subscriptionModel;