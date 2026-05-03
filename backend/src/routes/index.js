const express = require("express");
const router = express.Router();

// ─── Sub-routers ─────────────────────────────────────────────────
const authRoutes = require("./authRoutes");
const companyOnboardingRoutes = require("./onboarding/companyRoutes");
const agentOnboardingRoutes = require("./onboarding/agentRoutes");

// ─── Mount ───────────────────────────────────────────────────────

// Auth: /api/auth/*
router.use("/auth", authRoutes);

// Company onboarding: /api/onboard/company/*
router.use("/onboard/company", companyOnboardingRoutes);

// Agent onboarding: /api/onboard/agent/*
router.use("/onboard/agent", agentOnboardingRoutes);

// Health check — no auth required
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "ChatFrame API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;