import mongoose from "mongoose";

const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log(`MongoDB Connected On ${mongoose.connections[0].host}`);
    } catch (err) {
        console.error("Database Connection Error ->", err);
        process.exit(1);
    }
};

export default connectToDatabase;
