import messages from "@Custom_message/index";
import { sessionModel, subscriptionModel, user_subscriptionModel, userModel } from "@models/index";
import { CustomError } from "@utils/errors";
import { sendNotificationToSpecificDevice } from "@utils/notification";
import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { identityGenerator, left_all_rooms } from "@utils/helpers";
import dayjs from "dayjs";
import mongoose from "mongoose";
const { OK, CREATED } = StatusCodes
const listUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    console.log('inside api')
    const todayDate = dayjs().format('YYYY-MM-DD');
    const { search, status, page = 1, perPage = 10, fromDate, toDate, type, loggedIn, subscribed } = req.query;
    console.log(search)
    const obj: any = {
      isDelete: false,
    };
    if (loggedIn && loggedIn != '' && loggedIn != undefined) {
      obj.onlineStatus = true
    }
    if (type && type != '' && type != undefined) {
      obj.loginKey = type == 2 ? 2 : { $in: [0, 1] }
    }
    if (search && search !== "" && search !== undefined) {
      const search1 = search.trim()
      obj.$or = [
        { name: { $regex: search1, $options: "i" } },
        { email: { $regex: search1, $options: "i" } },
        { phoneNumber: { $regex: search1, $options: "i" } },
        { uniqueId: { $regex: search1, $options: "i" } },
        { $expr: { $regexMatch: { input: { $concat: ["$countryCode", "$phoneNumber"] }, regex: search1, options: "i" } } }
      ]
      
    }
    if (fromDate && toDate) {
      const fromDate1 = new Date(fromDate)
      fromDate1.setHours(0, 0, 0, 0)
      const toDate1 = new Date(toDate)
      toDate1.setHours(23, 59, 59, 999)
      obj.createdAt = {
        $gte: fromDate1,
        $lte: toDate1
      }
    }
    if (status) {
      obj.isActive = status
    }
    const [UserData, Count] = await Promise.all([
      userModel.aggregate([
        {
          $match: obj
        },
        {
          $lookup: {
            from: "user_subscriptions",
            localField: "_id",
            foreignField: "userId",
            as: "subscription_details",
            pipeline: [
              {
                $match: {
                  status: 'active',
                  endDate: { $gte: todayDate }
                }
              },
              {
                $limit: 1
              }
            ]
          }
        },
        {
          $addFields: {
            subscribed: {
              $cond: {
                if: { $gt: [{ $size: "$subscription_details" }, 0] },
                then: true,
                else: false
              }
            }
          }
        },
        // Only push this stage if subscribed filter is needed
        ...(subscribed ? [{ $match: { subscribed: true } }] : []),
        {
          $project: {
            password1: 0,
            password2: 0,
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $skip: (Number(page) - 1) * Number(perPage)
        },
        {
          $limit: Number(perPage)
        }
      ]),
      userModel.aggregate([
        { $match: obj },

        // Only push this stage if subscribed filter is needed
        ...(subscribed ? [
          {
            $lookup: {
              from: "user_subscriptions",
              localField: "_id",
              foreignField: "userId",
              as: "subscription_details",
              pipeline: [
                {
                  $match: {
                    status: 'active',
                    endDate: { $gte: todayDate }
                  }
                },
                {
                  $limit: 1
                }
              ]
            }
          },
          { $match: { subscription_details: { $ne: [] } } }
        ] : []),
        { $count: "count" }
      ])
    ]);
    res.status(OK).json({ code: OK, totalCount: Count.length ? Count[0].count : 0, user_data: UserData, image_baseUrl: process.env.Bucket_Base_Url });
  } catch (error) {
    next(error);
  }
}

const details = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const findUserById = await userModel.findOne({
      _id: id,
      isDelete: false,
    }, { password1: 0, password2: 0 }
    );
    if (findUserById) {
      res.status(OK).json({ code: OK, data: findUserById, image_baseUrl: process.env.Bucket_Base_Url });
    } else {
      throw new CustomError(messages.noDatafoundWithID, StatusCodes.NOT_FOUND)
    }
  } catch (error) {
    next(error);
  }
}


const updateStatus = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { status, userId } = req.body;
    const updataeStatus = await userModel.findOne(
      { _id: userId, isDelete: false }
    );
    if (updataeStatus) {
      const onlineStatus = status == true ? updataeStatus.onlineStatus : false
      await userModel.updateOne({ _id: userId }, { isActive: status, onlineStatus: onlineStatus });
      await sessionModel.deleteMany({ userId: userId });
      res.status(OK).json({ success: true, code: OK });
    } else {
      throw new CustomError(messages.noDatafoundWithID, StatusCodes.NOT_FOUND);
    }
  } catch (error) {
    next(error);
  }
}

const deleteUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updataeStatus = await userModel.findOneAndUpdate(
      { _id: id, isDelete: false },
      { isDelete: false, onlineStatus: false },
      { new: true, fields: { countryCode: 1, name: 1, phoneNumber: 1 } }
    );
    if (updataeStatus) {
      await left_all_rooms({ userId: id, name: updataeStatus.name });
      res.status(OK).json({ success: true, code: OK });
    } else {
      throw new CustomError(messages.noDatafoundWithID, StatusCodes.NOT_FOUND);
    }
  } catch (error) {
    next(error);
  }
}

const updateUser_access = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id, status } = req.params;
    const updataeStatus = await userModel.findOneAndUpdate(
      { _id: id, isDelete: false },
      { loginKey: status },
      { new: true, fields: { countryCode: 1, phoneNumber: 1 } }
    );
    if (updataeStatus) {
      const fetch_user_session = await sessionModel.findOneAndUpdate({ userId: id, isDelete: false, status: true }, { isDelete: true, status: false }, { fields: { deviceToken: 1 } });
      if (fetch_user_session) {
        if (fetch_user_session.deviceToken) {
          const notificationObj = {
            userId: id.toString(),
            status: '0',
            role: 'admin',
            title: messages.full_access,
            body: messages.full_access,
            token: fetch_user_session.deviceToken,
            type: 'full-access'
          }
          await sendNotificationToSpecificDevice(notificationObj);
        }
      }
      res.status(OK).json({ success: true, code: OK });
    } else {
      throw new CustomError(messages.noDatafoundWithID, StatusCodes.NOT_FOUND);
    }
  } catch (error) {
    next(error);
  }
}

const user_sub_list = async (req: any, res: Response, next: NextFunction) => {
  try {
    const todayDate = dayjs().format('YYYY-MM-DD');
    const { page = 1, perPage = 10 } = req.query;
    const userId = req.params.id;
    let cond = {
      userId: new mongoose.Types.ObjectId(userId),
      status: { $ne: 'pending' }
    }
    const [list, count] = await Promise.all([
      user_subscriptionModel.aggregate([
        { $match: cond },
        {
          $project: {
            uniqueId: 1,
            createdAt: 1,
            subscription_details: 1,
            startDate: 1,
            endDate: 1,
            status: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ["$status", "active"] },
                    { $lte: ["$endDate", todayDate] }
                  ]
                },
                then: "active",
                else: "$status"
              }
            }
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $skip: (Number(page) - 1) * Number(perPage)
        },
        {
          $limit: Number(perPage)
        },
      ]),
      user_subscriptionModel.countDocuments(cond)
    ]);
    res.status(OK).json({ data: { list, count }, code: OK });
  } catch (err) {
    next(err);
  }
}

const purchase_subscription = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { userId, subId } = req.body;
    const subscription_details = await subscriptionModel.findOne({ _id: subId });
    if (!subscription_details) {
      throw new CustomError(messages.noDatafoundWithID, StatusCodes.NOT_FOUND);
    }
    const newSubscription: any = {
      uniqueId: identityGenerator('user_subscription', await user_subscriptionModel.countDocuments({ "userId": userId })),
      userId,
      subscription_details: {
        subId: subscription_details.uniqueId,
        subscriptionType: subscription_details.subscriptionType,
        amount: subscription_details.amount,
        title: subscription_details.title,
        features: subscription_details.features
      },
      status: "active",
      purchase_by: 'admin'
    };
    if (subscription_details.subscriptionType) {
      // Last month, last 6 months, last year
      const number = subscription_details.subscriptionType === 'monthly' ? 1 : subscription_details.subscriptionType === '6-months' ? 6 : 1;
      const unit = subscription_details.subscriptionType === 'monthly' ? 'month' : subscription_details.subscriptionType === '6-months' ? "month" : 'year';
      const today = dayjs();
      const todayStart = today.startOf('day'); // start of day
      const month = today.add(number, unit);
      newSubscription.startDate = dayjs(todayStart).format('YYYY-MM-DD');
      newSubscription.endDate = dayjs(month).format('YYYY-MM-DD');
      newSubscription.start_timeStamp = Math.floor((todayStart.valueOf()) / 1000);
      newSubscription.end_timeStamp = Math.floor((month.endOf('day').valueOf()) / 1000);
    }

    const savedSubscription = await user_subscriptionModel.create(newSubscription);
    res.status(CREATED).json({ data: savedSubscription, code: CREATED });
  } catch (err) {
    next(err);
  }
}

export default {
  listUser,
  details,
  updateStatus,
  deleteUser,
  updateUser_access,
  user_sub_list,
  purchase_subscription
} as const;





