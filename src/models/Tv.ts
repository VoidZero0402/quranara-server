import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { IUser } from "./User";
import { ICategory } from "./Category";

export interface ITv {
    title: string;
    description: string;
    slug: string;
    publisher: PopulatedDoc<Document<ObjectId> & IUser>;
    category: PopulatedDoc<Document<ObjectId> & ICategory>;
    cover: string;
    video: string;
    attached: string;
    content: string;
    views: number;
    likes: number;
}

const schema = new Schema<ITv>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            index: true,
        },

        description: {
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

        publisher: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
            index: true,
        },

        cover: {
            type: String,
            required: true,
        },

        video: {
            type: String,
            required: true,
        },

        attached: String,

        content: String,

        views: {
            type: Number,
            default: 0,
        },

        likes: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const TvModel = model<ITv>("Tv", schema);

export default TvModel;
