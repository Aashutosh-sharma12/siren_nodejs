import { model, Schema } from "mongoose";

interface subscription {
    uniqueId: string,
    title: string;
    lowe_title: string;
    amount: number;
    currency: string; // Optional, if you want to store the currency type
    subscriptionType: string;
    features: any;
    isDelete: boolean;
    isActive: boolean;
}

const schema = new Schema<subscription>({
    uniqueId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    lowe_title: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    subscriptionType: { type: String, required: true, enum: ['monthly', 'yearly', '6-months'] }, // e.g., monthly, yearly,6-months
    features: [],
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
},
    {
        timestamps: true
    });
// schema.index({ title: 1 }, { unique: true });
const subscriptionModel = model<subscription>('subscriptions', schema);
export default subscriptionModel;