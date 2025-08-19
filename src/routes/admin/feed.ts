import { Router } from "express";
const userRouter = Router();
import feedContoller from "@controllers/admin/feed";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
import { schemaValidator } from "@utils/schemaValidator";
import { add_feed, edit_feed, statusValidator } from "@validators/admin/adminValidator";
import { checkFileSize, upload } from "@utils/multer";

const p = {
    list: "/list",
    // statusUpdate: "/updateStatus",
    details: "/details/:id",
    add_feed: "/add_feed",
    edit_feed: '/edit_feed'
};

userRouter.get(p.list, verifyAuthToken, checkRole(["admin"]), feedContoller.list);
userRouter.get(p.details, verifyAuthToken, checkRole(["admin"]), feedContoller.details);
userRouter.post(p.add_feed, verifyAuthToken, checkRole(["admin"]), upload.fields([{ name: 'image', maxCount: 1 }]), checkFileSize, schemaValidator(add_feed), feedContoller.add_feed);
userRouter.put(p.edit_feed, verifyAuthToken, checkRole(["admin"]), upload.fields([{ name: 'image', maxCount: 1 }]), checkFileSize, schemaValidator(edit_feed), feedContoller.edit_feed);

export default userRouter;
