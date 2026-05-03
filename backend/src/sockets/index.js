const { verifyAccessToken } = require("../utils/jwt");
const { getCachedUserSession } = require("../services/redisService");

/**
 * initSockets — attaches Socket.io to the HTTP server
 * with JWT authentication middleware.
 *
 * @param {http.Server} httpServer
 * @param {SocketIO.Server} io
 */
const initSockets = (io) => {
  // ─── Auth middleware for every socket connection ───
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication token is required."));
      }

      const decoded = verifyAccessToken(token);

      // Try Redis cache first for performance
      let sessionData = await getCachedUserSession(decoded.sub);

      if (!sessionData) {
        // Fallback: rebuild from token payload
        sessionData = {
          userId: decoded.sub,
          email: decoded.email,
          role: decoded.role,
          tenantId: decoded.tenantId,
        };
      }

      socket.user = sessionData;
      next();
    } catch (err) {
      next(new Error("Invalid or expired authentication token."));
    }
  });

  // ─── Connection handler ───
  io.on("connection", (socket) => {
    const { userId, tenantId, role } = socket.user;

    console.log(`🔌 Socket connected: userId=${userId} tenantId=${tenantId} role=${role}`);

    // Each user joins their tenant room for scoped broadcasts
    if (tenantId) {
      socket.join(`tenant:${tenantId}`);
    }

    // Join personal room (for direct notifications)
    socket.join(`user:${userId}`);

    // ─── Disconnect ───
    socket.on("disconnect", (reason) => {
      console.log(`🔌 Socket disconnected: userId=${userId} reason=${reason}`);
    });

    // ─── Future: support conversation events ───
    // socket.on("conversation:join", ...)
    // socket.on("message:send", ...)
    // socket.on("typing:start", ...)
  });
};

module.exports = initSockets;