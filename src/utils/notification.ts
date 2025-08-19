import * as admin from "firebase-admin";
import { token } from "morgan";
import * as path from "path";

// Path to your service account JSON file
const serviceAccountPath = path.resolve(__dirname, "../../hiastro-25210-firebase-adminsdk-fbsvc-641621cdd9.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
});


async function subscribeToTopic(devideToken: any, topics: any) {
    try {
        topics.forEach(async (topic: any) => {
            const response = await admin.messaging().subscribeToTopic(devideToken, topic);
            console.log("Successfully subscribed:", response);
        })
    } catch (error) {
        console.error("Error subscribing to topic:", error);
    }
}

// Function to unsubscribe from a topic
async function unsubscribeFromTopic(deviceToken: any, topic: any) {
    try {
        const response = await admin.messaging().unsubscribeFromTopic(deviceToken, topic);
        console.log(`Successfully unsubscribed from topic "${topic}":`, response);
    } catch (error) {
        console.error(`Error unsubscribing from topic "${topic}":`, error);
    }
}

async function sendNotificationToTopic(topic: string, messageObj: any) {
    const message: any = {
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
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

interface notificationObj {
    userId: string,
    status: string,
    role: string,
    title: string,
    body: string,
    token: string,
    type: string
}
// Function to send notification
async function sendNotificationToSpecificDevice(notificationObj: notificationObj) {
    try {
        const { userId, status, role, title, body, token } = notificationObj
        const message: any = {
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
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

async function sendMsg_notification(notificationObj: any) {
    try {
        console.log("notificationObj", notificationObj);
        const response = await admin.messaging().send(notificationObj);
        console.log('Notification sent successfully:', response);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}
// const notificationObj = {
//     driverId: new mongoose.Types.ObjectId('67d161e10a73b11f2541fe51'),
//     bookingStatus: 'On The Way',
//     orderId: 'FHVOIDM6UF1WQ2111',
//     bookingId: new mongoose.Types.ObjectId('67dd41a3666f251a7526a3cf'),
//     language: 'en',
//     sendTo: 'driver',
//     role: 'company'

// }
// sendNotificationToSpecificDevice(notificationObj)
export {
    subscribeToTopic,
    sendNotificationToTopic,
    sendNotificationToSpecificDevice,
    unsubscribeFromTopic,
    sendMsg_notification
};