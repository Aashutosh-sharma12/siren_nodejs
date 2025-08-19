"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../../Custom_message/index"));
const subscription_1 = __importDefault(require("../../models/subscription"));
const errors_1 = require("../../utils/errors");
const helpers_1 = require("../../utils/helpers");
const http_status_codes_1 = require("http-status-codes");
const { CREATED, OK } = http_status_codes_1.StatusCodes;
const add_subscription = async (req, res, next) => {
    try {
        const { title, amount, subscriptionType, features } = req.body;
        const lowe_title = title.toLowerCase();
        // Create new subscription
        const obj = {
            uniqueId: (0, helpers_1.identityGenerator)('subscription', await subscription_1.default.countDocuments()),
            title,
            lowe_title,
            amount,
            subscriptionType,
            features
        };
        const existingSubscription = await subscription_1.default.find({ $or: [{ lowe_title: lowe_title }, { subscriptionType: subscriptionType }], isDelete: false });
        if (existingSubscription.length) {
            throw new errors_1.CustomError(index_1.default.alreadyExist_subscription, http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        else {
            const newSubscription = await subscription_1.default.create(obj);
            ;
            return res.status(CREATED).json({ data: newSubscription, code: CREATED });
        }
    }
    catch (err) {
        console.error("Error adding subscription:", err);
        next(err);
    }
};
const edit_subscription = async (req, res, next) => {
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
        const existingSubscription = await subscription_1.default.find({ uniqueId: { $ne: subId }, $or: [{ lowe_title: lowe_title }, { subscriptionType: subscriptionType }], isDelete: false });
        if (existingSubscription.length) {
            throw new errors_1.CustomError(index_1.default.alreadyExist_subscription, http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        else {
            const newSubscription = await subscription_1.default.updateOne({ uniqueId: subId }, obj);
            ;
            return res.status(CREATED).json({ data: newSubscription, code: CREATED });
        }
    }
    catch (err) {
        console.error("Error adding subscription:", err);
        next(err);
    }
};
const details = async (req, res, next) => {
    try {
        const subId = req.params.id;
        const details = await subscription_1.default.findOne({ uniqueId: subId, isDelete: false });
        return res.status(OK).json({ data: details, code: OK });
    }
    catch (err) {
        console.error("Error adding subscription:", err);
        next(err);
    }
};
const list = async (req, res, next) => {
    try {
        const { page = 1, perPage = 10, search } = req.query;
        const obj = {
            isDelete: false
        };
        if (search) {
            obj.$or = [
                {
                    title: { $regex: search, $options: 'i' }
                },
                {
                    uniqueId: { $regex: search, $options: 'i' }
                }
            ];
        }
        const [list, count] = await Promise.all([subscription_1.default.find(obj).sort({ createdAt: -1 }).skip((Number(page) * Number(perPage)) - Number(perPage)).limit(Number(perPage)), subscription_1.default.countDocuments(obj)]);
        return res.status(OK).json({ data: { list, count }, code: OK });
    }
    catch (err) {
        console.error("Error adding subscription:", err);
        next(err);
    }
};
const updateStatus = async (req, res, next) => {
    try {
        const subId = req.params.id;
        const details = await subscription_1.default.findOne({ uniqueId: subId, isDelete: false });
        if (!details) {
            throw new errors_1.CustomError(index_1.default.noDatafoundWithID, http_status_codes_1.StatusCodes.NOT_FOUND);
        }
        else {
            const updatedDetails = await subscription_1.default.findOneAndUpdate({ uniqueId: subId }, { isActive: details.isActive ? false : true }, { new: true });
            return res.status(OK).json({ data: updatedDetails, code: OK });
        }
    }
    catch (err) {
        console.error("Error adding subscription:", err);
        next(err);
    }
};
const deleteSub = async (req, res, next) => {
    try {
        const subId = req.params.id;
        const details = await subscription_1.default.findOne({ uniqueId: subId, isDelete: false });
        if (!details) {
            throw new errors_1.CustomError(index_1.default.noDatafoundWithID, http_status_codes_1.StatusCodes.NOT_FOUND);
        }
        else {
            const updatedDetails = await subscription_1.default.findOneAndUpdate({ uniqueId: subId }, { isDelete: true }, { new: true });
            return res.status(OK).json({ data: updatedDetails, code: OK });
        }
    }
    catch (err) {
        console.error("Error adding subscription:", err);
        next(err);
    }
};
exports.default = {
    add_subscription,
    edit_subscription,
    details,
    list,
    updateStatus,
    deleteSub
};
