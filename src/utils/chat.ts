import redis from "@/config/redis";
import { STATUS } from "@/constants/chat";
import { IChatMessage, Status } from "@/types/chat.types";

export class Chat {
    private chatExpiresInSeconds = 259200;

    constructor(public uuid: string, public user: string | null) {
        this.uuid = uuid;
        this.user = user;
    }

    getRedisChatPattern(): string {
        return `chat:${this.uuid}`;
    }

    getRedisChatMessagesPattern(): string {
        return `chat:${this.uuid}:messages`;
    }

    async init(): Promise<void> {
        const chat = await redis.exists(this.getRedisChatPattern());

        if (!chat) {
            await redis.hset(this.getRedisChatPattern(), [
                ["user", this.user],
                ["status", STATUS.ACTIVE],
            ]);
        }
    }

    async changeStatus(status: Status): Promise<void> {
        await redis.hset(this.getRedisChatPattern(), [["status", status]]);
    }

    async updateExpires(): Promise<void> {
        await redis.expire(this.getRedisChatPattern(), this.chatExpiresInSeconds);
        await redis.expire(this.getRedisChatMessagesPattern(), this.chatExpiresInSeconds);
    }

    async push(data: IChatMessage): Promise<void> {
        await redis.rpush(this.getRedisChatMessagesPattern(), JSON.stringify(data));
        await this.changeStatus(STATUS.ACTIVE);
        await this.updateExpires();
    }

    async answer(data: IChatMessage): Promise<void> {
        await this.push(data);
        await this.changeStatus(STATUS.SLEEP);
    }

    async getMessages(): Promise<IChatMessage[]> {
        const messages = await redis.lrange(this.getRedisChatMessagesPattern(), 0, -1);
        const parsedMessages = messages.map((message) => JSON.parse(message));
        return parsedMessages;
    }
}
