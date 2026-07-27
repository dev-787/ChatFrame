const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");
const { createRateLimiter } = require("../middleware/rateLimiter");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendCreated } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");

const { KnowledgeSource } = require("../models/KnowledgeSource");
const { KnowledgeChunk } = require("../models/KnowledgeChunk");
const { KnowledgeFlag } = require("../models/KnowledgeFlag");

const { ingestTextSource } = require("../services/kbIngestionService");
const {
  batchEmbedAndUpsertChunks,
  embedAndUpsertChunk,
  deleteChunkVector,
} = require("../services/kbEmbeddingService");

// Rate limiter for ingestion (max 10 ingestion requests per 15 mins per tenant/IP)
const kbIngestRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyPrefix: "rl:kb-ingest",
  message: "Knowledge base ingestion rate limit exceeded. Please wait a few minutes.",
});

// All routes require authentication + company_admin or super_admin role
router.use(authMiddleware, roleMiddleware("company_admin", "super_admin"));

/**
 * POST /api/knowledge-base/text
 * Ingest raw text source & auto-embed high-confidence chunks
 */
router.post(
  "/text",
  kbIngestRateLimiter,
  asyncHandler(async (req, res) => {
    const { rawText, sourceRef } = req.body;
    const tenantId = req.user.tenantId;

    if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
      throw new AppError("rawText is required and cannot be empty.", 400);
    }

    // Ingest text source
    const result = await ingestTextSource(tenantId, rawText, sourceRef);

    // Embed & upsert chunks that don't need review
    if (result.chunks && result.chunks.length > 0) {
      await batchEmbedAndUpsertChunks(result.chunks, false);
    }

    sendCreated(
      res,
      {
        source: result.source,
        chunksCreated: result.chunksCreated,
        flagsCreated: result.flagsCreated,
        chunks: result.chunks,
        flags: result.flags,
        isDuplicate: result.isDuplicate,
      },
      "Knowledge text source ingested successfully."
    );
  })
);

/**
 * GET /api/knowledge-base/sources
 * List tenant's KnowledgeSource documents with chunk and flag counts
 */
router.get(
  "/sources",
  asyncHandler(async (req, res) => {
    const tenantId = req.user.tenantId;

    const sources = await KnowledgeSource.find({ tenantId }).sort({ createdAt: -1 });

    const sourcesWithCounts = await Promise.all(
      sources.map(async (source) => {
        const chunkCount = await KnowledgeChunk.countDocuments({ tenantId, sourceId: source._id });
        const flagCount = await KnowledgeFlag.countDocuments({ tenantId, sourceId: source._id });
        const unreviewedChunkCount = await KnowledgeChunk.countDocuments({
          tenantId,
          sourceId: source._id,
          needsReview: true,
        });

        return {
          ...source.toObject(),
          chunkCount,
          flagCount,
          unreviewedChunkCount,
        };
      })
    );

    sendSuccess(res, { sources: sourcesWithCounts }, "Knowledge sources retrieved.");
  })
);

/**
 * GET /api/knowledge-base/sources/:id
 * Retrieve single source detail with its chunks and flags
 */
router.get(
  "/sources/:id",
  asyncHandler(async (req, res) => {
    const tenantId = req.user.tenantId;
    const { id } = req.params;

    const source = await KnowledgeSource.findOne({ _id: id, tenantId });
    if (!source) {
      throw new AppError("Knowledge source not found.", 404);
    }

    const chunks = await KnowledgeChunk.find({ sourceId: source._id, tenantId }).sort({ createdAt: 1 });
    const flags = await KnowledgeFlag.find({ sourceId: source._id, tenantId }).sort({ createdAt: 1 });

    sendSuccess(res, { source, chunks, flags }, "Knowledge source details retrieved.");
  })
);

/**
 * PATCH /api/knowledge-base/chunks/:id/approve
 * Admin approves a needsReview chunk and triggers vector embedding
 */
router.patch(
  "/chunks/:id/approve",
  asyncHandler(async (req, res) => {
    const tenantId = req.user.tenantId;
    const { id } = req.params;

    const chunk = await KnowledgeChunk.findOne({ _id: id, tenantId });
    if (!chunk) {
      throw new AppError("Knowledge chunk not found.", 404);
    }

    chunk.needsReview = false;
    await chunk.save();

    // Trigger embedding & upsert for approved chunk
    await embedAndUpsertChunk(chunk, true);

    sendSuccess(res, { chunk }, "Knowledge chunk approved and embedded.");
  })
);

/**
 * PATCH /api/knowledge-base/chunks/:id
 * Admin edits chunk content, title, or category
 */
router.patch(
  "/chunks/:id",
  asyncHandler(async (req, res) => {
    const tenantId = req.user.tenantId;
    const { id } = req.params;
    const { content, title, category } = req.body;

    const chunk = await KnowledgeChunk.findOne({ _id: id, tenantId });
    if (!chunk) {
      throw new AppError("Knowledge chunk not found.", 404);
    }

    if (content !== undefined) chunk.content = content;
    if (title !== undefined) chunk.title = title;
    if (category !== undefined) chunk.category = category;

    await chunk.save();

    // Re-embed if already approved
    if (!chunk.needsReview) {
      await embedAndUpsertChunk(chunk, true);
    }

    sendSuccess(res, { chunk }, "Knowledge chunk updated successfully.");
  })
);

/**
 * DELETE /api/knowledge-base/chunks/:id
 * Remove chunk from Mongo AND delete vector from Pinecone
 */
router.delete(
  "/chunks/:id",
  asyncHandler(async (req, res) => {
    const tenantId = req.user.tenantId;
    const { id } = req.params;

    const chunk = await KnowledgeChunk.findOne({ _id: id, tenantId });
    if (!chunk) {
      throw new AppError("Knowledge chunk not found.", 404);
    }

    // Delete vector from Pinecone
    if (chunk.pineconeId) {
      await deleteChunkVector(tenantId, chunk.pineconeId);
    }

    await KnowledgeChunk.deleteOne({ _id: chunk._id, tenantId });

    sendSuccess(res, { deletedId: id }, "Knowledge chunk deleted successfully.");
  })
);

/**
 * PATCH /api/knowledge-base/flags/:id/resolve
 * Mark a flag as resolved/dismissed by admin
 */
router.patch(
  "/flags/:id/resolve",
  asyncHandler(async (req, res) => {
    const tenantId = req.user.tenantId;
    const { id } = req.params;
    const { resolved = true } = req.body;

    const flag = await KnowledgeFlag.findOne({ _id: id, tenantId });
    if (!flag) {
      throw new AppError("Knowledge flag not found.", 404);
    }

    flag.resolved = Boolean(resolved);
    await flag.save();

    sendSuccess(res, { flag }, "Knowledge flag resolved status updated.");
  })
);

module.exports = router;
