import mongoose from "mongoose";

export const isDuplicateKeyError = (err: Error): boolean => err instanceof mongoose.mongo.MongoError && err.code === 11000;
