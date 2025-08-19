import messages from "@Custom_message/index";
import subscriptionModel from "@models/subscription";
import { CustomError } from "@utils/errors";
import { identityGenerator } from "@utils/helpers";
import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
const { CREATED, OK } = StatusCodes;
const add_subscription = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { title, amount, subscriptionType, features } = req.body;
        const lowe_title = title.toLowerCase();
        // Create new subscription
        const obj = {
            uniqueId: identityGenerator('subscription', await subscriptionModel.countDocuments()),
            title,
            lowe_title,
            amount,
            subscriptionType,
            features
        };
        const existingSubscription = await subscriptionModel.find({ $or: [{ lowe_title: lowe_title }, { subscriptionType: subscriptionType }], isDelete: false });
        if (existingSubscription.length) {
            throw new CustomError(messages.alreadyExist_subscription, StatusCodes.BAD_REQUEST);
        } else {
            const newSubscription = await subscriptionModel.create(obj);;
            return res.status(CREATED).json({ data: newSubscription, code: CREATED });
        }
    } catch (err) {
        console.error("Error adding subscription:", err);
        next(err);
    }
}

const edit_subscription = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { title, amount, subscriptionType, features, subId } = req.body;
        const lowe_title = title.toLowerCase();
        // Create new subscription
        const obj = {
            title,
            lowe_title,
            amount,
            subscriptionType,
            features
        };
        const existingSubscription = await subscriptionModel.find({ uniqueId: { $ne: subId }, $or: [{ lowe_title: lowe_title }, { subscriptionType: subscriptionType }], isDelete: false });
        if (existingSubscription.length) {
            throw new CustomError(messages.alreadyExist_subscription, StatusCodes.BAD_REQUEST);
        } else {
            const newSubscription = await subscriptionModel.updateOne({ uniqueId: subId }, obj);;
            return res.status(CREATED).json({ data: newSubscription, code: CREATED });
        }
    } catch (err) {
        console.error("Error adding subscription:", err);
        next(err);
    }
}

const details = async (req: any, res: Response, next: NextFunction) => {
    try {
        const subId = req.params.id;
        const details = await subscriptionModel.findOne({ uniqueId: subId, isDelete: false });
        return res.status(OK).json({ data: details, code: OK });
    } catch (err) {
        console.error("Error adding subscription:", err);
        next(err);
    }
}

const list = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { page = 1, perPage = 10, search } = req.query;
        const obj: any = {
            isDelete: false
        }
        if (search) {
            obj.$or = [
                {
                    title: { $regex: search, $options: 'i' }
                },
                {
                    uniqueId: { $regex: search, $options: 'i' }
                }
            ]
        }
        const [list, count] = await Promise.all([subscriptionModel.find(obj).sort({ createdAt: -1 }).skip((Number(page) * Number(perPage)) - Number(perPage)).limit(Number(perPage)), subscriptionModel.countDocuments(obj)]);
        return res.status(OK).json({ data: { list, count }, code: OK });
    } catch (err) {
        console.error("Error adding subscription:", err);
        next(err);
    }
}

const updateStatus = async (req: any, res: Response, next: NextFunction) => {
    try {
        const subId = req.params.id;
        const details = await subscriptionModel.findOne({ uniqueId: subId, isDelete: false });
        if (!details) {
            throw new CustomError(messages.noDatafoundWithID, StatusCodes.NOT_FOUND);
        } else {
            const updatedDetails = await subscriptionModel.findOneAndUpdate({ uniqueId: subId }, { isActive: details.isActive ? false : true }, { new: true });
            return res.status(OK).json({ data: updatedDetails, code: OK });
        }
    } catch (err) {
        console.error("Error adding subscription:", err);
        next(err);
    }
}

const deleteSub = async (req: any, res: Response, next: NextFunction) => {
    try {
        const subId = req.params.id;
        const details = await subscriptionModel.findOne({ uniqueId: subId, isDelete: false });
        if (!details) {
            throw new CustomError(messages.noDatafoundWithID, StatusCodes.NOT_FOUND);
        } else {
            const updatedDetails = await subscriptionModel.findOneAndUpdate({ uniqueId: subId }, { isDelete: true }, { new: true });
            return res.status(OK).json({ data: updatedDetails, code: OK });
        }
    } catch (err) {
        console.error("Error adding subscription:", err);
        next(err);
    }
}
export default {
    add_subscription,
    edit_subscription,
    details,
    list,
    updateStatus,
    deleteSub
} as const;