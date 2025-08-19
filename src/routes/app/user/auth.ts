import { Router } from "express";
import authController from '@controllers/user/auth';
import { schemaValidator, schemaValidator_forQueryReq } from "@utils/schemaValidator";
import { authSchema, loginSchema, userInfoSchema, profileSchema } from "@validators/user/auth";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { checkFileSize, upload } from "@utils/multer";

const route = Router();
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

route.post(p.addUser, upload.fields([{ name: 'image', maxCount: 1 }]), checkFileSize, schemaValidator(authSchema), authController.addUser);
// route.post(p.addUser, schemaValidator(authSchema), authController.addUser);
route.post(p.userLogin, schemaValidator(loginSchema), authController.userLogin);
route.get(p.userInfo, schemaValidator_forQueryReq(userInfoSchema), authController.userInfo);
route.get(p.re_generateAccessToken, authController.re_generateAccessToken);
route.put(p.updateProfile, verifyAuthToken, checkRole(['user']), schemaValidator(profileSchema), authController.updateProfile);
route.get(p.userDetails, verifyAuthToken, checkRole(['user']), authController.userDetails);
route.get(p.logout, authController.logout);
route.patch(p.updateNotification, verifyAuthToken, checkRole(['user']), authController.updateNotification);

export default route;