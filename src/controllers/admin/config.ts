import adminModal from "@models/admin";


async function saveLogoutSessionORPanicTime(userId: any, body: any, headers: any): Promise<any> {
    try {
        const { logoutSession, panicDay = 0, panicHour = 0, panicMinute = 0 } = body;
        if (logoutSession) {
            const savedValue = await adminModal.findOneAndUpdate(
                { _id: userId },
                { logoutSession: logoutSession },
                { new: true, upsert: true }
            ).select({ password: 0, token: 0 })
            return (savedValue)
        } else {
            const totalSeconds = (panicDay * 24 * 60 * 60) + (panicHour * 60 * 60) + (panicMinute * 60);
            body.totalSeconds = totalSeconds;
            const savedValue = await adminModal.findOneAndUpdate(
                { _id: userId },
                { panicTime: body },
                { new: true, upsert: true }
            ).select({ password: 0, token: 0 })
            return (savedValue);
        }
    } catch (error) {
        throw error;
    }
}


async function getLastAddedValue(userId: any, query: any, headers: any): Promise<any> {
    try {
        const data = await adminModal.findOne({ _id: userId }).select({ password: 0, token: 0 })
        return (data)
    } catch (error) {
        throw error;
    }
}

export default {
    saveLogoutSessionORPanicTime,
    getLastAddedValue
} as const;
