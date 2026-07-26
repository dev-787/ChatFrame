const express = require("express");
const router = express.Router();

const { login, refresh, getMe, logout } = require("../controllers/authController");
const { loginRules } = require("../validators/onboardingValidators");
const validate = require("../middleware/validate");
const authMiddleware = require("../middleware/authMiddleware");
const { authRateLimiter } = require("../middleware/rateLimiter");

// POST /api/auth/login
router.post("/login", authRateLimiter, loginRules, validate, login);

// POST /api/auth/refresh
router.post("/refresh", refresh);

// GET /api/auth/me — protected
router.get("/me", authMiddleware, getMe);

// POST /api/auth/logout — protected
router.post("/logout", authMiddleware, logout);

module.exports = router;