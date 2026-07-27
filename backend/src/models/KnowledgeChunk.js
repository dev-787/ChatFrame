const mongoose = require("mongoose");

const CHUNK_CATEGORIES = [
  "policy",
  "product",
  "pricing",
  "process",
  "faq",
  "contact",
  "general",
];

const CONFIDENCE_LEVELS = ["high", "low"];
const CHUNK_STATUS = ["active", "stale"];

const knowledgeChunkSchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: [true, "content is required"],
    },
    category: {
      type: String,
      enum: CHUNK_CATEGORIES,
      default: "general",
    },
    title: {
      type: String,
      default: "Knowledge Chunk",
      trim: true,
    },
    confidence: {
      type: String,
      enum: CONFIDENCE_LEVELS,
      default: "high",
    },
    needsReview: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: CHUNK_STATUS,
      default: "active",
      index: true,
    },
    pineconeId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for tenant-scoped operations
knowledgeChunkSchema.index({ tenantId: 1, sourceId: 1 });
knowledgeChunkSchema.index({ tenantId: 1, needsReview: 1, status: 1 });

const KnowledgeChunk = mongoose.model("KnowledgeChunk", knowledgeChunkSchema);

module.exports = {
  KnowledgeChunk,
  CHUNK_CATEGORIES,
  CONFIDENCE_LEVELS,
  CHUNK_STATUS,
};
