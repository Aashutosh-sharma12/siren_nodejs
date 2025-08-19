import { subscriptionModel, user_subscriptionModel } from "@models/index";
import { identityGenerator } from "@utils/helpers";
import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import dayjs from "dayjs";
const { OK, CREATED } = StatusCodes;
const sub_list = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { page = 1, perPage = 10 } = req.query;
        const { id } = req.user;
        let cond = {
            isActive: true,
            isDelete: false
        }
        const todayDate = dayjs().format('YYYY-MM-DD');
        const [list, count] = await Promise.all([
            subscriptionModel.aggregate([
                { $match: cond },
                {
                    $lookup: {
                        from: "user_subscriptions",
                        localField: "uniqueId",
                        foreignField: "subscription_details.subId",
                        as: "user_subscriptions",
                        pipeline: [
                            { $match: { userId: new mongoose.Types.ObjectId(id), status: 'active', endDate: { $gte: todayDate } } },
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
            subscriptionModel.countDocuments(cond)
        ]);
        res.status(OK).json({ data: { list, count }, code: OK });
    } catch (err) {
        next(err);
    }
}

const user_sub_list = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { page = 1, perPage = 10 } = req.query;
        const { id } = req.user;
        let cond = {
            userId: id,
            status: { $ne: 'pending' }
        }
        const [list, count] = await Promise.all([
            user_subscriptionModel.find(cond)
                .skip((Number(page) - 1) * Number(perPage))
                .limit(Number(perPage))
                .sort({ createdAt: -1 }),
            user_subscriptionModel.countDocuments(cond)
        ]);
        res.status(OK).json({ data: { list, count }, code: OK });
    } catch (err) {
        next(err);
    }
}

const purchase_subscription = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.user;
        console.log(id)
        const { userId, subscription_details, startDate, endDate, start_timeStamp, end_timeStamp } = req.body;
        const newSubscription = {
            uniqueId: identityGenerator('user_subscription', await user_subscriptionModel.countDocuments({ "userId": userId })),
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
            const today = dayjs();
            const todayStart = today.startOf('day'); // start of day
            const month = today.add(number, unit);
            newSubscription.startDate = dayjs(todayStart).format('YYYY-MM-DD');
            newSubscription.endDate = dayjs(month).format('YYYY-MM-DD');
            newSubscription.start_timeStamp = Math.floor((todayStart.valueOf()) / 1000);
            newSubscription.end_timeStamp = Math.floor((month.endOf('day').valueOf()) / 1000);
        }

        const savedSubscription = await user_subscriptionModel.create(newSubscription);
        res.status(CREATED).json({ data: savedSubscription, code: CREATED });
    } catch (err) {
        next(err);
    }
}

export default {
    sub_list,
    user_sub_list,
    purchase_subscription
} as const;