import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { IUser } from "./User";
import { ICourse } from "./Course";

export interface ICart {
    user: PopulatedDoc<Document<ObjectId> & IUser>;
    items: PopulatedDoc<Document<ObjectId> & ICourse>[];
}

export type PopulatedCourse = Document<unknown, {}, ICourse> & ICourse;

const schema = new Schema<ICart>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true,
    },

    items: {
        type: [Schema.Types.ObjectId],
        ref: "Course",
    },
});

const CartModel = model<ICart>("Cart", schema);

export default CartModel;
