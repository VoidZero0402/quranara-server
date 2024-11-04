import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { IUser } from "./User";
import { IChat } from "@/types/chat.types";
import { ATTACHED_FILE_TYPES } from "@/constants/files";

export type AttachedType = (typeof ATTACHED_FILE_TYPES)[keyof typeof ATTACHED_FILE_TYPES];

interface IChatMessage {
    content: string;
    user?: PopulatedDoc<Document<ObjectId> & IUser>;
    chat: PopulatedDoc<Document<ObjectId> & IChat>;
    attached?: {
        type: AttachedType;
        url: string;
    };
    replyTo: PopulatedDoc<Document<ObjectId> & IChatMessage>;
}

const schema = new Schema<IChatMessage>(
    {
        content: {
            type: String,
            required: true,
            trim: true,
        },

        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },

        chat: {
            type: Schema.Types.ObjectId,
            ref: "Chat",
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

        replyTo: {
            type: Schema.Types.ObjectId,
            ref: "ChatMessage",
        },
    },
    { timestamps: { createdAt: true } }
);

const ChatMessageModel = model<IChatMessage>("ChatMessage", schema);

export default ChatMessageModel;
