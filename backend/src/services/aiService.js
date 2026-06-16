const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.isEnabled = process.env.AI_AUTO_REPLY_ENABLED === 'true';
    this.confidenceThreshold = parseFloat(process.env.AI_CONFIDENCE_THRESHOLD) || 0.7;
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
          maxOutputTokens: 1000,
          temperature: 0.7,
          topP: 0.95,
        },
      });
      console.log('✅ Gemini AI initialized (gemini-flash-lite-latest)');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error.message);
      this.isEnabled = false;
    }
  }

  isAIEnabled() {
    return this.isEnabled && this.model !== null;
  }

  /**
   * Generate an AI response for a customer message.
   * Returns null if AI is disabled or an error occurs — caller should assign a human agent.
   */
  async generateResponse(customerMessage, conversationHistory = [], companyContext = {}) {
    if (!this.isAIEnabled()) return null;

    const systemPrompt = this._buildSystemPrompt(companyContext);
    const conversationContext = this._buildConversationContext(conversationHistory);
    const fullPrompt = `${systemPrompt}\n\n${conversationContext}\n\nCustomer: ${customerMessage}\n\nAssistant:`;

    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🤖 Generating AI response (attempt ${attempt}) for: "${customerMessage.substring(0, 60)}..."`);

        const result = await this.model.generateContent(fullPrompt);
        const response = await result.response;
        
        // Log the full response for debugging
        console.log('📝 Raw Gemini response:', JSON.stringify({
          text: response.text(),
          candidates: result.response.candidates?.length,
          finishReason: result.response.candidates?.[0]?.finishReason
        }));
        
        const aiReply = response.text().trim();

        if (!aiReply) {
          console.warn('⚠️  Gemini returned an empty response.');
          return null;
        }

        const confidence = this._calculateConfidence(customerMessage, aiReply);

        return {
          response: aiReply,
          confidence,
          shouldAutoReply: confidence >= this.confidenceThreshold,
        };
      } catch (error) {
        lastError = error;
        const isRetryable = this._isRetryableError(error);
        console.error(`❌ AI attempt ${attempt} failed: ${error.message}`);

        if (!isRetryable || attempt === this.maxRetries) break;

        // Exponential backoff before retry
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

    // Don't auto-reply once a human agent has joined
    if (conversationHistory.some(msg => msg.senderType === 'agent')) return false;

    // Skip very short / unclear messages
    if (!customerMessage || customerMessage.trim().length < 5) return false;

    return true;
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  _buildSystemPrompt(companyContext = {}) {
    if (companyContext.systemPrompt) {
      const toneString = companyContext.responseTone
        ? `\nYour response tone should be: ${companyContext.responseTone}.`
        : '';
      return `${companyContext.systemPrompt}${toneString}`;
    }

    const companyName = companyContext.companyName || 'our company';
    const industry = companyContext.industry || '';
    const extraContext = companyContext.additionalContext
      ? `\nAdditional context: ${companyContext.additionalContext}`
      : '';

    return `You are a professional customer support assistant for ${companyName}${industry ? ` (${industry})` : ''}.

Rules:
- Be concise, friendly, and solution-oriented.
- Keep replies under 120 words.
- Never fabricate order details, account data, or policies you don't know.
- If the issue is complex or requires account access, politely say you'll escalate to a human agent.
- Do not mention that you are an AI unless directly asked.${extraContext}`;
  }

  _buildConversationContext(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return 'This is the start of a new conversation.';
    }

    const lines = conversationHistory
      .slice(-6) // last 6 messages for context window efficiency
      .map(msg => {
        const role =
          msg.senderType === 'customer' ? 'Customer' :
          msg.senderType === 'ai'       ? 'Assistant' : 'Agent';
        return `${role}: ${msg.content}`;
      });

    return `Previous conversation:\n${lines.join('\n')}`;
  }

  _calculateConfidence(customerMessage, aiResponse) {
    let confidence = 0.55;

    const commonPatterns = [
      /how.*work/i, /what.*is/i, /can.*help/i,
      /problem.*with/i, /need.*help/i, /thank/i, /hello|hi|hey/i,
    ];
    if (commonPatterns.some(p => p.test(customerMessage))) confidence += 0.2;

    // Shorter, focused responses tend to be more reliable
    if (aiResponse.length < 250) confidence += 0.1;

    // Penalise uncertainty language
    const uncertainPhrases = ['not sure', 'might be', 'possibly', 'maybe', 'i think'];
    if (uncertainPhrases.some(p => aiResponse.toLowerCase().includes(p))) confidence -= 0.1;

    // Penalise very short customer messages (likely ambiguous)
    if (customerMessage.trim().length < 10) confidence -= 0.2;

    return Math.max(0.1, Math.min(0.95, confidence));
  }

  /**
   * Generate a summary of the conversation context.
   */
  async generateSummary(conversationHistory = []) {
    if (!this.isAIEnabled()) return null;

    const lines = conversationHistory
      .slice(-10) // Limit to last 10 messages for summary context
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
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('❌ Failed to generate chat summary:', error.message);
      return null;
    }
  }

  _isRetryableError(error) {
    // Retry on rate limits and transient server errors
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
