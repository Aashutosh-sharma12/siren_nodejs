"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = loadEnv;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const dotenv_1 = __importDefault(require("dotenv"));
function loadEnv() {
    const env = process.env.NODE_ENV || "development";
    const encFile = path_1.default.resolve(__dirname, `./pre-start/env/${env}.env.enc`);
    const decFile = path_1.default.resolve(__dirname, `./pre-start/env/${env}.env`);
    if (!fs_1.default.existsSync(encFile)) {
        throw new Error(`Encrypted env file not found: ${encFile}`);
    }
    // Decrypt into memory temporarily
    // Requires user to provide ENV_PASSWORD at runtime
    const password = process.env.ENV_PASSWORD;
    if (!password)
        throw new Error("ENV_PASSWORD not set for decryption!");
    (0, child_process_1.execSync)(`openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 \ -in ${encFile} -out ${decFile} -pass pass:${password}`, { stdio: "inherit" });
    // Load env into process.env
    dotenv_1.default.config({ path: decFile });
    // Optionally delete decrypted file immediately
    // fs.unlinkSync(decFile);
}
