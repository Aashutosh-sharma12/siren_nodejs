"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userRouter = (0, express_1.Router)();
const feed_1 = __importDefault(require("../../controllers/admin/feed"));
const authValidator_1 = require("../../utils/authValidator");
const schemaValidator_1 = require("../../utils/schemaValidator");
const adminValidator_1 = require("../../validators/admin/adminValidator");
const multer_1 = require("../../utils/multer");
const p = {
    list: "/list",
    // statusUpdate: "/updateStatus",
    details: "/details/:id",
    add_feed: "/add_feed",
    edit_feed: '/edit_feed'
};
userRouter.get(p.list, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), feed_1.default.list);
userRouter.get(p.details, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), feed_1.default.details);
userRouter.post(p.add_feed, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), multer_1.upload.fields([{ name: 'image', maxCount: 1 }]), multer_1.checkFileSize, (0, schemaValidator_1.schemaValidator)(adminValidator_1.add_feed), feed_1.default.add_feed);
userRouter.put(p.edit_feed, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), multer_1.upload.fields([{ name: 'image', maxCount: 1 }]), multer_1.checkFileSize, (0, schemaValidator_1.schemaValidator)(adminValidator_1.edit_feed), feed_1.default.edit_feed);
exports.default = userRouter;
