import MetadataModel from "@/models/Metadata";

type Entities = "users" | "courses" | "sessions" | "tickets" | "blogs";

const getUnique = (entity: Entities) => async () => {
    const metadata = await MetadataModel.getMetadata();
    metadata[entity].counter += 1;
    await metadata.save();

    return metadata[entity].counter;
};

export const getUsersUnique = getUnique("users");

export const getCoursesUnique = getUnique("courses");

export const decreaseCoursesUnique = async () => {
    const metadata = await MetadataModel.getMetadata();
    metadata.courses.counter -= 1;
    await metadata.save();
};

export const getSessionsUnique = getUnique("sessions");

export const getTicketUnique = getUnique("tickets");

export const getBlogUnique = getUnique("blogs");

export const decreaseBlogsUnique = async () => {
    const metadata = await MetadataModel.getMetadata();
    metadata.blogs.counter -= 1;
    await metadata.save();
};
