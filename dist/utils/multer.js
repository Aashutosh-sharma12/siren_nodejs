"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUploadURL = exports.uploadSingleImage = exports.checkFileSize = exports.upload = void 0;
exports.deleteGroupFolder = deleteGroupFolder;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
// Extend Express Request interface to include uniqueId and type
require("express");
const multer_1 = __importDefault(require("multer"));
const aws_config_1 = require("./aws_config");
const http_status_codes_1 = require("http-status-codes");
const errors_1 = require("./errors");
// const s3 = new s3Client({ region: process.env.Region });
// Set up multer with memory storage
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({ storage });
//Middleware to check file sizes
const checkFileSize = (req, res, next) => {
    try {
        if (!req.files)
            return next();
        const maxSizeImage = 10 * 1024 * 1024; // 10 MB
        const maxSizeVideo = 10 * 1024 * 1024; // 10 MB
        const maxSizeDoc = 10 * 1024 * 1024; // 10 MB
        const maxSizeAudio = 10 * 1024 * 1024; // 10 MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const video_allowedTypes = ['video/mp4'];
        // Check if req.files is an array (for multiple files) or an object
        const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
        for (const file of files) {
            if (file.mimetype.startsWith('image/')) {
                if (!allowedTypes.includes(file.mimetype)) {
                    return res.status(400).json({ error: 'Invalid file type. Only JPG, PNG, and GIF are allowed.', code: 400 });
                }
                if (file.mimetype.startsWith('image/') && file.size > maxSizeImage) {
                    return res.status(400).json({ error: `${file.originalname} image file size exceeds 5 MB.`, code: 400 });
                }
            }
            else if (file.mimetype.startsWith('video/')) {
                if (!video_allowedTypes.includes(file.mimetype)) {
                    return res.status(400).json({ error: 'Invalid file type. Only MP4 is allowed.', code: 400 });
                }
                if (file.mimetype.startsWith('video/') && file.size > maxSizeVideo) {
                    return res.status(400).json({ error: 'Video file size exceeds 10 MB.', code: 400 });
                }
            }
            else if (file.mimetype.startsWith('application/')) {
                if (file.mimetype.startsWith('application/') && file.size > maxSizeDoc) {
                    return res.status(400).json({ error: 'Document file size exceeds 10 MB.', code: 400 });
                }
            }
            else if (file.mimetype.startsWith('audio/')) {
                if (file.mimetype.startsWith('audio/') && file.size > maxSizeAudio) {
                    return res.status(400).json({ error: 'Audio file size exceeds 10 MB.', code: 400 });
                }
            }
            else {
                return res.status(400).json({ error: 'Invalid file.', code: 400 });
            }
        }
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.checkFileSize = checkFileSize;
const uploadSingleImage = async (req, res, next) => {
    try {
        if (!req.files) {
            return res.status(http_status_codes_1.StatusCodes.EXPECTATION_FAILED).json({ error: "message.imageRequired", code: http_status_codes_1.StatusCodes.EXPECTATION_FAILED });
        }
        let compressedBuffer;
        let file;
        if (Array.isArray(req.files)) {
            file = req.files[0];
        }
        else if (req.files && typeof req.files === 'object' && req.files['image']) {
            file = req.files['image'][0];
        }
        else {
            return res.status(http_status_codes_1.StatusCodes.EXPECTATION_FAILED).json({ error: "message.imageRequired", code: http_status_codes_1.StatusCodes.EXPECTATION_FAILED });
        }
        let key;
        let contentType;
        const role = req.role;
        const userId = req.uniqueId;
        const type = req.type;
        const fileBuffer = file.buffer;
        const fileName = file.originalname;
        const fileType = file.mimetype;
        if (file.mimetype.startsWith('image/')) {
            compressedBuffer = fileBuffer;
            if (role === 'group') {
                key = `group-chat-assets/${userId}/${type}/${userId}`;
            }
            else {
                key = `images/${role}/${type}/${userId}`;
            }
            contentType = fileType;
        }
        else if (file.mimetype.startsWith('application/')) {
            compressedBuffer = fileBuffer;
            key = `documents/${role}/${type}/${userId}`;
            contentType = fileType;
        }
        else {
            throw new errors_1.CustomError("message.invalidFile", http_status_codes_1.StatusCodes.EXPECTATION_FAILED);
        }
        const params = {
            Bucket: process.env.BucketName,
            Key: key,
            Body: compressedBuffer,
            ContentType: contentType
        };
        const command = new client_s3_1.PutObjectCommand(params);
        const s3Client = await (0, aws_config_1.getS3Client)();
        const data = await s3Client.send(command);
        if (data['$metadata'].httpStatusCode == 200) {
            // const imageUrl = `https://${process.env.BucketName}.s3.${process.env.Region}.amazonaws.com/${key}`;
            // req.imageDetails = imageUrl
            // next();
            const imageUrl = key;
            return imageUrl;
        }
        else {
            throw new errors_1.CustomError("message.invalidFile", http_status_codes_1.StatusCodes.EXPECTATION_FAILED);
        }
    }
    catch (err) {
        next(err);
    }
};
exports.uploadSingleImage = uploadSingleImage;
const generateUploadURL = async (data) => {
    try {
        //type might be single,double or group
        // mediaType might be image or document
        const { fileName, type, fileType, mediaType, role, roomId, userId } = data;
        // const key = `${role}/${userId}/documents/${type}/${folderName}/${Date.now()}-${fileName}`
        let key;
        if (type === 'single') {
            key = `single-chat-assets/${roomId}/${userId}/${mediaType}/${Date.now()}-${fileName}`;
        }
        else if (type === 'group') {
            key = `group-chat-assets/${roomId}/${userId}/${mediaType}/${Date.now()}-${fileName}`;
        }
        else {
            key = `${mediaType}/${role}/${type}/${userId}`; // mediaType might be images , documents, videos and audios
            // key = `${userId}/${mediaType}/${Date.now()}-${fileName}`
        }
        const params = {
            Bucket: process.env.BucketName,
            Key: key, // Specify the desired object key
            ContentType: fileType, // // The content type of the file (e.g., 'image/jpeg')
            // ACL: 'public-read' // Grant public read access to the file
        };
        const command = new client_s3_1.PutObjectCommand(params);
        const s3Client = await (0, aws_config_1.getS3Client)();
        const signedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 60 * 10 }); // URL expires in 10 minutes
        return {
            fileName,
            signedUrl,
            fileType,
        };
    }
    catch (err) {
        console.error("Error generating presigned URL:", err);
        throw new Error("Failed to generate presigned URL");
    }
};
exports.generateUploadURL = generateUploadURL;
async function deleteGroupFolder(groupName) {
    try {
        let continuationToken = undefined;
        const bucketName = process.env.BucketName;
        const s3Client = await (0, aws_config_1.getS3Client)();
        do {
            // List objects with the group prefix
            const listParams1 = {
                Bucket: bucketName,
                Prefix: `${groupName}/`, // e.g., "Group1/"
                ContinuationToken: continuationToken,
            };
            const listedObjects = await s3Client.send(new client_s3_1.ListObjectsV2Command(listParams1));
            console.log(listParams1, "listedObjects:", listedObjects);
            if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
                console.log("No objects found for this group.");
                break;
            }
            // Delete objects
            const deleteParams = {
                Bucket: bucketName,
                Delete: {
                    Objects: listedObjects.Contents.map((obj) => ({ Key: obj.Key })),
                },
            };
            await s3Client.send(new client_s3_1.DeleteObjectsCommand(deleteParams));
            continuationToken = listedObjects.NextContinuationToken;
        } while (continuationToken);
        console.log(`All objects under "${groupName}/" have been deleted.`);
    }
    catch (error) {
        console.error("Error deleting group folder:", error);
    }
}
