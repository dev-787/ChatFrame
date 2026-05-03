require("dotenv").config();

const http = require("http");
const { Server: SocketIOServer } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const initSockets = require("./sockets");

const PORT = process.env.PORT || 5000;

// ─── Bootstrap ───────────────────────────────────────────────────
const bootstrap = async () => {
  try {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Connect Redis
    connectRedis();

    // 3. Create HTTP server
    const httpServer = http.createServer(app);

    // 4. Attach Socket.io
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
          .split(",")
          .map((o) => o.trim()),
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // 5. Init socket handlers
    initSockets(io);

    // Attach io to app so controllers can emit events if needed
    app.set("io", io);

    // 6. Start listening
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 ChatFrame API running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV}`);
      console.log(`🌐 http://localhost:${PORT}/api/health\n`);
    });

    // ─── Graceful shutdown ───
    const shutdown = async (signal) => {
      console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
      httpServer.close(() => {
        console.log("🛑 HTTP server closed");
        process.exit(0);
      });

      // Force close after 10s
      setTimeout(() => {
        console.error("❌ Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // Unhandled rejections
    process.on("unhandledRejection", (reason, promise) => {
      console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    });

    process.on("uncaughtException", (err) => {
      console.error("❌ Uncaught Exception:", err);
      process.exit(1);
    });
  } catch (err) {
    console.error("❌ Bootstrap failed:", err.message);
    process.exit(1);
  }
};

bootstrap();