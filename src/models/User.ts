import { Schema, model } from "mongoose";
import { ROLES } from "@/constants/roles";

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface IUser {
    phone: string;
    username: string;
    role: Role;
    profile?: string;
}

const schema = new Schema<IUser>({
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },

    username: {
        type: String,
        required: true,
        trim: true,
    },

    role: {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.USER,
    },

    profile: String,
});

const UserModel = model<IUser>("User", schema);

export default UserModel;
