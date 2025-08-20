"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../../Custom_message/index"));
const index_2 = require("../../models/index");
const errors_1 = require("../../utils/errors");
const helpers_1 = require("../../utils/helpers");
const multer_1 = require("../../utils/multer");
const http_status_codes_1 = require("http-status-codes");
const { OK, CREATED } = http_status_codes_1.StatusCodes;
const createRoom = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { participantId, } = req.body;
        const cond = {
            uniqueId: (0, helpers_1.identityGenerator)('room', await index_2.chat_roomModel.countDocuments()),
            created_by: id,
            created_timeStamp: (0, helpers_1.generate_timestamp_In_seconds)(),
        };
        const fullString = cond.uniqueId + "" + cond.created_timeStamp;
        const chatKeyString = fullString.substring(0, 32);
        cond.chat_encryptedId = (0, helpers_1.encrypt)(chatKeyString);
        const commonRoom = await index_2.chat_room_participantModel.aggregate([
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
            res.status(OK).json({ message: index_1.default.participant_allready_exist, data: {}, code: OK });
        }
        else {
            const create_room = await index_2.chat_roomModel.create(cond);
            if (create_room) {
                const participant_obj1 = {
                    addBy: id,
                    joined_timeStamp: cond.created_timeStamp,
                    roomId: create_room.uniqueId,
                    participantId: id,
                };
                const participant_obj2 = {
                    addBy: id,
                    joined_timeStamp: cond.created_timeStamp,
                    roomId: create_room.uniqueId,
                    participantId: participantId,
                };
                await index_2.chat_room_participantModel.insertMany([participant_obj1, participant_obj2]);
                res.status(CREATED).json({ data: create_room, image_baseUrl: process.env.Bucket_Base_Url, code: CREATED });
            }
            else {
                throw new errors_1.CustomError(index_1.default.someThingWent_wrongTo_create_room, http_status_codes_1.StatusCodes.BAD_REQUEST);
            }
        }
    }
    catch (err) {
        next(err);
    }
};
const createRoom_with_group = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { participantIds, groupName } = req.body;
        const cond = {
            uniqueId: (0, helpers_1.identityGenerator)('room', await index_2.chat_roomModel.countDocuments()),
            created_by: id,
            groupName: groupName,
            isGroup: true,
            created_timeStamp: (0, helpers_1.generate_timestamp_In_seconds)()
        };
        const fullString = cond.uniqueId + "" + cond.created_timeStamp;
        const chatKeyString = fullString.substring(0, 32);
        cond.chat_encryptedId = (0, helpers_1.encrypt)(chatKeyString);
        const create_room = await index_2.chat_roomModel.create(cond);
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
                    };
                    await index_2.chat_room_participantModel.create(participant_obj);
                }
            }
            if (req.files && req.files.image && req.files.image.length > 0) {
                req.uniqueId = create_room.uniqueId;
                req.type = 'group-profile-image';
                req.role = 'group';
                const imageUrl = await (0, multer_1.uploadSingleImage)(req, res, next);
                await index_2.chat_roomModel.updateOne({ _id: create_room._id }, { image: imageUrl });
            }
            res.status(CREATED).json({ data: create_room, image_baseUrl: process.env.Bucket_Base_Url, code: CREATED });
        }
        else {
            throw new errors_1.CustomError(index_1.default.someThingWent_wrongTo_create_room, http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
    }
    catch (err) {
        next(err);
    }
};
const update_group_profile = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { roomId, groupName } = req.body;
        const details = await index_2.chat_roomModel.findOne({ _id: roomId, isGroup: true });
        if (!details) {
            throw new errors_1.CustomError(index_1.default.group_not_exist, http_status_codes_1.StatusCodes.NOT_FOUND);
        }
        else {
            if (details.created_by != id) {
                throw new errors_1.CustomError(index_1.default.not_access_for_this_room, http_status_codes_1.StatusCodes.BAD_REQUEST);
            }
            if (req.files && req.files.image && req.files.image.length > 0) {
                req.uniqueId = details.uniqueId;
                req.type = 'group-profile-image';
                req.role = 'group';
                const imageUrl = await (0, multer_1.uploadSingleImage)(req, res, next);
                await index_2.chat_roomModel.updateOne({ _id: details._id }, { image: imageUrl, groupName: groupName });
                res.status(OK).json({ data: { success: true }, code: OK });
            }
            else {
                await index_2.chat_roomModel.updateOne({ _id: details._id }, { groupName: groupName });
                res.status(OK).json({ data: { success: true }, code: OK });
            }
        }
    }
    catch (err) {
        next(err);
    }
};
const room_details = async (req, res, next) => {
    try {
        const { id } = req.params;
        const details = await index_2.chat_roomModel.findOne({ _id: id });
        if (!details) {
            throw new errors_1.CustomError(index_1.default.noDatafoundWithID, http_status_codes_1.StatusCodes.NOT_FOUND);
        }
        else {
            res.status(OK).json({ data: details, image_baseUrl: process.env.Bucket_Base_Url, code: OK });
        }
    }
    catch (err) {
        next(err);
    }
};
const add_participants = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { participantIds = [], groupId } = req.body;
        let array = [];
        if (participantIds.length) {
            for (const ids of participantIds) {
                const participant_obj = {
                    addBy: id,
                    joined_timeStamp: (0, helpers_1.generate_timestamp_In_seconds)(),
                    roomId: groupId,
                    participantId: ids,
                    isGroup: true
                };
                const check = await index_2.chat_room_participantModel.findOne({ roomId: groupId, isDelete: false, participantId: ids });
                if (!check) {
                    await index_2.chat_room_participantModel.create(participant_obj);
                    const emit_details = {
                        "roomId": groupId,
                        "addBy_name": 'user',
                        "actionId": ids,
                        "addBy_role": 'user',
                        "message": "Added the room",
                        "senderId": id,
                        "messageType": "added", // text,image,video,voice, doc, sticker
                        "send_timeStamp": (0, helpers_1.generate_timestamp_In_seconds)() // In seconds
                    };
                    array.push(emit_details);
                }
            }
            if (array.length) {
                await (0, helpers_1.added_user_to_room)(array);
            }
        }
        res.status(CREATED).json({ data: { success: true }, code: CREATED });
    }
    catch (err) {
        next(err);
    }
};
const remove_participants = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { participantIds = [], groupId } = req.body;
        let array = [];
        if (participantIds.length) {
            for (const ids of participantIds) {
                const participant_obj = {
                    roomId: groupId,
                    participantId: ids,
                    isGroup: true
                };
                await index_2.chat_room_participantModel.findOneAndUpdate(participant_obj, { isDelete: true });
                await index_2.dynamic_roomModel.deleteMany({ roomId: groupId, joinedBy: ids });
                const emit_details = {
                    "roomId": groupId,
                    "addBy_name": 'user',
                    "actionId": ids,
                    "addBy_role": 'user',
                    "message": "Removed the room",
                    "senderId": id,
                    "messageType": "removed", // text,image,video,voice, doc, sticker
                    "send_timeStamp": (0, helpers_1.generate_timestamp_In_seconds)() // In seconds
                };
                array.push(emit_details);
            }
            if (array.length) {
                await (0, helpers_1.added_user_to_room)(array);
            }
        }
        res.status(CREATED).json({ data: { success: true }, code: CREATED });
    }
    catch (err) {
        next(err);
    }
};
const delete_msg = async (req, res, next) => {
    try {
        const { id } = req.user;
        console.log(id, "id");
        const messageId = req.params.id;
        await index_2.chat_room_messageModel.updateOne({ uniqueId: messageId, senderId: id, isDelete: false }, { isDelete: true });
        res.status(OK).json({ data: { success: true }, code: OK });
    }
    catch (err) {
        next(err);
    }
};
const check_participant_status = async (req, res, next) => {
    try {
        const participantId = req.params.id;
        const check_status = await index_2.userModel.findById(participantId, { onlineStatus: 1 });
        res.status(OK).json({ data: { status: check_status?.onlineStatus ?? false }, code: OK });
    }
    catch (err) {
        next(err);
    }
};
exports.default = {
    createRoom,
    createRoom_with_group,
    update_group_profile,
    room_details,
    add_participants,
    remove_participants,
    delete_msg,
    check_participant_status
};
