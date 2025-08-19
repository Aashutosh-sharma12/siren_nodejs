"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appVersion_1 = __importDefault(require("../../models/appVersion"));
function addVersion(body, headers) {
    return new Promise(async (resolve, reject) => {
        try {
            const data1 = await appVersion_1.default.findOneAndUpdate({ isDelete: false }, body, { new: true });
            if (data1) {
                resolve(data1);
            }
            else {
                const data = await appVersion_1.default.create(body);
                resolve(data);
            }
        }
        catch (error) {
            reject(error);
        }
    });
}
function getAppVersion(headers) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await appVersion_1.default.findOne({ isDelete: false });
            resolve(data);
        }
        catch (error) {
            reject(error);
        }
    });
}
exports.default = {
    addVersion,
    getAppVersion
};
