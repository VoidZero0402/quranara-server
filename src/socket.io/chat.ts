import { SocketIOServer } from "@/types/socket.types";

class ChatHandler {}

const chatSocketHandler = (io: SocketIOServer) => {
    io.of("/chat").on("connection", async (socket) => {});
};

export default chatSocketHandler;
