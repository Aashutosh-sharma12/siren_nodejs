"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const baseRoute = (0, express_1.Router)();
const auth_1 = __importDefault(require("./auth"));
const home_1 = __importDefault(require("./home"));
const chat_room_1 = __importDefault(require("./chat_room"));
const subscription_1 = __importDefault(require("./subscription"));
baseRoute.use('/auth', auth_1.default);
baseRoute.use('/home', home_1.default);
baseRoute.use('/chat_room', chat_room_1.default);
baseRoute.use('/sub', subscription_1.default);
exports.default = baseRoute;
