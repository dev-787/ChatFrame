const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { searchSimilarChunks } = require('./kbEmbeddingService');
const { KnowledgeChunk } = require('../models/KnowledgeChunk');

class AIService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.isEnabled = process.env.AI_AUTO_REPLY_ENABLED === 'true';
    this.confidenceThreshold = parseFloat(process.env.AI_CONFIDENCE_THRESHOLD) || 0.65;
    this.maxRetries = 2;

    if (this.isEnabled) {
      this._initialize();
    }
  }

  _initialize() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('⚠️  AI_AUTO_REPLY_ENABLED=true but GEMINI_API_KEY is not set. AI disabled.');
      this.isEnabled = false;
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-flash-lite-latest',
        generationConfig: {
          maxOutputTokens: 350,
          temperature: 0.0,
          topP: 0.95,
          responseMimeType: 'application/json',
        },
      });
      console.log('✅ Gemini AI initialized (gemini-flash-lite-latest, temp: 0.0)');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error.message);
      this.isEnabled = false;
    }
  }

  isAIEnabled() {
    return this.isEnabled && this.model !== null;
  }

  /**
   * Retrieve relevant Knowledge Base chunks and format as grounded context.
   * Returns { kbContext, topScore, retrievalError }
   */
  async _retrieveKnowledgeContext(tenantId, customerMessage) {
    if (!tenantId || !customerMessage) return { kbContext: '', topScore: 0, retrievalError: null };

    try {
      const matches = await searchSimilarChunks(tenantId, customerMessage, 5);
      if (!matches || matches.length === 0) return { kbContext: '', topScore: 0, retrievalError: null };

      // Ensure matches are sorted by score descending
      matches.sort((a, b) => (b.score || 0) - (a.score || 0));

      // Exclude chunks with needsReview === true
      const validMatches = matches.filter((m) => !m.metadata || !m.metadata.needsReview);
      if (validMatches.length === 0) return { kbContext: '', topScore: 0, retrievalError: null };

      const topScore = validMatches[0]?.score || 0;
      let knowledgeLines = [];

      const matchesWithText = validMatches.filter((m) => m.metadata && (m.metadata.text || m.metadata.content));
      if (matchesWithText.length > 0) {
        knowledgeLines = matchesWithText.map(
          (m) => `[${(m.metadata.category || 'GENERAL').toUpperCase()}] ${m.metadata.title || 'Knowledge'}: ${m.metadata.text || m.metadata.content}`
        );
      } else {
        const chunkIds = validMatches.map((m) => m.id);
        const validObjectIds = chunkIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

        if (validObjectIds.length > 0) {
          const chunks = await KnowledgeChunk.find({
            _id: { $in: validObjectIds },
            tenantId,
            needsReview: false,
            status: 'active',
          }).lean();

          knowledgeLines = chunks.map(
            (c) => `[${(c.category || 'GENERAL').toUpperCase()}] ${c.title}: ${c.content}`
          );
        }
      }

      if (knowledgeLines.length === 0) return { kbContext: '', topScore, retrievalError: null };

      const kbContext = `Here is verified company knowledge relevant to this question. Use it to answer accurately. If the knowledge doesn't cover the question, say so honestly instead of guessing.

--- KNOWLEDGE ---
${knowledgeLines.join('\n\n')}
--- END KNOWLEDGE ---`;

      return { kbContext, topScore, retrievalError: null };
    } catch (err) {
      console.error('💥 CRITICAL: Knowledge Base retrieval system exception!');
      console.error(err.stack || err);
      return { kbContext: '', topScore: 0, retrievalError: err.message || String(err) };
    }
  }

  /**
   * Generate an AI response for a customer message.
   * Returns null if AI is disabled or an error occurs — caller should assign a human agent.
   */
  async generateResponse(customerMessage, conversationHistory = [], companyContext = {}) {
    if (!this.isAIEnabled()) return null;

    console.log(`🔍 [TRACE-2026-07-28-MARKER-1035] generateResponse called for tenantId: '${companyContext.tenantId}' with message: "${customerMessage}"`);

    const tenantId = companyContext.tenantId;
    const { kbContext, topScore, retrievalError } = tenantId
      ? await this._retrieveKnowledgeContext(tenantId, customerMessage)
      : { kbContext: '', topScore: 0, retrievalError: null };

    const systemPrompt = this._buildSystemPrompt(companyContext);
    const conversationContext = this._buildConversationContext(conversationHistory);

    const promptParts = [systemPrompt];
    if (kbContext) promptParts.push(kbContext);
    promptParts.push(conversationContext);
    promptParts.push(`Customer Question: ${customerMessage}`);
    promptParts.push(`Generate your response as JSON output:`);

    const fullPrompt = promptParts.join('\n\n');

    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🤖 Generating AI response (attempt ${attempt}) for: "${customerMessage.substring(0, 60)}..."`);

        const result = await this.model.generateContent(fullPrompt);
        const response = await result.response;
        const responseText = response.text().trim();

        console.log('📝 Raw Gemini response:', JSON.stringify({
          text: responseText,
          finishReason: result.response.candidates?.[0]?.finishReason,
          topScore,
        }));

        let parsedResponse = { response: responseText, grounded: true, modelConfidence: 0.9 };
        try {
          const cleanedJson = responseText
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();
          parsedResponse = JSON.parse(cleanedJson);
        } catch (jsonErr) {
          // Fallback if response is raw text
          parsedResponse = { response: responseText, grounded: true, modelConfidence: 0.85 };
        }

        const aiReply = parsedResponse.response || responseText;
        if (!aiReply) {
          console.warn('⚠️ Gemini returned empty response text.');
          return null;
        }

        const confidence = this._calculateConfidence({
          customerMessage,
          aiReply,
          topScore,
          modelConfidence: parsedResponse.confidence || parsedResponse.modelConfidence,
          grounded: parsedResponse.grounded,
        });

        const activeThreshold = companyContext.confidenceThreshold !== undefined
          ? companyContext.confidenceThreshold
          : this.confidenceThreshold;

        return {
          response: aiReply,
          confidence,
          shouldAutoReply: confidence >= activeThreshold && !retrievalError,
          retrievalError,
        };
      } catch (error) {
        lastError = error;
        const isRetryable = this._isRetryableError(error);
        console.error(`❌ AI attempt ${attempt} failed: ${error.message}`);

        if (!isRetryable || attempt === this.maxRetries) break;

        await this._sleep(300 * attempt);
      }
    }

    console.error('❌ AI response generation failed after retries:', lastError?.message);
    return null;
  }

  /**
   * Decide whether to attempt an auto-reply for this message.
   */
  async shouldAutoReply(customerMessage, conversationHistory = []) {
    if (!this.isAIEnabled()) return false;
    if (conversationHistory.some(msg => msg.senderType === 'agent')) return false;
    if (!customerMessage || customerMessage.trim().length < 3) return false;
    return true;
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  _buildSystemPrompt(companyContext = {}) {
    const companyName = companyContext.companyName || 'ChatFrame';
    const basePrompt = companyContext.systemPrompt
      ? companyContext.systemPrompt
      : `You are a professional customer support assistant for ${companyName}.`;

    const toneString = companyContext.responseTone
      ? ` Your response tone should be: ${companyContext.responseTone}.`
      : '';

    return `${basePrompt}${toneString}

RESPONSE INSTRUCTIONS:
You MUST respond with valid JSON in this exact shape:
{
  "response": "Your complete, customer-facing support answer here.",
  "grounded": true or false,
  "confidence": 0.0 to 1.0
}

GROUNDING RULES:
1. If the provided knowledge base context contains sufficient information to answer the customer's question, answer accurately and set "grounded": true with "confidence": 1.0.
2. If the provided knowledge base context does NOT contain information to answer the question, state politely that the knowledge base does not contain that information and offer to connect them with a support representative. In this case, set "grounded": false and "confidence": 0.20.
3. Do NOT invent order details, pricing, or company policies not present in the provided knowledge base.`;
  }

  _buildConversationContext(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return 'This is the start of a new conversation.';
    }

    const lines = conversationHistory
      .slice(-6)
      .map(msg => {
        const role =
          msg.senderType === 'customer' ? 'Customer' :
          msg.senderType === 'ai'       ? 'Assistant' : 'Agent';
        return `${role}: ${msg.content}`;
      });

    return `Previous conversation:\n${lines.join('\n')}`;
  }

  /**
   * Redesigned Grounding-Based Confidence Calculation
   * Evaluates vector retrieval relevance (topScore) + model self-reported grounding.
   */
  _calculateConfidence({ customerMessage, aiReply, topScore = 0, modelConfidence = 0.85, grounded = true }) {
    // 1. Vector Retrieval Relevance Signal (Normalized against empirical ~0.45 score threshold)
    const normalizedRetrievalScore = Math.min(1.0, topScore / 0.45);

    // 2. Model Self-Reported Grounding Signal
    const isHonestDecline = !grounded || /does not contain|don't have information|not in our knowledge/i.test(aiReply);
    const effectiveModelConfidence = isHonestDecline ? 0.20 : (modelConfidence || 0.85);

    // 3. Composite Weighted Base Score (50% Retrieval Score + 50% Model Grounding)
    let confidence = (0.50 * normalizedRetrievalScore) + (0.50 * effectiveModelConfidence);

    // 4. Quality Deductions
    const uncertainPhrases = ['not sure', 'might be', 'possibly', 'maybe', 'i think'];
    if (uncertainPhrases.some(p => aiReply.toLowerCase().includes(p))) {
      confidence -= 0.10;
    }

    // 5. Honest Decline Cap (Ensures unsupported queries cap at 0.35 to trigger human escalation)
    if (isHonestDecline) {
      confidence = Math.min(0.35, confidence);
    }

    return Math.round(Math.max(0.05, Math.min(0.98, confidence)) * 100) / 100;
  }

  /**
   * Generate a summary of the conversation context.
   */
  async generateSummary(conversationHistory = []) {
    if (!this.isAIEnabled()) return null;

    const lines = conversationHistory
      .slice(-10)
      .map(msg => {
        const role =
          msg.senderType === 'customer' ? 'Customer' :
          msg.senderType === 'ai'       ? 'AI Assistant' : 'Agent';
        return `${role}: ${msg.content}`;
      });

    const conversationContext = lines.join('\n');
    const prompt = `Please review the following customer support chat history and provide a concise, one-sentence or two-sentence summary of the customer's issue and current status. Be helpful, professional, and do not include conversational fluff.

${conversationContext}

Summary:`;

    try {
      console.log('🤖 Generating chat summary...');
      const summaryModel = this.genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });
      const result = await summaryModel.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('❌ Failed to generate chat summary:', error.message);
      return null;
    }
  }

  _isRetryableError(error) {
    const retryableCodes = [429, 500, 502, 503, 504];
    return retryableCodes.includes(error?.status) ||
      /rate limit|quota|timeout|network/i.test(error?.message || '');
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton
const aiService = new AIService();
module.exports = aiService;
