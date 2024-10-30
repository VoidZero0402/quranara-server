import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { ICourse } from "./Course";

export interface ITopic {
    title: string;
    order: number;
    course: PopulatedDoc<Document<ObjectId> & ICourse>;
}

const schema = new Schema<ITopic>({
    title: {
        type: String,
        required: true,
        trim: true,
    },

    order: {
        type: Number,
        required: true,
        index: true,
    },

    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true,
        index: true,
    },
});

const TopicModel = model<ITopic>("Topic", schema);

export default TopicModel;
