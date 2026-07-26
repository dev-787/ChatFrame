const { verifyAccessToken } = require("../utils/jwt");
const { User } = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { parseCookies } = require("../utils/cookies");

/**
 * authMiddleware — verifies the JWT from the Authorization header
 * or HTTP-only cookies and attaches the decoded user to req.user.
 */
const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.headers.cookie) {
    const cookies = parseCookies(req.headers.cookie);
    token = cookies.token;
  }

  if (!token) {
    throw new AppError("Authentication token is missing or malformed", 401);
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      const expiredError = new AppError("Your session has expired.", 401);
      expiredError.code = "TOKEN_EXPIRED";
      throw expiredError;
    }
    throw new AppError("Invalid authentication token.", 401);
  }

  // Fetch fresh user from DB (validates account is still active)
  const user = await User.findById(decoded.sub).select("-password");

  if (!user) {
    throw new AppError("User account not found.", 401);
  }

  if (!user.isActive) {
    throw new AppError("Your account has been deactivated.", 403);
  }

  req.user = user;
  next();
});

module.exports = authMiddleware;