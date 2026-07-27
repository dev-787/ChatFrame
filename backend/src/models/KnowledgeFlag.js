const mongoose = require("mongoose");

const FLAG_TYPES = [
  "prompt_injection",
  "unverifiable_claim",
  "pii",
  "off_topic",
];

const knowledgeFlagSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: [true, "tenantId is required"],
      index: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KnowledgeSource",
      required: [true, "sourceId is required"],
      index: true,
    },
    type: {
      type: String,
      enum: FLAG_TYPES,
      required: [true, "flag type is required"],
    },
    excerpt: {
      type: String,
      required: [true, "excerpt is required"],
    },
    reason: {
      type: String,
      required: [true, "reason is required"],
    },
    resolved: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for tenant-scoped query performance
knowledgeFlagSchema.index({ tenantId: 1, sourceId: 1 });
knowledgeFlagSchema.index({ tenantId: 1, resolved: 1 });

const KnowledgeFlag = mongoose.model("KnowledgeFlag", knowledgeFlagSchema);

module.exports = {
  KnowledgeFlag,
  FLAG_TYPES,
};
