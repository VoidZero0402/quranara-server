import { Schema, model, PopulatedDoc, Document, ObjectId } from "mongoose";
import { IUser } from "./User";
import { ITv } from "./Tv";

export interface ITvLike {
    tv: PopulatedDoc<Document<ObjectId> & ITv>;
    user: PopulatedDoc<Document<ObjectId> & IUser>;
}

const schema = new Schema<ITvLike>({
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

schema.index({ tv: 1, user: 1 }, { unique: true });

const TvLikeModel = model<ITvLike>("TvLike", schema);

export default TvLikeModel;
