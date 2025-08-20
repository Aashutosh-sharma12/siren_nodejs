"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSESClient = exports.getS3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const client_ses_1 = require("@aws-sdk/client-ses");
const helpers_1 = require("./helpers");
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.Region;
// export const s3Client = new S3Client({
//   region,
//   credentials: {
//     accessKeyId,
//     secretAccessKey
//   }
// });
// export const sesClient = new SESClient({
//   region,
//   credentials: {
//     accessKeyId,
//     secretAccessKey
//   },
// });
// Usage with AWS clients
const getS3Client = async () => {
    const decryptedAccessKeyId = (0, helpers_1.decrypt)(AWS_ACCESS_KEY_ID);
    const decryptedSecretAccessKey = (0, helpers_1.decrypt)(AWS_SECRET_ACCESS_KEY);
    return new client_s3_1.S3Client({
        region,
        credentials: {
            accessKeyId: decryptedAccessKeyId,
            secretAccessKey: decryptedSecretAccessKey
        }
    });
};
exports.getS3Client = getS3Client;
// Similar for SES client
const getSESClient = async () => {
    const decryptedAccessKeyId = (0, helpers_1.decrypt)(AWS_ACCESS_KEY_ID);
    const decryptedSecretAccessKey = (0, helpers_1.decrypt)(AWS_SECRET_ACCESS_KEY);
    return new client_ses_1.SESClient({
        region,
        credentials: {
            accessKeyId: decryptedAccessKeyId,
            secretAccessKey: decryptedSecretAccessKey
        }
    });
};
exports.getSESClient = getSESClient;
