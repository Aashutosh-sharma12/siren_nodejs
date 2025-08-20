import { generate_timestamp_In_seconds, identityGenerator, update_msg_status } from "./helpers";
import { chat_room_messageModel, chat_room_participantModel, dynamic_roomModel, sessionModel, userModel } from "@models/index";
import { sendMsg_notification } from "./notification";
// const { io } = require('../index');
// const nsp1 = io.of(`${process.env.ChannelName}`)
let nsp: any; // module-level variable

/**
 * 
 * @param data 
 * Save message details into database
 */
interface chat_room_message {
    uniqueId: string,
    roomId: string,
    senderId: string,
    message: string,
    messageType: string,
    readStatus: boolean,
    send_timeStamp: number,
    sender_name?: string;
    roomName?: string;
    seen_details: Array<{ participantId: string, status: string, seen_timeStamp: number }>,
}
/***
 * Join room
 */
interface roomData {
    roomId: string,
    roomType: string, // one-to-one,group
    joinedBy: string
}
/***
 * Leave Room
 */
interface leave_roomData {
    roomId: string,
    roomType: string, // one-to-one,group
    leavedBy: string
}
/**
 * Typing 
 */
interface typing_roomData {
    roomId: string,
    typingBy: string
}
/***
 * Disconnect room and connection
 */
interface disconnect_roomData {
    roomId: string
}
/**
 * Send Message
 */
interface send_message {
    roomId: string,
    senderId: string,
    message: string,
    messageType: string, // text,image,video,voice,doc,sticker,seen,left,joined
    readStatus: boolean,
    send_timeStamp: number
}
/**
 * Seen Message
 */
interface messageSeenData {
    roomId: string,
    seenBy: string,
    messageId?: string,
    send_timeStamp: number
}

const save_chat_messages = async (data: chat_room_message) => {
    try {
        const check_participant_list = await chat_room_participantModel.aggregate([
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
                    data.seen_details.push({ participantId: item.participantId ? item.participantId : '', status: status, seen_timeStamp: send_timeStamp })
                    if (item.paticipantDetails.onlineStatus == true && item.paticipantDetails.isNotification == true) {
                        const check_join_roomDetails = await dynamic_roomModel.aggregate([
                            {
                                $match: { roomId: data.roomId, joinedBy: item.participantId }
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
                            if (check_join_roomDetails[0].isActive == false) {
                                const deviceToken = check_join_roomDetails[0].sessionDetails.deviceToken;
                                if (deviceToken && deviceToken != '' && deviceToken != undefined && deviceToken != null) {
                                    const message: any = {
                                        notification: {
                                            title: data.message,
                                            body: data.message,
                                        },
                                        data: {
                                            roomId: data.roomId ?? '',
                                            roomName: data.roomName ?? '',
                                            send_timeStamp: (data.send_timeStamp).toString() ?? '',
                                            sender_name: (data.sender_name ?? '').toString(),
                                            sendBy: data.senderId ?? '',
                                        },
                                        token: deviceToken, // FCM device token
                                    };
                                    // console.log("check_join_roomDetails", check_join_roomDetails)

                                    await sendMsg_notification(message);
                                }
                            }
                        } else {
                            const sessionDetails = await sessionModel.findOne({ userId: item.participantId, isDelete: false, status: true }, { deviceToken: 1 });
                            const deviceToken = sessionDetails?.deviceToken;
                            if (deviceToken && deviceToken != '' && deviceToken != undefined && deviceToken != null) {
                                const message: any = {
                                    notification: {
                                        title: data.message,
                                        body: data.message,
                                    },
                                    data: {
                                        roomId: data.roomId ?? '',
                                        roomName: data.roomName ?? '',
                                        send_timeStamp: (data.send_timeStamp).toString() ?? '',
                                        sender_name: (data.sender_name ?? '').toString(),
                                        sendBy: data.senderId ?? '',
                                    },
                                    token: deviceToken, // FCM device token
                                };
                                // console.log("check_join_roomDetails", check_join_roomDetails)

                                await sendMsg_notification(message);
                            }
                        }
                    }
                }
            }
        }
        await chat_room_messageModel.create(data);
    } catch (err) {
        console.log("Save chat messages error", err)
    }
}

const save_roomDetails = async (data: roomData) => {
    try {
        const obj = {
            joinedBy: data.joinedBy,
            roomId: data.roomId,
            last_online_timeStamp: generate_timestamp_In_seconds(),    // In seconds
            isActive: true
        }
        const checkRoomId = await dynamic_roomModel.findOneAndUpdate({ roomId: data.roomId, joinedBy: data.joinedBy }, obj);
        if (!checkRoomId) {
            await dynamic_roomModel.create(obj);
        }
    } catch (err) {
        console.log("Save room details error", err)
    }
}

const check_socket_connection = async (userId: string, socketId: string) => {
    try {
        const details = await userModel.findOne({ _id: userId }, { socketId: 1, uniqueId: 1 });
        if (details) {
            if (details.socketId != socketId) {
                await userModel.updateOne({ _id: userId }, { socketId: socketId });
                return details;
            } else {
                return { userId: details.uniqueId };
            }
        } else {
            return {};
        }
    } catch (err) {
        console.error("Error checking socket connection:", err);
    }
}

// export { notify_to_connected_users };

const socket_connection = async (io: any, emitter: any) => {
    const nsp = io.of(`${process.env.ChannelName}`)
    // Middleware to check socket connection
    nsp.use(async (socket: any, next: any) => {
        const userId = socket.handshake.query.userId;
        console.log(socket.id, "socket.id", userId)
        const details: any = await check_socket_connection(userId, socket.id);
        if (!details || (typeof details === 'object' && Object.keys(details).length === 0)) {
            return next(new Error("Authentication error"));
        } else {
            socket.userDetails = details;
            next();
        }
    });
    // Listen for connection events
    nsp.on('connection', async (socket: any) => {
        try {
            const userDetails = socket.userDetails;
            const userId = socket.handshake.query.userId;
            console.log("Connecting -------------", userId)
            // const details: any = await check_socket_connection(userId, socket.id);
            if (userDetails && userDetails?.socketId) {
                if (nsp.sockets.has(userDetails.socketId)) {
                    nsp.sockets.get(userDetails.socketId).disconnect(true);
                    console.log(`Disconnect called on socket ${userDetails.socketId}`);
                }
            }

            socket.on('join_room', async (data: roomData) => {
                socket.join(data.roomId);
                console.log("Join room -------------", data.roomId);
                data.joinedBy = userId;
                await save_roomDetails(data);
                socket.broadcast.to(data.roomId).emit('user_joined', data);
            });

            // Leave a room
            socket.on('leaveRoom', async (data: leave_roomData) => {
                console.log(`Socket ${socket.id} left room ${data.roomId}`, "userId", userId);
                socket.leave(data.roomId); // Leave the room
                const obj = {
                    last_online_timeStamp: generate_timestamp_In_seconds(),    // In seconds
                    isActive: false
                }
                await dynamic_roomModel.findOneAndUpdate({ roomId: data.roomId, joinedBy: userId }, obj);
                socket.broadcast.to(data.roomId).emit('user_leaveRoom', data);
            });

            socket.on('send_messages', async (data: send_message) => {
                try {
                    console.log("msg listening-----", data);
                    const send_message_obj = {
                        ...data,
                        uniqueId: identityGenerator('message', 1),
                        senderId: userId,
                        seen_details: []
                    }
                    await save_chat_messages(send_message_obj);
                    socket.broadcast.to(data.roomId).emit('receive_messages', send_message_obj);
                } catch (err: any) {
                    console.error('Error saving message:', err);
                    socket.emit('error_saving_message', err.message); // Notify client of error          
                }
            });

            socket.on('messageSeen', async (data: messageSeenData) => {
                try {
                    if (data.messageId && data.messageId != '' && data.messageId != undefined) {
                        data.seenBy = userId;
                        await update_msg_status(data);
                    }
                    console.log(data, "data");
                    // Notify others in the room except the user who saw the message
                    socket.to(data.roomId).emit('messageSeenByUser', data);
                } catch (err) {
                    console.log("Error msg during seen", err)
                }
            });

            socket.on("disconnect", async (data: disconnect_roomData) => {
                try {
                    const userId = socket.handshake.query.userId;
                    const active_room = await dynamic_roomModel.findOneAndUpdate(
                        { joinedBy: userId, isActive: true },
                        { $set: { last_online_timeStamp: generate_timestamp_In_seconds(), isActive: false } });
                    socket.broadcast.to(active_room?.roomId).emit('disconnected', {
                        roomId: active_room?.roomId ?? ''
                    });
                } catch (err) {
                    console.log("Error during disconnect", err);
                }
            });

            socket.on('typing', function (data: typing_roomData) {
                try {
                    socket.broadcast.to(data.roomId).emit('user_typing', data
                    );
                } catch (err) {
                    console.log("Error during typing event", err);
                }
            });
        } catch (err) {
            console.log("Error in socket connection", err);
        }
    });
};
export { socket_connection };