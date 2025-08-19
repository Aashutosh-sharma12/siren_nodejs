"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscription_1 = __importDefault(require("../../controllers/admin/subscription"));
const schemaValidator_1 = require("../../utils/schemaValidator");
const adminValidator_1 = require("../../validators/admin/adminValidator");
const authValidator_1 = require("../../utils/authValidator");
const authRoute = (0, express_1.Router)();
const p = {
    add: "/add",
    edit: '/edit',
    details: '/details/:id',
    list: '/list',
    updateStatus: '/update-status/:id',
    deleteSub: '/delete/:id'
};
authRoute.post(p.add, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), (0, schemaValidator_1.schemaValidator)(adminValidator_1.addSub), subscription_1.default.add_subscription);
authRoute.put(p.edit, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), (0, schemaValidator_1.schemaValidator)(adminValidator_1.editSub), subscription_1.default.edit_subscription);
authRoute.get(p.details, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), subscription_1.default.details);
authRoute.get(p.list, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), subscription_1.default.list);
authRoute.get(p.updateStatus, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), subscription_1.default.updateStatus);
authRoute.delete(p.deleteSub, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), subscription_1.default.deleteSub);
exports.default = authRoute;
