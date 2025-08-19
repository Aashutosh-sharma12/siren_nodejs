import { BooleanSchema } from "joi";
import { model, Schema } from "mongoose";

interface user {
    uniqueId: string;
    name: string;
    image: string;
    email: string;
    countryCode: string;
    phoneNumber: string;
    password1: string;
    password2: string;
    dob: string;    // YYYY-MM-DD
    onlineStatus: boolean;
    isNotification: boolean;
    subscribed:boolean;
    loginKey: number;
    socketId: string;
    loginTimeStamp: number;
    blocked_TimeStamp: number; // Timestamp in seconds
    isDelete: boolean;
    isActive: boolean
}

const userSchema = new Schema<user>({
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
    subscribed:{type:Boolean, default:false},
    loginKey: { type: Number, required: true },   // 0 for signup, 1 for login with password 1, 2 for login with password 2
    socketId: { type: String, default: '' },
    loginTimeStamp: { type: Number, default: 0 }, // Timestamp in seconds
    blocked_TimeStamp: { type: Number, default: 0 }, // Timestamp in seconds
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    versionKey: false
});
const userModel = model<user>('users', userSchema);
export default userModel;