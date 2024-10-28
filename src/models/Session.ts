import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { ICourse } from "./Course";
import { ITopic } from "./Topic";

export interface ISession {
    title: string;
    slug: string;
    course: PopulatedDoc<Document<ObjectId> & ICourse>;
    topic: PopulatedDoc<Document<ObjectId> & ITopic>;
    order: number;
    isPublic: boolean;
    video: string;
    attached?: string;
    time: string;
}

const schema = new Schema<ISession>({
    title: {
        type: String,
        required: true,
        trim: true,
    },

    slug: {
        type: String,
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

    time: {
        type: String,
        required: true,
    },

    attached: String,
});

const SessionModel = model<ISession>("Session", schema);

export default SessionModel;
