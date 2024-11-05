import ChatModel from "@/models/Chat";
import ChatMessageModel from "@/models/ChatMessage";

import { STATUS } from "@/constants/chat";

import { SocketIOServer } from "@/types/socket.types";

import { createPaginationData } from "@/utils/funcs";

const formatChatId = (_id: string) => `_chat_${_id}`;

const unformatChatId = (chatId: string) => chatId.replace("_chat_", "");

const chatSocketHandler = (io: SocketIOServer) => {
    io.of("/chat").on("connection", async (socket) => {
        console.log("New Client Connected!");

        socket.on("chat:starting", async (chatId: string) => {
            try {
                let chat = await ChatModel.findById(chatId && unformatChatId(chatId));

                if (!chat) {
                    chat = await ChatModel.create({});
                }

                socket.join(formatChatId(chat._id.toString()));

                socket.emit("chat:start", { chatId: formatChatId(chat._id.toString()) });
            } catch (err) {
                socket.emit("chat:error", { message: "Unable to start chat" });
            }
        });

        socket.on("manager:active-chats", async ({ page = 1, limit = 10 }: { page: number; limit: number }) => {
            try {
                const filters = { status: STATUS.ACTIVE };

                const chats = await ChatModel.find(filters)
                    .populate("user", "username profile")
                    .sort({ updatedAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit);

                const chatsCount = await ChatModel.countDocuments(filters);

                socket.emit("manager:get-active-chats", {
                    chats: chats,
                    pagination: createPaginationData(page, limit, chatsCount),
                });
            } catch (err) {
                socket.emit("error", { message: "Unable to fetch active chats." });
            }
        });

        socket.on("message:send", async ({ chatId, content }: { chatId: string; content: string }) => {
            try {
                const unformatedChatId = unformatChatId(chatId);

                const message = await ChatMessageModel.create({
                    chat: unformatedChatId,
                    content,
                });

                const chat = await ChatModel.findByIdAndUpdate(unformatedChatId, { status: STATUS.ACTIVE }, { new: true });

                io.of("/chat").to(chatId).emit("message:new", message.toObject());
                io.of("/chat").emit("manager:chat-update", chat?.toObject());
            } catch (err) {
                socket.emit("chat:error", { message: "Unable to send message" });
            }
        });

        socket.on("manager:join-chat", async ({ chatId }: { chatId: string }) => {
            try {
                const chat = await ChatModel.findById(chatId).populate("user");

                if (!chat) {
                    socket.emit("error", { message: "Chat not found." });
                    return;
                }

                socket.join(formatChatId(chatId));

                const messages = await ChatMessageModel.find({ chat: chatId }).sort({ createdAt: -1 }).populate("user");

                socket.emit("manager:chat-history", { messages });
            } catch (err) {
                socket.emit("error", { message: "Unable to join chat." });
            }
        });

        socket.on("manager:reply", async ({ chatId, content }: { chatId: string; content: string }) => {
            try {
                const message = await ChatMessageModel.create({
                    chat: chatId,
                    content,
                });

                io.of("/chat").to(formatChatId(chatId)).emit("message:new", message);
            } catch (err) {
                socket.emit("chat:error", { message: "Unable to reply message" });
            }
        });

        socket.on("manager:sleep-chat", async ({ chatId }: { chatId: string }) => {
            try {
                await ChatModel.findByIdAndUpdate(chatId, { status: STATUS.SLEEP }, { new: true });
            } catch (err) {
                socket.emit("chat:error", { message: "Unable to sleep chat" });
            }
        });
    });
};

export default chatSocketHandler;
