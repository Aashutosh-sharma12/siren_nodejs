"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userRouter = (0, express_1.Router)();
const user_1 = __importDefault(require("../../controllers/admin/user"));
const authValidator_1 = require("../../utils/authValidator");
const schemaValidator_1 = require("../../utils/schemaValidator");
const adminValidator_1 = require("../../validators/admin/adminValidator");
const p = {
    list: "/list",
    statusUpdate: "/updateStatus",
    details: "/details/:id",
    deleteUser: "/deleteUser/:id",
    updateUser_access: '/updateUser_access/:id/:status'
};
userRouter.get(p.list, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), user_1.default.listUser);
userRouter.patch(p.statusUpdate, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), (0, schemaValidator_1.schemaValidator)(adminValidator_1.statusValidator), user_1.default.updateStatus);
userRouter.get(p.details, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), user_1.default.details);
userRouter.delete(p.deleteUser, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), user_1.default.deleteUser);
userRouter.get(p.updateUser_access, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), user_1.default.updateUser_access);
exports.default = userRouter;
