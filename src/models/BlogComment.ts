import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { STATUS } from "@/constants/comments";
import { IBlog } from "./Blog";
import { IUser } from "./User";

export type Status = (typeof STATUS)[keyof typeof STATUS];

export interface IBlogComment {
    content: string;
    blog: PopulatedDoc<Document<ObjectId> & IBlog>;
    user: PopulatedDoc<Document<ObjectId> & IUser>;
    rating?: Number;
    status: Status;
    replyTo?: PopulatedDoc<Document<ObjectId> & IBlogComment>;
}

const schema = new Schema<IBlogComment>(
    {
        content: {
            type: String,
            required: true,
            trim: true,
        },

        blog: {
            type: Schema.Types.ObjectId,
            ref: "Blog",
            required: true,
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
        },

        replyTo: {
            type: Schema.Types.ObjectId,
            ref: "BlogComment",
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const BlogCommentModel = model<IBlogComment>("BlogComment", schema);

export default BlogCommentModel;
