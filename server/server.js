// // import express from "express";
// // import "dotenv/config";
// // import cors from "cors";
// // import http from "http";
// // import { connectDB } from "./lib/DB.js";
// // import userRouter from "./routes/userRoutes.js";
// // import messageRouter from "./routes/messageRoutes.js";
// // import { Server } from "socket.io";
// // import { log } from "console";
// // // Create Express and Http server

// // const app = express();
// // const server = http.createServer(app);

// // //initialize socket.io server

// // export const io = new Server(server, {
// //   cors: { origin: "*" },
// // });

// // //store online users
// // export const userSocketMap = {}; //  {userId: socketId}

// // //socket.io connection handler
// // io.on("connection", (socket) => {
// //   const userId = socket.handshake.query.userId;
// //   console.log("user connected", userId);

// //   if (userId) userSocketMap[userId] = socket.id;
// // });

// // //emit online user to all connected clients

// // io.emit("getOnlineUsers", Object.keys(userSocketMap));

// // socket.on("disconnect", () => {
// //   console.log("user disconnected", userId);
// //   delete userSocketMap[userId];
// //   io.emit("getOnlineUsers", Object.keys(userSocketMap));
// // });

// // // Middleware setup

// // app.use(express.json({ limit: "4mb" }));
// // app.use(cors());

// // //Route setup
// // app.use("/api/status", (req, res) => res.send("server is live "));
// // app.use("/api/auth", userRouter);
// // app.use("/api/messages", messageRouter);

// // // connect to MongoDB
// // await connectDB();

// // const PORT = process.env.PORT || 5000;
// // server.listen(PORT, () => console.log("server is running on PORT :" + PORT));

// // server.js
// import express from "express";
// import "dotenv/config";
// import cors from "cors";
// import http from "http";
// import { connectDB } from "./lib/DB.js";
// import { initializeSocket } from "./lib/socket.js";
// import userRouter from "./routes/userRoutes.js";
// import messageRouter from "./routes/messageRoutes.js";

// // Create Express app and HTTP server
// const app = express();
// const server = http.createServer(app);

// // Initialize socket.io server
// export const io = initializeSocket(server);

// // Middleware setup
// app.use(express.json({ limit: "4mb" }));
// app.use(cors());

// // Routes
// app.use("/api/status", (req, res) => res.send("Server is live"));
// app.use("/api/auth", userRouter);
// app.use("/api/messages", messageRouter);

// // Connect to MongoDB and start server
// const startServer = async () => {
//   try {
//     await connectDB();
//     const PORT = 5001; // Force port 5001 to avoid conflicts
//     server.listen(PORT, () =>
//       console.log(`Server is running on PORT: ${PORT}`)
//     );
//   } catch (error) {
//     console.error("Failed to start server:", error.message);
//   }
// };

// startServer();
// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/DB.js";
import { initializeSocket } from "./lib/socket.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

// Load environment variables
// dotenv.config({ path: './.env' });
dotenv.config();

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize socket.io server
export const io = initializeSocket(server);

// Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.use("/api/status", (req, res) => res.send("✅ Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Start server only after DB connection succeeds
const startServer = async () => {
  try {
    await connectDB();
    const PORT = 5001;
    server.listen(PORT, () => {
      console.log("Server is running on port 5001");
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();