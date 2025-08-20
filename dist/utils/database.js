"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnect = exports.connect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
let database;
const connect = () => {
    // add your own uri below
    const uri = process.env.MONGO_URI || '';
    if (database) {
        return;
    }
    // Set strictQuery to false to suppress the warning
    mongoose_1.default.set('strictQuery', false);
    mongoose_1.default.connect(uri);
    database = mongoose_1.default.connection;
    database.once("open", async () => {
        console.log("MONGODB DATABASE CONNECTED");
        // Fetch all replicaSet list 
        // const db: any = Mongoose.connection.db;
        // try {
        //   const status = await db.admin().command({ replSetGetStatus: 1 });
        //   console.log("🔹 Replica Set Members:", status.members.map((m: any) => ({
        //     host: m.name,
        //     state: m.stateStr
        //   })), status);
        // } catch (error: any) {
        //   if (error.code === 94) {
        //     console.log("⚠️ This MongoDB instance is NOT part of a replica set.");
        //   } else {
        //     console.error("❌ Error fetching replica set status:", error);
        //   }
        // }
    });
    // If the connection throws an error
    database.on("error", function (err) {
        console.error('Failed to connect to DB on startup ', err);
    });
    // When the connection is disconnected
    database.on('disconnected', function () {
        console.log('Mongoose default connection to DB disconnected');
    });
    //   var gracefulExit = function () {
    //     database.close(function (err: any) {
    //       if (err) {
    //         console.error('Error during disconnection', err);
    //       } else {
    //         console.log('Mongoose default connection with DB is disconnected through app termination');
    //       }
    //       process.exit(0);
    //     });
    //   };
    //   // If the Node process ends, close the Mongoose connection
    //   process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);
};
exports.connect = connect;
const disconnect = () => {
    if (!database) {
        return;
    }
    mongoose_1.default.disconnect();
};
exports.disconnect = disconnect;
