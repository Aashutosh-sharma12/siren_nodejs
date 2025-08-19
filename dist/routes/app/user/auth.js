"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../../../controllers/user/auth"));
const schemaValidator_1 = require("../../../utils/schemaValidator");
const auth_2 = require("../../../validators/user/auth");
const authValidator_1 = require("../../../utils/authValidator");
const multer_1 = require("../../../utils/multer");
const route = (0, express_1.Router)();
const p = {
    addUser: '/signUp',
    userLogin: '/signIn',
    userInfo: '/getUserInfo',
    re_generateAccessToken: '/re_generateAccessToken',
    updateProfile: '/updateProfile',
    userDetails: '/userDetails',
    logout: '/logout',
    updateNotification: '/updateNotification'
};
route.post(p.addUser, multer_1.upload.fields([{ name: 'image', maxCount: 1 }]), multer_1.checkFileSize, (0, schemaValidator_1.schemaValidator)(auth_2.authSchema), auth_1.default.addUser);
// route.post(p.addUser, schemaValidator(authSchema), authController.addUser);
route.post(p.userLogin, (0, schemaValidator_1.schemaValidator)(auth_2.loginSchema), auth_1.default.userLogin);
route.get(p.userInfo, (0, schemaValidator_1.schemaValidator_forQueryReq)(auth_2.userInfoSchema), auth_1.default.userInfo);
route.get(p.re_generateAccessToken, auth_1.default.re_generateAccessToken);
route.put(p.updateProfile, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(['user']), (0, schemaValidator_1.schemaValidator)(auth_2.profileSchema), auth_1.default.updateProfile);
route.get(p.userDetails, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(['user']), auth_1.default.userDetails);
route.get(p.logout, auth_1.default.logout);
route.patch(p.updateNotification, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(['user']), auth_1.default.updateNotification);
exports.default = route;
