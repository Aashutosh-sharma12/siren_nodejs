import messages from '@Custom_message/index';
import Joi from 'joi';

const create_roomSchema = Joi.object({
    participantId: Joi.string()
        .min(24).max(24)
        .required()
        .messages({
            "string.min": messages.invalidMongoId.replace("{{key}}", "participantId"),
        })
});

const create_room_with_groupSchema = Joi.object({
    participantIds: Joi.string().required(),
    groupName: Joi.string().required()
});

const edit_groupSchema = Joi.object({
    roomId: Joi.string().required(),
    groupName: Joi.string().required(),
    image: Joi.string().optional().allow('', null)
});

const add_remove_participantsSchema = Joi.object({
    participantIds: Joi.array().min(1).required(),
    groupId: Joi.string().required()
});
const subscription_details = Joi.object({
    subId: Joi.string().required(),
    title: Joi.string().required(),
    amount: Joi.number().required(),
    currency: Joi.string().optional(),
    subscriptionType: Joi.string().valid('monthly', 'yearly', '6-months').required(), // e.g., monthly, yearly,6-months
    features: Joi.array().min(1).required()
});
const purchase_subscriptionSchema = Joi.object({
    userId: Joi.string().required(),
    subscription_details: subscription_details.required()
});

export {
    create_roomSchema,
    create_room_with_groupSchema,
    add_remove_participantsSchema,
    edit_groupSchema,
    purchase_subscriptionSchema
}