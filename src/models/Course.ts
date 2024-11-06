import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { STATUS } from "@/constants/courses";
import { IUser } from "./User";

export type Status = (typeof STATUS)[keyof typeof STATUS];

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
    metadata: {
        support: string;
        preRequisite: string;
        present: string;
        hours: number;
    };
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
            required: true,
            unique: true,
            trim: true,
            index: true,
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
            min: 0,
            default: 0,
        },

        status: {
            type: String,
            enum: [STATUS.PRE_SELL, STATUS.ON_PERFORMING, STATUS.REACHED],
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

        shortId: {
            type: String,
            required: true,
        },

        metadata: {
            support: {
                type: String,
                required: true,
            },

            preRequisite: {
                type: String,
                required: true,
            },

            present: {
                type: String,
                required: true,
            },

            hours: {
                type: Number,
                min: 1,
                required: true,
            },
        },
    },
    { timestamps: true }
);

schema.virtual("topics", {
    ref: "Topic",
    localField: "_id",
    foreignField: "course",
});

const CourseModel = model<ICourse>("Course", schema);

export default CourseModel;
