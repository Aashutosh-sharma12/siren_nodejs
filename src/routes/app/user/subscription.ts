import { Router } from "express";
import subController from '@controllers/user/subscription';
import { check_access, checkRole, verifyAuthToken } from "@utils/authValidator";
import { schemaValidator } from "@utils/schemaValidator";
import { purchase_subscriptionSchema } from "@validators/user/add";

const route = Router();
const p = {
    sub_list: '/sub_list',
    user_sub_list: '/user_sub_list',
    purchase_subscription: '/purchase_subscription'
};

route.get(p.sub_list, verifyAuthToken, checkRole(['user']), check_access([0, 1]), subController.sub_list);
route.get(p.user_sub_list, verifyAuthToken, checkRole(['user']), check_access([0, 1]), subController.user_sub_list);
route.post(p.purchase_subscription, verifyAuthToken, checkRole(['user']), check_access([0, 1]), schemaValidator(purchase_subscriptionSchema), subController.purchase_subscription);
export default route;