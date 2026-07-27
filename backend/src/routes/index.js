const express = require("express");
const router = express.Router();

// ─── Phase 1 routes (already exist) ──────────────────────────────
const authRoutes = require("./authRoutes");
const companyOnboardingRoutes = require("./onboarding/companyRoutes");
const agentOnboardingRoutes = require("./onboarding/agentRoutes");

// ─── Phase 2 routes (new) ─────────────────────────────────────────
const dashboardRoutes = require("./dashboardRoutes");
const widgetRoutes = require("./widgetRoutes");

// ─── Services ─────────────────────────────────────────────────────
const aiService = require("../services/aiService");
const logger = require("../utils/logger");

// ─── Public Routes (no auth required) ────────────────────────────
router.use("/auth", authRoutes);
router.use("/onboard/company", companyOnboardingRoutes);
router.use("/onboard/agent", agentOnboardingRoutes);
router.use("/widget", widgetRoutes);

// Dev logger bridge — receives frontend logs and prints them to terminal
router.post("/dev/log", (req, res) => {
  const { level = "info", message, meta, source = "browser" } = req.body;
  const tag = `[${source.toUpperCase()}]`;

  if (level === "error") {
    logger.error(`${tag} ${message}`, meta || {});
  } else if (level === "warn") {
    logger.warn(`${tag} ${message}`, meta || {});
  } else {
    logger.info(`${tag} ${message}`, meta || {});
  }

  res.json({ success: true });
});

// Health check (public)
router.get("/health", (req, res) => {
  const aiStatus = {
    enabled: aiService.isAIEnabled(),
    configured: !!process.env.GEMINI_API_KEY,
    autoReplyEnabled: process.env.AI_AUTO_REPLY_ENABLED === 'true',
    confidenceThreshold: process.env.AI_CONFIDENCE_THRESHOLD || 'not set',
  };

  res.json({
    success: true,
    message: "ChatFrame API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    ai: aiStatus,
  });
});

const knowledgeBaseRoutes = require("./knowledgeBaseRoutes");

// ─── Protected Routes (auth required) ─────────────────────────────
router.use("/knowledge-base", knowledgeBaseRoutes);
router.use("/", dashboardRoutes);

module.exports = router;