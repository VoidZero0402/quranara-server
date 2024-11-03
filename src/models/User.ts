import { Document, Model, Schema, model } from "mongoose";
import { compare, hash } from "bcryptjs";
import { ROLES } from "@/constants/roles";

import CartModel from "./Cart";

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface IUser {
    phone: string;
    email: string;
    fullname: string;
    username: string;
    role: Role;
    password: string;
    profile?: string;
}

export type UserDocument = Document<unknown, {}, IUser> & IUser;

interface IUserMethods {
    comparePassword(password: string): Promise<boolean>;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const schema = new Schema<IUser, UserModel, IUserMethods>({
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },

    fullname: {
        type: String,
        required: true,
        trim: true,
    },

    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },

    role: {
        type: String,
        enum: [ROLES.MANAGER, ROLES.ADMIN, ROLES.USER],
        default: ROLES.USER,
    },

    password: {
        type: String,
        required: true,
    },

    profile: String,
});

schema.pre("save", async function (next) {
    this.password = await hash(this.password, 12);
    await CartModel.create({ user: this._id });
    next();
});

schema.method("comparePassword", async function (password: string): Promise<boolean> {
    return await compare(password, this.password);
});

const UserModel = model<IUser, UserModel>("User", schema);

export default UserModel;
