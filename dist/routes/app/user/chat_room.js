"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_room_1 = __importDefault(require("../../../controllers/user/chat_room"));
const authValidator_1 = require("../../../utils/authValidator");
const multer_1 = require("../../../utils/multer");
const schemaValidator_1 = require("../../../utils/schemaValidator");
const add_1 = require("../../../validators/user/add");
const route = (0, express_1.Router)();
const p = {
    createRoom: '/createRoom',
    createRoom_with_group: '/createRoom_with_group',
    update_group_profile: '/update_group_profile',
    room_details: '/room_details/:id',
    add_participants: '/add_participants',
    remove_participants: '/remove_participants',
    delete_msg: '/delete_msg/:id',
    check_participant_status: '/check_participant_status/:id'
};
route.post(p.createRoom, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(['user']), (0, authValidator_1.check_access)([0, 1]), (0, schemaValidator_1.schemaValidator)(add_1.create_roomSchema), chat_room_1.default.createRoom);
route.post(p.createRoom_with_group, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(['user']), (0, authValidator_1.check_access)([0, 1]), multer_1.upload.fields([{ name: 'image', maxCount: 1 }]), multer_1.checkFileSize, (0, schemaValidator_1.schemaValidator)(add_1.create_room_with_groupSchema), chat_room_1.default.createRoom_with_group);
route.put(p.update_group_profile, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(['user']), (0, authValidator_1.check_access)([0, 1]), multer_1.upload.fields([{ name: 'image', maxCount: 1 }]), multer_1.checkFileSize, (0, schemaValidator_1.schemaValidator)(add_1.edit_groupSchema), chat_room_1.default.update_group_profile);
route.get(p.room_details, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(['user']), (0, authValidator_1.check_access)([0, 1]), chat_room_1.default.room_details);
route.put(p.add_participants, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(['user']), (0, authValidator_1.check_access)([0, 1]), (0, schemaValidator_1.schemaValidator)(add_1.add_remove_participantsSchema), chat_room_1.default.add_participants);
route.put(p.remove_participants, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(['user']), (0, authValidator_1.check_access)([0, 1]), (0, schemaValidator_1.schemaValidator)(add_1.add_remove_participantsSchema), chat_room_1.default.remove_participants);
route.delete(p.delete_msg, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(['user']), (0, authValidator_1.check_access)([0, 1]), chat_room_1.default.delete_msg);
route.get(p.check_participant_status, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(['user']), (0, authValidator_1.check_access)([0, 1]), chat_room_1.default.check_participant_status);
exports.default = route;
