import messages from "@Custom_message/index";
import { chat_roomModel, chat_room_messageModel, chat_room_participantModel, dynamic_roomModel, userModel } from "@models/index";
import { CustomError } from "@utils/errors";
import { added_user_to_room, encrypt, generate_timestamp_In_seconds, identityGenerator } from "@utils/helpers";
import { uploadSingleImage } from "@utils/multer";
import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { array } from "joi";
const { OK, CREATED } = StatusCodes;

const createRoom = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.user;
        const { participantId, } = req.body;
        const cond: any = {
            uniqueId: identityGenerator('room', await chat_roomModel.countDocuments()),
            created_by: id,
            created_timeStamp: generate_timestamp_In_seconds(),
        }
        const fullString = cond.uniqueId + "" + cond.created_timeStamp
        const chatKeyString = fullString.substring(0, 32);
        cond.chat_encryptedId = encrypt(chatKeyString);
        const commonRoom = await chat_room_participantModel.aggregate([
            {
                $match: {
                    participantId: { $in: [id, participantId] },
                    isDelete: false
                }
            },
            {
                $group: {
                    _id: "$roomId",
                    participantIds: { $addToSet: "$participantId" }
                }
            },
            {
                $match: {
                    participantIds: { $all: [id, participantId] },
                    $expr: { $eq: [{ $size: "$participantIds" }, 2] } // ensures only 2 participants
                }
            }
        ]);
        if (commonRoom.length) {
            res.status(OK).json({ message: messages.participant_allready_exist, data: {}, code: OK });
        } else {
            const create_room = await chat_roomModel.create(cond);
            if (create_room) {
                const participant_obj1 = {
                    addBy: id,
                    joined_timeStamp: cond.created_timeStamp,
                    roomId: create_room.uniqueId,
                    participantId: id,
                }
                const participant_obj2 = {
                    addBy: id,
                    joined_timeStamp: cond.created_timeStamp,
                    roomId: create_room.uniqueId,
                    participantId: participantId,
                }
                await chat_room_participantModel.insertMany([participant_obj1, participant_obj2]);
                res.status(CREATED).json({ data: create_room, image_baseUrl: process.env.Bucket_Base_Url, code: CREATED });
            } else {
                throw new CustomError(messages.someThingWent_wrongTo_create_room, StatusCodes.BAD_REQUEST);
            }
        }
    } catch (err) {
        next(err);
    }
}

const createRoom_with_group = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.user;
        const { participantIds, groupName } = req.body;
        const cond: any = {
            uniqueId: identityGenerator('room', await chat_roomModel.countDocuments()),
            created_by: id,
            groupName: groupName,
            isGroup: true,
            created_timeStamp: generate_timestamp_In_seconds()
        }
        const fullString = cond.uniqueId + "" + cond.created_timeStamp
        const chatKeyString = fullString.substring(0, 32);
        cond.chat_encryptedId = encrypt(chatKeyString);
        const create_room = await chat_roomModel.create(cond);
        if (create_room) {
            const participantIds_array = participantIds.split(',');
            // itself admin participant joined
            participantIds_array.push(id);
            if (participantIds_array.length) {
                for (const ids of participantIds_array) {
                    const participant_obj = {
                        addBy: id,
                        joined_timeStamp: cond.created_timeStamp,
                        roomId: create_room.uniqueId,
                        participantId: ids,
                        isGroup: true
                    }
                    await chat_room_participantModel.create(participant_obj);
                }
            }
            if (req.files && req.files.image && req.files.image.length > 0) {
                req.uniqueId = create_room.uniqueId;
                req.type = 'group-profile-image';
                req.role = 'group';
                const imageUrl = await uploadSingleImage(req, res, next);
                await chat_roomModel.updateOne({ _id: create_room._id }, { image: imageUrl });
            }
            res.status(CREATED).json({ data: create_room, image_baseUrl: process.env.Bucket_Base_Url, code: CREATED });
        } else {
            throw new CustomError(messages.someThingWent_wrongTo_create_room, StatusCodes.BAD_REQUEST);
        }
    } catch (err) {
        next(err);
    }
}

const update_group_profile = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.user;
        const { roomId, groupName } = req.body;
        const details = await chat_roomModel.findOne({ _id: roomId, isGroup: true });
        if (!details) {
            throw new CustomError(messages.group_not_exist, StatusCodes.NOT_FOUND);
        } else {
            if (details.created_by != id) {
                throw new CustomError(messages.not_access_for_this_room, StatusCodes.BAD_REQUEST);
            }
            if (req.files && req.files.image && req.files.image.length > 0) {
                req.uniqueId = details.uniqueId;
                req.type = 'group-profile-image';
                req.role = 'group';
                const imageUrl = await uploadSingleImage(req, res, next);
                await chat_roomModel.updateOne({ _id: details._id }, { image: imageUrl, groupName: groupName });
                res.status(OK).json({ data: { success: true }, code: OK });
            } else {
                await chat_roomModel.updateOne({ _id: details._id }, { groupName: groupName });
                res.status(OK).json({ data: { success: true }, code: OK });
            }
        }
    } catch (err) {
        next(err);
    }
}

const room_details = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const details = await chat_roomModel.findOne({ _id: id });
        if (!details) {
            throw new CustomError(messages.noDatafoundWithID, StatusCodes.NOT_FOUND);
        } else {
            res.status(OK).json({ data: details, image_baseUrl: process.env.Bucket_Base_Url, code: OK });
        }
    } catch (err) {
        next(err);
    }
}

const add_participants = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.user;
        const { participantIds = [], groupId } = req.body;
        let array = []
        if (participantIds.length) {
            for (const ids of participantIds) {
                const participant_obj = {
                    addBy: id,
                    joined_timeStamp: generate_timestamp_In_seconds(),
                    roomId: groupId,
                    participantId: ids,
                    isGroup: true
                }
                const check = await chat_room_participantModel.findOne({ roomId: groupId, isDelete: false, participantId: ids });
                if (!check) {
                    await chat_room_participantModel.create(participant_obj);
                    const emit_details = {
                        "roomId": groupId,
                        "addBy_name": 'user',
                        "actionId": ids,
                        "addBy_role": 'user',
                        "message": "Added the room",
                        "senderId": id,
                        "messageType": "added", // text,image,video,voice, doc, sticker
                        "send_timeStamp": generate_timestamp_In_seconds() // In seconds
                    }
                    array.push(emit_details);
                }
            }
            if (array.length) {
                await added_user_to_room(array);
            }
        }
        res.status(CREATED).json({ data: { success: true }, code: CREATED });
    } catch (err) {
        next(err);
    }
}

const remove_participants = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.user;
        const { participantIds = [], groupId } = req.body;
        let array = []
        if (participantIds.length) {
            for (const ids of participantIds) {
                const participant_obj = {
                    roomId: groupId,
                    participantId: ids,
                    isGroup: true
                }
                await chat_room_participantModel.findOneAndUpdate(participant_obj, { isDelete: true });
                await dynamic_roomModel.deleteMany({ roomId: groupId, joinedBy: ids });
                const emit_details = {
                    "roomId": groupId,
                    "addBy_name": 'user',
                    "actionId": ids,
                    "addBy_role": 'user',
                    "message": "Removed the room",
                    "senderId": id,
                    "messageType": "removed", // text,image,video,voice, doc, sticker
                    "send_timeStamp": generate_timestamp_In_seconds() // In seconds
                }
                array.push(emit_details);
            }
            if (array.length) {
                await added_user_to_room(array);
            }
        }
        res.status(CREATED).json({ data: { success: true }, code: CREATED });
    } catch (err) {
        next(err);
    }
}

const delete_msg = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.user;
        console.log(id, "id")
        const messageId = req.params.id;
        await chat_room_messageModel.updateOne({ uniqueId: messageId, senderId: id, isDelete: false }, { isDelete: true });
        res.status(OK).json({ data: { success: true }, code: OK });
    } catch (err) {
        next(err)
    }
}

const check_participant_status = async (req: any, res: Response, next: NextFunction) => {
    try {
        const participantId = req.params.id;
        const check_status = await userModel.findById(participantId, { onlineStatus: 1 });
        res.status(OK).json({ data: { status: check_status?.onlineStatus ?? false }, code: OK });
    } catch (err) {
        next(err);
    }
}

export default {
    createRoom,
    createRoom_with_group,
    update_group_profile,
    room_details,
    add_participants,
    remove_participants,
    delete_msg,
    check_participant_status
} as const;