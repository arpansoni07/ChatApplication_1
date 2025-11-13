import { Server } from "socket.io";

// Store online users: { userId: socketId }
export const userSocketMap = {};

// Initialize socket.io server
export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  // Socket.io connection handler
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User connected:", userId);

    if (userId) {
      const userIdStr = userId?.toString ? userId.toString() : userId;
      userSocketMap[userIdStr] = socket.id;
    }

    // Emit updated online users to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", userId);
      if (userId) {
        const userIdStr = userId?.toString ? userId.toString() : userId;
        if (userSocketMap[userIdStr]) {
          delete userSocketMap[userIdStr];
          io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
      }
    });
  });

  return io;
};
