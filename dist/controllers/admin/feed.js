"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const feed_1 = __importDefault(require("../../models/feed"));
const helpers_1 = require("../../utils/helpers");
const multer_1 = require("../../utils/multer");
const http_status_codes_1 = require("http-status-codes");
const add_feed = async (req, res, next) => {
    try {
        req.body.uniqueId = (0, helpers_1.identityGenerator)('admin-feed', await feed_1.default.countDocuments());
        req.body.created_timeStamp = (0, helpers_1.generate_timestamp_In_seconds)();
        const add = await feed_1.default.create(req.body);
        if (req.files && req.files.image && req.files.image.length > 0) {
            req.uniqueId = add.uniqueId;
            req.type = 'admin-feed-image';
            req.role = 'admin';
            const imageUrl = await (0, multer_1.uploadSingleImage)(req, res, next);
            await feed_1.default.updateOne({ _id: add._id }, { image: imageUrl });
            add.image = imageUrl;
            add.base_imageUrl = process.env.Bucket_Base_Url;
        }
        res.status(http_status_codes_1.StatusCodes.CREATED).json({ code: http_status_codes_1.StatusCodes.CREATED, data: add });
    }
    catch (err) {
        next(err);
    }
};
const edit_feed = async (req, res, next) => {
    try {
        const { feedId } = req.body;
        const update = await feed_1.default.findOneAndUpdate({ _id: feedId }, req.body);
        if (req.files && req.files.image && req.files.image.length > 0) {
            req.uniqueId = update.uniqueId;
            req.type = 'admin-feed-image';
            req.role = 'admin';
            const imageUrl = await (0, multer_1.uploadSingleImage)(req, res, next);
            await feed_1.default.updateOne({ _id: feedId }, { image: imageUrl });
        }
        res.status(http_status_codes_1.StatusCodes.CREATED).json({ code: http_status_codes_1.StatusCodes.CREATED, data: update });
    }
    catch (err) {
        next(err);
    }
};
const details = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await feed_1.default.findOne({ _id: id });
        res.status(http_status_codes_1.StatusCodes.OK).json({ code: http_status_codes_1.StatusCodes.OK, data: data, image_baseUrl: process.env.Bucket_Base_Url });
    }
    catch (err) {
        next(err);
    }
};
const list = async (req, res, next) => {
    try {
        const { page = 1, perPage = 10, search } = req.query;
        const cond = {
            isDelete: false
        };
        const [list, count] = await Promise.all([
            feed_1.default.find(cond).sort({ createdAt: -1 }).skip((Number(page) * Number(perPage)) - Number(perPage)).limit(Number(perPage)),
            feed_1.default.countDocuments()
        ]);
        res.status(http_status_codes_1.StatusCodes.OK).json({ code: http_status_codes_1.StatusCodes.OK, data: { list, count, image_baseUrl: process.env.Bucket_Base_Url } });
    }
    catch (err) {
        next(err);
    }
};
exports.default = {
    add_feed,
    edit_feed,
    details,
    list
};
