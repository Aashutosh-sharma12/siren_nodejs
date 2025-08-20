"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../models/index");
const errors_1 = require("../../utils/errors");
const index_2 = __importDefault(require("../../Custom_message/index"));
const http_status_codes_1 = require("http-status-codes");
const argon2_1 = __importDefault(require("argon2"));
const jwt = require("jsonwebtoken");
function adminSignup(body) {
    return new Promise(async (resolve, reject) => {
        try {
            const { password, email } = body;
            const check = await index_1.adminModal.findOne({ email: email });
            if (check !== null) {
                reject(new errors_1.CustomError(index_2.default.accountAlreadyExist, http_status_codes_1.StatusCodes.UNPROCESSABLE_ENTITY));
            }
            else {
                const hashPass = await argon2_1.default.hash(password);
                body.password = hashPass;
                const addDataResult = await index_1.adminModal.create(body);
                if (addDataResult !== null) {
                    resolve(addDataResult);
                }
            }
        }
        catch (err) {
            reject(err);
        }
    });
}
function adminLogin(body, headers) {
    return new Promise(async (resolve, reject) => {
        try {
            const { email, password } = body;
            const { devicetype, deviceip, devicetoken, language = 'en', timezone = 'Asia/Calcutta' } = headers;
            const findAdmin = await index_1.adminModal.findOne({ email: email.toLowerCase() }).lean();
            if (findAdmin) {
                const verifyPassword = await argon2_1.default.verify(`${findAdmin.password}`, password);
                if (verifyPassword) {
                    const access_token = jwt.sign({ id: findAdmin._id, role: "admin" }, process.env.JWT_SECRET_TOKEN, {
                        expiresIn: "30d"
                    });
                    const session_obj = {
                        userId: findAdmin._id,
                        deviceType: devicetype,
                        deviceIp: deviceip,
                        deviceToken: devicetoken,
                        language: language,
                        timezone: timezone,
                        accessToken: access_token,
                        role: 'admin'
                    };
                    await index_1.sessionModel.create(session_obj);
                    findAdmin.token = access_token;
                    delete findAdmin.password;
                    resolve(findAdmin);
                }
                else {
                    reject(new errors_1.CustomError(index_2.default.wrongPassword, http_status_codes_1.StatusCodes.BAD_REQUEST));
                }
            }
            else {
                reject(new errors_1.CustomError(index_2.default.noAccountMatch, http_status_codes_1.StatusCodes.BAD_REQUEST));
            }
        }
        catch (error) {
            reject(error);
        }
    });
}
function logoutAdmin(headers) {
    return new Promise(async (resolve, reject) => {
        try {
            const { authorization } = headers;
            await index_1.sessionModel.findOneAndUpdate({ accessToken: authorization }, { isDelete: true, status: false });
            resolve(index_2.default.logoutSuccessful);
        }
        catch (error) {
            reject(error);
        }
    });
}
function changeAdminPassword(body, adminId) {
    return new Promise(async (resolve, reject) => {
        try {
            const { current_password, new_password, confirm_new_password } = body;
            if (new_password === confirm_new_password) {
                const findUserByID = await index_1.adminModal.findOne({ _id: adminId });
                if (findUserByID) {
                    const verifyoldPass = await argon2_1.default.verify(`${findUserByID?.password}`, current_password);
                    if (!verifyoldPass) {
                        reject(new errors_1.CustomError(index_2.default.wrongPassword, http_status_codes_1.StatusCodes.BAD_REQUEST));
                    }
                    else {
                        if (current_password !== new_password) {
                            const newPassword = await argon2_1.default.hash(new_password);
                            await index_1.adminModal.updateOne({}, { password: newPassword });
                            resolve(index_2.default.passwordUpdateSuccessful);
                        }
                        else {
                            reject(new errors_1.CustomError(index_2.default.bothNewAndCurrentSame, http_status_codes_1.StatusCodes.BAD_REQUEST));
                        }
                    }
                }
                else {
                    reject(new errors_1.CustomError(index_2.default.noDatafoundWithID, http_status_codes_1.StatusCodes.BAD_REQUEST));
                }
            }
            else {
                reject(new errors_1.CustomError(index_2.default.bothNewAndConfirmSame, http_status_codes_1.StatusCodes.BAD_REQUEST));
            }
        }
        catch (err) {
            reject(err);
        }
    });
}
exports.default = {
    adminSignup,
    adminLogin,
    logoutAdmin,
    changeAdminPassword
};
