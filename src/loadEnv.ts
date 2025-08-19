import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import dotenv from "dotenv";

export function loadEnv() {
    const env = process.env.NODE_ENV || "development";

    const encFile = path.resolve(__dirname, `./pre-start/env/${env}.env.enc`);
    const decFile = path.resolve(__dirname, `./pre-start/env/${env}.env`);

    if (!fs.existsSync(encFile)) {
        throw new Error(`Encrypted env file not found: ${encFile}`);
    }

    // Decrypt into memory temporarily
    // Requires user to provide ENV_PASSWORD at runtime
    const password = process.env.ENV_PASSWORD;
    if (!password) throw new Error("ENV_PASSWORD not set for decryption!");

    execSync(
        `openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 \ -in ${encFile} -out ${decFile} -pass pass:${password}`,
        { stdio: "inherit" }
    );

    // Load env into process.env
    dotenv.config({ path: decFile });

    // Optionally delete decrypted file immediately
    // fs.unlinkSync(decFile);
}
