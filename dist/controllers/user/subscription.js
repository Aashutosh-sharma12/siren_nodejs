"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../models/index");
const helpers_1 = require("../../utils/helpers");
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = __importDefault(require("mongoose"));
const dayjs_1 = __importDefault(require("dayjs"));
const { OK, CREATED } = http_status_codes_1.StatusCodes;
const sub_list = async (req, res, next) => {
    try {
        const { page = 1, perPage = 10 } = req.query;
        const { id } = req.user;
        let cond = {
            isActive: true,
            isDelete: false
        };
        const todayDate = (0, dayjs_1.default)().format('YYYY-MM-DD');
        const [list, count] = await Promise.all([
            index_1.subscriptionModel.aggregate([
                { $match: cond },
                {
                    $lookup: {
                        from: "user_subscriptions",
                        localField: "uniqueId",
                        foreignField: "subscription_details.subId",
                        as: "user_subscriptions",
                        pipeline: [
                            { $match: { userId: new mongoose_1.default.Types.ObjectId(id), status: 'active', endDate: { $gte: todayDate } } },
                            { $project: { userId: 1, startDate: 1, endDate: 1, status: 1 } },
                            {
                                $limit: 1 // Limit to the latest subscription
                            }
                        ]
                    }
                },
                {
                    $project: {
                        uniqueId: 1,
                        title: 1,
                        features: 1,
                        amount: 1,
                        currency: 1,
                        subscriptionType: 1,
                        isActive: 1,
                        isDelete: 1,
                        createdAt: 1,
                        user_subscription: {
                            $cond: {
                                if: { $gt: [{ $size: "$user_subscriptions" }, 0] },
                                then: true,
                                else: false
                            }
                        }
                    }
                },
                { $sort: { createdAt: -1 } },
                { $skip: (Number(page) - 1) * Number(perPage) },
                { $limit: Number(perPage) }
            ]),
            index_1.subscriptionModel.countDocuments(cond)
        ]);
        res.status(OK).json({ data: { list, count }, code: OK });
    }
    catch (err) {
        next(err);
    }
};
const user_sub_list = async (req, res, next) => {
    try {
        const { page = 1, perPage = 10 } = req.query;
        const { id } = req.user;
        let cond = {
            userId: id,
            status: { $ne: 'pending' }
        };
        const [list, count] = await Promise.all([
            index_1.user_subscriptionModel.find(cond)
                .skip((Number(page) - 1) * Number(perPage))
                .limit(Number(perPage))
                .sort({ createdAt: -1 }),
            index_1.user_subscriptionModel.countDocuments(cond)
        ]);
        res.status(OK).json({ data: { list, count }, code: OK });
    }
    catch (err) {
        next(err);
    }
};
const purchase_subscription = async (req, res, next) => {
    try {
        const { id } = req.user;
        console.log(id);
        const { userId, subscription_details, startDate, endDate, start_timeStamp, end_timeStamp } = req.body;
        const newSubscription = {
            uniqueId: (0, helpers_1.identityGenerator)('user_subscription', await index_1.user_subscriptionModel.countDocuments({ "userId": userId })),
            userId,
            subscription_details,
            startDate,
            endDate,
            start_timeStamp,
            end_timeStamp,
            status: "active"
        };
        if (subscription_details.subscriptionType) {
            // Last month, last 6 months, last year
            const number = subscription_details.subscriptionType === 'monthly' ? 1 : subscription_details.subscriptionType === '6-months' ? 6 : 1;
            const unit = subscription_details.subscriptionType === 'monthly' ? 'month' : subscription_details.subscriptionType === '6-months' ? "month" : 'year';
            const today = (0, dayjs_1.default)();
            const todayStart = today.startOf('day'); // start of day
            const month = today.add(number, unit);
            newSubscription.startDate = (0, dayjs_1.default)(todayStart).format('YYYY-MM-DD');
            newSubscription.endDate = (0, dayjs_1.default)(month).format('YYYY-MM-DD');
            newSubscription.start_timeStamp = Math.floor((todayStart.valueOf()) / 1000);
            newSubscription.end_timeStamp = Math.floor((month.endOf('day').valueOf()) / 1000);
        }
        const savedSubscription = await index_1.user_subscriptionModel.create(newSubscription);
        res.status(CREATED).json({ data: savedSubscription, code: CREATED });
    }
    catch (err) {
        next(err);
    }
};
exports.default = {
    sub_list,
    user_sub_list,
    purchase_subscription
};
