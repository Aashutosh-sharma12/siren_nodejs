"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.check_access = exports.checkRole = exports.verifyAuthToken = void 0;
// const jwt = require("jsonwebtoken");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const index_1 = __importDefault(require("../Custom_message/index"));
const user_1 = __importDefault(require("../models/user"));
const session_1 = __importDefault(require("../models/session"));
const appVersion_1 = __importDefault(require("../models/appVersion"));
const verifyAuthToken = async (req, res, next) => {
    try {
        const accessToken = req.headers.authorization;
        const { devicetype, currentversion } = req.headers;
        if (!accessToken) {
            return res.status(http_status_codes_1.default.UNAUTHORIZED).json({
                error: index_1.default.noToken,
                message: index_1.default.noToken,
                code: http_status_codes_1.default.UNAUTHORIZED,
            });
        }
        const JWT_SECRET_TOKEN = process.env.JWT_SECRET_TOKEN;
        if (!JWT_SECRET_TOKEN) {
            return res.status(http_status_codes_1.default.INTERNAL_SERVER_ERROR).json({
                error: "JWT secret token is not configured.",
                message: "JWT secret token is not configured.",
                code: http_status_codes_1.default.INTERNAL_SERVER_ERROR,
            });
        }
        const verified = jsonwebtoken_1.default.verify(accessToken, JWT_SECRET_TOKEN);
        if (verified.role == "admin") {
            const findAdmin = await session_1.default.findOne({
                accessToken: accessToken, role: "admin", isDelete: false,
                status: true
            });
            if (findAdmin) {
                req.user = verified;
                next();
                return;
            }
            else {
                return res.status(http_status_codes_1.default.UNAUTHORIZED).json({
                    error: index_1.default.invalidToken,
                    message: index_1.default.invalidToken,
                    code: http_status_codes_1.default.UNAUTHORIZED,
                });
            }
        }
        const check = await user_1.default.findOne({ _id: verified.id }, { isDelete: 1, isActive: 1 });
        if (check) {
            if (check.isDelete) {
                return res.status(http_status_codes_1.default.GONE).json({
                    error: index_1.default.userDeleted,
                    message: index_1.default.userDeleted,
                    code: http_status_codes_1.default.GONE //410
                });
            }
            else if (check.isActive) {
                const checkSession = await session_1.default.findOne({
                    userId: verified.id,
                    accessToken: accessToken,
                    role: verified.role,
                    isDelete: false,
                    status: true
                });
                if (checkSession) {
                    const check_appVersion = await appVersion_1.default.findOne({ isDelete: false });
                    if (check_appVersion) {
                        if (devicetype && devicetype == 'android' && currentversion && check_appVersion.androidVersion != currentversion && check_appVersion.androidUpdate_Type == 'Force') {
                            return res.status(http_status_codes_1.default.HTTP_VERSION_NOT_SUPPORTED).json({
                                error: index_1.default.updatedVersion_available,
                                message: index_1.default.updatedVersion_available,
                                versionType: check_appVersion.versionStatus_android,
                                code: http_status_codes_1.default.HTTP_VERSION_NOT_SUPPORTED,
                            });
                        }
                        if (devicetype && devicetype == 'ios' && currentversion && check_appVersion.iosVersion != currentversion && check_appVersion.iosUpdate_Type == 'Force') {
                            return res.status(http_status_codes_1.default.HTTP_VERSION_NOT_SUPPORTED).json({
                                error: index_1.default.updatedVersion_available,
                                message: index_1.default.updatedVersion_available,
                                versionType: check_appVersion.versionStatus_ios,
                                code: http_status_codes_1.default.HTTP_VERSION_NOT_SUPPORTED,
                            });
                        }
                    }
                    req.user = verified;
                    next();
                    return;
                }
                else {
                    return res.status(http_status_codes_1.default.UNAUTHORIZED).json({
                        error: index_1.default.sessionExpired,
                        message: index_1.default.sessionExpired,
                        code: http_status_codes_1.default.UNAUTHORIZED,
                    });
                }
            }
            else {
                return res.status(http_status_codes_1.default.FORBIDDEN).json({
                    error: index_1.default.accountBlocked,
                    message: index_1.default.accountBlocked,
                    code: http_status_codes_1.default.FORBIDDEN, //403
                });
            }
        }
        else {
            return res.status(http_status_codes_1.default.UNAUTHORIZED).json({
                error: index_1.default.invalidToken,
                message: index_1.default.invalidToken,
                code: http_status_codes_1.default.UNAUTHORIZED, //401
            });
        }
    }
    catch (err) {
        console.error("Error verifying token:", err);
        if (typeof err === "object" && err !== null && "message" in err && err.message === "jwt expired") {
            return res.status(http_status_codes_1.default.UNAUTHORIZED).json({
                error: index_1.default.access_tokenExpired,
                message: index_1.default.access_tokenExpired,
                code: http_status_codes_1.default.UNAUTHORIZED,
            });
        }
        return res.status(http_status_codes_1.default.UNAUTHORIZED).json({
            error: index_1.default.invalidToken,
            message: index_1.default.invalidToken,
            code: http_status_codes_1.default.UNAUTHORIZED,
        });
    }
};
exports.verifyAuthToken = verifyAuthToken;
const checkRole = (roles) => {
    return (req, res, next) => {
        if (req.user && roles.includes(req.user.role)) {
            next();
        }
        else {
            return res.status(http_status_codes_1.default.FORBIDDEN).json({
                error: index_1.default.unAuthRole,
                message: index_1.default.unAuthRole,
                code: http_status_codes_1.default.FORBIDDEN, //403
            });
        }
    };
};
exports.checkRole = checkRole;
const check_access = (access) => {
    return (req, res, next) => {
        if (req.user && access.includes(req.user.loginKey_status)) {
            next();
        }
        else {
            return res.status(http_status_codes_1.default.FORBIDDEN).json({
                error: index_1.default.not_full_access,
                message: index_1.default.not_full_access,
                httpcode: http_status_codes_1.default.FORBIDDEN, //403
                code: req.user.loginKey_status
            });
        }
    };
};
exports.check_access = check_access;
