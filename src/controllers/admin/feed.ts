import feedModel from "@models/feed";
import { generate_timestamp_In_seconds, identityGenerator } from "@utils/helpers";
import { uploadSingleImage } from "@utils/multer";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const add_feed = async (req: any, res: Response, next: NextFunction) => {
    try {
        req.body.uniqueId = identityGenerator('admin-feed', await feedModel.countDocuments());
        req.body.created_timeStamp = generate_timestamp_In_seconds();
        const add: any = await feedModel.create(req.body);
        if (req.files && req.files.image && req.files.image.length > 0) {
            req.uniqueId = add.uniqueId;
            req.type = 'admin-feed-image';
            req.role = 'admin'
            const imageUrl = await uploadSingleImage(req, res, next);
            await feedModel.updateOne({ _id: add._id }, { image: imageUrl });
            add.image = imageUrl;
            add.base_imageUrl = process.env.Bucket_Base_Url
        }
        res.status(StatusCodes.CREATED).json({ code: StatusCodes.CREATED, data: add });
    } catch (err) {
        next(err);
    }
}

const edit_feed = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { feedId } = req.body
        const update: any = await feedModel.findOneAndUpdate({ _id: feedId }, req.body);
        if (req.files && req.files.image && req.files.image.length > 0) {
            req.uniqueId = update.uniqueId;
            req.type = 'admin-feed-image';
            req.role = 'admin'
            const imageUrl = await uploadSingleImage(req, res, next);
            await feedModel.updateOne({ _id: feedId }, { image: imageUrl });
        }
        res.status(StatusCodes.CREATED).json({ code: StatusCodes.CREATED, data: update });
    } catch (err) {
        next(err);
    }
}

const details = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const data = await feedModel.findOne({ _id: id });
        res.status(StatusCodes.OK).json({ code: StatusCodes.OK, data: data, image_baseUrl: process.env.Bucket_Base_Url });
    } catch (err) {
        next(err);
    }
}

const list = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, perPage = 10, search } = req.query;
        const cond = {
            isDelete: false
        }
        const [list, count] = await Promise.all([
            feedModel.find(cond).sort({ createdAt: -1 }).skip((Number(page) * Number(perPage)) - Number(perPage)).limit(Number(perPage)),
            feedModel.countDocuments()]);
        res.status(StatusCodes.OK).json({ code: StatusCodes.OK, data: { list, count, image_baseUrl: process.env.Bucket_Base_Url } });
    } catch (err) {
        next(err);
    }
}

export default {
    add_feed,
    edit_feed,
    details,
    list
} as const;