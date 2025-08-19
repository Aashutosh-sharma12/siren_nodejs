"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.added_user_to_room = exports.delete_user_all_data = exports.left_all_rooms = exports.update_msg_status = exports.all_participant_seen_msg = exports.generate_timestamp_In_seconds = void 0;
exports.generate_refreshToken = generate_refreshToken;
exports.generate_accessToken = generate_accessToken;
exports.identityGenerator = identityGenerator;
exports.generateOtp = generateOtp;
exports.fetchFile = fetchFile;
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const jwt = require("jsonwebtoken");
const otp_generator_1 = __importDefault(require("otp-generator"));
const axios_1 = __importDefault(require("axios"));
const chat_message_1 = __importDefault(require("../models/chat_message"));
const participants_1 = __importDefault(require("../models/participants"));
const dynamic_room_1 = __importDefault(require("../models/dynamic_room"));
const index_1 = require("../index");
const room_1 = __importDefault(require("../models/room"));
const multer_1 = require("./multer");
const user_1 = __importDefault(require("../models/user"));
function generate_refreshToken(userId, role, usingPasswordKey, loginKey_status) {
    const refreshToken = jwt.sign({ id: userId, role: role, usingPasswordKey: usingPasswordKey, loginKey_status: loginKey_status }, process.env.JWT_SECRET_TOKEN, {
        expiresIn: process.env.refreshToken_expire_time,
    });
    return refreshToken;
}
function generate_accessToken(userId, role, usingPasswordKey, loginKey_status) {
    const accessToken = jwt.sign({ id: userId, role: role, usingPasswordKey: usingPasswordKey, loginKey_status: loginKey_status }, process.env.JWT_SECRET_TOKEN, {
        expiresIn: process.env.accessToken_expire_time,
    });
    return accessToken;
}
function identityGenerator(role, count) {
    let padding;
    switch (role) {
        case "user":
            padding = "ASTRO_user";
            break;
        case "room":
            padding = "ASTRO_chat_room";
            break;
        case "message":
            padding = "ASTRO_message";
            break;
        case "admin-feed":
            padding = "ASTRO_AdFE";
            break;
        case "subscription":
            padding = "ASTRO_SUB";
            break;
        case 'user_subscription':
            padding = "ASTRO_USUB";
            break;
        default:
            padding = "ASTRO_user";
    }
    // const m = new Date();
    const timestamp = Date.now().toString(36);
    const theID = padding + "" + timestamp.toUpperCase() + "" + count;
    return theID;
}
function generateOtp() {
    const otp = otp_generator_1.default.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false
    });
    return otp;
}
async function fetchFile(url) {
    const response = await axios_1.default.get(url, {
        responseType: 'arraybuffer',
        maxRedirects: 5, // Adjust based on expected redirect behavior
    });
    return Buffer.from(response.data);
}
// async function decryptMessage(cipherText: string) {
//   try {
//     const ENCRYPTION_KEY: any = process.env.ENCRYPTION_KEY; // Store securely in secure storage
//     const bytes = await CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY);
//     console.log(bytes.toString(CryptoJS.enc.Utf8), "bytes.toString(CryptoJS.enc.Utf8)")
//     return bytes.toString(CryptoJS.enc.Utf8);
//   } catch (err) {
//     console.error("Decryption error:", err);
//   }
// };
// // Encrypt
// const encryptMessage = (plainText: string) => {
//   try {
//     const ENCRYPTION_KEY: any = process.env.ENCRYPTION_KEY; // Store securely in secure storage
//     return CryptoJS.AES.encrypt(plainText, ENCRYPTION_KEY).toString();
//   } catch (err) {
//     console.log("Encryption error:", err);
//   }
// };
const crypto_1 = __importDefault(require("crypto"));
const algorithm = 'aes-256-cbc'; // AES encryption algorithm
const masterKey = process.env.ENCRYPTION_KEY; // 32 bytes for aes-256
const iv = crypto_1.default.randomBytes(16); // Initialization vector
// Encrypt
function encrypt(text) {
    const cipher = crypto_1.default.createCipheriv(algorithm, masterKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Return iv + encrypted data (needed for decryption)
    // console.log(iv.toString('hex') + ':' + encrypted);
    return iv.toString('hex') + ':' + encrypted;
}
// Decrypt
function decrypt(encryptedText) {
    const [ivHex, encrypted] = encryptedText.split(':');
    const ivBuffer = Buffer.from(ivHex, 'hex');
    const decipher = crypto_1.default.createDecipheriv(algorithm, masterKey, ivBuffer);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    // console.log("decrypted", decrypted);
    return decrypted;
}
const generate_timestamp_In_seconds = () => {
    return Math.floor(new Date().getTime() / 1000);
};
exports.generate_timestamp_In_seconds = generate_timestamp_In_seconds;
const all_participant_seen_msg = async (data) => {
    try {
        const { roomId, userId, messageId } = data;
        let obj = {
            roomId: roomId,
            senderId: { $ne: userId },
            seen_details: { $exists: true, $type: "array" }
        };
        if (messageId && messageId != '' && messageId != undefined) {
            obj.uniqueId = messageId;
        }
        // Now update read_status for messages where all participants have seen the message
        await chat_message_1.default.updateMany(obj, [
            {
                $set: {
                    read_status: {
                        $cond: [
                            {
                                $eq: [
                                    {
                                        $size: {
                                            $filter: {
                                                input: { $ifNull: ["$seen_details", []] }, // ✅ Ensure array
                                                cond: { $eq: ["$$this.status", "seen"] }
                                            }
                                        }
                                    },
                                    { $size: "$seen_details" }
                                ]
                            },
                            true,
                            false
                        ]
                    }
                }
            }
        ]);
        console.log("all_participant_seen_msg");
    }
    catch (err) {
        console.log("all_participant_seen_msg :", err);
    }
};
exports.all_participant_seen_msg = all_participant_seen_msg;
const update_msg_status = async (data) => {
    try {
        const { messageId, roomId, seenBy, send_timeStamp } = data; // messageId is uniqueId
        const userId = seenBy;
        const updateResult = await chat_message_1.default.updateOne({
            roomId: roomId,
            uniqueId: messageId,
            senderId: { $ne: userId },
            // "seen_details.participantId": id,  // array element exists
            seen_details: {
                $elemMatch: {
                    participantId: userId,
                    status: { $ne: "seen" }
                }
            }
        }, {
            $set: {
                "seen_details.$.status": "seen",
                "seen_details.$.seen_timeStamp": send_timeStamp,
            },
        });
        if (updateResult.matchedCount === 0) {
            await chat_message_1.default.updateMany({
                roomId: roomId,
                uniqueId: messageId,
                senderId: { $ne: userId },
                "seen_details.participantId": { $ne: userId }, // no existing entry
            }, {
                $push: {
                    seen_details: {
                        participantId: userId,
                        status: "seen",
                        seen_timeStamp: send_timeStamp,
                    },
                },
            });
        }
        await all_participant_seen_msg({ roomId: roomId, userId: userId, messageId: messageId });
        console.log("Message status updated successfully");
        // const update_msg_status_seen = await chat_room_messageModel.updateOne({
        //     uniqueId: messageId, roomId: roomId, senderId: { $ne: id },
        //     seen_details: {
        //         $elemMatch: {
        //             participantId: id,
        //             status: { $ne: "seen" }
        //         }
        //     }
        // }, {
        //     $set: {
        //         "seen_details.$.status": "seen",
        //         "seen_details.$.seen_timeStamp": generate_timestamp_In_seconds()
        //     }
        // })
    }
    catch (err) {
        console.log("Message status update error:", err);
    }
};
exports.update_msg_status = update_msg_status;
const left_all_rooms = async (data) => {
    try {
        const { userId } = data;
        // Step 1: Find all rooms where deleted user was a participant
        const rooms = await participants_1.default.find({ participantId: data.userId, isDelete: false }, { roomId: 1 }).lean();
        await delete_user_all_data(userId);
        if (!rooms.length)
            return;
        const roomIds = rooms.map(r => r.roomId);
        // Step 2: Find all other participants in those rooms
        const otherParticipants = await participants_1.default.find({
            roomId: { $in: roomIds },
            participantId: { $ne: data.userId },
            isDelete: false
        }, { participantId: 1 }).lean();
        const participantIds = [...new Set(otherParticipants.map((p) => p.participantId))];
        if (!participantIds.length)
            return;
        // Step 3: Find their active socket connections
        const usersWithSockets = await dynamic_room_1.default.aggregate([
            {
                $match: {
                    joinedBy: { $in: participantIds },
                    roomId: { $ne: null },
                    // isActive: true
                }
            },
            {
                $project: {
                    roomId: 1
                }
            },
            {
                $lookup: {
                    foreignField: "roomId",
                    localField: "uniqueId",
                    from: "chat_rooms",
                    as: "roomDetails",
                    pipeline: [
                        {
                            $match: {
                                isDelete: false
                            }
                        },
                        {
                            $project: {
                                name: 1,
                                isGroup: 1
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$roomDetails"
            }
        ]);
        let arr = [];
        await dynamic_room_1.default.deleteMany({ roomId: { $in: roomIds }, joinedBy: userId });
        if (usersWithSockets.length) {
            for (let u of usersWithSockets) {
                const emit_details = {
                    "roomId": u.roomId,
                    "leftTo_name": data.name,
                    "leftBy_name": 'admin',
                    "roomName": u.roomDetails.isGroup == true ? u.roomDetails.name : data.name,
                    "actionId": data.userId,
                    "leftBy_role": 'admin',
                    "message": "Left the room",
                    "senderId": data.userId,
                    "sender_name": data.name,
                    "messageType": "left", // text,image,video,voice, doc, sticker
                    "send_timeStamp": generate_timestamp_In_seconds() // In seconds
                };
                arr.push(emit_details);
            }
            if (arr.length) {
                await (0, index_1.notify_to_connected_users)(arr);
            }
            ;
        }
        console.log("Left all rooms for user from admin:", userId);
    }
    catch (err) {
        console.error("Error in left_all_rooms:", err);
    }
};
exports.left_all_rooms = left_all_rooms;
const delete_user_all_data = async (userId) => {
    try {
        const user_rooms = await participants_1.default.find({ participantId: userId, isDelete: false });
        if (user_rooms) {
            for (const room of user_rooms) {
                if (room.addBy == userId && room.isGroup == true) {
                    await chat_message_1.default.deleteMany({ roomId: room.roomId });
                    await participants_1.default.deleteMany({ roomId: room.roomId });
                    await room_1.default.deleteOne({ uniqueId: room.roomId });
                    await (0, multer_1.deleteGroupFolder)(`group-chat-assets/${room.roomId}`);
                }
                else if (room.addBy != userId && room.isGroup === true) {
                    await participants_1.default.deleteOne({ participantId: userId });
                }
                else {
                    await chat_message_1.default.deleteMany({ roomId: room.roomId });
                    await participants_1.default.deleteMany({ roomId: room.roomId, isGroup: false });
                    await room_1.default.deleteOne({ uniqueId: room.roomId, isGroup: false });
                    await (0, multer_1.deleteGroupFolder)(`single-chat-assets/${room.roomId}`);
                }
            }
        }
    }
    catch (err) {
        console.log("Errors : ", err);
        throw err;
    }
};
exports.delete_user_all_data = delete_user_all_data;
const added_user_to_room = async (data) => {
    try {
        if (data.length) {
            var array = [];
            const senderId = data[0].senderId;
            var sender_name1 = '';
            const senderDetails = await user_1.default.findOne({ _id: senderId }, { name: 1 });
            if (senderDetails) {
                sender_name1 = senderDetails.name;
            }
        }
        for (let item of data) {
            item.addedTo_name = '';
            item.sender_name = sender_name1;
            const participantDetails = await user_1.default.findOne({ _id: item.actionId }, { name: 1 });
            if (participantDetails) {
                item.addedTo_name = participantDetails.name;
            }
            array.push(item);
        }
        if (array.length) {
            await (0, index_1.notify_to_connected_users)(array);
        }
    }
    catch (err) {
        console.log("Error in added/removed_user_to_room:", err);
    }
};
exports.added_user_to_room = added_user_to_room;
