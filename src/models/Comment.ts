import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { STATUS, REPLIES_STATUS } from "@/constants/comments";
import { ICourse } from "./Course";
import { IBlog } from "./Blog";
import { ITv } from "./Tv";
import { IUser } from "./User";

export type Status = (typeof STATUS)[keyof typeof STATUS];
export type RepliesStatus = (typeof REPLIES_STATUS)[keyof typeof REPLIES_STATUS];

export interface IComment {
    content: string;
    blog?: PopulatedDoc<Document<ObjectId> & IBlog>;
    course?: PopulatedDoc<Document<ObjectId> & ICourse>;
    tv?: PopulatedDoc<Document<ObjectId> & ITv>;
    user: PopulatedDoc<Document<ObjectId> & IUser>;
    pin: boolean;
    status: Status;
    repliesStatus: RepliesStatus;
}

const schema = new Schema<IComment>(
    {
        content: {
            type: String,
            required: true,
            trim: true,
        },

        blog: {
            type: Schema.Types.ObjectId,
            ref: "Blog",
            index: true,
        },

        course: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            index: true,
        },

        tv: {
            type: Schema.Types.ObjectId,
            ref: "Tv",
            index: true,
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        pin: {
            type: Boolean,
            default: false,
            index: -1,
        },

        status: {
            type: String,
            enum: [STATUS.PENDING, STATUS.ACCEPTED, STATUS.REJECTED],
            default: STATUS.PENDING,
            index: true,
        },

        repliesStatus: {
            type: String,
            enum: [REPLIES_STATUS.NONE, REPLIES_STATUS.PENDING],
            default: REPLIES_STATUS.NONE,
        },
    },
    { timestamps: true }
);

schema.index({ updatedAt: -1 });

schema.virtual("replies", {
    ref: "ReplyComment",
    localField: "_id",
    foreignField: "replyTo",
    match: { status: STATUS.ACCEPTED },
});

schema.virtual("_replies", {
    ref: "ReplyComment",
    localField: "_id",
    foreignField: "replyTo",
});

const CommentModel = model<IComment>("Comment", schema);

export default CommentModel;
