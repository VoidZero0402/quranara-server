import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { IUser } from "./User";
import { ITicket } from "./Ticket";
import { ATTACHED_FILE_TYPES } from "@/constants/files";

export type AttachedType = (typeof ATTACHED_FILE_TYPES)[keyof typeof ATTACHED_FILE_TYPES];

export interface ITicketMessage {
    content: string;
    user: PopulatedDoc<Document<ObjectId> & IUser>;
    ticket: PopulatedDoc<Document<ObjectId> & ITicket>;
    attached?: {
        type: AttachedType;
        url: string;
    };
}

const schema = new Schema<ITicketMessage>(
    {
        content: {
            type: String,
            required: true,
            trim: true,
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        ticket: {
            type: Schema.Types.ObjectId,
            ref: "Ticket",
            required: true,
            index: true,
        },

        attached: {
            type: {
                type: String,
                enum: [ATTACHED_FILE_TYPES.IMAGE, ATTACHED_FILE_TYPES.AUDIO, ATTACHED_FILE_TYPES.ZIP],
            },
            url: String,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const TicketMessageModel = model<ITicketMessage>("TicketMessage", schema);

export default TicketMessageModel;
