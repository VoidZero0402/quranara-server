import { Schema, model } from "mongoose";
import { References } from "@/constants/categories";

export type Ref = (typeof References)[keyof typeof References];

export interface ICategory {
    title: string;
    caption: string;
    color: string;
    ref: Ref;
}

const schema = new Schema<ICategory>({
    title: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },

    caption: {
        type: String,
        required: true,
        trim: true,
    },

    color: {
        type: String,
        required: true,
        trim: true,
    },

    ref: {
        type: String,
        enum: Object.values(References),
        default: References.BLOG,
        index: true,
    },
});

schema.index({ title: 1, ref: 1 }, { unique: true })

const CategoryModel = model<ICategory>("Category", schema);

export default CategoryModel;
