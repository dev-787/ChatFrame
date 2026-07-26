const jwt = require("jsonwebtoken");

/**
 * Sign an access token
 */
const signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    issuer: "chatframe",
    audience: "chatframe-client",
  });
};

/**
 * Sign a refresh token
 */
const signRefreshToken = (payload, expiresInSeconds = null) => {
  const options = {
    issuer: "chatframe",
    audience: "chatframe-client",
  };

  if (expiresInSeconds !== null && expiresInSeconds > 0) {
    options.expiresIn = expiresInSeconds;
  } else {
    options.expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "30d";
  }

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, options);
};

/**
 * Verify access token — throws on failure
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: "chatframe",
    audience: "chatframe-client",
  });
};

/**
 * Verify refresh token — throws on failure
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
    issuer: "chatframe",
    audience: "chatframe-client",
  });
};

/**
 * Build the token payload from a user document
 */
const buildTokenPayload = (user) => ({
  sub: user._id.toString(),
  email: user.email,
  role: user.role,
  tenantId: user.tenantId,
});

/**
 * Generate both tokens and return auth response shape.
 * Bounds refresh token expiration to hard 30-day max session limit.
 */
const generateAuthTokens = (user, initialLoginAt = null, remainingRefreshSeconds = null) => {
  const now = Math.floor(Date.now() / 1000);
  const loginTimestamp = initialLoginAt || now;

  const accessPayload = buildTokenPayload(user);

  const refreshPayload = {
    ...accessPayload,
    initialLoginAt: loginTimestamp,
  };

  const accessToken = signAccessToken(accessPayload);
  const refreshToken = signRefreshToken(refreshPayload, remainingRefreshSeconds);

  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    remainingRefreshSeconds,
  };
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  buildTokenPayload,
  generateAuthTokens,
};