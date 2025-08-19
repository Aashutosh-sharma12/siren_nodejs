"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileSchema = exports.userInfoSchema = exports.loginSchema = exports.authSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const customJoi = joi_1.default.extend((joi) => ({
    type: "phoneNumber",
    base: joi.string(),
    messages: {
        "phoneNumber.base": "Phone Number should contain only digits",
    },
    rules: {
        digitsOnly: {
            validate(value, helpers) {
                if (value !== "" && !/^[0-9]+$/.test(value)) {
                    return helpers.error("phoneNumber.base");
                }
                return value;
            },
        },
    },
}));
const authSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).required(),
    email: joi_1.default.string().email({ minDomainSegments: 2 }).required(),
    countryCode: joi_1.default.string().required(),
    phoneNumber: customJoi
        .phoneNumber()
        .min(3)
        .max(20)
        .required()
        .digitsOnly()
        .messages({
        "string.empty": "Phone Number cannot be an empty field",
        "string.min": "Phone Number should have a minimum length of {#limit}",
        "string.max": "Phone Number should have a maximum length of {#limit}",
        "any.required": "Phone Number is a required field",
        "phoneNumber.base": "Phone Number should contain only digits",
    }),
    // image: Joi.string().required(),
    password1: joi_1.default.string().required(),
    password2: joi_1.default.string().required(),
    dob: joi_1.default.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required()
        .messages({
        "string.pattern.base": "Date of birth must be in YYYY-MM-DD format",
        "string.empty": "Date of birth is required",
        "any.required": "Date of birth is required"
    })
});
exports.authSchema = authSchema;
const loginSchema = joi_1.default.object({
    countryCode: joi_1.default.string().required(),
    phoneNumber: customJoi
        .phoneNumber()
        .min(3)
        .max(20)
        .required()
        .digitsOnly()
        .messages({
        "string.empty": "Phone Number cannot be an empty field",
        "string.min": "Phone Number should have a minimum length of {#limit}",
        "string.max": "Phone Number should have a maximum length of {#limit}",
        "any.required": "Phone Number is a required field",
        "phoneNumber.base": "Phone Number should contain only digits",
    }),
    password: joi_1.default.string().required(),
});
exports.loginSchema = loginSchema;
const userInfoSchema = joi_1.default.object({
    countryCode: joi_1.default.string().required(),
    phoneNumber: customJoi
        .phoneNumber()
        .min(3)
        .max(20)
        .required()
        .digitsOnly()
        .messages({
        "string.empty": "Phone Number cannot be an empty field",
        "string.min": "Phone Number should have a minimum length of {#limit}",
        "string.max": "Phone Number should have a maximum length of {#limit}",
        "any.required": "Phone Number is a required field",
        "phoneNumber.base": "Phone Number should contain only digits",
    })
});
exports.userInfoSchema = userInfoSchema;
const profileSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).required(),
    email: joi_1.default.string().email({ minDomainSegments: 2 }).required(),
    image: joi_1.default.string().optional().allow(''),
    dob: joi_1.default.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required()
        .messages({
        "string.pattern.base": "Date of birth must be in YYYY-MM-DD format",
        "string.empty": "Date of birth is required",
        "any.required": "Date of birth is required",
    })
});
exports.profileSchema = profileSchema;
