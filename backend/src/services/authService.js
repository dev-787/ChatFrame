const { User, ROLES } = require("../models/User");
const { generateAuthTokens, verifyRefreshToken } = require("../utils/jwt");
const { cacheUserSession, blacklistToken, isTokenBlacklisted } = require("./redisService");
const AppError = require("../utils/AppError");

/**
 * Create a new company admin user.
 */
const createCompanyAdmin = async ({ firstName, lastName, email, password, tenantId }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: ROLES.COMPANY_ADMIN,
    tenantId,
    isVerified: true, // Self-registered admin is auto-verified
  });

  return user;
};

/**
 * Create a new support agent user.
 */
const createSupportAgent = async ({ firstName, lastName, email, password, tenantId }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: ROLES.SUPPORT_AGENT,
    tenantId,
  });

  return user;
};

/**
 * Authenticate a user by email + password.
 * Returns user + tokens on success.
 */
const loginUser = async ({ email, password }) => {
  // Explicitly select password (it's excluded by default)
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.isActive) {
    throw new AppError("Your account has been deactivated. Contact your admin.", 403);
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password.", 401);
  }

  // Update last login timestamp
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const tokens = generateAuthTokens(user);

  // Cache session in Redis for fast socket auth lookups
  await cacheUserSession(user._id.toString(), {
    userId: user._id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
  });

  return { user, tokens };
};

/**
 * Validate a refresh token, rotate tokens, and cache updated session.
 * Enforces a hard 30-day max session limit from initial login.
 */
const refreshAuthTokens = async (refreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new AppError("Invalid or expired refresh token. Please log in again.", 401);
  }

  const isBlacklisted = await isTokenBlacklisted(refreshToken);
  if (isBlacklisted) {
    throw new AppError("Refresh token has been revoked. Please log in again.", 401);
  }

  // Calculate remaining lifetime based on initial login timestamp (hard 30-day cap)
  const now = Math.floor(Date.now() / 1000);
  const initialLoginAt = decoded.initialLoginAt || now;
  const maxSessionSeconds = 30 * 24 * 60 * 60; // 30 days
  const remainingSeconds = maxSessionSeconds - (now - initialLoginAt);

  if (remainingSeconds <= 0) {
    throw new AppError("Maximum 30-day session limit reached. Please log in again.", 401);
  }

  const user = await User.findById(decoded.sub);
  if (!user) {
    throw new AppError("User account not found.", 401);
  }

  if (!user.isActive) {
    throw new AppError("Your account has been deactivated.", 403);
  }

  // Blacklist old refresh token for its remaining lifetime
  await blacklistToken(refreshToken, Math.max(remainingSeconds, 60));

  // Generate new token pair bounded by the remaining time of the 30-day limit
  const tokens = generateAuthTokens(user, initialLoginAt, remainingSeconds);

  // Refresh cached Redis session
  await cacheUserSession(user._id.toString(), {
    userId: user._id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
  });

  return { user, tokens };
};

/**
 * Get current user profile (the /me endpoint).
 */
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found.", 404);
  return user;
};

module.exports = {
  createCompanyAdmin,
  createSupportAgent,
  loginUser,
  refreshAuthTokens,
  getCurrentUser,
};