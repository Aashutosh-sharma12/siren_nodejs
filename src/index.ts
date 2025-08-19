import "./pre-start"; // Must be the first import
// import { loadEnv } from "./loadEnv";
// loadEnv();
import { socket_connection } from "@utils/socket";
import server from "./server";
import { chat_room_messageModel } from "@models/index";
const { createServer } = require("http");
const { Server } = require("socket.io");
// Constants
const serverStartMsg = "Express server started on port: ",
  port = process.env.PORT || 3000;

const httpServer = createServer(server);
// Start server
httpServer.listen(port, (req: any, res: any) => {
  console.log(serverStartMsg + port);
});

const io: any = new Server(httpServer, {
  cors: {
    origin: "*",
  },
  pingTimeout: 60000,
  // transport: "polling",
  transports: ["polling", "websocket"], // better than just "polling"
});

var events = require("events");
const eventEmitter = new events.EventEmitter();
const nsp = io.of(`${process.env.ChannelName}`)

export const notify_to_connected_users = async (data: any) => {
  try {
    for (let u of data) {
      await chat_room_messageModel.create(u);
      nsp.to(u.roomId).emit('user_notification', u);
      console.log("Notification sent to user:", u);
    }
  } catch (err) {
    console.error("Error notifying connected users:", err);
  }
};
// export = {
//   io: io,
//   notify_to_connected_users
// };

setTimeout(() => {
  socket_connection(io, eventEmitter);
}, 10);