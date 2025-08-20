"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchase_subscriptionSchema = exports.edit_groupSchema = exports.add_remove_participantsSchema = exports.create_room_with_groupSchema = exports.create_roomSchema = void 0;
const index_1 = __importDefault(require("../../Custom_message/index"));
const joi_1 = __importDefault(require("joi"));
const create_roomSchema = joi_1.default.object({
    participantId: joi_1.default.string()
        .min(24).max(24)
        .required()
        .messages({
        "string.min": index_1.default.invalidMongoId.replace("{{key}}", "participantId"),
    })
});
exports.create_roomSchema = create_roomSchema;
const create_room_with_groupSchema = joi_1.default.object({
    participantIds: joi_1.default.string().required(),
    groupName: joi_1.default.string().required()
});
exports.create_room_with_groupSchema = create_room_with_groupSchema;
const edit_groupSchema = joi_1.default.object({
    roomId: joi_1.default.string().required(),
    groupName: joi_1.default.string().required(),
    image: joi_1.default.string().optional().allow('', null)
});
exports.edit_groupSchema = edit_groupSchema;
const add_remove_participantsSchema = joi_1.default.object({
    participantIds: joi_1.default.array().min(1).required(),
    groupId: joi_1.default.string().required()
});
exports.add_remove_participantsSchema = add_remove_participantsSchema;
const subscription_details = joi_1.default.object({
    subId: joi_1.default.string().required(),
    title: joi_1.default.string().required(),
    amount: joi_1.default.number().required(),
    currency: joi_1.default.string().optional(),
    subscriptionType: joi_1.default.string().valid('monthly', 'yearly', '6-months').required(), // e.g., monthly, yearly,6-months
    features: joi_1.default.array().min(1).required()
});
const purchase_subscriptionSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
    subscription_details: subscription_details.required()
});
exports.purchase_subscriptionSchema = purchase_subscriptionSchema;
