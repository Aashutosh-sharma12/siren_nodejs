import { DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextFunction, Request, Response } from 'express';

// Extend Express Request interface to include uniqueId and type
import 'express';

declare module 'express' {
  export interface Request {
    uniqueId?: string;
    type?: string;
    role?: string;
  }
}
import multer from 'multer'
import { getS3Client } from './aws_config';
import { StatusCodes } from 'http-status-codes';
import { CustomError } from './errors';
// const s3 = new s3Client({ region: process.env.Region });

// Set up multer with memory storage
const storage = multer.memoryStorage();
export const upload = multer({ storage });

//Middleware to check file sizes
export const checkFileSize = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.files) return next();
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
      } else if (file.mimetype.startsWith('video/')) {
        if (!video_allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({ error: 'Invalid file type. Only MP4 is allowed.', code: 400 });
        }
        if (file.mimetype.startsWith('video/') && file.size > maxSizeVideo) {
          return res.status(400).json({ error: 'Video file size exceeds 10 MB.', code: 400 });
        }
      } else if (file.mimetype.startsWith('application/')) {
        if (file.mimetype.startsWith('application/') && file.size > maxSizeDoc) {
          return res.status(400).json({ error: 'Document file size exceeds 10 MB.', code: 400 });
        }
      } else if (file.mimetype.startsWith('audio/')) {
        if (file.mimetype.startsWith('audio/') && file.size > maxSizeAudio) {
          return res.status(400).json({ error: 'Audio file size exceeds 10 MB.', code: 400 });
        }
      } else {
        return res.status(400).json({ error: 'Invalid file.', code: 400 });
      }
    }
    next();
  } catch (err) {
    next(err)
  }
};

export const uploadSingleImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.files) {
      return res.status(StatusCodes.EXPECTATION_FAILED).json({ error: "message.imageRequired", code: StatusCodes.EXPECTATION_FAILED });
    }
    let compressedBuffer;
    let file;
    if (Array.isArray(req.files)) {
      file = req.files[0];
    } else if (req.files && typeof req.files === 'object' && req.files['image']) {
      file = req.files['image'][0];
    } else {
      return res.status(StatusCodes.EXPECTATION_FAILED).json({ error: "message.imageRequired", code: StatusCodes.EXPECTATION_FAILED });
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
      compressedBuffer = fileBuffer
      if (role === 'group') {
        key = `group-chat-assets/${userId}/${type}/${userId}`
      } else {
        key = `images/${role}/${type}/${userId}`
      }
      contentType = fileType
    } else if (file.mimetype.startsWith('application/')) {
      compressedBuffer = fileBuffer;
      key = `documents/${role}/${type}/${userId}`
      contentType = fileType
    }
    else {
      throw new CustomError("message.invalidFile", StatusCodes.EXPECTATION_FAILED);
    }

    const params = {
      Bucket: process.env.BucketName,
      Key: key,
      Body: compressedBuffer,
      ContentType: contentType
    };
    const command = new PutObjectCommand(params);
    const s3Client = await getS3Client();
    const data = await s3Client.send(command);
    if (data['$metadata'].httpStatusCode == 200) {
      // const imageUrl = `https://${process.env.BucketName}.s3.${process.env.Region}.amazonaws.com/${key}`;
      // req.imageDetails = imageUrl
      // next();
      const imageUrl = key;
      return imageUrl;
    } else {
      throw new CustomError("message.invalidFile", StatusCodes.EXPECTATION_FAILED);
    }
  } catch (err) {
    next(err);
  }
};

// export const uploadMultiple_images = async (req: any, res: any, next: NextFunction) => {
//   try {
//     const uploadedFiles = req.files.files;
//     const { type, folderId } = req.query;
//     let folderName: string;
//     const folderDetails: any = await knowledge_basefolderModel.findById(folderId, { folderName: 1 });
//     if (folderDetails) {
//       folderName = folderDetails.folderName;
//     }
//     const { role, id } = req.user;
//     if (!type) {
//       return res.status(StatusCodes.EXPECTATION_FAILED).json({ error: "message.typeRequired", code: StatusCodes.EXPECTATION_FAILED });
//     }
//     // Check if files were uploaded
//     if (!uploadedFiles || uploadedFiles.length === 0) {
//       return res.status(400).json({ error: "message.nofile_upload", code: StatusCodes.EXPECTATION_FAILED });
//     }
//     // Log the uploaded files
//     const data = uploadedFiles.map(async (file: any) => {
//       let key;
//       let contentType;
//       const fileBuffer = file.buffer;
//       const fileName = file.originalname;
//       const fileType = file.mimetype;
//       if (file.mimetype.startsWith('image/')) {
//         key = `Users/${id}/images/${type}/${folderName}/${Date.now()}-${fileName}`
//         contentType = fileType
//       } else if (file.mimetype.startsWith('application/')) {
//         key = `Users/${id}/documents/${type}/${folderName}/${Date.now()}-${fileName}`
//         contentType = fileType
//       } else {
//         return res.status(StatusCodes.EXPECTATION_FAILED).json({ error: "message.invalidFile", code: StatusCodes.EXPECTATION_FAILED });
//       }
//       const params = {
//         Bucket: process.env.BucketName,
//         Key: key,
//         Body: fileBuffer,
//         ContentType: contentType
//       };

//       const command = new PutObjectCommand(params);
//       const data: any = await s3Client.send(command);
//       if (data['$metadata'].httpStatusCode == 200) {
//         const imageUrl = `https://${process.env.BucketName}.s3.${process.env.Region}.amazonaws.com/${key}`;
//         return imageUrl;
//       } else {
//         return res.status(StatusCodes.EXPECTATION_FAILED).json({ error: "message.invalidFile", code: StatusCodes.EXPECTATION_FAILED });
//       }
//     });
//     const image_Urls = await Promise.all(data)
//     req.imagesUrl = image_Urls
//     next();
//   } catch (err) {
//     next(err);
//   }
// };

// export const deleteFiles = async (condition: any) => {
//   try {
//     const list: any = await knowledge_baseModel.find(condition, { fileUrl: 1 });
//     if (list.length) {
//       for (let key of list) {
//         const url1 = new URL(key.fileUrl);
//         const extractedKey = decodeURIComponent(url1.pathname.substring(1));
//         const command = new DeleteObjectCommand({
//           Bucket: process.env.BucketName,
//           // Delete: {
//           //   Objects: data.key
//           // }
//           Key: extractedKey  // Delete one file at a time using the 'Key' field
//         });
//         const response = await s3Client.send(command);
//         await knowledge_baseModel.updateOne({ _id: key.id, isDeleteUrl: false }, { isDeleteUrl: true });
//         console.log("Deleted files:", response);
//       };
//     }
//   } catch (err) {
//     console.error(err);
//   }
// }

// Function to generate presigned URL
interface GenerateUploadURLData {
  fileName: string;
  type: string;
  fileType: string;
  mediaType: string;
  roomId?: string;
  userId: string;
  role: string;
}

export const generateUploadURL = async (data: GenerateUploadURLData) => {
  try {
    //type might be single,double or group
    // mediaType might be image or document
    const { fileName, type, fileType, mediaType, role, roomId, userId } = data;
    // const key = `${role}/${userId}/documents/${type}/${folderName}/${Date.now()}-${fileName}`
    let key: string;
    if (type === 'single') {
      key = `single-chat-assets/${roomId}/${userId}/${mediaType}/${Date.now()}-${fileName}`
    } else if (type === 'group') {
      key = `group-chat-assets/${roomId}/${userId}/${mediaType}/${Date.now()}-${fileName}`
    } else {
      key = `${mediaType}/${role}/${type}/${userId}` // mediaType might be images , documents, videos and audios
      // key = `${userId}/${mediaType}/${Date.now()}-${fileName}`
    }
    const params = {
      Bucket: process.env.BucketName,
      Key: key, // Specify the desired object key
      ContentType: fileType, // // The content type of the file (e.g., 'image/jpeg')
      // ACL: 'public-read' // Grant public read access to the file
    };
    const command = new PutObjectCommand(params);
    const s3Client = await getS3Client();
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 * 10 }); // URL expires in 10 minutes
    return {
      fileName,
      signedUrl,
      fileType,
    };
  } catch (err) {
    console.error("Error generating presigned URL:", err);
    throw new Error("Failed to generate presigned URL");
  }
}

export async function deleteGroupFolder(groupName: string) {
  try {
    let continuationToken: string | undefined = undefined;
    const bucketName = process.env.BucketName
    const s3Client = await getS3Client();

    do {
      // List objects with the group prefix
      const listParams1: any = {
        Bucket: bucketName,
        Prefix: `${groupName}/`, // e.g., "Group1/"
        ContinuationToken: continuationToken,
      };

      const listedObjects = await s3Client.send(new ListObjectsV2Command(listParams1));
      console.log(listParams1, "listedObjects:", listedObjects);
      if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
        console.log("No objects found for this group.");
        break;
      }

      // Delete objects
      const deleteParams = {
        Bucket: bucketName,
        Delete: {
          Objects: listedObjects.Contents.map((obj: any) => ({ Key: obj.Key! })),
        },
      };
      await s3Client.send(new DeleteObjectsCommand(deleteParams));
      continuationToken = listedObjects.NextContinuationToken;
    } while (continuationToken);

    console.log(`All objects under "${groupName}/" have been deleted.`);
  } catch (error) {
    console.error("Error deleting group folder:", error);
  }
}