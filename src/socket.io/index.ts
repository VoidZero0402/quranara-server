import { SocketIOServer } from "@/types/socket.types";
import chatSocketHandler from "./chat";

const socketHandler = (io: SocketIOServer) => {
    chatSocketHandler(io);
};

export default socketHandler;
