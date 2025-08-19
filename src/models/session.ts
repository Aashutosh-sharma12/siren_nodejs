import { model, Schema } from "mongoose"

interface session {
    userId: string;
    role: string;
    deviceToken: string;
    deviceIp: string;
    language: string;
    deviceType: string;
    timezone: string;
    refreshToken: string;
    accessToken: string;
    status: boolean;
    isDelete: boolean;
    isActive: boolean
}

const sessionSchema = new Schema<session>({
    userId: { type: String },
    role: { type: String, default: 'user' },
    deviceToken: { type: String, default: '' },
    deviceIp: { type: String, default: "" },
    language: { type: String, default: "en" },
    deviceType: { type: String, default: "web" },
    timezone: { type: String },
    refreshToken: { type: String, default: "" },
    accessToken: { type: String, default: "" },
    status: { type: Boolean, default: true },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    versionKey: false
});
const sessionModel = model<session>('sessions', sessionSchema);
export default sessionModel;