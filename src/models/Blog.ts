import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { IUser } from "./User";
import { ICategory } from "./Category";
import { ICourse } from "./Course";
import { IPoll } from "./Poll";
import { STATUS, CONTENT_TYPE } from "@/constants/blog";

type Status = (typeof STATUS)[keyof typeof STATUS];

type HtmlContent = { type: (typeof CONTENT_TYPE)["HTML"]; html: string };

type ImageContent = { type: (typeof CONTENT_TYPE)["IMAGE"]; urls: string[] };

type PollContent = { type: (typeof CONTENT_TYPE)["POLL"]; poll: PopulatedDoc<Document<ObjectId> & IPoll> };

type Content = HtmlContent | ImageContent | PollContent;

export interface IBlog {
    title: string;
    slug: string;
    description: string;
    cover: string;
    content: Content[];
    headings: { id: string; heading: string }[];
    author: PopulatedDoc<Document<ObjectId> & IUser>;
    category: PopulatedDoc<Document<ObjectId> & ICategory>;
    status: Status;
    tags: string[];
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

        content: [
            {
                type: {
                    type: String,
                    enum: [CONTENT_TYPE.HTML, CONTENT_TYPE.IMAGE, CONTENT_TYPE.POLL],
                    required: true,
                },

                html: {
                    type: String,
                    trim: true,
                },

                urls: {
                    type: [String],
                    default: undefined,
                },

                poll: {
                    type: Schema.Types.ObjectId,
                    ref: "Poll",
                },

                _id: false,
            },
        ],

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

        status: {
            type: String,
            enum: [STATUS.DRAFTED, STATUS.PUBLISHED],
            default: STATUS.DRAFTED,
            index: true,
        },

        tags: [String],

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
        },
    },
    { timestamps: true }
);

schema.index({ status: "text", shown: "text" });

const BlogModel = model<IBlog>("Blog", schema);

export default BlogModel;
