import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { IUser } from "./User";
import { ICourse } from "./Course";

export interface ICart {
    user: PopulatedDoc<Document<ObjectId> & IUser>;
    items: PopulatedDoc<Document<ObjectId> & ICourse>[];
}

const schema = new Schema<ICart>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },

    items: {
        type: [Schema.Types.ObjectId],
        ref: "Course",
        required: true,
    },
});

const CartModel = model<ICart>("Cart", schema);

export default CartModel;
