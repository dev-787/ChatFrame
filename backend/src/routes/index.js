const express = require("express");
const router = express.Router();

// ─── Phase 1 routes (already exist) ──────────────────────────────
const authRoutes = require("./authRoutes");
const companyOnboardingRoutes = require("./onboarding/companyRoutes");
const agentOnboardingRoutes = require("./onboarding/agentRoutes");

// ─── Phase 2 routes (new) ─────────────────────────────────────────
const dashboardRoutes = require("./dashboardRoutes");

// ─── Mount ────────────────────────────────────────────────────────
router.use("/auth", authRoutes);
router.use("/onboard/company", companyOnboardingRoutes);
router.use("/onboard/agent", agentOnboardingRoutes);

// All Phase 2 dashboard routes under /api/*
router.use("/", dashboardRoutes);

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "ChatFrame API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;