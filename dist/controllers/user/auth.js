"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../../Custom_message/index"));
const index_2 = require("../../models/index");
const errors_1 = require("../../utils/errors");
const helpers_1 = require("../../utils/helpers");
const argon2_1 = __importDefault(require("argon2"));
const http_status_codes_1 = require("http-status-codes");
const { CREATED, OK } = http_status_codes_1.StatusCodes;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const multer_1 = require("../../utils/multer");
/****
 * usingPasswordKey:
 * 0 → User signed up
 * 1 → User logged in with password1
 * 2 → User logged in with password2
 ****/
const addUser = async (req, res, next) => {
    try {
        const { countryCode, phoneNumber, email, password1, password2 } = req.body;
        const { devicetype, deviceip, devicetoken, language = 'en', timezone = 'Asia/Calcutta' } = req.headers;
        const email_trim = email.trim();
        const lower_email = email_trim.toLowerCase();
        const checkUser_Details = await index_2.userModel.findOne({ countryCode: "+" + countryCode, phoneNumber: phoneNumber, isDelete: false }, { countryCode: 1, phoneNumber: 1 });
        if (checkUser_Details) {
            throw new errors_1.CustomError(index_1.default.accountAlreadyExist, http_status_codes_1.StatusCodes.BAD_REQUEST);
        }
        else {
            const totalUsers = await index_2.userModel.countDocuments();
            const obj = {
                ...req.body,
                email: lower_email,
                uniqueId: (0, helpers_1.identityGenerator)('user', totalUsers),
                password1: await argon2_1.default.hash(password1 + "" + process.env.Password_Secret_Key),
                password2: await argon2_1.default.hash(password2 + "" + process.env.Password_Secret_Key),
                loginKey: 0,
                countryCode: "+" + countryCode,
                loginTimeStamp: (0, helpers_1.generate_timestamp_In_seconds)()
            };
            const addUser = await index_2.userModel.create(obj);
            const res_obj = addUser.toObject();
            res_obj.image = '';
            res_obj.base_imageUrl = '';
            if (req.files && req.files.image && req.files.image.length > 0) {
                req.uniqueId = addUser.uniqueId;
                req.type = 'profle-image';
                req.role = 'user';
                const imageUrl = await (0, multer_1.uploadSingleImage)(req, res, next);
                await index_2.userModel.updateOne({ _id: addUser._id }, { image: imageUrl });
                res_obj.image = imageUrl;
                res_obj.base_imageUrl = process.env.Bucket_Base_Url;
            }
            delete res_obj.password1;
            delete res_obj.password2;
            const session_obj = {
                userId: addUser._id,
                deviceType: devicetype,
                deviceIp: deviceip,
                deviceToken: devicetoken,
                language: language,
                timezone: timezone,
                refreshToken: (0, helpers_1.generate_refreshToken)(res_obj._id, 'user', 0, 0),
                accessToken: (0, helpers_1.generate_accessToken)(res_obj._id, 'user', 0, 0)
            };
            await index_2.sessionModel.create(session_obj);
            res_obj.accessToken = session_obj.accessToken;
            res_obj.refreshToken = session_obj.refreshToken;
            res_obj.usingPasswordKey = 0;
            res.status(CREATED).json({ data: res_obj, code: CREATED, message: index_1.default.signupSuccessful });
        }
    }
    catch (err) {
        next(err); // Pass the error to the error handling middleware
    }
};
const store_image_during_signUp = async (req, res, next) => {
    try {
        const { userId, imageUrl } = req.body;
        await index_2.userModel.updateOne({ _id: userId }, { image: imageUrl });
        res.status(OK).json({ data: imageUrl, code: OK });
    }
    catch (err) {
        next(err);
    }
};
const userLogin = async (req, res, next) => {
    try {
        const { devicetype, deviceip, devicetoken, language = 'en', timezone = 'Asia/Calcutta' } = req.headers;
        const { countryCode, phoneNumber, password } = req.body;
        const userDetails = await index_2.userModel.findOne({ countryCode: countryCode, phoneNumber: phoneNumber, isDelete: false });
        if (userDetails) {
            if (userDetails?.isActive) {
                const res_obj = userDetails.toObject();
                const session_obj = {
                    userId: userDetails._id,
                    deviceType: devicetype,
                    deviceIp: deviceip,
                    deviceToken: devicetoken,
                    language: language,
                    timezone: timezone
                };
                if (await argon2_1.default.verify(userDetails.password1, password + "" + process.env.Password_Secret_Key)) {
                    session_obj.refreshToken = (0, helpers_1.generate_refreshToken)(res_obj._id, 'user', 1, res_obj.loginKey);
                    session_obj.accessToken = (0, helpers_1.generate_accessToken)(res_obj._id, 'user', 1, res_obj.loginKey);
                    await index_2.sessionModel.updateMany({ userId: userDetails._id, isDelete: false, status: true }, { isDelete: true, status: false });
                    await index_2.sessionModel.create(session_obj);
                    res_obj.accessToken = session_obj.accessToken;
                    res_obj.refreshToken = session_obj.refreshToken;
                    res_obj.usingPasswordKey = 1;
                    delete res_obj.password1;
                    delete res_obj.password2;
                    await index_2.userModel.updateOne({ _id: userDetails._id }, { onlineStatus: true, loginTimeStamp: (0, helpers_1.generate_timestamp_In_seconds)() });
                    res.status(OK).json({ data: res_obj, code: OK, message: index_1.default.loginSuccessful });
                }
                else if (await argon2_1.default.verify(userDetails.password2, password + "" + process.env.Password_Secret_Key)) {
                    session_obj.refreshToken = (0, helpers_1.generate_refreshToken)(res_obj._id, 'user', 2, 2);
                    session_obj.accessToken = (0, helpers_1.generate_accessToken)(res_obj._id, 'user', 2, 2);
                    await index_2.sessionModel.updateMany({ userId: userDetails._id, isDelete: false, status: true }, { isDelete: true, status: false });
                    await index_2.sessionModel.create(session_obj);
                    res_obj.accessToken = session_obj.accessToken;
                    res_obj.refreshToken = session_obj.refreshToken;
                    res_obj.usingPasswordKey = 2;
                    delete res_obj.password1;
                    delete res_obj.password2;
                    if (res_obj.loginKey != 2) {
                        await index_2.userModel.updateOne({ _id: userDetails._id }, { blocked_TimeStamp: (0, helpers_1.generate_timestamp_In_seconds)() });
                        await (0, helpers_1.left_all_rooms)({ userId: userDetails._id, name: userDetails.name }); // Left all rooms if loginKey is not 2
                    }
                    res_obj.loginKey = 2;
                    await index_2.userModel.updateOne({ _id: userDetails._id }, { onlineStatus: true, loginKey: 2, loginTimeStamp: (0, helpers_1.generate_timestamp_In_seconds)() });
                    res.status(OK).json({ data: res_obj, code: OK, message: index_1.default.loginSuccessful });
                }
                else {
                    throw new errors_1.CustomError(index_1.default.userNotFound_withPhoneNumber, http_status_codes_1.StatusCodes.NON_AUTHORITATIVE_INFORMATION);
                }
            }
            else {
                throw new errors_1.CustomError(index_1.default.accountBlocked, http_status_codes_1.StatusCodes.BAD_REQUEST);
            }
        }
        else {
            throw new errors_1.CustomError(index_1.default.userNotFound_withPhoneNumber, http_status_codes_1.StatusCodes.NON_AUTHORITATIVE_INFORMATION);
        }
    }
    catch (err) {
        next(err);
    }
};
const userInfo = async (req, res, next) => {
    try {
        const { countryCode, phoneNumber } = req.query;
        const userDetails = await index_2.userModel.findOne({ countryCode: "+" + countryCode, phoneNumber: phoneNumber, isDelete: false }, { countryCode: 1, phoneNumber: 1 });
        if (userDetails) {
            res.status(OK).json({ userExists: true, code: OK });
        }
        else {
            res.status(OK).json({ userExists: false, code: OK });
        }
    }
    catch (err) {
        next(err);
    }
};
const updateProfile = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { name, email, image, dob } = req.body;
        const userDetails = await index_2.userModel.findOneAndUpdate({ _id: id }, { name: name, dob: dob, email: email, image: image }, { new: true, fields: { password1: 0, password2: 0 } });
        if (userDetails) {
            res.status(OK).json({ data: userDetails, code: OK });
        }
        else {
            throw new errors_1.CustomError(index_1.default.userNotFound_withPhoneNumber, http_status_codes_1.StatusCodes.NOT_FOUND);
        }
    }
    catch (err) {
        next(err);
    }
};
const userDetails = async (req, res, next) => {
    try {
        const { id } = req.user;
        const userDetails = await index_2.userModel.findOne({ _id: id }, { password1: 0, password2: 0 }, { new: true });
        if (userDetails) {
            res.status(OK).json({ data: userDetails, image_baseUrl: process.env.Bucket_Base_Url, code: OK });
        }
        else {
            throw new errors_1.CustomError(index_1.default.userNotFound_withPhoneNumber, http_status_codes_1.StatusCodes.NOT_FOUND);
        }
    }
    catch (err) {
        next(err);
    }
};
const logout = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        const user_sessionDetails = await index_2.sessionModel.findOne({ accessToken: authorization }, { refreshToken: 1, userId: 1, accessToken: 1 });
        if (user_sessionDetails) {
            await index_2.sessionModel.updateMany({ refreshToken: user_sessionDetails.refreshToken }, { isDelete: true, status: false });
            await index_2.userModel.updateOne({ _id: user_sessionDetails.userId }, { onlineStatus: false });
            res.status(OK).json({ code: OK, message: index_1.default.logoutSuccessful });
        }
        else {
            throw new errors_1.CustomError(index_1.default.invalidToken, http_status_codes_1.StatusCodes.UNAUTHORIZED);
        }
    }
    catch (err) {
        next(err);
    }
};
const re_generateAccessToken = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        const JWT_SECRET_TOKEN = process.env.JWT_SECRET_TOKEN;
        const verified = jsonwebtoken_1.default.verify(authorization, JWT_SECRET_TOKEN);
        const check = await index_2.userModel.findOne({ _id: verified.id, isDelete: false }, { isDelete: 1, isActive: 1, loginKey: 1 });
        if (check) {
            if (check?.isActive) {
                const checkSession = await index_2.sessionModel.findOne({
                    userId: verified.id,
                    refreshToken: authorization,
                    role: verified.role,
                    isDelete: false,
                });
                if (checkSession) {
                    const newAccessToken = await (0, helpers_1.generate_accessToken)(verified.id, verified.role, verified.usingPasswordKey, check.loginKey);
                    const update = await index_2.sessionModel.updateOne({
                        userId: verified.id,
                        refreshToken: authorization,
                        role: verified.role,
                        isDelete: false,
                    }, {
                        accessToken: newAccessToken
                    });
                    if (update && update.modifiedCount == 1) {
                        res.status(http_status_codes_1.StatusCodes.OK).send({
                            accessToken: newAccessToken,
                            message: index_1.default.regeneratedGenerated,
                            code: http_status_codes_1.StatusCodes.OK
                        });
                    }
                    else {
                        return res.status(410).json({
                            error: index_1.default.invalidToken,
                            message: index_1.default.invalidToken,
                            code: 410
                        });
                    }
                }
                else {
                    return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                        error: index_1.default.invalidToken,
                        message: index_1.default.invalidToken,
                        code: http_status_codes_1.StatusCodes.UNAUTHORIZED
                    });
                }
            }
            else {
                return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
                    error: index_1.default.accountBlocked,
                    message: index_1.default.accountBlocked,
                    code: http_status_codes_1.StatusCodes.FORBIDDEN,
                });
            }
        }
        else {
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                error: index_1.default.invalidToken,
                message: index_1.default.invalidToken,
                code: http_status_codes_1.StatusCodes.UNAUTHORIZED,
            });
        }
    }
    catch (err) {
        if (err.message == "jwt expired") {
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                error: index_1.default.sessionExpired,
                message: index_1.default.sessionExpired,
                code: http_status_codes_1.StatusCodes.UNAUTHORIZED
            });
        }
        return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
            error: index_1.default.invalidToken,
            message: index_1.default.invalidToken,
            code: http_status_codes_1.StatusCodes.UNAUTHORIZED
        });
    }
};
const updateNotification = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { isNotification = false } = req.body;
        const userDetails = await index_2.userModel.findOneAndUpdate({ _id: id }, { isNotification: isNotification }, { new: true, fields: { isNotification: 1 } });
        if (userDetails) {
            res.status(OK).json({ data: userDetails, code: OK });
        }
        else {
            throw new errors_1.CustomError(index_1.default.noDatafoundWithID, http_status_codes_1.StatusCodes.NOT_FOUND);
        }
    }
    catch (err) {
        next(err);
    }
};
exports.default = {
    addUser,
    store_image_during_signUp,
    userLogin,
    userInfo,
    updateProfile,
    userDetails,
    logout,
    re_generateAccessToken,
    updateNotification
};
