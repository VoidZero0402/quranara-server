import MetadataModel from "@/models/Metadata";

export const getUsersUnique = async () => {
    const metadata = await MetadataModel.getMetadata();
    metadata.users.counter += 1;
    await metadata.save();

    return metadata.users.counter;
};
