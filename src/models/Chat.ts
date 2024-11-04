import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { STATUS } from "@/constants/chat";
import { IUser } from "./User";

export type Status = (typeof STATUS)[keyof typeof STATUS];

interface IChat {
    user?: PopulatedDoc<Document<ObjectId> & IUser>;
    status: Status;
}

const schema = new Schema<IChat>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        status: {
            type: String,
            enum: [STATUS.ACTIVE, STATUS.SLEEP],
            default: STATUS.SLEEP,
        },
    },
    { timestamps: true }
);

const ChatModel = model<IChat>("Chat", schema);

export default ChatModel;
