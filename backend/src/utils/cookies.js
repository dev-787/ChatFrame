/**
 * Cookie Utilities for ChatFrame
 * Manages cookie parsing, setting, and clearing for HttpOnly JWT storage
 */

/**
 * Parse a raw cookie header string into an object of key-value pairs
 * @param {string} cookieString - The raw Cookie header from request
 * @returns {Object} Parse cookie object
 */
const parseCookies = (cookieString) => {
  if (!cookieString) return {};
  const cookies = {};
  cookieString.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    if (parts.length >= 2) {
      cookies[parts[0].trim()] = parts.slice(1).join("=").trim();
    }
  });
  return cookies;
};

/**
 * Set HTTP-only, secure cookies for Access and Refresh tokens
 * @param {import("express").Response} res - Express response object
 * @param {Object} tokens - Object containing accessToken and refreshToken
 */
const setAuthCookies = (res, tokens) => {
  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction || process.env.SECURE_COOKIES === "true",
    sameSite: process.env.COOKIE_SAME_SITE || (isProduction ? "none" : "lax"),
    maxAge: 60 * 60 * 1000, // 1 hour for Access Token
  };

  // Set standard token cookie (Access Token)
  res.cookie("token", tokens.accessToken, cookieOptions);

  // Set Refresh Token cookie with remaining lifetime (up to 30 days max from initial login)
  const refreshMaxAge = tokens.remainingRefreshSeconds
    ? tokens.remainingRefreshSeconds * 1000
    : 30 * 24 * 60 * 60 * 1000;

  res.cookie("refreshToken", tokens.refreshToken, {
    ...cookieOptions,
    maxAge: refreshMaxAge,
  });
};

/**
 * Clear the authentication cookies from client
 * @param {import("express").Response} res - Express response object
 */
const clearAuthCookies = (res) => {
  const isProduction = process.env.NODE_ENV === "production";

  const clearOptions = {
    httpOnly: true,
    secure: isProduction || process.env.SECURE_COOKIES === "true",
    sameSite: process.env.COOKIE_SAME_SITE || (isProduction ? "none" : "lax"),
  };

  res.clearCookie("token", clearOptions);
  res.clearCookie("refreshToken", clearOptions);
};

module.exports = {
  parseCookies,
  setAuthCookies,
  clearAuthCookies,
};
