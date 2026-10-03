import "dotenv/config";

import { createServer } from "http";
import { Server } from "socket.io";

import app from "./app";
import initializeSocket from "./socket";

import { connectToDatabase } from "../lib/db";

// Create HTTP Server
const server = createServer(app);

// Create Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Server Port
const PORT = Number(process.env.PORT) || 5000;

// Start Server
async function startServer() {
  try {
    console.log("⏳ Connecting to MongoDB...");

    await connectToDatabase();

    console.log("✅ MongoDB Connected");

    console.log("⏳ Initializing Socket.IO...");

    initializeSocket(io);

    console.log("✅ Socket.IO Initialized");

    server.listen(PORT, () => {
      console.log("=================================");
      console.log(`🚀 Server Running`);
      console.log(`🌐 Express : http://localhost:${PORT}`);
      console.log(`🔌 Socket  : ws://localhost:${PORT}`);
      console.log("=================================");
    });
  } catch (error) {
    console.error("❌ Failed to start server");
    console.error(error);
    process.exit(1);
  }
}

startServer();