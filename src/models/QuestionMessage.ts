import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { IUser } from "./User";
import { IQuestion } from "./Question";
import { ATTACHED_FILE_TYPES } from "@/constants/files";

export type AttachedType = (typeof ATTACHED_FILE_TYPES)[keyof typeof ATTACHED_FILE_TYPES];

export interface IQuestionMessage {
    content: string;
    user: PopulatedDoc<Document<ObjectId> & IUser>;
    question: PopulatedDoc<Document<ObjectId> & IQuestion>;
    attached?: {
        type: AttachedType;
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
            index: true,
        },

        attached: {
            type: {
                type: String,
                enum: [ATTACHED_FILE_TYPES.IMAGE, ATTACHED_FILE_TYPES.AUDIO, ATTACHED_FILE_TYPES.ZIP],
            },
            url: String,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const QuestionMessageModel = model<IQuestionMessage>("QuestionMessage", schema);

export default QuestionMessageModel;
