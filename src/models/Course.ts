import { Schema, model, PopulatedDoc, Document, ObjectId, Model } from "mongoose";
import { STATUS } from "@/constants/courses";
import { IUser } from "./User";
import SessionModel from "./Session";
import { secondsToTimeArray } from "@/utils/funcs";

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
    shown: boolean;
    order: number;
    introduction: {
        video: string;
        content: string;
    };
    shortId: string;
    metadata: {
        students: number;
        rating: number;
        support: string;
        preRequisite: string;
        present: string;
        hours: number;
    };
}

interface ICourseMethods {
    getTime(): Promise<[number, number]>;
    getProgress(hours: number): number;
}

type CourseModel = Model<ICourse, {}, ICourseMethods>;

const schema = new Schema<ICourse, CourseModel, ICourseMethods>(
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

        shown: {
            type: Boolean,
            required: true,
            index: 1,
        },

        order: {
            type: Number,
            required: true,
            index: 1,
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
            students: {
                type: Number,
                default: 0,
            },

            rating: {
                type: Number,
                min: 0,
                max: 5,
                default: 5,
            },

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

schema.method("getTime", async function () {
    const sessions = await SessionModel.find({ course: this._id }, "seconds");

    let seconds = 0;

    for (let session of sessions) {
        seconds += session.seconds;
    }

    return secondsToTimeArray(seconds);
});

schema.method("getProgress", function (hours: number) {
    if (hours === 0) return 0;
    return Math.floor((hours * 100) / this.metadata.hours);
});

const CourseModel = model<ICourse, CourseModel>("Course", schema);

export default CourseModel;
