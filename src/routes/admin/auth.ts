import { Router, Request, Response } from "express";
import adminController from "@controllers/admin/auth";
import { StatusCodes } from "http-status-codes";
import { schemaValidator } from "@utils/schemaValidator";
import { adminLogin, adminSignup, changeAdminPassValidation } from "@validators/admin/adminValidator";
import { checkRole, verifyAuthToken } from "@utils/authValidator";


const authRoute = Router();
const { OK, CREATED } = StatusCodes;

const p = {
  add: "/add",
  login: "/login",
  changePass: '/change_password',
  logout: "/logout"
};

authRoute.post(p.add, schemaValidator(adminSignup), async (req, res) => {
  const data = await adminController.adminSignup(req.body);
  res.status(CREATED).json({ data, code: CREATED });
});


authRoute.post(p.login, schemaValidator(adminLogin), async (req, res) => {
  const data = await adminController.adminLogin(req.body, req.headers);
  res.status(OK).json({ code: OK, data });
});

authRoute.patch(p.changePass, verifyAuthToken, checkRole(["admin"]), schemaValidator(changeAdminPassValidation), async (req: any, res) => {
  console.log("Req", req.body)
  const data = await adminController.changeAdminPassword(req.body, req.user.id);
  res.status(OK).json({ code: OK, data });
});


authRoute.get(p.logout, verifyAuthToken, checkRole(["admin"]), async (req: Request, res: Response) => {
  const data = await adminController.logoutAdmin(req.headers);
  res.status(OK).json({ data, code: OK });
}
);

export default authRoute;
