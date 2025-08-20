"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pre_signedUrlSchema = exports.promptListSchema = void 0;
const index_1 = __importDefault(require("../../Custom_message/index"));
const joi_1 = __importDefault(require("joi"));
const promptListSchema = joi_1.default.object({
    categoryId: joi_1.default.string()
        .min(24).max(24)
        .required()
        .messages({
        "string.min": index_1.default.invalidMongoId.replace("{{key}}", "categoryId"),
    }),
    industriesId: joi_1.default.string()
        .min(24).max(24)
        .required()
        .messages({
        "string.min": index_1.default.invalidMongoId.replace("{{key}}", "categoryId"),
    })
});
exports.promptListSchema = promptListSchema;
const pre_signedUrlSchema = joi_1.default.object({
    type: joi_1.default.string().required().valid('profle-image', 'group-profile-image', 'single', 'double', 'group'),
    fileName: joi_1.default.string().required(),
    fileType: joi_1.default.string().required(),
    roomId: joi_1.default.when('type', {
        is: joi_1.default.valid('profle-image', 'group-profile-image'),
        then: joi_1.default.string().optional().allow(null, ''),
        otherwise: joi_1.default.string().required()
    }),
    mediaType: joi_1.default.string().required()
});
exports.pre_signedUrlSchema = pre_signedUrlSchema;
