import { model, Schema } from "mongoose";

interface feed {
    uniqueId: string;
    name: string;
    image: string;
    lastMessage: object;
    created_timeStamp: number;    // In seconds
    isDelete: boolean;
    isActive: boolean
}

const feedSchema = new Schema<feed>({
    uniqueId: { type: String },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    lastMessage: {},// {message: String, created_timeStamp: Number} In seconds
    created_timeStamp: { type: Number, required: true },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    versionKey: false
});
feedSchema.index({ uniqueId: 1 });
const feedModel = model<feed>('feeds', feedSchema);
export default feedModel;