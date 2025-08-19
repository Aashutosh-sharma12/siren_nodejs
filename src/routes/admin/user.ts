import { Router } from "express";
const userRouter = Router();
import userContoller from "@controllers/admin/user";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { schemaValidator } from "@utils/schemaValidator";
import { add_subscription, statusValidator } from "@validators/admin/adminValidator";

const p = {
  list: "/list",
  statusUpdate: "/updateStatus",
  details: "/details/:id",
  deleteUser: "/deleteUser/:id",
  updateUser_access: '/updateUser_access/:id/:status',
  user_sub_list: '/user_sub_list/:id',
  purchase_subscription: "/purchase_subscription"
};

userRouter.get(p.list, verifyAuthToken, checkRole(["admin"]), userContoller.listUser);
userRouter.patch(p.statusUpdate, verifyAuthToken, checkRole(["admin"]), schemaValidator(statusValidator), userContoller.updateStatus);
userRouter.get(p.details, verifyAuthToken, checkRole(["admin"]), userContoller.details);
userRouter.delete(p.deleteUser, verifyAuthToken, checkRole(["admin"]), userContoller.deleteUser);
userRouter.get(p.updateUser_access, verifyAuthToken, checkRole(["admin"]), userContoller.updateUser_access);
userRouter.get(p.user_sub_list, verifyAuthToken, checkRole(["admin"]), userContoller.user_sub_list);
userRouter.post(p.purchase_subscription, verifyAuthToken, checkRole(["admin"]), schemaValidator(add_subscription), userContoller.purchase_subscription);
export default userRouter;
