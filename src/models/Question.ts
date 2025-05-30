import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { STATUS } from "@/constants/questions";
import { IUser } from "./User";
import { ISession } from "./Session";

export type Status = (typeof STATUS)[keyof typeof STATUS];

export interface IQuestion {
    title: string;
    question: string;
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

        question: {
            type: String,
            required: true,
            trim: true,
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        session: {
            type: Schema.Types.ObjectId,
            ref: "Session",
            required: true,
            index: true,
        },

        status: {
            type: String,
            enum: [STATUS.ACTIVE, STATUS.SLEEP, STATUS.COLSED],
            default: STATUS.ACTIVE,
        },
    },
    { timestamps: true }
);

schema.index({ user: 1, session: 1 }, { unique: true });

schema.virtual("messages", {
    ref: "QuestionMessage",
    localField: "_id",
    foreignField: "question",
});

const QuestionModel = model<IQuestion>("Question", schema);

export default QuestionModel;
