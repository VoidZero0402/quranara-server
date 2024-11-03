import { Document, Model, Schema, model } from "mongoose";

export interface IMetadata {
    courses: { counter: number };
    sessions: { counter: number };
    tickets: { counter: number };
    blogs: { counter: number };
}

interface MetadataModel extends Model<IMetadata> {
    getMetadata(): Promise<Document<unknown, {}, IMetadata> & IMetadata>;
}

const schema = new Schema<IMetadata, MetadataModel>({
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

const MetadataModel = model<IMetadata, MetadataModel>("Metadata", schema);

export default MetadataModel;
