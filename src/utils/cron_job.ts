import { adminModal, sessionModel, userModel } from '@models/index';
import cron from 'node-cron';
import { generate_timestamp_In_seconds } from './helpers';

/**
 * This cron job runs every minute to check for users who need to be unblocked
 * based on the panic time and logout session settings.
 */
cron.schedule('* * * * *', async () => {
    try {
        // Your cron job logic here
        console.log('Cron job executed at every minute');
        const current_timeStamp_in_seconds = generate_timestamp_In_seconds();
        const panic_details = await adminModal.findOne({ isDelete: false }, { panicTime: 1, logoutSession: 1 });
        if (panic_details) {
            if (panic_details?.panicTime?.totalSeconds > 0) {
                const { totalSeconds } = panic_details.panicTime;
                const unblocked_TimeStamp = current_timeStamp_in_seconds - totalSeconds;
                const list = await userModel.find({ isDelete: false, loginKey: 2, blocked_TimeStamp: { $lte: unblocked_TimeStamp } }, { name: 1 });
                if (list.length) {
                    const details = await userModel.updateMany({ isDelete: false, loginKey: 2, blocked_TimeStamp: { $lte: unblocked_TimeStamp } }, { loginKey: 1, blocked_TimeStamp: 0, onlineStatus: false });
                    console.log('Unblocked Users:', details);
                    for (const user of list) {
                        await sessionModel.deleteMany({ userId: user._id });
                        console.log('Deleted Sessions for User:', user.name);
                    }
                }
            }
            if (panic_details?.logoutSession > 0) {
                const logoutSession = panic_details.logoutSession;
                const logout_TimeStamp = current_timeStamp_in_seconds - Number(logoutSession) * 60; // Convert minutes to seconds
                const list = await userModel.find({ isDelete: false, onlineStatus: true, loginTimeStamp: { $lte: logout_TimeStamp } }, { name: 1 });
                if (list.length) {
                    const details = await userModel.updateMany({ isDelete: false, onlineStatus: true, loginTimeStamp: { $lte: logout_TimeStamp } }, { onlineStatus: false });
                    console.log('Unblocked Users:', details);
                    for (const user of list) {
                        await sessionModel.deleteMany({ userId: user._id });
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error executing cron job:', error);
    }
});