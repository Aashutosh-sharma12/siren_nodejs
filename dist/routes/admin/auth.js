"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../../controllers/admin/auth"));
const http_status_codes_1 = require("http-status-codes");
const schemaValidator_1 = require("../../utils/schemaValidator");
const adminValidator_1 = require("../../validators/admin/adminValidator");
const authValidator_1 = require("../../utils/authValidator");
const authRoute = (0, express_1.Router)();
const { OK, CREATED } = http_status_codes_1.StatusCodes;
const p = {
    add: "/add",
    login: "/login",
    changePass: '/change_password',
    logout: "/logout"
};
authRoute.post(p.add, (0, schemaValidator_1.schemaValidator)(adminValidator_1.adminSignup), async (req, res) => {
    const data = await auth_1.default.adminSignup(req.body);
    res.status(CREATED).json({ data, code: CREATED });
});
authRoute.post(p.login, (0, schemaValidator_1.schemaValidator)(adminValidator_1.adminLogin), async (req, res) => {
    const data = await auth_1.default.adminLogin(req.body, req.headers);
    res.status(OK).json({ code: OK, data });
});
authRoute.patch(p.changePass, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), (0, schemaValidator_1.schemaValidator)(adminValidator_1.changeAdminPassValidation), async (req, res) => {
    console.log("Req", req.body);
    const data = await auth_1.default.changeAdminPassword(req.body, req.user.id);
    res.status(OK).json({ code: OK, data });
});
authRoute.get(p.logout, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), async (req, res) => {
    const data = await auth_1.default.logoutAdmin(req.headers);
    res.status(OK).json({ data, code: OK });
});
exports.default = authRoute;
