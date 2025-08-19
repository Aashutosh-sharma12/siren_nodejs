import {Router} from "express"
const appVersionRoute = Router();
import appVersionController from "@controllers/admin/appVersion";
import { StatusCodes } from "http-status-codes";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { schemaValidator, schemaValidator_forQueryReq } from "@utils/schemaValidator";
import { appVersionSchema } from "@validators/admin/adminValidator";

const {OK, CREATED} = StatusCodes


const p = {
    updateApp_version:"/updateApp_version",
    getAppVersion:"/getAppVersion"
  };

  
appVersionRoute.post(p.updateApp_version, verifyAuthToken, checkRole(["admin"]), 
schemaValidator(appVersionSchema),
 async (req: any, res: any) => {
    const data = await appVersionController.addVersion(req?.body, req?.headers);
    res.status(OK).json({ code: OK, data });
  }
)

appVersionRoute.get(p.getAppVersion, verifyAuthToken, checkRole(["admin"]), 
 async (req: any, res: any) => {
    const data = await appVersionController.getAppVersion(req?.headers);
    res.status(OK).json({ code: OK, data });
  }
)


export default appVersionRoute;