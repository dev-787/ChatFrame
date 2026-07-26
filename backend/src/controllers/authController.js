const { loginUser, getCurrentUser, refreshAuthTokens } = require("../services/authService");
const { blacklistToken, invalidateUserSession } = require("../services/redisService");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { setAuthCookies, clearAuthCookies, parseCookies } = require("../utils/cookies");
const AppError = require("../utils/AppError");

/**
 * POST /api/auth/login
 * Authenticate any user type (admin, agent, super_admin) by email + password.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, tokens } = await loginUser({ email, password });

  // Set HTTP-only secure cookies — tokens are NEVER sent in the response body
  // to prevent XSS attacks from reading tokens via JS.
  setAuthCookies(res, tokens);

  sendSuccess(
    res,
    {
      user: user.toAuthJSON(),
    },
    "Login successful."
  );
});

/**
 * POST /api/auth/refresh
 * Refresh access & refresh tokens using the HTTP-only refreshToken cookie.
 */
const refresh = asyncHandler(async (req, res) => {
  let refreshToken;
  if (req.headers.cookie) {
    const cookies = parseCookies(req.headers.cookie);
    refreshToken = cookies.refreshToken;
  }

  if (!refreshToken) {
    throw new AppError("Refresh token is missing.", 401);
  }

  const { user, tokens } = await refreshAuthTokens(refreshToken);

  // Set new HTTP-only secure cookies (rotates both access and refresh tokens)
  setAuthCookies(res, tokens);

  sendSuccess(
    res,
    {
      user: user.toAuthJSON(),
    },
    "Token refreshed successfully."
  );
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 * Requires: authMiddleware
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user._id);

  sendSuccess(res, { user: user.toAuthJSON() }, "User profile retrieved.");
});

/**
 * POST /api/auth/logout
 * Blacklists the current access token and clears Redis session.
 * Requires: authMiddleware
 */
const logout = asyncHandler(async (req, res) => {
  // Token is read exclusively from the HttpOnly cookie (authMiddleware already validated it)
  let token;
  if (req.headers.cookie) {
    const cookies = parseCookies(req.headers.cookie);
    token = cookies.token;
  }

  if (token) {
    // Blacklist for 7 days (matches JWT_EXPIRES_IN)
    await blacklistToken(token, 60 * 60 * 24 * 7);
  }

  // Clear HTTP-only cookies on the client side
  clearAuthCookies(res);

  // Invalidate Redis session
  await invalidateUserSession(req.user._id.toString());

  sendSuccess(res, {}, "Logged out successfully.");
});

module.exports = { login, refresh, getMe, logout };