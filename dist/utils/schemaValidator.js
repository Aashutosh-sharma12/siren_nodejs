"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemaValidator_forQueryReq = exports.schemaValidator = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const schemaValidator = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        const valid = error == null;
        if (valid) {
            next();
        }
        else {
            const { details } = error;
            const message = details
                .map((i) => i.message.split('"').join(""))
                .join(",");
            return res.status(http_status_codes_1.default.UNPROCESSABLE_ENTITY).json({
                error: message,
                message: message,
                code: http_status_codes_1.default.UNPROCESSABLE_ENTITY,
            });
        }
    };
};
exports.schemaValidator = schemaValidator;
const schemaValidator_forQueryReq = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.query);
        const valid = error == null;
        if (valid) {
            next();
        }
        else {
            const { details } = error;
            const message = details
                .map((i) => i.message.split('"').join(""))
                .join(",");
            return res.status(http_status_codes_1.default.UNPROCESSABLE_ENTITY).json({
                error: message,
                message: message,
                code: http_status_codes_1.default.UNPROCESSABLE_ENTITY,
            });
        }
    };
};
exports.schemaValidator_forQueryReq = schemaValidator_forQueryReq;
