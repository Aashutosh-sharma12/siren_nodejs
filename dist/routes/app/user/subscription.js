"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscription_1 = __importDefault(require("../../../controllers/user/subscription"));
const authValidator_1 = require("../../../utils/authValidator");
const schemaValidator_1 = require("../../../utils/schemaValidator");
const add_1 = require("../../../validators/user/add");
const route = (0, express_1.Router)();
const p = {
    sub_list: '/sub_list',
    user_sub_list: '/user_sub_list',
    purchase_subscription: '/purchase_subscription'
};
route.get(p.sub_list, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(['user']), (0, authValidator_1.check_access)([0, 1]), subscription_1.default.sub_list);
route.get(p.user_sub_list, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(['user']), (0, authValidator_1.check_access)([0, 1]), subscription_1.default.user_sub_list);
route.post(p.purchase_subscription, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(['user']), (0, authValidator_1.check_access)([0, 1]), (0, schemaValidator_1.schemaValidator)(add_1.purchase_subscriptionSchema), subscription_1.default.purchase_subscription);
exports.default = route;
