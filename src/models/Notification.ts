import { Schema, model } from "mongoose";

export interface INotification {
    title: string;
    description: string;
}

const schema = new Schema<INotification>(
    {
        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const NotificationModel = model<INotification>("Notification", schema);

export default NotificationModel;
