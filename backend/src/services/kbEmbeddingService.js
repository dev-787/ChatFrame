const { getPineconeIndex } = require("../config/pinecone");
const logger = require("../utils/logger");

/**
 * Embed a single chunk using Pinecone integrated inference (llama-text-embed-v2)
 */
const embedAndUpsertChunk = async (chunkDoc, forceApproved = false) => {
  if (!chunkDoc) return null;

  if (chunkDoc.needsReview && !forceApproved) {
    logger.info(`Skipping embedding for chunk ${chunkDoc._id}: needsReview is true.`);
    return null;
  }

  try {
    const chunkIdStr = chunkDoc._id.toString();

    const record = {
      _id: chunkIdStr,
      text: chunkDoc.content,
      tenantId: chunkDoc.tenantId,
      sourceId: chunkDoc.sourceId.toString(),
      category: chunkDoc.category || "general",
      title: chunkDoc.title || "Knowledge Chunk",
      confidence: chunkDoc.confidence || "high",
      needsReview: Boolean(chunkDoc.needsReview),
      contentPreview: chunkDoc.content.slice(0, 200),
    };

    const index = getPineconeIndex();
    if (index) {
      await index.namespace(chunkDoc.tenantId).upsertRecords({ records: [record] });
      logger.info(`✅ Successfully upserted record ${chunkIdStr} to Pinecone namespace '${chunkDoc.tenantId}' via llama-text-embed-v2`);
    } else {
      logger.warn(`⚠️ Pinecone not configured. Saved record ${chunkIdStr} locally without Pinecone sync.`);
    }

    // Save pineconeId on MongoDB chunk doc
    chunkDoc.pineconeId = chunkIdStr;
    await chunkDoc.save();

    return chunkIdStr;
  } catch (err) {
    logger.error(`❌ Failed to upsert record ${chunkDoc._id}:`, { message: err.message });
    throw err;
  }
};

/**
 * Batch embed and upsert multiple chunks using Pinecone integrated inference
 */
const batchEmbedAndUpsertChunks = async (chunkDocs = [], forceApproved = false) => {
  const eligibleChunks = chunkDocs.filter((c) => !c.needsReview || forceApproved);
  if (eligibleChunks.length === 0) {
    logger.info("No eligible chunks for embedding in batch.");
    return [];
  }

  const recordsToUpsert = eligibleChunks.map((chunk) => ({
    _id: chunk._id.toString(),
    text: chunk.content,
    tenantId: chunk.tenantId,
    sourceId: chunk.sourceId.toString(),
    category: chunk.category || "general",
    title: chunk.title || "Knowledge Chunk",
    confidence: chunk.confidence || "high",
    needsReview: Boolean(chunk.needsReview),
    contentPreview: chunk.content.slice(0, 200),
  }));

  const tenantId = eligibleChunks[0].tenantId;
  const index = getPineconeIndex();

  if (index && recordsToUpsert.length > 0) {
    try {
      await index.namespace(tenantId).upsertRecords({ records: recordsToUpsert });
      logger.info(`✅ Batch upserted ${recordsToUpsert.length} records to Pinecone namespace '${tenantId}' via llama-text-embed-v2`);

      // Update pineconeId on processed chunk docs
      for (const chunk of eligibleChunks) {
        chunk.pineconeId = chunk._id.toString();
        await chunk.save();
      }
    } catch (pErr) {
      logger.error(`❌ Pinecone batch upsertRecords failed for tenant '${tenantId}':`, { message: pErr.message });
      throw pErr;
    }
  }

  return eligibleChunks.map((c) => c._id.toString());
};

/**
 * Delete a chunk vector/record from Pinecone namespace
 */
const deleteChunkVector = async (tenantId, pineconeId) => {
  if (!pineconeId || !tenantId) return false;

  const index = getPineconeIndex();
  if (!index) return false;

  try {
    await index.namespace(tenantId).deleteOne({ id: pineconeId });
    logger.info(`🗑️ Deleted Pinecone record ${pineconeId} from namespace '${tenantId}'`);
    return true;
  } catch (err) {
    logger.error(`❌ Failed to delete record ${pineconeId} from Pinecone:`, { message: err.message });
    return false;
  }
};

/**
 * Search Pinecone for top-K matching chunk IDs using integrated searchRecords
 */
const searchSimilarChunks = async (tenantId, queryText, topK = 5) => {
  const index = getPineconeIndex();
  if (!index) return [];

  try {
    const searchResponse = await index.namespace(tenantId).searchRecords({
      query: {
        inputs: {
          text: queryText,
        },
        topK,
      },
    });

    if (!searchResponse || !searchResponse.result || !searchResponse.result.hits) {
      return [];
    }

    return searchResponse.result.hits.map((hit) => ({
      id: hit._id,
      score: hit._score,
      metadata: hit.fields || {},
    }));
  } catch (err) {
    logger.error(`❌ Error in searchRecords for tenant '${tenantId}':`, { message: err.message });
    return [];
  }
};

module.exports = {
  embedAndUpsertChunk,
  batchEmbedAndUpsertChunks,
  deleteChunkVector,
  searchSimilarChunks,
};
