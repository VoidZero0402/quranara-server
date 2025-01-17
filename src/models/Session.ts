import { Schema, model, PopulatedDoc, Document, ObjectId, Model, Types } from "mongoose";
import { ICourse } from "./Course";
import { ITopic } from "./Topic";
import CourseUserModel from "./CourseUser";

export interface ISession {
    title: string;
    slug: string;
    course: PopulatedDoc<Document<ObjectId> & ICourse>;
    topic: PopulatedDoc<Document<ObjectId> & ITopic>;
    order: number;
    isPublic: boolean;
    video: string;
    attached?: string;
    content?: string;
    time: string;
    seconds: number;
}

export type PopulatedCourse = Document<unknown, {}, ICourse> & ICourse;

interface ISessionMethods {
    hasUserAccess(_id: Types.ObjectId): Promise<boolean>;
}

type SessionModel = Model<ISession, {}, ISessionMethods>;

const schema = new Schema<ISession, SessionModel, ISessionMethods>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        course: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: true,
            index: true,
        },

        topic: {
            type: Schema.Types.ObjectId,
            ref: "Topic",
            required: true,
            index: true,
        },

        order: {
            type: Number,
            required: true,
            index: true,
        },

        isPublic: {
            type: Boolean,
            default: false,
        },

        video: {
            type: String,
            required: true,
        },

        content: String,

        time: {
            type: String,
            required: true,
        },

        seconds: {
            type: Number,
            required: true,
        },

        attached: String,
    },
    { timestamps: true }
);

schema.method("hasUserAccess", async function hasUserAccess(userId) {
    if (!this.isPublic) {
        const hasAccess = await CourseUserModel.exists({ user: userId, course: this.course });

        if (!hasAccess) {
            return false;
        }
    }

    return true;
});

const SessionModel = model<ISession, SessionModel>("Session", schema);

export default SessionModel;
