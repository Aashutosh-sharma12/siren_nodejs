"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../../Custom_message/index"));
const index_2 = require("../../models/index");
const errors_1 = require("../../utils/errors");
const notification_1 = require("../../utils/notification");
const http_status_codes_1 = require("http-status-codes");
const helpers_1 = require("../../utils/helpers");
const dayjs_1 = __importDefault(require("dayjs"));
const { OK } = http_status_codes_1.StatusCodes;
const listUser = async (req, res, next) => {
    try {
        const todayDate = (0, dayjs_1.default)().format('YYYY-MM-DD');
        const { search, status, page = 1, perPage = 10, fromDate, toDate } = req.query;
        const obj = {
            isDelete: false,
        };
        if (search && search !== "" && search !== undefined) {
            obj.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phoneNumber: { $regex: search, $options: "i" } },
                { uniqueId: { $regex: search, $options: "i" } }
            ];
        }
        if (fromDate && toDate) {
            const fromDate1 = new Date(fromDate);
            fromDate1.setHours(0, 0, 0, 0);
            const toDate1 = new Date(toDate);
            toDate1.setHours(23, 59, 59, 999);
            obj.createdAt = {
                $gte: fromDate1,
                $lte: toDate1
            };
        }
        if (status) {
            obj.isActive = status;
        }
        const [UserData, Count] = await Promise.all([
            index_2.userModel.aggregate([
                {
                    $match: obj
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
                    $addFields: {
                        subscribed: {
                            $cond: {
                                if: { $gt: [{ $size: "$subscription_details" }, 0] },
                                then: true,
                                else: false
                            }
                        }
                    }
                },
                {
                    $project: {
                        password1: 0,
                        password2: 0,
                    }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $skip: (Number(page) - 1) * Number(perPage)
                },
                {
                    $limit: Number(perPage)
                }
            ]),
            index_2.userModel.countDocuments(obj)
        ]);
        res.status(OK).json({ code: OK, totalCount: Count, user_data: UserData, image_baseUrl: process.env.Bucket_Base_Url });
    }
    catch (error) {
        next(error);
    }
};
const details = async (req, res, next) => {
    try {
        const { id } = req.params;
        const findUserById = await index_2.userModel.findOne({
            _id: id,
            isDelete: false,
        }, { password1: 0, password2: 0 });
        if (findUserById) {
            res.status(OK).json({ code: OK, data: findUserById, image_baseUrl: process.env.Bucket_Base_Url });
        }
        else {
            throw new errors_1.CustomError(index_1.default.noDatafoundWithID, http_status_codes_1.StatusCodes.NOT_FOUND);
        }
    }
    catch (error) {
        next(error);
    }
};
const updateStatus = async (req, res, next) => {
    try {
        const { status, userId } = req.body;
        const updataeStatus = await index_2.userModel.findOneAndUpdate({ _id: userId, isDelete: false }, { isActive: status }, { new: true, fields: { password1: 0, password2: 0 } });
        if (updataeStatus) {
            res.status(OK).json({ success: true, code: OK });
        }
        else {
            throw new errors_1.CustomError(index_1.default.noDatafoundWithID, http_status_codes_1.StatusCodes.NOT_FOUND);
        }
    }
    catch (error) {
        next(error);
    }
};
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updataeStatus = await index_2.userModel.findOneAndUpdate({ _id: id, isDelete: false }, { isDelete: false }, { new: true, fields: { countryCode: 1, name: 1, phoneNumber: 1 } });
        if (updataeStatus) {
            await (0, helpers_1.left_all_rooms)({ userId: id, name: updataeStatus.name });
            res.status(OK).json({ success: true, code: OK });
        }
        else {
            throw new errors_1.CustomError(index_1.default.noDatafoundWithID, http_status_codes_1.StatusCodes.NOT_FOUND);
        }
    }
    catch (error) {
        next(error);
    }
};
const updateUser_access = async (req, res, next) => {
    try {
        const { id, status } = req.params;
        const updataeStatus = await index_2.userModel.findOneAndUpdate({ _id: id, isDelete: false }, { loginKey: status }, { new: true, fields: { countryCode: 1, phoneNumber: 1 } });
        if (updataeStatus) {
            const fetch_user_session = await index_2.sessionModel.findOneAndUpdate({ userId: id, isDelete: false, status: true }, { isDelete: true, status: false }, { fields: { deviceToken: 1 } });
            if (fetch_user_session) {
                if (fetch_user_session.deviceToken) {
                    const notificationObj = {
                        userId: id.toString(),
                        status: '0',
                        role: 'admin',
                        title: index_1.default.full_access,
                        body: index_1.default.full_access,
                        token: fetch_user_session.deviceToken,
                        type: 'full-access'
                    };
                    await (0, notification_1.sendNotificationToSpecificDevice)(notificationObj);
                }
            }
            res.status(OK).json({ success: true, code: OK });
        }
        else {
            throw new errors_1.CustomError(index_1.default.noDatafoundWithID, http_status_codes_1.StatusCodes.NOT_FOUND);
        }
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    listUser,
    details,
    updateStatus,
    deleteUser,
    updateUser_access
};
