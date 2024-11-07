import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { STATUS, ROLES } from "@/constants/comments";
import { IUser } from "./User";
import { IComment } from "./Comment";

export type Status = (typeof STATUS)[keyof typeof STATUS];

export interface IReplyComment {
    content: string;
    user: PopulatedDoc<Document<ObjectId> & IUser>;
    status: Status;
    replyTo: PopulatedDoc<Document<ObjectId> & IComment>;
}

const schema = new Schema<IReplyComment>(
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

        status: {
            type: String,
            enum: [STATUS.PENDING, STATUS.ACCEPTED, STATUS.REJECTED],
            default: STATUS.PENDING,
            index: true,
        },

        replyTo: {
            type: Schema.Types.ObjectId,
            ref: "Comment",
            index: true,
        }
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const ReplyCommentModel = model<IReplyComment>("ReplyComment", schema);

export default ReplyCommentModel;
