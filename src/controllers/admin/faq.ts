import messages from "@Custom_message/index";
import faqModel from "@models/faq";
import { CustomError } from "@utils/errors";
import { StatusCodes } from "http-status-codes";
import moment from "moment";

function addFaq(body: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      body.lower_que = body.que.toLowerCase().trim();
      body.lower_ans = body.ans.toLowerCase().trim();
      const findFAQByName = await faqModel.findOne(
        {
          isDelete: false,
          lower_que: body.lower_que
        },
      )
      if (findFAQByName) {
        reject(
          new CustomError(
            messages.faq_AlreadyExist.replace(
              "{{que}}",
              `${body.que}`
            ),
            StatusCodes.BAD_REQUEST
          )
        );
      } else {
        const resultData = await faqModel.create(body);
        if (resultData) {
          resolve(resultData);
        }
      }

    } catch (error) {
      reject(error)
    }
  });
}

function faqList(query: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { page = 1, perPage = 10, isActive, search, fromDate, toDate } = query;
      const skip = (page - 1) * perPage;
      let condition: any = { isDelete: false };
      if (search && search !== "" && search !== null) {
        condition = {
          ...condition,
          $or: [
            { que: { $regex: search, $options: 'i' } },
            { ans: { $regex: search, $options: 'i' } },
          ]
        };
      }

      if (fromDate && toDate) {
        const startDate1 = moment(fromDate).startOf('day').toDate();
        const endDate1 = moment(toDate).endOf('day').toDate();
        condition = {
          ...condition,
          createdAt: {
            $gte: startDate1,
            $lte: endDate1
          }
        };
      }

      if (isActive === "Active") {
        condition.isActive = true;
      } else if (isActive === "InActive") {
        condition.isActive = false;
      } else if (isActive === "all") {
        condition = {
          ...condition
        }
      } else {
        condition = {
          ...condition
        }
      }
      const [faqList, count] = await Promise.all([
        faqModel
          .find(condition, { lower_que: 0, lower_ans: 0 })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(perPage),
        faqModel.countDocuments(condition)
      ]);
      resolve({ faqList: faqList, count: count });
    } catch (error) {
      reject(error);
    }
  });
}

function editFAQ(body: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      body.lower_que = body.que.toLowerCase();
      body.lower_ans = body.ans.toLowerCase();
      const data = await faqModel.findOne({
        isDelete: false,
        lower_que: body.lower_que,
        _id: {
          $ne: body.id,
        },
      })
      if (data) {
        reject(
          new CustomError(
            messages.faq_AlreadyExist.replace(
              "{{que}}",
              `${body.que}`
            ),
            StatusCodes.BAD_REQUEST
          )
        );
      } else {
        const updatedData = await faqModel.findOneAndUpdate(
          {
            _id: body.id,
            isDelete: false,
          },
          {
            que: body?.que,
            lower_que: body?.lower_que,
            ans: body?.ans,
            lower_ans: body?.lower_ans,
            isActive: body.isActive
          },
          { new: true }
        );
        resolve(updatedData);
      };
    } catch (error) {
      reject(error)
    }
  });
}


function faqDelete(params: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { id } = params;
      const check = await faqModel.findOne({ _id: id, isDelete: false });
      if (check) {
        const deleteFAQ = await faqModel.deleteOne(
          { _id: id, isDelete: false },
          // { new: true }
        )
        if (deleteFAQ.deletedCount === 1) {
          resolve({ success: true });
        } else {
          reject(new CustomError(messages.noAccountMatch, StatusCodes.NOT_FOUND))
        }
      } else {
        reject(
          new CustomError(messages.noDatafoundWithID, StatusCodes.NOT_FOUND)
        );
      }
    } catch (error) {
      reject(error);
    }
  });
}


function faqDetails(params: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const { id } = params;
      const FAQ = await faqModel.findOne(
        { _id: id, isDelete: false },
      )
      if (FAQ) {
        resolve({ FAQ });
      } else {
        reject(
          new CustomError(messages.noDatafoundWithID, StatusCodes.NOT_FOUND)
        );
      }
    } catch (error) {
      reject(error);
    }
  });
}



export default {
  addFaq,
  faqList,
  editFAQ,
  faqDelete,
  faqDetails
} as const;