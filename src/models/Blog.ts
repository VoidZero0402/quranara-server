import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { IUser } from "./User";
import { ICategory } from "./Category";
import { ICourse } from "./Course";

export interface IBlog {
    title: string;
    slug: string;
    description: string;
    cover: string;
    content: string;
    headings: { id: string; heading: string }[];
    author: PopulatedDoc<Document<ObjectId> & IUser>;
    category: PopulatedDoc<Document<ObjectId> & ICategory>;
    views: number;
    likes: number;
    timeToRead: number;
    shortId: string;
    relatedCourses: PopulatedDoc<Document<ObjectId> & ICourse>[];
    shown: boolean;
}

const schema = new Schema<IBlog>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
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

        cover: {
            type: String,
            required: true,
        },

        content: {
            type: String,
            required: true,
        },

        headings: [
            {
                id: {
                    type: String,
                    required: true,
                },

                heading: {
                    type: String,
                    required: true,
                },

                _id: false,
            },
        ],

        author: {
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

        views: {
            type: Number,
            default: 0,
        },

        likes: {
            type: Number,
            default: 0,
        },

        timeToRead: Number,

        shortId: String,

        relatedCourses: {
            type: [Schema.Types.ObjectId],
            ref: "Course",
        },

        shown: {
            type: Boolean,
            required: true,
            index: true,
        },
    },
    { timestamps: true }
);

const BlogModel = model<IBlog>("Blog", schema);

export default BlogModel;
