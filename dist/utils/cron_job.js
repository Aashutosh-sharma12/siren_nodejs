"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../models/index");
const node_cron_1 = __importDefault(require("node-cron"));
const helpers_1 = require("./helpers");
/**
 * This cron job runs every minute to check for users who need to be unblocked
 * based on the panic time and logout session settings.
 */
node_cron_1.default.schedule('* * * * *', async () => {
    try {
        // Your cron job logic here
        console.log('Cron job executed at every minute');
        const current_timeStamp_in_seconds = (0, helpers_1.generate_timestamp_In_seconds)();
        const panic_details = await index_1.adminModal.findOne({ isDelete: false }, { panicTime: 1, logoutSession: 1 });
        if (panic_details) {
            if (panic_details?.panicTime?.totalSeconds > 0) {
                const { totalSeconds } = panic_details.panicTime;
                const unblocked_TimeStamp = current_timeStamp_in_seconds - totalSeconds;
                const list = await index_1.userModel.find({ isDelete: false, loginKey: 2, blocked_TimeStamp: { $lte: unblocked_TimeStamp } }, { name: 1 });
                if (list.length) {
                    const details = await index_1.userModel.updateMany({ isDelete: false, loginKey: 2, blocked_TimeStamp: { $lte: unblocked_TimeStamp } }, { loginKey: 1, blocked_TimeStamp: 0, onlineStatus: false });
                    console.log('Unblocked Users:', details);
                    for (const user of list) {
                        await index_1.sessionModel.deleteMany({ userId: user._id });
                        console.log('Deleted Sessions for User:', user.name);
                    }
                }
            }
            if (panic_details?.logoutSession > 0) {
                const logoutSession = panic_details.logoutSession;
                const logout_TimeStamp = current_timeStamp_in_seconds - Number(logoutSession) * 60; // Convert minutes to seconds
                const list = await index_1.userModel.find({ isDelete: false, onlineStatus: true, loginTimeStamp: { $lte: logout_TimeStamp } }, { name: 1 });
                if (list.length) {
                    const details = await index_1.userModel.updateMany({ isDelete: false, onlineStatus: true, loginTimeStamp: { $lte: logout_TimeStamp } }, { onlineStatus: false });
                    console.log('Unblocked Users:', details);
                    for (const user of list) {
                        await index_1.sessionModel.deleteMany({ userId: user._id });
                    }
                }
            }
        }
    }
    catch (error) {
        console.error('Error executing cron job:', error);
    }
});
