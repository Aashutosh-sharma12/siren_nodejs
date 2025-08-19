import { model, Schema } from "mongoose";

interface chat_room_participant {
    roomId: string;
    addBy: string;
    participantId: string;
    isGroup: boolean;
    joined_timeStamp: number;    // In seconds
    isDelete: boolean;
    isActive: boolean
}

const chat_room_participantSchema = new Schema<chat_room_participant>({
    roomId: { type: String, required: true },
    addBy: { type: String, required: true },
    participantId: { type: String, required: true },
    isGroup: { type: Boolean, default: false },
    joined_timeStamp: { type: Number, required: true },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    versionKey: false
});
chat_room_participantSchema.index({ isGroup: 1, participantId: 1, isDelete: 1 });
chat_room_participantSchema.index({ isGroup: 1 });
chat_room_participantSchema.index({ roomId: 1, participantId: 1 });
chat_room_participantSchema.index({ roomId: 1 });
const chat_room_participantModel = model<chat_room_participant>('chat_room_participants', chat_room_participantSchema);
export default chat_room_participantModel;