import { model, Schema } from "mongoose"

interface admin {
    username: string;
    email: string;
    phoneNumber: string;
    countryCode:string;
    logoutSession: number; 
    panicTime: {
        panicDay:number,
        panicHour:number,
        panicMinute:number,
        totalSeconds:number;
    };    
    password: string;
    token: string;
    isDelete: boolean;
    isActive: boolean
}

const adminSchema = new Schema<admin>({
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true,trim: true  },
    password: { type: String, required: true,trim: true  },
    logoutSession: { type: Number, default: 0 },
    panicTime: {
        panicDay: { type: Number, default: 0 },
        panicHour: { type: Number, default: 0 },
        panicMinute: { type: Number, default: 0 },
        totalSeconds:{type: Number, default:0},
    },
    countryCode: { type: String,trim: true  },
    phoneNumber: { type: String },
    token: { type: String, default: "" },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    versionKey: false
});

adminSchema.index({ email: 1 }, { unique: true });
const adminModal = model<admin>('admin', adminSchema);
export default adminModal;