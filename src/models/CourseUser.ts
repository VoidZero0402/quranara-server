import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { ICourse } from "./Course";
import { IUser } from "./User";

export interface ICourseUser {
    course: PopulatedDoc<Document<ObjectId> & ICourse>;
    user: PopulatedDoc<Document<ObjectId> & IUser>;
}

const schema = new Schema<ICourseUser>({
    course: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true,
        index: true,
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
});

schema.index({ course: 1, user: 1 }, { unique: true });

const CourseUserModel = model<ICourseUser>("CourseUser", schema);

export default CourseUserModel;
