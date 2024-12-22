import { Schema, model } from "mongoose";
import { REFERENCES } from "@/constants/categories";

export type Ref = (typeof REFERENCES)[keyof typeof REFERENCES];

export interface ICategory {
    title: string;
    caption: string;
    ref: Ref;
}

const schema = new Schema<ICategory>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        caption: {
            type: String,
            required: true,
            trim: true,
        },

        ref: {
            type: String,
            enum: [REFERENCES.BLOG, REFERENCES.TV, REFERENCES.COURSE, REFERENCES.DISCUSSION],
            default: REFERENCES.BLOG,
            index: true,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

schema.index({ title: 1, ref: 1 }, { unique: true });

const CategoryModel = model<ICategory>("Category", schema);

export default CategoryModel;
