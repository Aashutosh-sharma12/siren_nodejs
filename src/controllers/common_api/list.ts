import subscriptionModel from "@models/subscription";
import userModel from "@models/user";
import { generateUploadURL } from "@utils/multer";
import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
const { OK, CREATED } = StatusCodes;

const generatePresignedUrl = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id, role } = req.user;
        const { mediaType, roomId, type, fileType, fileName } = req.body;
        const userDetails = await userModel.findById(id, { uniqueId: 1 }).lean();
        const obj = {
            userId: userDetails ? userDetails.uniqueId : "",
            role: role,
            roomId: roomId,
            fileType: fileType,
            fileName: fileName,
            mediaType: mediaType,
            type: type
        }

        const pre_signedUrl = await generateUploadURL(obj);
        res.status(CREATED).json({ code: CREATED, pre_signedUrl: pre_signedUrl });
    } catch (err) {
        next(err);
    }
}

const sub_list = async (req: any, res: Response, next: NextFunction) => {
    try {
        let cond = {
            isActive: true,
            isDelete: false
        }
        const [list, count] = await Promise.all([
            subscriptionModel.aggregate([
                { $match: cond },
                {
                    $project: {
                        uniqueId: 1,
                        title: 1,
                        features: 1,
                        amount: 1,
                        currency: 1,
                        subscriptionType: 1,
                        isActive: 1,
                        isDelete: 1,
                        createdAt: 1
                    }
                },
                { $sort: { createdAt: -1 } }
            ]),
            subscriptionModel.countDocuments(cond)
        ]);
        res.status(OK).json({ data: { list, count }, code: OK });
    } catch (err) {
        next(err);
    }
}

export = {
    generatePresignedUrl,
    sub_list
} as const;