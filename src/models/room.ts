import { model, Schema } from "mongoose";

interface chat_room {
    uniqueId: string;
    chat_encryptedId: string;
    created_by: string;
    groupName: string;
    isGroup: boolean;
    image: string;
    lastMessage: object;
    created_timeStamp: number;    // In seconds
    isDelete: boolean;
    isActive: boolean
}

const chat_roomSchema = new Schema<chat_room>({
    uniqueId: { type: String },
    chat_encryptedId: { type: String, required: false },
    created_by: { type: String, required: false },
    groupName: { type: String, required: false, default: '' },
    isGroup: { type: Boolean, default: false },
    image: { type: String, default: '' },
    lastMessage: {},// {message: String, created_timeStamp: Number} In seconds
    created_timeStamp: { type: Number, required: true },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    versionKey: false
});
chat_roomSchema.index({ uniqueId: 1 });
const chat_roomModel = model<chat_room>('chat_rooms', chat_roomSchema);
export default chat_roomModel;