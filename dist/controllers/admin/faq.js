"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../../Custom_message/index"));
const faq_1 = __importDefault(require("../../models/faq"));
const errors_1 = require("../../utils/errors");
const http_status_codes_1 = require("http-status-codes");
const moment_1 = __importDefault(require("moment"));
function addFaq(body) {
    return new Promise(async (resolve, reject) => {
        try {
            body.lower_que = body.que.toLowerCase().trim();
            body.lower_ans = body.ans.toLowerCase().trim();
            const findFAQByName = await faq_1.default.findOne({
                isDelete: false,
                lower_que: body.lower_que
            });
            if (findFAQByName) {
                reject(new errors_1.CustomError(index_1.default.faq_AlreadyExist.replace("{{que}}", `${body.que}`), http_status_codes_1.StatusCodes.BAD_REQUEST));
            }
            else {
                const resultData = await faq_1.default.create(body);
                if (resultData) {
                    resolve(resultData);
                }
            }
        }
        catch (error) {
            reject(error);
        }
    });
}
function faqList(query) {
    return new Promise(async (resolve, reject) => {
        try {
            const { page = 1, perPage = 10, isActive, search, fromDate, toDate } = query;
            const skip = (page - 1) * perPage;
            let condition = { isDelete: false };
            if (search && search !== "" && search !== null) {
                condition = {
                    ...condition,
                    $or: [
                        { que: { $regex: search, $options: 'i' } },
                        { ans: { $regex: search, $options: 'i' } },
                    ]
                };
            }
            if (fromDate && toDate) {
                const startDate1 = (0, moment_1.default)(fromDate).startOf('day').toDate();
                const endDate1 = (0, moment_1.default)(toDate).endOf('day').toDate();
                condition = {
                    ...condition,
                    createdAt: {
                        $gte: startDate1,
                        $lte: endDate1
                    }
                };
            }
            if (isActive === "Active") {
                condition.isActive = true;
            }
            else if (isActive === "InActive") {
                condition.isActive = false;
            }
            else if (isActive === "all") {
                condition = {
                    ...condition
                };
            }
            else {
                condition = {
                    ...condition
                };
            }
            const [faqList, count] = await Promise.all([
                faq_1.default
                    .find(condition, { lower_que: 0, lower_ans: 0 })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(perPage),
                faq_1.default.countDocuments(condition)
            ]);
            resolve({ faqList: faqList, count: count });
        }
        catch (error) {
            reject(error);
        }
    });
}
function editFAQ(body) {
    return new Promise(async (resolve, reject) => {
        try {
            body.lower_que = body.que.toLowerCase();
            body.lower_ans = body.ans.toLowerCase();
            const data = await faq_1.default.findOne({
                isDelete: false,
                lower_que: body.lower_que,
                _id: {
                    $ne: body.id,
                },
            });
            if (data) {
                reject(new errors_1.CustomError(index_1.default.faq_AlreadyExist.replace("{{que}}", `${body.que}`), http_status_codes_1.StatusCodes.BAD_REQUEST));
            }
            else {
                const updatedData = await faq_1.default.findOneAndUpdate({
                    _id: body.id,
                    isDelete: false,
                }, {
                    que: body?.que,
                    lower_que: body?.lower_que,
                    ans: body?.ans,
                    lower_ans: body?.lower_ans,
                    isActive: body.isActive
                }, { new: true });
                resolve(updatedData);
            }
            ;
        }
        catch (error) {
            reject(error);
        }
    });
}
function faqDelete(params) {
    return new Promise(async (resolve, reject) => {
        try {
            const { id } = params;
            const check = await faq_1.default.findOne({ _id: id, isDelete: false });
            if (check) {
                const deleteFAQ = await faq_1.default.deleteOne({ _id: id, isDelete: false });
                if (deleteFAQ.deletedCount === 1) {
                    resolve({ success: true });
                }
                else {
                    reject(new errors_1.CustomError(index_1.default.noAccountMatch, http_status_codes_1.StatusCodes.NOT_FOUND));
                }
            }
            else {
                reject(new errors_1.CustomError(index_1.default.noDatafoundWithID, http_status_codes_1.StatusCodes.NOT_FOUND));
            }
        }
        catch (error) {
            reject(error);
        }
    });
}
function faqDetails(params) {
    return new Promise(async (resolve, reject) => {
        try {
            const { id } = params;
            const FAQ = await faq_1.default.findOne({ _id: id, isDelete: false });
            if (FAQ) {
                resolve({ FAQ });
            }
            else {
                reject(new errors_1.CustomError(index_1.default.noDatafoundWithID, http_status_codes_1.StatusCodes.NOT_FOUND));
            }
        }
        catch (error) {
            reject(error);
        }
    });
}
exports.default = {
    addFaq,
    faqList,
    editFAQ,
    faqDelete,
    faqDetails
};
