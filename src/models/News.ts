import { Schema, model } from "mongoose";

export interface INews {
    cover: string;
    title: string;
    description: string;
    link?: {
        text: string;
        url: string;
    };
    shown: boolean;
}

const schema = new Schema<INews>(
    {
        cover: {
            type: String,
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
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
