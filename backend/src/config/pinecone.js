const { Pinecone } = require("@pinecone-database/pinecone");
const logger = require("../utils/logger");

let pineconeClient = null;

/**
 * Get or initialize Pinecone client singleton
 */
const getPinecone = () => {
  if (!process.env.PINECONE_API_KEY) {
    logger.warn("⚠️ PINECONE_API_KEY is not set in environment.");
    return null;
  }

  if (!pineconeClient) {
    try {
      pineconeClient = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      });
    } catch (err) {
      logger.error("❌ Failed to initialize Pinecone client:", { message: err.message });
      return null;
    }
  }

  return pineconeClient;
};

/**
 * Get Pinecone Index instance
 */
const getPineconeIndex = () => {
  const pc = getPinecone();
  if (!pc) return null;

  const indexName = process.env.PINECONE_INDEX_NAME || "chatframe";
  return pc.index(indexName);
};

module.exports = {
  getPinecone,
  getPineconeIndex,
};
