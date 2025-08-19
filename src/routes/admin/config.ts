import {Router} from "express"
const configRoute = Router();
import configController from "@controllers/admin/config";
import { StatusCodes } from "http-status-codes";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { schemaValidator, schemaValidator_forQueryReq } from "@utils/schemaValidator";
import { configValidator } from "@validators/admin/adminValidator";
const {OK, CREATED} = StatusCodes


const p = {
    logoutORPanicTime:"/lotoutORpaniTime",
    lastData:"/lastData"
  };

  
configRoute.post(p.logoutORPanicTime, verifyAuthToken, checkRole(["admin"]), 
  schemaValidator(configValidator),
 async (req: any, res: any) => {
    const data = await configController.saveLogoutSessionORPanicTime(req.user.id, req?.body, req?.headers);
    res.status(OK).json({ code: OK, data });
  }
)

configRoute.get(p.lastData, verifyAuthToken, checkRole(["admin"]), 
 async (req: any, res: any) => {
    const data = await configController.getLastAddedValue(req.user.id, req?.query, req?.headers);
    res.status(OK).json({ code: OK, data });
  }
)




export default configRoute;