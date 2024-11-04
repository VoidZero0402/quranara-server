import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { IUser } from "./User";
import { ICourse } from "./Course";
import { STATUS } from "@/constants/orders";

export type Status = (typeof STATUS)[keyof typeof STATUS];

export interface IOrder {
    user: PopulatedDoc<Document<ObjectId> & IUser>;
    items: PopulatedDoc<Document<ObjectId> & ICourse>[];
    amount: number;
    status: Status;
    authority: string;
    shortId: string;
}

const schema = new Schema<IOrder>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        items: {
            type: [Schema.Types.ObjectId],
            ref: "Course",
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        },

        status: {
            type: String,
            enum: [STATUS.PAYING, STATUS.SUCCESSFUL, STATUS.PAYING],
            default: STATUS.PAYING,
        },

        authority: {
            type: String,
            required: true,
            index: true,
        },

        shortId: {
            type: String,
            required: true,
            index: true,
        },
    },
    { timestamps: true }
);

const OrderModel = model<IOrder>("Order", schema);

export default OrderModel;
