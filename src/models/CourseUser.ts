import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import CourseModel, { ICourse } from "./Course";
import { IUser } from "./User";

export interface ICourseUser {
    course: PopulatedDoc<Document<ObjectId> & ICourse>;
    user: PopulatedDoc<Document<ObjectId> & IUser>;
}

export type CourseUserDocument = Document<unknown, {}, ICourseUser> & ICourseUser;

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

schema.post("insertMany", async function (docs: CourseUserDocument[], next) {
    try {
        const courses = docs.map((doc) => doc.course);

        await CourseModel.updateMany({ _id: { $in: courses } }, { $inc: { "metadata.students": 1 } });

        next();
    } catch (err: any) {
        next(err);
    }
});

schema.post("save", async function (doc: CourseUserDocument, next) {
    try {
        await CourseModel.updateOne({ _id: doc.course }, { $inc: { "metadata.students": 1 } });
    } catch (err: any) {
        next(err);
    }
});

const CourseUserModel = model<ICourseUser>("CourseUser", schema);

export default CourseUserModel;
