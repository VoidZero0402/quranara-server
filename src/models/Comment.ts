import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { STATUS } from "@/constants/comments";
import { ICourse } from "./Course";
import { IBlog } from "./Blog";
import { ITv } from "./Tv";
import { IUser } from "./User";

export type Status = (typeof STATUS)[keyof typeof STATUS];

export interface IComment {
    content: string;
    blog?: PopulatedDoc<Document<ObjectId> & IBlog>;
    course?: PopulatedDoc<Document<ObjectId> & ICourse>;
    tv?: PopulatedDoc<Document<ObjectId> & ITv>;
    user: PopulatedDoc<Document<ObjectId> & IUser>;
    rating?: Number;
    status: Status;
    replyTo?: PopulatedDoc<Document<ObjectId> & IComment>;
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

        rating: {
            type: Number,
            required() {
                return !this.replyTo;
            },
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
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

schema.virtual("replies", {
    ref: "Comment",
    localField: "_id",
    foreignField: "replyTo",
    match: { status: STATUS.ACCEPTED },
});

const CommentModel = model<IComment>("Comment", schema);

export default CommentModel;
