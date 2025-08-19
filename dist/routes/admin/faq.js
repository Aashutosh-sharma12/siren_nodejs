"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const faqRouter = (0, express_1.Router)();
const faq_1 = __importDefault(require("../../controllers/admin/faq"));
const http_status_codes_1 = require("http-status-codes");
const authValidator_1 = require("../../utils/authValidator");
const { OK, CREATED } = http_status_codes_1.StatusCodes;
const schemaValidator_1 = require("../../utils/schemaValidator");
const adminValidator_1 = require("../../validators/admin/adminValidator");
const p = {
    add: "/addFAQ",
    edit: "/edit",
    delete: "/delete/:id",
    list: "/list",
    details: "/details/:id"
};
faqRouter.post(p.add, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), (0, schemaValidator_1.schemaValidator)(adminValidator_1.faqValidator), async (req, res) => {
    const data = await faq_1.default.addFaq(req?.body);
    res.status(CREATED).json({ code: CREATED, data });
});
faqRouter.get(p.list, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), async (req, res) => {
    const data = await faq_1.default.faqList(req?.query);
    res.status(OK).json({ code: OK, data });
});
faqRouter.patch(p.edit, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), (0, schemaValidator_1.schemaValidator)(adminValidator_1.faqEditValidator), async (req, res) => {
    const data = await faq_1.default.editFAQ(req?.body);
    res.status(OK).json({ data, code: OK });
});
faqRouter.delete(p.delete, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), async (req, res) => {
    const data = await faq_1.default.faqDelete(req?.params);
    res.status(OK).json({ data, code: OK });
});
faqRouter.get(p.details, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(["admin"]), async (req, res) => {
    const data = await faq_1.default.faqDetails(req?.params);
    res.status(OK).json({ code: OK, data });
});
exports.default = faqRouter;
