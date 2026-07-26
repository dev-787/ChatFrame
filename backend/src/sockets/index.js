const { verifyAccessToken } = require("../utils/jwt");
const { getCachedUserSession, cacheUserSession, invalidateUserSession } = require("../services/redisService");
const { getRedis } = require("../config/redis");
const { parseCookies } = require("../utils/cookies");
const logger = require("../utils/logger");

const initSockets = (io) => {
  // ─── Auth middleware ───────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      let token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token && socket.handshake.headers?.cookie) {
        const cookies = parseCookies(socket.handshake.headers.cookie);
        token = cookies.token;
      }

      if (!token) return next(new Error("Authentication token is required."));

      const decoded = verifyAccessToken(token);

      let sessionData = await getCachedUserSession(decoded.sub);
      if (!sessionData) {
        sessionData = {
          userId: decoded.sub,
          email: decoded.email,
          role: decoded.role,
          tenantId: decoded.tenantId,
        };
      }

      socket.user = sessionData;
      next();
    } catch {
      next(new Error("Invalid or expired authentication token."));
    }
  });

  // ─── Connection ────────────────────────────────────────────────
  io.on("connection", async (socket) => {
    const { userId, tenantId, role } = socket.user;

    logger.info(`🔌 Connected: userId=${userId} role=${role} tenantId=${tenantId}`);

    // Join tenant room (scoped broadcasts)
    if (tenantId) socket.join(`tenant:${tenantId}`);

    // Join personal room (notifications)
    socket.join(`user:${userId}`);

    // Mark agent online in Redis
    try {
      const redis = getRedis();
      await redis.set(`online:${tenantId}:${userId}`, "1", "EX", 300); // 5 min TTL

      // Broadcast updated online presence to tenant
      io.to(`tenant:${tenantId}`).emit("agent:online", { userId });
    } catch (err) {
      logger.error("Redis presence error:", { message: err.message });
    }

    // ── Join a specific ticket/conversation room ─────────────────
    socket.on("ticket:join", (ticketId) => {
      socket.join(`ticket:${ticketId}`);
      logger.info(`📨 ${userId} joined ticket room: ${ticketId}`);
    });

    socket.on("ticket:leave", (ticketId) => {
      socket.leave(`ticket:${ticketId}`);
    });

    // ── Typing indicators ────────────────────────────────────────
    socket.on("typing:start", ({ ticketId }) => {
      socket.to(`ticket:${ticketId}`).emit("typing:start", {
        userId,
        ticketId,
      });
    });

    socket.on("typing:stop", ({ ticketId }) => {
      socket.to(`ticket:${ticketId}`).emit("typing:stop", {
        userId,
        ticketId,
      });
    });

    // ── Heartbeat to keep online presence fresh ──────────────────
    socket.on("heartbeat", async () => {
      try {
        const redis = getRedis();
        await redis.expire(`online:${tenantId}:${userId}`, 300);
      } catch {}
    });

    // ── Disconnect ───────────────────────────────────────────────
    socket.on("disconnect", async (reason) => {
      logger.info(`🔌 Disconnected: userId=${userId} reason=${reason}`);

      try {
        const redis = getRedis();
        await redis.del(`online:${tenantId}:${userId}`);
        io.to(`tenant:${tenantId}`).emit("agent:offline", { userId });
      } catch {}
    });
  });
};

module.exports = initSockets;