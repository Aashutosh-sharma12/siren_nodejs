"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const home_1 = __importDefault(require("../../../controllers/user/home"));
const authValidator_1 = require("../../../utils/authValidator");
const route = (0, express_1.Router)();
const p = {
    contactList: '/contactList',
    all_room_list: '/all_room_list',
    all_room_list1: '/all_room_list1',
    chatList: '/chatList/:id',
    feed_list: '/feed_list'
};
route.get(p.contactList, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(['user']), (0, authValidator_1.check_access)([0, 1]), home_1.default.contactList);
route.get(p.all_room_list, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(['user']), (0, authValidator_1.check_access)([0, 1]), home_1.default.all_room_list);
route.get(p.all_room_list1, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(['user']), (0, authValidator_1.check_access)([0, 1]), home_1.default.all_room_list1);
route.get(p.chatList, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(['user']), (0, authValidator_1.check_access)([0, 1]), home_1.default.chatList);
route.get(p.feed_list, authValidator_1.verifyAuthToken, (0, authValidator_1.checkRole)(['user']), home_1.default.feed_list);
exports.default = route;
