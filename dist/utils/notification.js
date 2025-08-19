"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeToTopic = subscribeToTopic;
exports.sendNotificationToTopic = sendNotificationToTopic;
exports.sendNotificationToSpecificDevice = sendNotificationToSpecificDevice;
exports.unsubscribeFromTopic = unsubscribeFromTopic;
exports.sendMsg_notification = sendMsg_notification;
const admin = __importStar(require("firebase-admin"));
const path = __importStar(require("path"));
// Path to your service account JSON file
const serviceAccountPath = path.resolve(__dirname, "../../hiastro-25210-firebase-adminsdk-fbsvc-641621cdd9.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
});
async function subscribeToTopic(devideToken, topics) {
    try {
        topics.forEach(async (topic) => {
            const response = await admin.messaging().subscribeToTopic(devideToken, topic);
            console.log("Successfully subscribed:", response);
        });
    }
    catch (error) {
        console.error("Error subscribing to topic:", error);
    }
}
// Function to unsubscribe from a topic
async function unsubscribeFromTopic(deviceToken, topic) {
    try {
        const response = await admin.messaging().unsubscribeFromTopic(deviceToken, topic);
        console.log(`Successfully unsubscribed from topic "${topic}":`, response);
    }
    catch (error) {
        console.error(`Error unsubscribing from topic "${topic}":`, error);
    }
}
async function sendNotificationToTopic(topic, messageObj) {
    const message = {
        notification: {
            title: messageObj.title,
            body: messageObj.body,
        },
        // android: { priority: "high" }, // Priority for Android
        // apns: { headers: { "apns-priority": "10" } }, // Priority for iOS
        topic: topic, // Subscribe Topic
    };
    try {
        const response = await admin.messaging().send(message);
        console.log("Successfully sent message:", response);
    }
    catch (error) {
        console.error("Error sending message:", error);
    }
}
// Function to send notification
async function sendNotificationToSpecificDevice(notificationObj) {
    try {
        const { userId, status, role, title, body, token } = notificationObj;
        const message = {
            notification: {
                title: title,
                body: body,
            },
            data: {
            // orderId: (notificationObj.bookingId).toString() || '',
            // sendTo: notificationObj.sendTo || ''
            },
            token: token, // FCM device token
        };
        console.log(message, "message", notificationObj);
        const response = await admin.messaging().send(message);
        console.log('Notification sent successfully:', response);
    }
    catch (error) {
        console.error('Error sending notification:', error);
    }
}
async function sendMsg_notification(notificationObj) {
    try {
        console.log("notificationObj", notificationObj);
        const response = await admin.messaging().send(notificationObj);
        console.log('Notification sent successfully:', response);
    }
    catch (error) {
        console.error('Error sending notification:', error);
    }
}
