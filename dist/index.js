"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notify_to_connected_users = void 0;
require("./pre-start"); // Must be the first import
// import { loadEnv } from "./loadEnv";
// loadEnv();
const socket_1 = require("./utils/socket");
const server_1 = __importDefault(require("./server"));
const index_1 = require("./models/index");
const { createServer } = require("http");
const { Server } = require("socket.io");
// Constants
const serverStartMsg = "Express server started on port: ", port = process.env.PORT || 3000;
const httpServer = createServer(server_1.default);
// Start server
httpServer.listen(port, (req, res) => {
    console.log(serverStartMsg + port);
});
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    },
    pingTimeout: 60000,
    // transport: "polling",
    transports: ["polling", "websocket"], // better than just "polling"
});
var events = require("events");
const eventEmitter = new events.EventEmitter();
const nsp = io.of(`${process.env.ChannelName}`);
const notify_to_connected_users = async (data) => {
    try {
        for (let u of data) {
            await index_1.chat_room_messageModel.create(u);
            nsp.to(u.roomId).emit('user_notification', u);
            console.log("Notification sent to user:", u);
        }
    }
    catch (err) {
        console.error("Error notifying connected users:", err);
    }
};
exports.notify_to_connected_users = notify_to_connected_users;
// export = {
//   io: io,
//   notify_to_connected_users
// };
setTimeout(() => {
    (0, socket_1.socket_connection)(io, eventEmitter);
}, 10);
