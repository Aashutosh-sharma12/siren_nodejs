import { Request, Response, NextFunction } from 'express';
import messages from "@Custom_message/index";
import { userModel, sessionModel, chat_room_messageModel } from "@models/index";
import { CustomError } from "@utils/errors";
import { generate_accessToken, generate_refreshToken, generate_timestamp_In_seconds, identityGenerator, left_all_rooms, offline_online_all_rooms } from "@utils/helpers";
import argon2 from "argon2";
import { StatusCodes } from "http-status-codes";
const { CREATED, OK } = StatusCodes;
import jwt from 'jsonwebtoken';
import { uploadSingleImage } from '@utils/multer';

/**** 
 * usingPasswordKey:
 * 0 → User signed up
 * 1 → User logged in with password1
 * 2 → User logged in with password2
 ****/

const addUser = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { countryCode, phoneNumber, email, password1, password2 } = req.body;
        const { devicetype, deviceip, devicetoken, language = 'en', timezone = 'Asia/Calcutta' } = req.headers;
        const email_trim = email.trim()
        const lower_email = email_trim.toLowerCase()
        const checkUser_Details = await userModel.findOne({ countryCode: "+" + countryCode, phoneNumber: phoneNumber, isDelete: false }, { countryCode: 1, phoneNumber: 1 });
        if (checkUser_Details) {
            throw new CustomError(messages.accountAlreadyExist, StatusCodes.BAD_REQUEST);
        } else {
            const totalUsers = await userModel.countDocuments();
            const obj = {
                ...req.body,
                email: lower_email,
                uniqueId: identityGenerator('user', totalUsers),
                password1: await argon2.hash(password1 + "" + process.env.Password_Secret_Key),
                password2: await argon2.hash(password2 + "" + process.env.Password_Secret_Key),
                loginKey: 0,
                countryCode: "+" + countryCode,
                loginTimeStamp: generate_timestamp_In_seconds()
            }
            const addUser = await userModel.create(obj);
            const res_obj: any = addUser.toObject();
            res_obj.image = '';
            res_obj.base_imageUrl = '';
            if (req.files && req.files.image && req.files.image.length > 0) {
                req.uniqueId = addUser.uniqueId;
                req.type = 'profle-image';
                req.role = 'user'
                const imageUrl = await uploadSingleImage(req, res, next);
                await userModel.updateOne({ _id: addUser._id }, { image: imageUrl });
                res_obj.image = imageUrl;
                res_obj.base_imageUrl = process.env.Bucket_Base_Url
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
                refreshToken: generate_refreshToken(res_obj._id, 'user', 0, 0),
                accessToken: generate_accessToken(res_obj._id, 'user', 0, 0)
            }
            await sessionModel.create(session_obj);
            res_obj.accessToken = session_obj.accessToken
            res_obj.refreshToken = session_obj.refreshToken
            res_obj.usingPasswordKey = 0;
            res.status(CREATED).json({ data: res_obj, code: CREATED, message: messages.signupSuccessful });
        }
    } catch (err) {
        next(err); // Pass the error to the error handling middleware
    }
};

const store_image_during_signUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, imageUrl } = req.body;
        await userModel.updateOne({ _id: userId }, { image: imageUrl });
        res.status(OK).json({ data: imageUrl, code: OK });
    } catch (err) {
        next(err);
    }
}

const userLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { devicetype, deviceip, devicetoken, language = 'en', timezone = 'Asia/Calcutta' } = req.headers;
        const { countryCode, phoneNumber, password } = req.body;
        const userDetails = await userModel.findOne({ countryCode: countryCode, phoneNumber: phoneNumber, isDelete: false });
        if (userDetails) {
            if (userDetails?.isActive) {
                const res_obj: any = userDetails.toObject();
                const session_obj: any = {
                    userId: userDetails._id,
                    deviceType: devicetype,
                    deviceIp: deviceip,
                    deviceToken: devicetoken,
                    language: language,
                    timezone: timezone
                }
                if (await argon2.verify(userDetails.password1, password + "" + process.env.Password_Secret_Key)) {
                    session_obj.refreshToken = generate_refreshToken(res_obj._id, 'user', 1, res_obj.loginKey);
                    session_obj.accessToken = generate_accessToken(res_obj._id, 'user', 1, res_obj.loginKey);
                    await sessionModel.updateMany({ userId: userDetails._id, isDelete: false, status: true }, { isDelete: true, status: false });
                    await sessionModel.create(session_obj);
                    res_obj.accessToken = session_obj.accessToken
                    res_obj.refreshToken = session_obj.refreshToken
                    res_obj.usingPasswordKey = 1
                    delete res_obj.password1;
                    delete res_obj.password2;
                    await userModel.updateOne({ _id: userDetails._id }, { onlineStatus: true, loginTimeStamp: generate_timestamp_In_seconds() });
                    await offline_online_all_rooms({ userId: userDetails._id, status: 'online', name: userDetails.name });
                    res.status(OK).json({ data: res_obj, code: OK, message: messages.loginSuccessful });
                } else if (await argon2.verify(userDetails.password2, password + "" + process.env.Password_Secret_Key)) {
                    session_obj.refreshToken = generate_refreshToken(res_obj._id, 'user', 2, 2);
                    session_obj.accessToken = generate_accessToken(res_obj._id, 'user', 2, 2);
                    await sessionModel.updateMany({ userId: userDetails._id, isDelete: false, status: true }, { isDelete: true, status: false });
                    await sessionModel.create(session_obj);
                    res_obj.accessToken = session_obj.accessToken
                    res_obj.refreshToken = session_obj.refreshToken
                    res_obj.usingPasswordKey = 2
                    delete res_obj.password1;
                    delete res_obj.password2;
                    if (res_obj.loginKey != 2) {
                        await userModel.updateOne({ _id: userDetails._id }, { blocked_TimeStamp: generate_timestamp_In_seconds() });
                        await left_all_rooms({ userId: userDetails._id, name: userDetails.name }); // Left all rooms if loginKey is not 2
                    }
                    res_obj.loginKey = 2
                    await userModel.updateOne({ _id: userDetails._id }, { onlineStatus: true, loginKey: 2, loginTimeStamp: generate_timestamp_In_seconds() });
                    res.status(OK).json({ data: res_obj, code: OK, message: messages.loginSuccessful });
                }
                else {
                    throw new CustomError(messages.userNotFound_withPhoneNumber, StatusCodes.NON_AUTHORITATIVE_INFORMATION);
                }
            } else {
                throw new CustomError(messages.accountBlocked, StatusCodes.BAD_REQUEST);
            }
        } else {
            throw new CustomError(messages.userNotFound_withPhoneNumber, StatusCodes.NON_AUTHORITATIVE_INFORMATION);
        }
    } catch (err) {
        next(err);
    }
}
const dd = async () => {
    await chat_room_messageModel.deleteMany({ messageType: { $in: ['online', 'offline'] } })
}
// dd();

const userInfo = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { countryCode, phoneNumber } = req.query;
        const userDetails = await userModel.findOne({ countryCode: "+" + countryCode, phoneNumber: phoneNumber, isDelete: false }, { countryCode: 1, phoneNumber: 1 });
        if (userDetails) {
            res.status(OK).json({ userExists: true, code: OK });
        } else {
            res.status(OK).json({ userExists: false, code: OK });
        }
    } catch (err) {
        next(err);
    }
}

const updateProfile = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.user;
        const { name, email, image, dob } = req.body;
        const userDetails = await userModel.findOneAndUpdate({ _id: id }, { name: name, dob: dob, email: email, image: image }, { new: true, fields: { password1: 0, password2: 0 } });
        if (userDetails) {
            res.status(OK).json({ data: userDetails, code: OK });
        } else {
            throw new CustomError(messages.userNotFound_withPhoneNumber, StatusCodes.NOT_FOUND);
        }
    } catch (err) {
        next(err);
    }
}

const userDetails = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.user;
        const userDetails = await userModel.findOne({ _id: id }, { password1: 0, password2: 0 }, { new: true });
        if (userDetails) {
            res.status(OK).json({ data: userDetails, image_baseUrl: process.env.Bucket_Base_Url, code: OK });
        } else {
            throw new CustomError(messages.userNotFound_withPhoneNumber, StatusCodes.NOT_FOUND);
        }
    } catch (err) {
        next(err);
    }
}

const logout = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { authorization } = req.headers;
        const user_sessionDetails = await sessionModel.findOne({ accessToken: authorization }, { refreshToken: 1, userId: 1, accessToken: 1 });
        if (user_sessionDetails) {
            await sessionModel.updateMany({ refreshToken: user_sessionDetails.refreshToken }, { isDelete: true, status: false });
            const user_details = await userModel.findOneAndUpdate({ _id: user_sessionDetails.userId }, { onlineStatus: false });
            await offline_online_all_rooms({ userId: user_sessionDetails.userId, status: 'offline', name: user_details?.name ?? '' });
            res.status(OK).json({ code: OK, message: messages.logoutSuccessful });
        } else {
            throw new CustomError(messages.invalidToken, StatusCodes.UNAUTHORIZED);
        }
    } catch (err) {
        next(err);
    }
}

const re_generateAccessToken = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { authorization } = req.headers;
        const JWT_SECRET_TOKEN: any = process.env.JWT_SECRET_TOKEN
        const verified: any = jwt.verify(authorization, JWT_SECRET_TOKEN);
        const check = await userModel.findOne(
            { _id: verified.id, isDelete: false },
            { isDelete: 1, isActive: 1, loginKey: 1 }
        );

        if (check) {
            if (check?.isActive) {
                const checkSession = await sessionModel.findOne({
                    userId: verified.id,
                    refreshToken: authorization,
                    role: verified.role,
                    isDelete: false,
                });
                if (checkSession) {
                    const newAccessToken = await generate_accessToken(
                        verified.id,
                        verified.role,
                        verified.usingPasswordKey,
                        check.loginKey
                    );
                    const update = await sessionModel.updateOne({
                        userId: verified.id,
                        refreshToken: authorization,
                        role: verified.role,
                        isDelete: false,
                    }, {
                        accessToken: newAccessToken
                    });
                    if (update && update.modifiedCount == 1) {
                        res.status(StatusCodes.OK).send({
                            accessToken: newAccessToken,
                            message: messages.regeneratedGenerated,
                            code: StatusCodes.OK
                        });
                    } else {
                        return res.status(410).json({
                            error: messages.invalidToken,
                            message: messages.invalidToken,
                            code: 410
                        });
                    }
                } else {
                    return res.status(StatusCodes.UNAUTHORIZED).json({
                        error: messages.invalidToken,
                        message: messages.invalidToken,
                        code: StatusCodes.UNAUTHORIZED
                    });
                }
            } else {
                return res.status(StatusCodes.FORBIDDEN).json({
                    error: messages.accountBlocked,
                    message: messages.accountBlocked,
                    code: StatusCodes.FORBIDDEN,
                });
            }
        } else {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: messages.invalidToken,
                message: messages.invalidToken,
                code: StatusCodes.UNAUTHORIZED,
            });
        }
    } catch (err: any) {
        if (err.message == "jwt expired") {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: messages.sessionExpired,
                message: messages.sessionExpired,
                code: StatusCodes.UNAUTHORIZED
            });
        }
        return res.status(StatusCodes.UNAUTHORIZED).json({
            error: messages.invalidToken,
            message: messages.invalidToken,
            code: StatusCodes.UNAUTHORIZED
        });
    }
}

const updateNotification = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.user;
        const { isNotification = false } = req.body;
        const userDetails = await userModel.findOneAndUpdate({ _id: id }, { isNotification: isNotification }, { new: true, fields: { isNotification: 1 } });
        if (userDetails) {
            res.status(OK).json({ data: userDetails, code: OK });
        } else {
            throw new CustomError(messages.noDatafoundWithID, StatusCodes.NOT_FOUND);
        }
    } catch (err) {
        next(err);
    }
}

export default {
    addUser,
    store_image_during_signUp,
    userLogin,
    userInfo,
    updateProfile,
    userDetails,
    logout,
    re_generateAccessToken,
    updateNotification
} as const;