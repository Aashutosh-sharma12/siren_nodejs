import { adminModal, sessionModel } from "@models/index";
import { CustomError } from "@utils/errors";
import messages from "@Custom_message/index";
import { StatusCodes } from "http-status-codes";
import argon2 from "argon2";
const jwt = require("jsonwebtoken");

function adminSignup(body: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { password, email } = body
      const check = await adminModal.findOne({ email: email });
      if (check !== null) {
        reject(new CustomError(messages.accountAlreadyExist, StatusCodes.UNPROCESSABLE_ENTITY));
      } else {
        const hashPass = await argon2.hash(password);
        body.password = hashPass
        const addDataResult = await adminModal.create(body);
        if (addDataResult !== null) {
          resolve(addDataResult);
        }
      }
    } catch (err) {
      reject(err);
    }
  });
}


function adminLogin(body: any, headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { email, password } = body;
      const { devicetype, deviceip, devicetoken, language = 'en', timezone = 'Asia/Calcutta' } = headers;
      const findAdmin: any = await adminModal.findOne({ email: email.toLowerCase() }).lean();
      if (findAdmin) {
        const verifyPassword = await argon2.verify(`${findAdmin.password}`, password);
        if (verifyPassword) {
          const access_token = jwt.sign(
            { id: findAdmin._id, role: "admin" },
            process.env.JWT_SECRET_TOKEN,
            {
              expiresIn: "30d"
            }
          );
          const session_obj = {
            userId: findAdmin._id,
            deviceType: devicetype,
            deviceIp: deviceip,
            deviceToken: devicetoken,
            language: language,
            timezone: timezone,
            accessToken: access_token,
            role: 'admin'
          }
          await sessionModel.create(session_obj)
          findAdmin.token = access_token;
          delete findAdmin.password;
          resolve(findAdmin);
        } else {
          reject(new CustomError(messages.wrongPassword, StatusCodes.BAD_REQUEST))
        }
      } else {
        reject(
          new CustomError(messages.noAccountMatch, StatusCodes.BAD_REQUEST)
        );
      }
    } catch (error) {
      reject(error)
    }
  })
}

function logoutAdmin(headers: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { authorization } = headers;
      await sessionModel.findOneAndUpdate({ accessToken: authorization }, { isDelete: true, status: false });
      resolve(messages.logoutSuccessful);
    } catch (error) {
      reject(error);
    }
  });
}

function changeAdminPassword(body: any, adminId: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { current_password, new_password, confirm_new_password } = body
      if (new_password === confirm_new_password) {
        const findUserByID = await adminModal.findOne({ _id: adminId });
        if (findUserByID) {
          const verifyoldPass = await argon2.verify(
            `${findUserByID?.password}`,
            current_password
          );
          if (!verifyoldPass) {
            reject(
              new CustomError(messages.wrongPassword, StatusCodes.BAD_REQUEST)
            );
          } else {
            if (current_password !== new_password) {
              const newPassword = await argon2.hash(new_password);
              await adminModal.updateOne({},
                { password: newPassword }
              );
              resolve(messages.passwordUpdateSuccessful);
            } else {
              reject(new CustomError(messages.bothNewAndCurrentSame, StatusCodes.BAD_REQUEST));
            }
          }
        } else {
          reject(
            new CustomError(messages.noDatafoundWithID, StatusCodes.BAD_REQUEST)
          );
        }
      } else {
        reject(
          new CustomError(messages.bothNewAndConfirmSame, StatusCodes.BAD_REQUEST)
        );
      }
    } catch (err) {
      reject(err);
    }
  });
}


export default {
  adminSignup,
  adminLogin,
  logoutAdmin,
  changeAdminPassword
} as const