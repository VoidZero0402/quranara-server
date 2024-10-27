import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { IUser } from "./User";
import { IQuestion } from "./Question";

export interface IQuestionMessage {
    content: string;
    user: PopulatedDoc<Document<ObjectId> & IUser>;
    question: PopulatedDoc<Document<ObjectId> & IQuestion>;
    attached?: {
        type: string;
        url: string;
    };
}

const schema = new Schema<IQuestionMessage>(
    {
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

        question: {
            type: Schema.Types.ObjectId,
            ref: "Question",
            required: true,
            index: true
        },

        attached: {
            type: String,
            url: String,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const QuestionMessageModel = model<IQuestionMessage>("QuestionMessage", schema);

export default QuestionMessageModel;
