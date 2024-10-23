import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { STATUS } from "@/constants/courses";
import { IUser } from "./User";

type Status = (typeof STATUS)[keyof typeof STATUS];

export interface ICourse {
    title: string;
    slug: string;
    description: string;
    cover: string;
    price: number;
    status: Status;
    discount: number;
    teacher: PopulatedDoc<Document<ObjectId> & IUser>;
    introduction: {
        video: string;
        content: string;
    };
    shortId: string;
}

const schema = new Schema<ICourse>(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        slug: {
            type: String,
            unique: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        cover: {
            type: String,
            required: true,
            trim: true,
        },

        price: {
            type: Number,
            default: 0,
        },

        status: {
            type: String,
            enum: Object.values(STATUS),
            default: STATUS.PRE_SELL,
        },

        discount: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },

        teacher: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        introduction: {
            video: String,
            content: String,
        },

        shortId: String,
    },
    { timestamps: true }
);

const CourseModel = model<ICourse>("Course", schema);

export default CourseModel;
