"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socket_connection = void 0;
const helpers_1 = require("./helpers");
const index_1 = require("../models/index");
const notification_1 = require("./notification");
// const { io } = require('../index');
// const nsp1 = io.of(`${process.env.ChannelName}`)
let nsp; // module-level variable
const save_chat_messages = async (data) => {
    try {
        const check_participant_list = await index_1.chat_room_participantModel.aggregate([
            { $match: { roomId: data.roomId, isDelete: false } },
            {
                $addFields: {
                    userId: { $toObjectId: "$participantId" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    let: { userId1: "$userId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$userId1"] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: { onlineStatus: 1, name: 1, isDelete: 1, uniqueId: 1, isNotification: 1 }
                        }
                    ],
                    as: "paticipantDetails"
                },
            },
            { $unwind: "$paticipantDetails" },
            {
                $project: {
                    paticipantDetails: 1,
                    participantId: 1,
                    isGroup: 1
                }
            }
        ]);
        if (check_participant_list) {
            for (let item of check_participant_list) {
                if (item.participantId != data.senderId) {
                    let status = item.paticipantDetails.onlineStatus == 'true' ? 'delivered' : 'un_delivered';
                    let send_timeStamp = item.paticipantDetails.onlineStatus == 'online' ? data.send_timeStamp : 0;
                    data.seen_details.push({ participantId: item.participantId ? item.participantId : '', status: status, seen_timeStamp: send_timeStamp });
                    if (item.paticipantDetails.onlineStatus == true && item.paticipantDetails.isNotification == true) {
                        const check_join_roomDetails = await index_1.dynamic_roomModel.aggregate([
                            {
                                $match: { roomId: data.roomId, joinedBy: item.paticipantDetails.uniqueId, isActive: false }
                            },
                            {
                                $lookup: {
                                    localField: 'joinedBy',
                                    from: 'sessions',
                                    foreignField: 'userId',
                                    as: 'sessionDetails',
                                    pipeline: [
                                        {
                                            $match: {
                                                isDelete: false,
                                                status: true
                                            }
                                        },
                                        {
                                            $project: { deviceToken: 1 }
                                        },
                                        {
                                            $limit: 1
                                        }
                                    ]
                                }
                            },
                            {
                                $unwind: "$sessionDetails"
                            }
                        ]);
                        if (check_join_roomDetails.length > 0) {
                            const deviceToken = check_join_roomDetails[0].sessionDetails.deviceToken;
                            if (deviceToken && deviceToken != '' && deviceToken != undefined && deviceToken != null) {
                                const message = {
                                    notification: {
                                        title: data.message,
                                        body: data.message,
                                    },
                                    data: {
                                        roomId: data.roomId,
                                        roomName: data.roomName,
                                        send_timeStamp: data.send_timeStamp,
                                        sender_name: data.sender_name,
                                        sendBy: data.senderId,
                                    },
                                    token: deviceToken, // FCM device token
                                };
                                await (0, notification_1.sendMsg_notification)(message);
                            }
                        }
                    }
                }
            }
        }
        await index_1.chat_room_messageModel.create(data);
    }
    catch (err) {
        console.log("Save chat messages error", err);
    }
};
const save_roomDetails = async (data) => {
    try {
        const obj = {
            joinedBy: data.joinedBy,
            roomId: data.roomId,
            last_online_timeStamp: (0, helpers_1.generate_timestamp_In_seconds)(), // In seconds
            isActive: true
        };
        const checkRoomId = await index_1.dynamic_roomModel.findOneAndUpdate({ roomId: data.roomId, joinedBy: data.joinedBy }, obj);
        if (!checkRoomId) {
            await index_1.dynamic_roomModel.create(obj);
        }
    }
    catch (err) {
        console.log("Save room details error", err);
    }
};
const check_socket_connection = async (userId, socketId) => {
    try {
        const details = await index_1.userModel.findOne({ _id: userId }, { socketId: 1, uniqueId: 1 });
        if (details) {
            if (details.socketId != socketId) {
                await index_1.userModel.updateOne({ _id: userId }, { socketId: socketId });
                return details;
            }
            else {
                return { userId: details.uniqueId };
            }
        }
        else {
            return {};
        }
    }
    catch (err) {
        console.error("Error checking socket connection:", err);
    }
};
// export { notify_to_connected_users };
const socket_connection = async (io, emitter) => {
    const nsp = io.of(`${process.env.ChannelName}`);
    // Middleware to check socket connection
    nsp.use(async (socket, next) => {
        const userId = socket.handshake.query.userId;
        console.log(socket.id, "socket.id", userId);
        const details = await check_socket_connection(userId, socket.id);
        if (!details || (typeof details === 'object' && Object.keys(details).length === 0)) {
            return next(new Error("Authentication error"));
        }
        else {
            socket.userDetails = details;
            next();
        }
    });
    // Listen for connection events
    nsp.on('connection', async (socket) => {
        try {
            const userDetails = socket.userDetails;
            const userId = socket.handshake.query.userId;
            console.log("Connecting -------------", userId);
            // const details: any = await check_socket_connection(userId, socket.id);
            if (userDetails && userDetails?.socketId) {
                if (nsp.sockets.has(userDetails.socketId)) {
                    nsp.sockets.get(userDetails.socketId).disconnect(true);
                    console.log(`Disconnect called on socket ${userDetails.socketId}`);
                }
            }
            socket.on('join_room', async (data) => {
                socket.join(data.roomId);
                console.log("Join room -------------", data.roomId);
                data.joinedBy = userId;
                await save_roomDetails(data);
                socket.broadcast.to(data.roomId).emit('user_joined', data);
            });
            // Leave a room
            socket.on('leaveRoom', async (data) => {
                console.log(`Socket ${socket.id} left room ${data.roomId}`, "userId", userId);
                socket.leave(data.roomId); // Leave the room
                const obj = {
                    last_online_timeStamp: (0, helpers_1.generate_timestamp_In_seconds)(), // In seconds
                    isActive: false
                };
                await index_1.dynamic_roomModel.findOneAndUpdate({ roomId: data.roomId, joinedBy: userId }, obj);
                socket.broadcast.to(data.roomId).emit('user_leaveRoom', data);
            });
            socket.on('send_messages', async (data) => {
                try {
                    console.log("msg listening-----", data);
                    const send_message_obj = {
                        ...data,
                        uniqueId: (0, helpers_1.identityGenerator)('message', 1),
                        senderId: userId,
                        seen_details: []
                    };
                    await save_chat_messages(send_message_obj);
                    socket.broadcast.to(data.roomId).emit('receive_messages', send_message_obj);
                }
                catch (err) {
                    console.error('Error saving message:', err);
                    socket.emit('error_saving_message', err.message); // Notify client of error          
                }
            });
            socket.on('messageSeen', async (data) => {
                try {
                    if (data.messageId && data.messageId != '' && data.messageId != undefined) {
                        data.seenBy = userId;
                        await (0, helpers_1.update_msg_status)(data);
                    }
                    // Notify others in the room except the user who saw the message
                    socket.to(data.roomId).emit('messageSeenByUser', data);
                }
                catch (err) {
                    console.log("Error msg during seen", err);
                }
            });
            socket.on("disconnect", async (data) => {
                try {
                    const userId = socket.handshake.query.userId;
                    const active_room = await index_1.dynamic_roomModel.findOneAndUpdate({ joinedBy: userId, isActive: true }, { $set: { last_online_timeStamp: (0, helpers_1.generate_timestamp_In_seconds)(), isActive: false } });
                    socket.broadcast.to(active_room?.roomId).emit('disconnected', {
                        roomId: active_room?.roomId ?? ''
                    });
                }
                catch (err) {
                    console.log("Error during disconnect", err);
                }
            });
            socket.on('typing', function (data) {
                try {
                    socket.broadcast.to(data.roomId).emit('user_typing', data);
                }
                catch (err) {
                    console.log("Error during typing event", err);
                }
            });
        }
        catch (err) {
            console.log("Error in socket connection", err);
        }
    });
};
exports.socket_connection = socket_connection;
