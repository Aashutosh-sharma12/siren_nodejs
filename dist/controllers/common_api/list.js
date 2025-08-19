"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const user_1 = __importDefault(require("../../models/user"));
const multer_1 = require("../../utils/multer");
const http_status_codes_1 = require("http-status-codes");
const { OK, CREATED } = http_status_codes_1.StatusCodes;
const generatePresignedUrl = async (req, res, next) => {
    try {
        const { id, role } = req.user;
        const { mediaType, roomId, type, fileType, fileName } = req.body;
        const userDetails = await user_1.default.findById(id, { uniqueId: 1 }).lean();
        const obj = {
            userId: userDetails ? userDetails.uniqueId : "",
            role: role,
            roomId: roomId,
            fileType: fileType,
            fileName: fileName,
            mediaType: mediaType,
            type: type
        };
        const pre_signedUrl = await (0, multer_1.generateUploadURL)(obj);
        res.status(CREATED).json({ code: CREATED, pre_signedUrl: pre_signedUrl });
    }
    catch (err) {
        next(err);
    }
};
module.exports = {
    generatePresignedUrl,
};
