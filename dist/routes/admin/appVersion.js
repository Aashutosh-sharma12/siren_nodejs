"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appVersionRoute = (0, express_1.Router)();
const appVersion_1 = __importDefault(require("../../controllers/admin/appVersion"));
const http_status_codes_1 = require("http-status-codes");
const authValidator_1 = require("../../utils/authValidator");
const schemaValidator_1 = require("../../utils/schemaValidator");
const adminValidator_1 = require("../../validators/admin/adminValidator");
const { OK, CREATED } = http_status_codes_1.StatusCodes;
const p = {
    updateApp_version: "/updateApp_version",
    getAppVersion: "/getAppVersion"
};
appVersionRoute.post(p.updateApp_version, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), (0, schemaValidator_1.schemaValidator)(adminValidator_1.appVersionSchema), async (req, res) => {
    const data = await appVersion_1.default.addVersion(req?.body, req?.headers);
    res.status(OK).json({ code: OK, data });
});
appVersionRoute.get(p.getAppVersion, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), async (req, res) => {
    const data = await appVersion_1.default.getAppVersion(req?.headers);
    res.status(OK).json({ code: OK, data });
});
exports.default = appVersionRoute;
