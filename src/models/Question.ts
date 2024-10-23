import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { STATUS } from "@/constants/questions";
import { IUser } from "./User";
import { ISession } from "./Session";

type Status = (typeof STATUS)[keyof typeof STATUS];

export interface IQuestion {
    title: string;
    content: string;
    user: PopulatedDoc<Document<ObjectId> & IUser>;
    session: PopulatedDoc<Document<ObjectId> & ISession>;
    status: Status;
}

const schema = new Schema<IQuestion>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        content: {
            type: String,
            required: true,
            trim: true,
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        session: {
            type: Schema.Types.ObjectId,
            ref: "Session",
            required: true,
        },

        status: {
            type: String,
            enum: Object.values(STATUS),
            default: STATUS.ACTIVE
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const QuestionModel = model<IQuestion>("Question", schema);

export default QuestionModel;
