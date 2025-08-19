/***
 * Schema for room during joining a room and delete a room after disconnect or leave room
 */

import { model, Schema } from "mongoose";
interface dynamic_room {
    joinedBy: string;
    roomId: string;
    last_online_timeStamp: number;    // In seconds
    isActive: boolean;
    isDelete: boolean;
}

const dynamic_roomSchema = new Schema<dynamic_room>({
    joinedBy: { type: String, required: true },  // user uniqueId
    roomId: { type: String, required: true },
    last_online_timeStamp: { type: Number, required: true },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true,
    versionKey: false
});
dynamic_roomSchema.index({ uniqueId: 1 });
const dynamic_roomModel = model<dynamic_room>('dynamic_rooms', dynamic_roomSchema);
export default dynamic_roomModel;