import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { STATUS, TYPE } from "@/constants/tickets";
import { IUser } from "./User";
import { ICourse } from "./Course";

type Status = (typeof STATUS)[keyof typeof STATUS];
type TicketType = (typeof TYPE)[keyof typeof TYPE];

export interface ITicket {
    title: string;
    user: PopulatedDoc<Document<ObjectId> & IUser>;
    course?: PopulatedDoc<Document<ObjectId> & ICourse>;
    status: Status;
    type: TicketType;
    shortId: string;
}

const schema = new Schema<ITicket>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        course: {
            type: Schema.Types.ObjectId,
            ref: "Course",
        },

        status: {
            type: String,
            enum: Object.values(STATUS),
            default: STATUS.ACTIVE,
        },

        type: {
            type: String,
            enum: Object.values(TYPE),
            default: TYPE.SUPPORT,
        },

        shortId: String,
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const TicketModel = model<ITicket>("Ticket", schema);

export default TicketModel;
