"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../../Custom_message/index"));
const chat_message_1 = __importDefault(require("../../models/chat_message"));
const feed_1 = __importDefault(require("../../models/feed"));
const participants_1 = __importDefault(require("../../models/participants"));
const user_1 = __importDefault(require("../../models/user"));
const errors_1 = require("../../utils/errors");
const helpers_1 = require("../../utils/helpers");
const http_status_codes_1 = require("http-status-codes");
const { OK } = http_status_codes_1.StatusCodes;
const mongodb_1 = require("mongodb");
const contactList = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { page = 1, perPage = 10, groupId, search } = req.query;
        const cond = {
            isDelete: false,
            loginKey: 0,
            _id: { $nin: [new mongodb_1.ObjectId(id)] }
        };
        if (search && search !== "" && search !== undefined) {
            cond.name = { $regex: search, $options: "i" };
        }
        const pipeLine = [
            {
                $match: cond
            },
            {
                $sort: { name: 1, createdAt: -1 }
            }
        ];
        if (groupId && groupId != null && groupId != undefined) {
            pipeLine.push({
                $addFields: {
                    stringId: { $toString: "$_id" },
                    participants_exists_message: index_1.default.already_exist_in_group
                }
            }, {
                $lookup: {
                    from: "chat_room_participants",
                    let: { userId: "$stringId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$participantId", "$$userId"] },
                                        { $eq: ["$roomId", groupId] },
                                        { $eq: ["$isDelete", false] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: { roomId: 1, isDelete: 1 }
                        }
                    ],
                    as: "participants"
                }
            }, {
                $project: {
                    name: 1,
                    image: 1,
                    uniqueId: 1,
                    isActive: 1,
                    createdAt: 1,
                    participants_exists_message: 1,
                    participants_exists: {
                        $cond: {
                            if: { $gt: [{ $size: "$participants" }, 0] },
                            then: true,
                            else: false
                        }
                    }
                }
            }, {
                $skip: Number(page * perPage) - Number(perPage)
            }, {
                $limit: Number(perPage)
            });
        }
        else {
            pipeLine.push({
                $addFields: {
                    participants_exists: false,
                    participants_exists_message: index_1.default.already_exist_in_group
                }
            }, {
                $project: {
                    name: 1,
                    image: 1,
                    uniqueId: 1,
                    isActive: 1,
                    createdAt: 1,
                    participants_exists_message: 1,
                    participants_exists: 1
                }
            }, {
                $skip: Number(page * perPage) - Number(perPage)
            }, {
                $limit: Number(perPage)
            });
        }
        const [list, count] = await Promise.all([
            user_1.default.aggregate(pipeLine),
            user_1.default.aggregate([
                {
                    $match: cond
                },
                {
                    $count: "totalCount"
                }
            ])
        ]);
        res.status(OK).json({ data: { list, totalCount: count.length ? count[0].totalCount : 0 }, code: OK });
    }
    catch (err) {
        next(err);
    }
};
const all_room_list1 = async (req, res, next) => {
    try {
        const { id } = req.user;
        console.log(id, "id");
        const { page = 1, perPage = 10, search, isGroup = false } = req.query;
        const list = await participants_1.default.aggregate([
            {
                $match: {
                    isGroup: isGroup == "true" ? true : false,
                    isDelete: false
                }
            },
            {
                $addFields: {
                    stringId: { $toObjectId: "$participantId" },
                }
            },
            {
                $lookup: {
                    from: "chat_rooms", // The collection to join 1
                    localField: "roomId", // Field from current collection
                    foreignField: "uniqueId", // Field from joined collection
                    as: "roomDetails", // Output array field
                    pipeline: [
                        {
                            $lookup: {
                                localField: "uniqueId",
                                foreignField: "roomId",
                                as: "message_details",
                                from: "chat_room_messages",
                                pipeline: [
                                    {
                                        $facet: {
                                            lastmessage: [
                                                {
                                                    $match: {
                                                        isDelete: false
                                                    }
                                                },
                                                {
                                                    $sort: { send_timeStamp: -1 }
                                                },
                                                {
                                                    $project: {
                                                        message: 1,
                                                        messageType: 1,
                                                        readStatus: 1,
                                                        send_timeStamp: 1,
                                                        senderId: 1
                                                    }
                                                },
                                                {
                                                    $limit: 1
                                                }
                                            ],
                                            unRead_messages: [
                                                {
                                                    $match: {
                                                        readStatus: false,
                                                        isDelete: false,
                                                        senderId: { $nin: [id] }
                                                    }
                                                },
                                                {
                                                    $count: "count"
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        $addFields: {
                                            lastMessageTime: {
                                                $ifNull: [{ $arrayElemAt: ["$lastmessage.send_timeStamp", 0] }, null]
                                            },
                                            senderId: {
                                                $ifNull: [{ $arrayElemAt: ["$lastmessage.senderId", 0] }, ""]
                                            },
                                            message: {
                                                $ifNull: [{ $arrayElemAt: ["$lastmessage.message", 0] }, ""]
                                            },
                                            messageType: {
                                                $ifNull: [{ $arrayElemAt: ["$lastmessage.messageType", 0] }, ""]
                                            },
                                            unRead_count: {
                                                $ifNull: [{ $arrayElemAt: ["$unRead_messages.count", 0] }, 0]
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            unRead_messages: 0,
                                            lastmessage: 0
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $project: {
                                created_by: 1, chat_encryptedId: 1, groupName: 1, isGroup: 1, image: 1, created_timeStamp: 1, isDelete: 1, message_details: 1
                            }
                        },
                        {
                            $unwind: {
                                path: "$message_details",
                                preserveNullAndEmptyArrays: true
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$roomDetails" // Convert the array to object
            },
            {
                $lookup: {
                    let: { participantId: "$stringId" },
                    from: "users", // Assuming you have a users collection
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$participantId"] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: { name: 1, image: 1, onlineStatus: 1, isDelete: 1 }
                        }
                    ],
                    as: "participant"
                }
            },
            {
                $unwind: {
                    path: "$participant",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$roomId",
                    participantList: {
                        $push: {
                            participantId: "$participantId",
                            participantDetails: "$participant"
                        }
                    },
                    // participantList: { "$push": "$$ROOT" },
                    roomDetails: { "$first": "$roomDetails" } // Preserve room details
                }
            },
            {
                $addFields: {
                    lastMessageTime: "$roomDetails.message_details.lastMessageTime"
                }
            },
            {
                $match: {
                    "participantList.participantId": id // ✅ only include rooms the user is in
                }
            },
            {
                $sort: { lastMessageTime: -1 }
            },
            // Second match: Search logic
            {
                $match: search ? {
                    $or: [
                        // Group chat search
                        {
                            "roomDetails.isGroup": true,
                            "roomDetails.groupName": { $regex: search, $options: 'i' }
                        },
                        // 1:1 chat search (must have exactly one other participant matching)
                        {
                            "roomDetails.isGroup": false,
                            "participantList": {
                                $elemMatch: {
                                    "participantId": { $ne: id },
                                    "participantDetails.name": { $regex: search, $options: 'i' }
                                }
                            }
                        }
                    ]
                } : {}
            },
            {
                $skip: Number(page * perPage) - Number(perPage)
            },
            {
                $limit: Number(perPage)
            }
        ]);
        res.status(OK).json({ data: { list, image_baseUrl: process.env.Bucket_Base_Url }, code: OK });
    }
    catch (err) {
        next(err);
    }
};
const all_room_list = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { page = 1, perPage = 10, search, isGroup = false } = req.query;
        const list = await participants_1.default.aggregate([
            {
                $match: {
                    isGroup: isGroup == "true" ? true : false,
                    participantId: id,
                    isDelete: false
                }
            },
            {
                $lookup: {
                    from: "chat_rooms", // The collection to join 1
                    localField: "roomId", // Field from current collection
                    foreignField: "uniqueId", // Field from joined collection
                    as: "roomDetails", // Output array field
                    pipeline: [
                        {
                            $lookup: {
                                localField: "uniqueId",
                                foreignField: "roomId",
                                as: "message_details",
                                from: "chat_room_messages",
                                pipeline: [
                                    {
                                        $facet: {
                                            lastmessage: [
                                                {
                                                    $match: {
                                                        isDelete: false
                                                    }
                                                },
                                                {
                                                    $sort: { send_timeStamp: -1 }
                                                },
                                                {
                                                    $project: {
                                                        message: 1,
                                                        messageType: 1,
                                                        readStatus: 1,
                                                        send_timeStamp: 1,
                                                        senderId: 1
                                                    }
                                                },
                                                {
                                                    $limit: 1
                                                }
                                            ],
                                            unRead_messages: [
                                                {
                                                    $match: {
                                                        readStatus: false,
                                                        isDelete: false,
                                                        senderId: { $nin: [id] }
                                                    }
                                                },
                                                {
                                                    $count: "count"
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        $addFields: {
                                            lastMessageTime: {
                                                $ifNull: [{ $arrayElemAt: ["$lastmessage.send_timeStamp", 0] }, null]
                                            },
                                            senderId: {
                                                $ifNull: [{ $arrayElemAt: ["$lastmessage.senderId", 0] }, ""]
                                            },
                                            message: {
                                                $ifNull: [{ $arrayElemAt: ["$lastmessage.message", 0] }, ""]
                                            },
                                            messageType: {
                                                $ifNull: [{ $arrayElemAt: ["$lastmessage.messageType", 0] }, ""]
                                            },
                                            unRead_count: {
                                                $ifNull: [{ $arrayElemAt: ["$unRead_messages.count", 0] }, 0]
                                            }
                                        }
                                    },
                                    {
                                        $project: {
                                            unRead_messages: 0,
                                            lastmessage: 0
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $lookup: {
                                localField: "uniqueId",
                                foreignField: "roomId",
                                as: "participant_list",
                                from: "chat_room_participants",
                                pipeline: [
                                    {
                                        $match: {
                                            participantId: { $ne: id }
                                        }
                                    },
                                    {
                                        $addFields: {
                                            stringId: { $toObjectId: "$participantId" },
                                        }
                                    },
                                    {
                                        $lookup: {
                                            let: { participantId: "$stringId" },
                                            from: "users", // Assuming you have a users collection
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: {
                                                            $and: [
                                                                { $eq: ["$_id", "$$participantId"] }
                                                            ]
                                                        }
                                                    }
                                                },
                                                {
                                                    $project: { name: 1, image: { $ifNull: ["$image", ""] }, onlineStatus: 1, isDelete: 1 }
                                                }
                                            ],
                                            as: "participant_details"
                                        }
                                    },
                                    {
                                        $project: { stringId: 1, isGroup: 1, participantId: 1, joined_timeStamp: 1, participant_details: { $ifNull: [{ $arrayElemAt: ["$participant_details", 0] }, null] } }
                                    },
                                ]
                            }
                        },
                        {
                            $project: {
                                created_by: 1, chat_encryptedId: 1, participant_list: 1, groupName: 1, isGroup: 1, image: 1, created_timeStamp: 1, isDelete: 1, message_details: { $ifNull: [{ $arrayElemAt: ["$message_details", 0] }, null] },
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    roomId: 1,
                    participantId: 1,
                    roomDetails: { $ifNull: [{ $arrayElemAt: ["$roomDetails", 0] }, null] },
                }
            },
            {
                $group: {
                    _id: "$roomId",
                    userId: { $first: "$participantId" }, // only one userId per room
                    roomDetails: { $first: "$roomDetails" },
                    lastMessageTime: { $first: "$roomDetails.message_details.lastMessageTime" },
                }
            },
            // ✅ Search filtering logic
            ...(search
                ? [{
                        $match: {
                            $or: [
                                { "roomDetails.isGroup": true, "roomDetails.groupName": { $regex: search, $options: 'i' } },
                                {
                                    "roomDetails.isGroup": false,
                                    "roomDetails.participant_list.participant.name": { $regex: search, $options: 'i' }
                                }
                            ]
                        }
                    }]
                : []),
            {
                $sort: { lastMessageTime: -1 }
            },
            {
                $skip: Number(page * perPage) - Number(perPage)
            },
            {
                $limit: Number(perPage)
            }
        ]);
        res.status(OK).json({ data: { list }, code: OK });
    }
    catch (err) {
        next(err);
    }
};
const chatList = async (req, res, next) => {
    try {
        const roomId = req.params.id;
        const { id } = req.user;
        const result = await (0, helpers_1.all_participant_seen_msg)({ roomId: roomId, userId: id });
        console.log("result", result);
        if (result == true) {
            const [list, update_message_seen] = await Promise.all([
                chat_message_1.default.aggregate([
                    {
                        $match: {
                            roomId: roomId,
                            isDelete: false
                        }
                    },
                    // Extract date string like "2025-07-29"
                    {
                        $addFields: {
                            date: {
                                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                            },
                            sender_objId: { $toObjectId: "$senderId" },
                            // Only convert actionId if not empty or null else null
                            action_objId: {
                                $cond: [
                                    { $and: [{ $ne: ["$actionId", null] }, { $ne: ["$actionId", ""] }] },
                                    { $toObjectId: "$actionId" },
                                    null
                                ]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            let: { senderId: "$sender_objId" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $eq: ["$_id", "$$senderId"] }
                                            ]
                                        }
                                    }
                                },
                                {
                                    $project: { name: 1, image: 1, isDelete: 1 }
                                }
                            ],
                            as: "senderDetails"
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            let: { actionId: "$action_objId" },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $and: [
                                                { $ne: ["$$actionId", null] }, // Only if actionId is not null
                                                { $eq: ["$_id", "$$actionId"] }
                                            ]
                                        }
                                    }
                                },
                                {
                                    $project: { name: 1, image: 1, isDelete: 1 }
                                }
                            ],
                            as: "actionDetails"
                        }
                    },
                    {
                        $addFields: {
                            isSendByUser: {
                                $cond: {
                                    if: { $eq: ["$senderId", id] },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            roomId: 0, isActive: 0, updatedAt: 0
                        }
                    },
                    // Group by date
                    {
                        $group: {
                            _id: "$date",
                            messages: {
                                $push: {
                                    message: "$message",
                                    messageType: "$messageType",
                                    send_timeStamp: "$send_timeStamp",
                                    createdAt: "$createdAt",
                                    senderDetails: "$senderDetails",
                                    isSendByUser: "$isSendByUser",
                                    readStatus: "$readStatus",
                                    seen_details: "$seen_details"
                                }
                            }
                        }
                    },
                    // Optional: sort groups (e.g., newest date first)
                    {
                        $sort: { _id: 1 }
                    }
                ]),
                chat_message_1.default.updateMany({
                    roomId: roomId, senderId: { $ne: id },
                    seen_details: {
                        $elemMatch: {
                            participantId: id,
                            status: { $ne: "seen" }
                        }
                    }
                }, {
                    $set: {
                        "seen_details.$.status": "seen",
                        "seen_details.$.seen_timeStamp": (0, helpers_1.generate_timestamp_In_seconds)()
                    }
                })
            ]);
            res.status(OK).json({ code: OK, data: list, image_baseUrl: process.env.Bucket_Base_Url });
        }
        else {
            throw new errors_1.CustomError(index_1.default.noDatafoundWithID, http_status_codes_1.StatusCodes.NOT_FOUND);
        }
    }
    catch (err) {
        next(err);
    }
};
const feed_list = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { page = 1, perPage = 10, search } = req.query;
        const cond = {
            isDelete: false
        };
        if (search) {
            cond.name = { $regex: search, $options: "i" };
        }
        let demo_messages = [
            {
                sender: "Alice",
                message: "Hey, have you seen my cat?",
                timestamp: Math.floor(Date.now() / 1000)
            },
            {
                sender: "Bob",
                message: "Your cat is sleeping on the sofa again 😸",
                timestamp: Math.floor(Date.now() / 1000)
            },
            {
                sender: "Alice",
                message: "Aww, she loves that spot!",
                timestamp: Math.floor(Date.now() / 1000)
            },
            {
                sender: "Charlie",
                message: "I think the cat wants some treats 🐾",
                timestamp: Math.floor(Date.now() / 1000)
            }
        ];
        const [list, count] = await Promise.all([feed_1.default.aggregate([
                {
                    $match: cond
                },
                {
                    $addFields: {
                        messageList: demo_messages
                    }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $skip: Number(page * perPage) - Number(perPage)
                },
                {
                    $limit: Number(perPage)
                }
            ]),
            feed_1.default.aggregate([
                {
                    $match: cond
                },
                {
                    $count: "totalCount"
                }
            ])
        ]);
        res.status(OK).json({ data: { list: list, image_baseUrl: process.env.Bucket_Base_Url, count: count.length ? count[0].totalCount : 0 }, code: OK });
    }
    catch (err) {
        next(err);
    }
};
exports.default = {
    contactList,
    all_room_list,
    all_room_list1,
    chatList,
    feed_list
};
