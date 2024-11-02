import { Schema, model } from "mongoose";
import { ROLES } from "@/constants/roles";

import CartModel from "./Cart";

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
        enum: [ROLES.MANAGER, ROLES.ADMIN, ROLES.USER],
        default: ROLES.USER,
    },

    profile: String,
});

schema.pre("save", async function (next) {
    await CartModel.create({ user: this._id });
    next();
});

const UserModel = model<IUser>("User", schema);

export default UserModel;
