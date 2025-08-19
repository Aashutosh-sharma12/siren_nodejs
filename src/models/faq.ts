import { model, Schema } from "mongoose";

interface faq {
    que: string,
    lower_que: string,
    ans: string,
    lower_ans: string,
    role: string,
    isDelete: boolean
    isActive: boolean
}

const schema = new Schema<faq>({
    que: { type: String, required: true },
    lower_que: { type: String, required: true },
    ans: { type: String, required: true },
    lower_ans: { type: String, required: true },
    role: { type: String, default: "admin" },
    isDelete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
},
    {
        timestamps: true
    });

const faqModel = model<faq>('faq', schema);

export default faqModel;