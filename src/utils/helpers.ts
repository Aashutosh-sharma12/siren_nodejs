const jwt = require("jsonwebtoken");
import otpGenerator from 'otp-generator'
import axios from 'axios';
import CryptoJS from 'crypto-js';
import chat_room_messageModel from '@models/chat_message';
import chat_room_participantModel from '@models/participants';
import dynamic_roomModel from '@models/dynamic_room';
import { notify_to_connected_users } from '../index';
import chat_roomModel from '@models/room';
import { deleteGroupFolder } from './multer';
import userModel from '@models/user';

function generate_refreshToken(userId: string, role: string, usingPasswordKey: number, loginKey_status: number) {
  const refreshToken = jwt.sign(
    { id: userId, role: role, usingPasswordKey: usingPasswordKey, loginKey_status: loginKey_status },
    process.env.JWT_SECRET_TOKEN,
    {
      expiresIn: process.env.refreshToken_expire_time,
    }
  );
  return refreshToken;
}

function generate_accessToken(userId: string, role: string, usingPasswordKey: number, loginKey_status: number) {
  const accessToken = jwt.sign(
    { id: userId, role: role, usingPasswordKey: usingPasswordKey, loginKey_status: loginKey_status },
    process.env.JWT_SECRET_TOKEN,
    {
      expiresIn: process.env.accessToken_expire_time,
    }
  );
  return accessToken;
}

function identityGenerator(role: string, count: number) {
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
  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false
  });
  return otp;
}

async function fetchFile(url: string): Promise<Buffer> {
  const response = await axios.get(url, {
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
import crypto from 'crypto';
const algorithm: any = 'aes-256-cbc'; // AES encryption algorithm
const masterKey: any = process.env.ENCRYPTION_KEY; // 32 bytes for aes-256
const iv: any = crypto.randomBytes(16); // Initialization vector
// Encrypt
function encrypt(text: any) {
  const cipher = crypto.createCipheriv(algorithm, masterKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  // Return iv + encrypted data (needed for decryption)
  // console.log(iv.toString('hex') + ':' + encrypted);
  return iv.toString('hex') + ':' + encrypted;
}
// Decrypt
function decrypt(encryptedText: any) {
  const [ivHex, encrypted] = encryptedText.split(':');
  const ivBuffer = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, masterKey, ivBuffer);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  // console.log("decrypted", decrypted);
  return decrypted;
}

const generate_timestamp_In_seconds = () => {
  return Math.floor(new Date().getTime() / 1000);
};

const all_participant_seen_msg = async (data: any) => {
  try {
    const { roomId, userId, messageId } = data;
    let obj: any = {
      roomId: roomId,
      senderId: { $ne: userId },
      seen_details: { $exists: true, $type: "array" }
    }
    if (messageId && messageId != '' && messageId != undefined) {
      obj.uniqueId = messageId
    }
    // Now update read_status for messages where all participants have seen the message
    await chat_room_messageModel.updateMany(
      obj,
      [
        {
          $set: {
            readStatus: {
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
      ]
    );
    console.log("all_participant_seen_msg");
    return true;
  } catch (err) {
    console.log("all_participant_seen_msg :", err);
  }
}

const update_msg_status = async (data: any) => {
  try {
    const { messageId, roomId, seenBy, send_timeStamp } = data; // messageId is uniqueId
    const userId = seenBy;
    const updateResult = await chat_room_messageModel.updateOne(
      {
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
      },
      {
        $set: {
          "seen_details.$.status": "seen",
          "seen_details.$.seen_timeStamp": send_timeStamp,
        },
      }
    );
    if (updateResult.matchedCount === 0) {
      await chat_room_messageModel.updateMany(
        {
          roomId: roomId,
          uniqueId: messageId,
          senderId: { $ne: userId },
          "seen_details.participantId": { $ne: userId },  // no existing entry
        },
        {
          $push: {
            seen_details: {
              participantId: userId,
              status: "seen",
              seen_timeStamp: send_timeStamp,
            },
          },
        }
      );
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
  } catch (err) {
    console.log("Message status update error:", err)
  }
}

const left_all_rooms = async (data: any) => {
  try {
    const { userId } = data;
    // Step 1: Find all rooms where deleted user was a participant
    const rooms = await chat_room_participantModel.find(
      { participantId: data.userId, isDelete: false },
      { roomId: 1 }
    ).lean();
    if (!rooms.length) return;

    const roomIds = rooms.map(r => r.roomId);

    // Step 2: Find their active socket connections
    const usersWithSockets = await dynamic_roomModel.aggregate([
      {
        $match: {
          // joinedBy: { $in: participantIds },
          roomId: { $ne: roomIds },
          joinedBy: { $ne: userId },
          isActive: true
        }
      },
      {
        $project: {
          roomId: 1
        }
      },
      {
        $lookup: {
          foreignField: "uniqueId",
          localField: "roomId",
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
    let arr = []
    await dynamic_roomModel.deleteMany({ roomId: { $in: roomIds }, joinedBy: userId });
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
        }
        arr.push(emit_details);
      }
      if (arr.length) {
        await notify_to_connected_users(arr);
      };
    }
    await delete_user_all_data(userId);
    console.log("Left all rooms for user from admin:", userId);
  } catch (err) {
    console.error("Error in left_all_rooms:", err);
  }
}

const delete_user_all_data = async (userId: string) => {
  try {
    const user_rooms = await chat_room_participantModel.find({ participantId: userId, isDelete: false });
    if (user_rooms) {
      for (const room of user_rooms) {
        if (room.addBy == userId && room.isGroup == true) {
          await chat_room_messageModel.deleteMany({ roomId: room.roomId });
          await chat_room_participantModel.deleteMany({ roomId: room.roomId });
          await chat_roomModel.deleteOne({ uniqueId: room.roomId });
          await deleteGroupFolder(`group-chat-assets/${room.roomId}`);
        } else if (room.addBy != userId && room.isGroup === true) {
          await chat_room_participantModel.deleteOne({ participantId: userId });
        } if (room.addBy == userId && room.isGroup == false) {
          await chat_room_messageModel.deleteMany({ roomId: room.roomId });
          await chat_room_participantModel.deleteMany({ roomId: room.roomId });
          await chat_roomModel.deleteOne({ uniqueId: room.roomId });
          await deleteGroupFolder(`group-chat-assets/${room.roomId}`);
        } else {
          await chat_room_messageModel.deleteMany({ roomId: room.roomId });
          await chat_room_participantModel.deleteMany({ roomId: room.roomId, isGroup: false });
          await chat_roomModel.deleteOne({ uniqueId: room.roomId, isGroup: false });
          await deleteGroupFolder(`single-chat-assets/${room.roomId}`);
        }
      }
    }
  } catch (err) {
    console.log("Errors : ", err);
    throw err;
  }
}

const added_user_to_room = async (data: any) => {
  try {
    if (data.length) {
      var array: any = [];
      const senderId = data[0].senderId;
      var sender_name1: any = ''
      const senderDetails = await userModel.findOne({ _id: senderId }, { name: 1 });
      if (senderDetails) {
        sender_name1 = senderDetails.name;
      }
    }
    for (let item of data) {
      item.addedTo_name = ''
      item.sender_name = sender_name1
      const participantDetails = await userModel.findOne({ _id: item.actionId }, { name: 1 });
      if (participantDetails) {
        item.addedTo_name = participantDetails.name;
      }
      array.push(item)
    }
    if (array.length) {
      await notify_to_connected_users(array)
    }

  } catch (err) {
    console.log("Error in added/removed_user_to_room:", err);
  }
}

const offline_online_all_rooms = async (data: any) => {
  try {
    const { userId, status } = data;
    // Step 1: Find all rooms where deleted user was a participant
    const rooms = await chat_room_participantModel.find(
      { participantId: data.userId, isDelete: false },
      { roomId: 1 }
    ).lean();
    if (!rooms.length) return;

    const roomIds = rooms.map(r => r.roomId);
    console.log("rooms", roomIds)

    // // Step 2: Find all other participants in those rooms
    // const otherParticipants = await chat_room_participantModel.find(
    //   {
    //     roomId: { $in: roomIds },
    //     participantId: { $ne: data.userId },
    //     isDelete: false
    //   },
    //   { participantId: 1 }
    // ).lean();

    // const participantIds = [...new Set(otherParticipants.map((p: any) => p.participantId))];
    // console.log("participantIds", participantIds);

    // if (!participantIds.length) return;

    // Step 3: Find their active socket connections
    const usersWithSockets = await dynamic_roomModel.aggregate([
      {
        $match: {
          // joinedBy: { $in: participantIds },
          roomId: { $in: roomIds },
          joinedBy: { $ne: userId },
          isActive: true
        }
      },
      {
        $project: {
          roomId: 1
        }
      },
      {
        $lookup: {
          foreignField: "uniqueId",
          localField: "roomId",
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
    console.log("usersWithSockets ====>", usersWithSockets)
    let arr = []
    if (status == "offline") {
      await dynamic_roomModel.updateMany({ roomId: { $in: roomIds }, joinedBy: userId, isActive: true }, { isActive: false, last_online_timeStamp: generate_timestamp_In_seconds() });
    }
    if (usersWithSockets.length) {
      for (let u of usersWithSockets) {
        const emit_details = {
          "roomId": u.roomId,
          // "leftTo_name": data.name,
          // "leftBy_name": 'admin',
          // "roomName": u.roomDetails.isGroup == true ? u.roomDetails.name : data.name,
          // "actionId": data.userId,
          // "leftBy_role": 'admin',
          "message": status,
          "senderId": data.userId,
          "sender_name": data.name,
          "messageType": status == "online" ? "online" : "offline",
          "send_timeStamp": generate_timestamp_In_seconds() // In seconds
        }
        arr.push(emit_details);
      }
      if (arr.length) {
        await notify_to_connected_users(arr);
      };
    }
    console.log("Left all rooms for user from admin:", userId);
  } catch (err) {
    console.error("Error in left_all_rooms:", err);
  }
}

export {
  generate_refreshToken,
  generate_accessToken,
  identityGenerator,
  generateOtp,
  // decryptMessage,
  // encryptMessage,
  generate_timestamp_In_seconds,
  fetchFile,
  all_participant_seen_msg,
  update_msg_status,
  left_all_rooms,
  delete_user_all_data,
  added_user_to_room,
  encrypt,
  decrypt,
  offline_online_all_rooms
};