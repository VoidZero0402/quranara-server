import { Schema, model } from "mongoose";
import { TYPE } from "@/constants/news";

export type Type = (typeof TYPE)[keyof typeof TYPE];

export interface INews {
    type: Type;
    cover: string;
    title?: string;
    description?: string;
    link?: {
        text?: string;
        url: string;
    };
    shown: boolean;
}

const schema = new Schema<INews>(
    {
        type: {
            type: String,
            enum: [TYPE.COVER, TYPE.CONTENT_BASE],
        },

        cover: {
            type: String,
            required: true,
        },

        title: {
            type: String,
            trim: true,
            required() {
                return this.type === TYPE.CONTENT_BASE;
            },
        },

        description: {
            type: String,
            trim: true,
            required() {
                return this.type === TYPE.CONTENT_BASE;
            },
        },

        link: {
            text: {
                type: String,
                trim: true,
            },

            url: {
                type: String,
            },
        },

        shown: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: { createdAt: true } }
);

schema.index({ createdAt: -1 });

const NewsModel = model<INews>("News", schema);

export default NewsModel;
