import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { STATUS } from "@/constants/comments";
import { ICourse } from "./Course";
import { IUser } from "./User";

export type Status = (typeof STATUS)[keyof typeof STATUS];

export interface ICourseComment {
    content: string;
    course: PopulatedDoc<Document<ObjectId> & ICourse>;
    user: PopulatedDoc<Document<ObjectId> & IUser>;
    rating?: Number;
    status: Status;
    replyTo?: PopulatedDoc<Document<ObjectId> & ICourseComment>;
}

const schema = new Schema<ICourseComment>(
    {
        content: {
            type: String,
            required: true,
            trim: true,
        },

        course: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: true,
            index: true
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
            index: true
        },

        replyTo: {
            type: Schema.Types.ObjectId,
            ref: "CourseComment",
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const CourseCommentModel = model<ICourseComment>("CourseComment", schema);

export default CourseCommentModel;
