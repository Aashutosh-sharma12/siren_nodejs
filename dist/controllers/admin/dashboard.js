"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = __importDefault(require("../../models/user"));
const dayjs_1 = __importDefault(require("dayjs"));
function dashboardCount(query, headers) {
    return new Promise(async (resolve, reject) => {
        try {
            const todayDate = (0, dayjs_1.default)().format('YYYY-MM-DD');
            let obj = { isDelete: false };
            let obj_loggedIn = { isDelete: false, isActive: true, onlineStatus: true };
            let obj_Blocked = { isDelete: false, loginKey: 2 };
            let obj_Unblocked = { isDelete: false, loginKey: { $in: [0, 1] } };
            let obj_subscribed = { isDelete: false };
            const Bucket_Base_Url = process.env.Bucket_Base_Url;
            const [user, logged_InUser, blocked, unblocked, subScribed, latestRegistered_List] = await Promise.all([
                user_1.default.countDocuments(obj),
                user_1.default.countDocuments(obj_loggedIn),
                user_1.default.countDocuments(obj_Blocked),
                user_1.default.countDocuments(obj_Unblocked),
                // userModel.countDocuments(obj_subscribed),
                user_1.default.aggregate([
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
                user_1.default.aggregate([{ $match: { isDelete: false } }, { $sort: { createdAt: -1 } }, { $limit: 10 }, { $project: { password1: 0, password2: 0 } }])
            ]);
            resolve({ userCount: user, loggedInUserCount: logged_InUser, blockedUserCount: blocked, unblockedUserCount: unblocked, subscribedUserCount: subScribed.length ? subScribed[0].totalCount : 0, latestRegistered_List: latestRegistered_List, baseUrl: Bucket_Base_Url });
        }
        catch (error) {
            reject(error);
        }
    });
}
exports.default = {
    dashboardCount
};
