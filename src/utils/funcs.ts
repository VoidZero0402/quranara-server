import fs from "fs/promises";

export const removeFile = async (path: string): Promise<void> => {
    await fs.unlink(path);
};
