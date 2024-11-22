import { Document, ObjectId, PopulatedDoc, Schema, model } from "mongoose";
import { IUser } from "./User";
export interface IBan {
    phone: string;
    user: PopulatedDoc<Document<ObjectId> & IUser>;
}

const schema = new Schema<IBan>({
    phone: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

const BanModel = model<IBan>("Ban", schema);

export default BanModel;
