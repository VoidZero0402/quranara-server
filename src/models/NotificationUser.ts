import { Document, ObjectId, PopulatedDoc, Schema, model } from "mongoose";
import { IUser } from "./User";
import { INotification } from "./Notification";

export interface INotificationUser {
    user: PopulatedDoc<Document<ObjectId> & IUser>;
    notification: PopulatedDoc<Document<ObjectId> & INotification>;
    isSeen: boolean;
}

const schema = new Schema<INotificationUser>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        notification: {
            type: Schema.Types.ObjectId,
            ref: "Notification",
            required: true,
        },

        isSeen: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const NotificationUserModel = model<INotificationUser>("NotificationUser", schema);

export default NotificationUserModel;
