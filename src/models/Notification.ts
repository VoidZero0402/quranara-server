import { Schema, model } from "mongoose";
import { TYPES } from "@/constants/notifications";
import NotificationUserModel from "./NotificationUser";

type Type = (typeof TYPES)[keyof typeof TYPES];

export interface INotification {
    title: string;
    description: string;
    type: Type;
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

        type: {
            type: String,
            enum: [TYPES.GLOBAL, TYPES.COURSE_REGISTERS, TYPES.ONE_USER],
            required: true,
        },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

schema.post("findOneAndDelete", async function (doc, next) {
    const _id = doc._id;

    await NotificationUserModel.deleteMany({
        notification: _id,
    });

    next();
});

const NotificationModel = model<INotification>("Notification", schema);

export default NotificationModel;
