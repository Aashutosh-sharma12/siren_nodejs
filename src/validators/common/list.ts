import messages from "@Custom_message/index";
import Joi from "joi";

const promptListSchema = Joi.object({
    categoryId: Joi.string()
        .min(24).max(24)
        .required()
        .messages({
            "string.min": messages.invalidMongoId.replace("{{key}}", "categoryId"),
        }),
    industriesId: Joi.string()
        .min(24).max(24)
        .required()
        .messages({
            "string.min": messages.invalidMongoId.replace("{{key}}", "categoryId"),
        })
});

const pre_signedUrlSchema = Joi.object({
    type: Joi.string().required().valid('profle-image', 'group-profile-image', 'single', 'double', 'group'),
    fileName: Joi.string().required(),
    fileType: Joi.string().required(),
    roomId: Joi.when('type', {
        is: Joi.valid('profle-image', 'group-profile-image'),
        then: Joi.string().optional().allow(null, ''),
        otherwise: Joi.string().required()
    }),
    mediaType: Joi.string().required()
});
export {
    promptListSchema,
    pre_signedUrlSchema
}