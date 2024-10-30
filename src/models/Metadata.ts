import { Document, Model, Schema, model } from "mongoose";

export interface IMetadata {
    users: { counter: number };
    courses: { counter: number };
    sessions: { counter: number };
    tickets: { counter: number };
    blogs: { counter: number };
}

interface UserModel extends Model<IMetadata> {
    getMetadata(): Promise<Document<unknown, {}, IMetadata> & IMetadata>;
}

const schema = new Schema<IMetadata, UserModel>({
    users: {
        counter: {
            type: Number,
            default: 0,
        },
    },
    courses: {
        counter: {
            type: Number,
            default: 0,
        },
    },
    sessions: {
        counter: {
            type: Number,
            default: 0,
        },
    },
    tickets: {
        counter: {
            type: Number,
            default: 0,
        },
    },
    blogs: {
        counter: {
            type: Number,
            default: 0,
        },
    },
});

schema.static("getMetadata", async function getMetadata() {
    let metadata = await this.findOne();

    if (!metadata) {
        metadata = await this.create({});
    }

    return metadata;
});

const MetadataModel = model<IMetadata, UserModel>("Metadata", schema);

export default MetadataModel;
