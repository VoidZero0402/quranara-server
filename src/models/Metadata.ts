import { Schema, model } from "mongoose";

export interface IMetadata {
    users: { counter: number };
    courses: { courses: number };
    sessions: { counter: number };
    tickets: { counter: number };
    blogs: { counter: number };
}

const schema = new Schema<IMetadata>({
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

const MetadataModel = model<IMetadata>("Metadata", schema);

// TODO: create just one document Or ( use redis to handle )

export default MetadataModel;
