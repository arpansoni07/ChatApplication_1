import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/DB.js";
import { initializeSocket } from "./lib/socket.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

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

// Socket.io support (disabled automatically on serverless platforms)
let httpServer = null;
export let io = null;

const enableSockets = () => {
  if (!httpServer) {
    httpServer = http.createServer(app);
    io = initializeSocket(httpServer);
  }
};

// Start server only after DB connection succeeds
const startServer = async () => {
  try {
    await connectDB();
    const isServerless = Boolean(process.env.VERCEL);

    if (!isServerless) {
      enableSockets();
      const PORT = process.env.PORT || 5001;
      httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    } else {
      console.log(
        "Server running in serverless mode – HTTP server is managed by the platform."
      );
    }
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();

// Export the Express app for serverless environments (e.g., Vercel)
export default app;
