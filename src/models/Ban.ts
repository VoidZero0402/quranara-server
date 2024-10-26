import { Schema, model } from "mongoose";

export interface IBan {
    phone: string;
}

const schema = new Schema<IBan>({
    phone: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
});

const BanModel = model<IBan>("Ban", schema);

export default BanModel;
