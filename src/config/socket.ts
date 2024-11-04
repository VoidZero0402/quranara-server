import { Server as HttpServer } from "http";
import { Server } from "socket.io";

const createSocketConnection = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            credentials: true,
        },
    });

    return io;
};

export default createSocketConnection;
