import { STATUS, TYPE } from "@/constants/chat";
import { ATTACHED_FILE_TYPES } from "@/constants/files";

export type Status = (typeof STATUS)[keyof typeof STATUS];
export type Type = (typeof TYPE)[keyof typeof TYPE];
export type AttachedType = (typeof ATTACHED_FILE_TYPES)[keyof typeof ATTACHED_FILE_TYPES];

export interface IChat {
    user: string | null;
    status: Status;
}

export interface IChatMessage {
    user: string;
    username: string;
    content: string;
    createdAt: Date;
    type: Type;
    attached?: {
        type: AttachedType;
        url: string;
    };
}
