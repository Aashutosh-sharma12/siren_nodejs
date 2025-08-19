import { Router } from "express";
import listController from '@controllers/common_api/list';
import { schemaValidator } from "@utils/schemaValidator";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { pre_signedUrlSchema } from "@validators/common/list";

const route = Router();
const p = {
    generatePresignedUrl: '/generatePresignedUrl',
    sub_list: '/sub_list'
};

route.post(p.generatePresignedUrl, verifyAuthToken, checkRole(['user', 'admin']), schemaValidator(pre_signedUrlSchema), listController.generatePresignedUrl);
route.get(p.sub_list, verifyAuthToken, checkRole(['user', 'admin']), listController.sub_list);

export default route;