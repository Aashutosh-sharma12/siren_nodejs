import {Router} from "express"
const dashboardRoute = Router();
import dashboardController from "@controllers/admin/dashboard";
import { StatusCodes } from "http-status-codes";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { schemaValidator, schemaValidator_forQueryReq } from "@utils/schemaValidator";
const {OK, CREATED} = StatusCodes


const p = {
    dashboardCount:"/dashboardCount"
  };

dashboardRoute.get(p.dashboardCount, verifyAuthToken, checkRole(["admin"]), 
 async (req: any, res: any) => {
    const data = await dashboardController.dashboardCount(req?.query, req?.headers);
    res.status(OK).json({ code: OK, data });
  }
)



export default dashboardRoute;