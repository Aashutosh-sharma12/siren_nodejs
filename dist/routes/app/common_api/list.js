"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const list_1 = __importDefault(require("../../../controllers/common_api/list"));
const schemaValidator_1 = require("../../../utils/schemaValidator");
const authValidator_1 = require("../../../utils/authValidator");
const list_2 = require("../../../validators/common/list");
const route = (0, express_1.Router)();
const p = {
    generatePresignedUrl: '/generatePresignedUrl',
    sub_list: '/sub_list'
};
route.post(p.generatePresignedUrl, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(['user', 'admin']), (0, schemaValidator_1.schemaValidator)(list_2.pre_signedUrlSchema), list_1.default.generatePresignedUrl);
route.get(p.sub_list, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(['user', 'admin']), list_1.default.sub_list);
exports.default = route;
