import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { ICourse } from "./Course";
import { IUser } from "./User";

export interface IDiscount {
    code: string;
    percent: number;
    course?: PopulatedDoc<Document<ObjectId> & ICourse>;
    creator: PopulatedDoc<Document<ObjectId> & IUser>;
    max: number;
    uses: number;
    expireAt: Date;
}

const schema = new Schema<IDiscount>(
    {
        code: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },

        percent: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },

        course: {
            type: Schema.Types.ObjectId,
            ref: "Course",
        },

        creator: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        max: {
            type: Number,
            min: 1,
            required: true,
        },

        uses: {
            type: Number,
            default: 0,
        },

        expireAt: {
            type: Date,
            required: true,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

schema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const DiscountModel = model<IDiscount>("Discount", schema);

export default DiscountModel;
