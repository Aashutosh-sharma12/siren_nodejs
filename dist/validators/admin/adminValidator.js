"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.add_subscription = exports.appVersionSchema = exports.editSub = exports.addSub = exports.configValidator = exports.faqEditValidator = exports.faqValidator = exports.changeAdminPassValidation = exports.addAI_ProviderModel = exports.addTonValidator = exports.edit_feed = exports.add_feed = exports.statusValidator = exports.adminLogin = exports.adminSignup = exports.editCatValidator = exports.IndValidator = exports.CatValidator = void 0;
const index_1 = __importDefault(require("../../Custom_message/index"));
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
const IndValidator = joi_1.default.object({
    name: joi_1.default.string().required(),
    llmId: joi_1.default.string().optional(),
    isActive: joi_1.default.boolean().required()
});
exports.IndValidator = IndValidator;
const CatValidator = joi_1.default.object({
    name: joi_1.default.string().required(),
    isActive: joi_1.default.boolean().required()
});
exports.CatValidator = CatValidator;
const editCatValidator = joi_1.default.object({
    name: joi_1.default.string().required(),
    isActive: joi_1.default.boolean().required(),
    id: joi_1.default.string().min(24).required()
        .messages({
        'string.min': index_1.default.invalidMongoId.replace('{{key}}', 'id')
    }),
});
exports.editCatValidator = editCatValidator;
const adminSignup = joi_1.default.object({
    username: joi_1.default.string().required().min(3),
    email: joi_1.default.string().email({ minDomainSegments: 2 }).required(),
    password: joi_1.default.string()
        .required()
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#_])[A-Za-z\\d@$!%*?&#_]{8,20}$"))
        .messages({
        "string.pattern.base": "Password must have minimum 8 characters and maximum 20 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
    countryCode: joi_1.default.string(),
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
});
exports.adminSignup = adminSignup;
const adminLogin = joi_1.default.object({
    email: joi_1.default.string().email({ minDomainSegments: 2 }).required(),
    password: joi_1.default.string().required(),
});
exports.adminLogin = adminLogin;
const statusValidator = joi_1.default.object({
    userId: joi_1.default.string().min(24).required()
        .messages({
        'string.min': index_1.default.invalidMongoId.replace('{{key}}', 'userId')
    }),
    status: joi_1.default.boolean().required()
});
exports.statusValidator = statusValidator;
const add_feed = joi_1.default.object({
    name: joi_1.default.string().required(),
    image: joi_1.default.string().optional().allow('', null)
});
exports.add_feed = add_feed;
const edit_feed = joi_1.default.object({
    name: joi_1.default.string().required(),
    image: joi_1.default.string().optional().allow('', null),
    feedId: joi_1.default.string().min(24).required()
        .messages({
        'string.min': index_1.default.invalidMongoId.replace('{{key}}', 'feedId')
    }),
});
exports.edit_feed = edit_feed;
const addTonValidator = joi_1.default.object({
    title: joi_1.default.string().required(),
    isActive: joi_1.default.boolean().required()
});
exports.addTonValidator = addTonValidator;
const addAI_ProviderModel = joi_1.default.object({
    providerId: joi_1.default.string().min(24).required()
        .messages({
        'string.min': index_1.default.invalidMongoId.replace('{{key}}', 'providerId')
    }),
    name: joi_1.default.string().required(),
    isActive: joi_1.default.boolean().required(),
});
exports.addAI_ProviderModel = addAI_ProviderModel;
const changeAdminPassValidation = joi_1.default.object({
    current_password: joi_1.default.string()
        .required()
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#_])[A-Za-z\\d@$!%*?&#_]{8,20}$"))
        .messages({
        "string.pattern.base": "Current-Password must have minimum 8 characters and maximum 20 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
    new_password: joi_1.default.string()
        .required()
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#_])[A-Za-z\\d@$!%*?&#_]{8,}$"))
        .messages({
        "string.pattern.base": "New-Password must have minimum 8 characters and maximum 20 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
    confirm_new_password: joi_1.default.string().valid(joi_1.default.ref('new_password')).messages({ "any.only": "Both Password must be same" })
});
exports.changeAdminPassValidation = changeAdminPassValidation;
const faqValidator = joi_1.default.object({
    que: joi_1.default.string().required(),
    ans: joi_1.default.string().required(),
    isActive: joi_1.default.boolean().required(),
    role: joi_1.default.string().required()
});
exports.faqValidator = faqValidator;
const faqEditValidator = joi_1.default.object({
    que: joi_1.default.string().required(),
    ans: joi_1.default.string().required(),
    isActive: joi_1.default.boolean().required(),
    id: joi_1.default.string().min(24).required()
        .messages({
        'string.min': index_1.default.invalidMongoId.replace('{{key}}', 'id')
    }),
});
exports.faqEditValidator = faqEditValidator;
// const configValidator = Joi.object({
//   logoutSession: Joi.number().optional(),
//   panicDay: Joi.number().optional(),
//   panicHour: Joi.number().optional(),
//   panicMinute: Joi.number().optional(),
// })
// .or('panicDay', 'panicHour', 'panicMinute')
// .messages({
//   'object.missing': 'At least one of Day, Hour or Minute is required.'
// });
const configValidator = joi_1.default.object({
    logoutSession: joi_1.default.number().optional(),
    panicDay: joi_1.default.number().optional(),
    panicHour: joi_1.default.number().optional(),
    panicMinute: joi_1.default.number().optional(),
})
    .when(joi_1.default.object({ logoutSession: joi_1.default.exist() }).unknown(), {
    then: joi_1.default.object({
        panicDay: joi_1.default.number().optional(),
        panicHour: joi_1.default.number().optional(),
        panicMinute: joi_1.default.number().optional(),
    }),
    otherwise: joi_1.default.object({
        panicDay: joi_1.default.number(),
        panicHour: joi_1.default.number(),
        panicMinute: joi_1.default.number()
    }).or('panicDay', 'panicHour', 'panicMinute')
        .messages({
        'object.missing': 'At least one of Day, Hour or Minute is required when logoutSession is not provided.'
    })
});
exports.configValidator = configValidator;
const addSub = joi_1.default.object({
    title: joi_1.default.string().required(),
    amount: joi_1.default.number().required(),
    features: joi_1.default.array().required(),
    subscriptionType: joi_1.default.string().required().valid('monthly', 'yearly', '6-months'),
});
exports.addSub = addSub;
const editSub = joi_1.default.object({
    subId: joi_1.default.string().required(),
    title: joi_1.default.string().required(),
    amount: joi_1.default.number().required(),
    features: joi_1.default.array().required(),
    subscriptionType: joi_1.default.string().required().valid('monthly', 'yearly', '6-months'),
});
exports.editSub = editSub;
const appVersionSchema = joi_1.default.object({
    androidVersion: joi_1.default.string().required(),
    iosVersion: joi_1.default.string().required(),
    androidUpdate_Type: joi_1.default.string().required().valid("Force", "Normal"),
    iosUpdate_Type: joi_1.default.string().required().valid("Force", "Normal"),
});
exports.appVersionSchema = appVersionSchema;
const add_subscription = joi_1.default.object({
    userId: joi_1.default.string().min(24).required()
        .messages({
        'string.min': index_1.default.invalidMongoId.replace('{{key}}', 'userId')
    }),
    subId: joi_1.default.string().min(24).required()
        .messages({
        'string.min': index_1.default.invalidMongoId.replace('{{key}}', 'subId')
    }),
});
exports.add_subscription = add_subscription;
