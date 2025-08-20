// const jwt = require("jsonwebtoken");
import jwt from "jsonwebtoken";
import StatusCodes from "http-status-codes";
import { NextFunction, Response, Request } from "express";
import messages from "@Custom_message/index";
import userModel from "@models/user";
import sessionModel from "@models/session";
import appVersionModal from "@models/appVersion";

declare module 'express' {
  export interface Request {
    user?: string;
  }
}

const verifyAuthToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.headers.authorization;
    const { devicetype, currentversion } = req.headers;
    if (!accessToken) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: messages.noToken,
        message: messages.noToken,
        code: StatusCodes.UNAUTHORIZED,
      });
    }
    const JWT_SECRET_TOKEN = process.env.JWT_SECRET_TOKEN;
    if (!JWT_SECRET_TOKEN) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: "JWT secret token is not configured.",
        message: "JWT secret token is not configured.",
        code: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
    const verified: any = jwt.verify(accessToken, JWT_SECRET_TOKEN);
    if (verified.role == "admin") {
      const findAdmin = await sessionModel.findOne({
        accessToken: accessToken, role: "admin", isDelete: false,
        status: true
      });
      if (findAdmin) {
        req.user = verified;
        next();
        return;
      } else {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: messages.invalidToken,
          message: messages.invalidToken,
          code: StatusCodes.UNAUTHORIZED,
        });
      }
    }
    const check = await userModel.findOne(
      { _id: verified.id },
      { isDelete: 1, isActive: 1 }
    );
    if (check) {
      if (check.isDelete) {
        return res.status(StatusCodes.GONE).json({
          error: messages.userDeleted,
          message: messages.userDeleted,
          code: StatusCodes.GONE //410
        });
      } else if (check.isActive) {
        const checkSession = await sessionModel.findOne({
          userId: verified.id,
          accessToken: accessToken,
          role: verified.role,
          isDelete: false,
          status: true
        });
        if (checkSession) {
          const check_appVersion: any = await appVersionModal.findOne({ isDelete: false });
          if (check_appVersion) {
            if (devicetype && devicetype == 'android' && currentversion && check_appVersion.androidVersion != currentversion && check_appVersion.androidUpdate_Type == 'Force') {
              return res.status(StatusCodes.HTTP_VERSION_NOT_SUPPORTED).json({
                error: messages.updatedVersion_available,
                message: messages.updatedVersion_available,
                versionType: check_appVersion.versionStatus_android,
                code: StatusCodes.HTTP_VERSION_NOT_SUPPORTED,
              });
            }
            if (devicetype && devicetype == 'ios' && currentversion && check_appVersion.iosVersion != currentversion && check_appVersion.iosUpdate_Type == 'Force') {
              return res.status(StatusCodes.HTTP_VERSION_NOT_SUPPORTED).json({
                error: messages.updatedVersion_available,
                message: messages.updatedVersion_available,
                versionType: check_appVersion.versionStatus_ios,
                code: StatusCodes.HTTP_VERSION_NOT_SUPPORTED,
              });
            }
          }
          req.user = verified;
          next();
          return;
        } else {
          return res.status(StatusCodes.UNAUTHORIZED).json({
            error: messages.sessionExpired,
            message: messages.sessionExpired,
            code: StatusCodes.UNAUTHORIZED,
          });
        }
      } else {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: messages.accountBlocked,
          message: messages.accountBlocked,
          code: StatusCodes.FORBIDDEN, //403
        });
      }
    } else {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: messages.invalidToken,
        message: messages.invalidToken,
        code: StatusCodes.UNAUTHORIZED, //401
      });
    }
  } catch (err) {
    console.error("Error verifying token:", err);
    if (typeof err === "object" && err !== null && "message" in err && (err as any).message === "jwt expired") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: messages.access_tokenExpired,
        message: messages.access_tokenExpired,
        code: StatusCodes.UNAUTHORIZED,
      });
    }
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: messages.invalidToken,
      message: messages.invalidToken,
      code: StatusCodes.UNAUTHORIZED,
    });
  }
}

const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user && roles.includes((req.user as any).role)) {
      next();
    }
    else {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: messages.unAuthRole,
        message: messages.unAuthRole,
        code: StatusCodes.FORBIDDEN, //403
      });
    }
  };
};

const check_access = (access: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user && access.includes((req.user as any).loginKey_status)) {
      next();
    }
    else {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: messages.not_full_access,
        message: messages.not_full_access,
        httpcode: StatusCodes.FORBIDDEN, //403
        code: (req.user as any).loginKey_status
      });
    }
  };
};
export { verifyAuthToken, checkRole, check_access };
