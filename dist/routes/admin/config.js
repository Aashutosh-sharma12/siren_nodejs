"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const configRoute = (0, express_1.Router)();
const config_1 = __importDefault(require("../../controllers/admin/config"));
const http_status_codes_1 = require("http-status-codes");
const authValidator_1 = require("../../utils/authValidator");
const schemaValidator_1 = require("../../utils/schemaValidator");
const adminValidator_1 = require("../../validators/admin/adminValidator");
const { OK, CREATED } = http_status_codes_1.StatusCodes;
const p = {
    logoutORPanicTime: "/lotoutORpaniTime",
    lastData: "/lastData"
};
configRoute.post(p.logoutORPanicTime, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), (0, schemaValidator_1.schemaValidator)(adminValidator_1.configValidator), async (req, res) => {
    const data = await config_1.default.saveLogoutSessionORPanicTime(req.user.id, req?.body, req?.headers);
    res.status(OK).json({ code: OK, data });
});
configRoute.get(p.lastData, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), async (req, res) => {
    const data = await config_1.default.getLastAddedValue(req.user.id, req?.query, req?.headers);
    res.status(OK).json({ code: OK, data });
});
exports.default = configRoute;
