import userModel from "@models/user"
import dayjs from "dayjs";


function dashboardCount(query: any, headers: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
        try {
            const todayDate = dayjs().format('YYYY-MM-DD');
            let obj: any = { isDelete: false }
            let obj_loggedIn: any = { isDelete: false, onlineStatus: true }
            let obj_Blocked: any = { isDelete: false, loginKey: 2 }
            let obj_Unblocked: any = { isDelete: false, loginKey: { $in: [0, 1] } }
            let obj_subscribed: any = { isDelete: false }
            const Bucket_Base_Url = process.env.Bucket_Base_Url
            const [user, logged_InUser, blocked, unblocked, subScribed, latestRegistered_List] = await Promise.all([
                userModel.countDocuments(obj),
                userModel.countDocuments(obj_loggedIn),
                userModel.countDocuments(obj_Blocked),
                userModel.countDocuments(obj_Unblocked),
                // userModel.countDocuments(obj_subscribed),
                userModel.aggregate([
                    {
                        $match: obj_subscribed
                    },
                    {
                        $lookup: {
                            from: "user_subscriptions",
                            localField: "_id",
                            foreignField: "userId",
                            as: "subscription_details",
                            pipeline: [
                                {
                                    $match: {
                                        status: 'active',
                                        endDate: { $gte: todayDate }
                                    }
                                },
                                {
                                    $limit: 1
                                }
                            ]
                        }
                    },
                    {
                        $match: {
                            subscription_details: { $ne: [] }
                        }
                    },
                    {
                        $count: "totalCount"
                    }
                ]),
                userModel.aggregate([{ $match: { isDelete: false } }, { $sort: { createdAt: -1 } }, { $limit: 10 }, { $project: { password1: 0, password2: 0 } }])
            ])
            resolve({ userCount: user, loggedInUserCount: logged_InUser, blockedUserCount: blocked, unblockedUserCount: unblocked, subscribedUserCount: subScribed.length ? subScribed[0].totalCount : 0, latestRegistered_List: latestRegistered_List, baseUrl: Bucket_Base_Url })
        } catch (error) {
            reject(error)
        }
    })
}

export default {
    dashboardCount
} as const;