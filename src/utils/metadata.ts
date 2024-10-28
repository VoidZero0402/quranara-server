import MetadataModel from "@/models/Metadata";

export const getUsersUnique = async () => {
    const metadata = await MetadataModel.getMetadata();
    metadata.users.counter += 1;
    await metadata.save();

    return metadata.users.counter;
};

export const getCoursesUnique = async () => {
    const metadata = await MetadataModel.getMetadata();
    metadata.courses.counter += 1;
    await metadata.save();

    return metadata.courses.counter;
};

export const decreaseCoursesUnique = async () => {
    const metadata = await MetadataModel.getMetadata();
    metadata.courses.counter -= 1;
    await metadata.save();
};

export const getSessionsUnique = async () => {
    const metadata = await MetadataModel.getMetadata();
    metadata.sessions.counter += 1;
    await metadata.save();

    return metadata.sessions.counter;
};
