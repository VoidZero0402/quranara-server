import { getUsersUnique } from "./metadata";

export const getUniqueUsername = async () => {
    const unique = await getUsersUnique();
    const username = `کاربر ${unique}#`;
    return username;
};
