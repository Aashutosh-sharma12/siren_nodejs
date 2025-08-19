"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const baseRoute = (0, express_1.Router)();
const list_1 = __importDefault(require("./list"));
baseRoute.use('/list', list_1.default);
exports.default = baseRoute;
