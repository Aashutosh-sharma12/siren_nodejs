"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardRoute = (0, express_1.Router)();
const dashboard_1 = __importDefault(require("../../controllers/admin/dashboard"));
const http_status_codes_1 = require("http-status-codes");
const authValidator_1 = require("../../utils/authValidator");
const { OK, CREATED } = http_status_codes_1.StatusCodes;
const p = {
    dashboardCount: "/dashboardCount"
};
dashboardRoute.get(p.dashboardCount, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), async (req, res) => {
    const data = await dashboard_1.default.dashboardCount(req?.query, req?.headers);
    res.status(OK).json({ code: OK, data });
});
exports.default = dashboardRoute;
