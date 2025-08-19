import { Router } from "express";
import subController from "@controllers/admin/subscription";
import { schemaValidator } from "@utils/schemaValidator";
import { addSub, editSub } from "@validators/admin/adminValidator";
import { checkRole, verifyAuthToken } from "@utils/authValidator";

const authRoute = Router();

const p = {
    add: "/add",
    edit: '/edit',
    details: '/details/:id',
    list: '/list',
    updateStatus: '/update-status/:id',
    deleteSub: '/delete/:id'
};

authRoute.post(p.add, verifyAuthToken, checkRole(["admin"]), schemaValidator(addSub), subController.add_subscription);
authRoute.put(p.edit, verifyAuthToken, checkRole(["admin"]), schemaValidator(editSub), subController.edit_subscription);
authRoute.get(p.details, verifyAuthToken, checkRole(["admin"]), subController.details);
authRoute.get(p.list, verifyAuthToken, checkRole(["admin"]), subController.list);
authRoute.get(p.updateStatus, verifyAuthToken, checkRole(["admin"]), subController.updateStatus);
authRoute.delete(p.deleteSub, verifyAuthToken, checkRole(["admin"]), subController.deleteSub);

export default authRoute;
