import { Router, Request, Response } from "express";
const faqRouter = Router();
import faqContoller from "@controllers/admin/faq";
import { StatusCodes } from "http-status-codes";
import { checkRole, verifyAuthToken } from "@utils/authValidator";
const { OK, CREATED } = StatusCodes;


import {
  schemaValidator
} from "@utils/schemaValidator";
import { faqEditValidator, faqValidator } from "@validators/admin/adminValidator";


const p = {
  add: "/addFAQ",
  edit: "/edit",
  delete: "/delete/:id",
  list: "/list",
  details: "/details/:id"
};


faqRouter.post(
  p.add,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator(faqValidator),
  async (req: Request, res: Response) => {
    const data = await faqContoller.addFaq(req?.body);
    res.status(CREATED).json({ code: CREATED, data });
  }
);


faqRouter.get(
  p.list,
  verifyAuthToken,
  checkRole(["admin"]),
  async (req: Request, res: Response) => {
    const data = await faqContoller.faqList(req?.query);
    res.status(OK).json({ code: OK, data });
  }
);

faqRouter.patch(
  p.edit,
  verifyAuthToken,
  checkRole(["admin"]),
  schemaValidator(faqEditValidator),
  async (req: Request, res: Response) => {
    const data = await faqContoller.editFAQ(
      req?.body);
    res.status(OK).json({ data, code: OK });
  }
);

faqRouter.delete(
  p.delete,
  verifyAuthToken,
  checkRole(["admin"]),
  async (req: Request, res: Response) => {
    const data = await faqContoller.faqDelete(
      req?.params);
    res.status(OK).json({ data, code: OK });
  }
);


faqRouter.get(
  p.details,
  verifyAuthToken,
  checkRole(["admin"]),
  async (req: Request, res: Response) => {
    const data = await faqContoller.faqDetails(
      req?.params);
    res.status(OK).json({ code: OK, data });
  }
);



export default faqRouter;
