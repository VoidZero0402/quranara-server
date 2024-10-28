import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { STATUS } from "@/constants/comments";
import { ITv } from "./Tv";
import { IUser } from "./User";

export type Status = (typeof STATUS)[keyof typeof STATUS];

export interface ITvComment {
    content: string;
    tv: PopulatedDoc<Document<ObjectId> & ITv>;
    user: PopulatedDoc<Document<ObjectId> & IUser>;
    rating?: Number;
    status: Status;
    replyTo?: PopulatedDoc<Document<ObjectId> & ITvComment>;
}

const schema = new Schema<ITvComment>(
    {
        content: {
            type: String,
            required: true,
            trim: true,
        },

        tv: {
            type: Schema.Types.ObjectId,
            ref: "Tv",
            required: true,
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        rating: {
            type: Number,
            required() {
                return !this.replyTo;
            },
        },

        status: {
            type: String,
            enum: [STATUS.PENDING, STATUS.PENDING, STATUS.REJECTED],
            default: STATUS.PENDING,
        },

        replyTo: {
            type: Schema.Types.ObjectId,
            ref: "TvComment",
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const TvCommentModel = model<ITvComment>("TvComment", schema);

export default TvCommentModel;
