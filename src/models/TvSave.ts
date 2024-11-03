import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { IUser } from "./User";
import { ITv } from "./Tv";

export interface ITvSave {
    tv: PopulatedDoc<Document<ObjectId> & ITv>;
    user: PopulatedDoc<Document<ObjectId> & IUser>;
}

const schema = new Schema<ITvSave>({
    tv: {
        type: Schema.Types.ObjectId,
        ref: "Tv",
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

schema.index({ blog: 1, user: 1 }, { unique: true });

const TvSaveModel = model<ITvSave>("TvSave", schema);

export default TvSaveModel;
