const mongoose = require("mongoose");

const SOURCE_TYPES = {
  TEXT: "text",
  PDF: "pdf",
  URL: "url",
};

const SOURCE_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  READY: "ready",
  FAILED: "failed",
};

const knowledgeSourceSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: [true, "tenantId is required"],
      index: true,
    },
    sourceType: {
      type: String,
      enum: Object.values(SOURCE_TYPES),
      default: SOURCE_TYPES.TEXT,
      required: true,
    },
    sourceRef: {
      type: String,
      default: "Manual Text Input",
      trim: true,
    },
    rawText: {
      type: String,
      required: [true, "rawText is required"],
    },
    contentHash: {
      type: String,
      required: [true, "contentHash is required"],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(SOURCE_STATUS),
      default: SOURCE_STATUS.PENDING,
      required: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for tenant-scoped deduplication lookups & status queries
knowledgeSourceSchema.index({ tenantId: 1, contentHash: 1 });
knowledgeSourceSchema.index({ tenantId: 1, status: 1 });

const KnowledgeSource = mongoose.model("KnowledgeSource", knowledgeSourceSchema);

module.exports = {
  KnowledgeSource,
  SOURCE_TYPES,
  SOURCE_STATUS,
};
