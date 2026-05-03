const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.isEnabled = process.env.AI_AUTO_REPLY_ENABLED === 'true';
    this.confidenceThreshold = parseFloat(process.env.AI_CONFIDENCE_THRESHOLD) || 0.7;
    this.demoMode = process.env.AI_DEMO_MODE === 'true';
    
    if (this.isEnabled && process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('Demo')) {
      this.initializeAI();
    } else if (this.isEnabled) {
      console.log('🤖 AI Service running in demo mode (no real API key provided)');
      this.demoMode = true;
    }
  }

  initializeAI() {
    try {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      console.log('✅ Gemini AI initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error);
      this.isEnabled = false;
    }
  }

  isAIEnabled() {
    return this.isEnabled && (this.model || this.demoMode);
  }

  async generateResponse(customerMessage, conversationHistory = [], companyContext = {}) {
    if (!this.isAIEnabled()) {
      return null;
    }

    try {
      // Demo mode - return predefined responses
      if (this.demoMode) {
        return this.generateDemoResponse(customerMessage, conversationHistory, companyContext);
      }

      // Build context for the AI
      const systemPrompt = this.buildSystemPrompt(companyContext);
      const conversationContext = this.buildConversationContext(conversationHistory);
      const fullPrompt = `${systemPrompt}\n\n${conversationContext}\n\nCustomer: ${customerMessage}\n\nAssistant:`;

      console.log('🤖 Generating AI response for:', customerMessage.substring(0, 50) + '...');

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const aiReply = response.text();

      // Calculate confidence score (simplified)
      const confidence = this.calculateConfidence(customerMessage, aiReply);

      return {
        response: aiReply.trim(),
        confidence: confidence,
        shouldAutoReply: confidence >= this.confidenceThreshold
      };
    } catch (error) {
      console.error('❌ AI response generation failed:', error);
      return null;
    }
  }

  generateDemoResponse(customerMessage, conversationHistory = [], companyContext = {}) {
    console.log('🤖 Generating demo AI response for:', customerMessage.substring(0, 50) + '...');
    
    const companyName = companyContext.companyName || 'ChatFrame';
    const lowerMessage = customerMessage.toLowerCase();
    
    // Predefined responses based on common patterns
    let response = '';
    let confidence = 0.8;
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response = `Hello! Welcome to ${companyName} support. I'm here to help you with any questions or issues you might have. How can I assist you today?`;
      confidence = 0.9;
    } else if (lowerMessage.includes('order') || lowerMessage.includes('track') || lowerMessage.includes('delivery') || lowerMessage.includes('shipping') || lowerMessage.includes('where is my')) {
      response = `I'd be happy to help you track your order! Could you please share your order number or the email address used when placing the order? That will help me look it up for you right away.`;
      confidence = 0.88;
    } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      response = `You're very welcome! I'm glad I could help. Is there anything else you need assistance with today?`;
      confidence = 0.95;
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      response = `I'd be happy to help you! Could you please provide more details about what you need assistance with? This will help me give you the most accurate information.`;
      confidence = 0.85;
    } else if (lowerMessage.includes('account') || lowerMessage.includes('login') || lowerMessage.includes('password') || lowerMessage.includes('sign in')) {
      response = `I can help you with account-related issues. For security reasons, I'll need to verify some information. Could you please provide your registered email address?`;
      confidence = 0.85;
    } else if (lowerMessage.includes('billing') || lowerMessage.includes('payment') || lowerMessage.includes('charge') || lowerMessage.includes('invoice') || lowerMessage.includes('refund')) {
      response = `I understand you have a billing question. I can help with general billing information — for specific account charges, I may need to connect you with our billing team. What's your question?`;
      confidence = 0.82;
    } else if (lowerMessage.includes('cancel') || lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      response = `I can help you with cancellations and returns. Could you please provide your order number so I can look into this for you?`;
      confidence = 0.85;
    } else if (lowerMessage.includes('bug') || lowerMessage.includes('error') || lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('not working')) {
      response = `I'm sorry to hear you're experiencing an issue. To help resolve this quickly, could you describe what happened and any error messages you saw? Screenshots are also helpful if you have them.`;
      confidence = 0.82;
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('plan') || lowerMessage.includes('subscription')) {
      response = `I'd be happy to share pricing information! We have several plans to fit different needs. Could you tell me a bit more about what you're looking for so I can point you to the best option?`;
      confidence = 0.82;
    } else {
      // Generic fallback — still respond, just with lower confidence
      response = `Thanks for reaching out to ${companyName} support! I want to make sure I help you correctly. Could you provide a bit more detail about what you need? I'm here to help.`;
      confidence = 0.72; // Above threshold so it still auto-replies
    }
    
    return {
      response: response,
      confidence: confidence,
      shouldAutoReply: confidence >= this.confidenceThreshold
    };
  }

  buildSystemPrompt(companyContext = {}) {
    const companyName = companyContext.companyName || 'ChatFrame';
    
    return `You are a helpful customer support assistant for ${companyName}. 

Your role:
- Provide friendly, professional, and helpful responses
- Be concise but thorough in your answers
- If you don't know something specific about the company, acknowledge it and offer to connect them with a human agent
- Always maintain a positive and solution-oriented tone
- For complex technical issues, suggest escalating to a human agent

Guidelines:
- Keep responses under 150 words when possible
- Use a conversational but professional tone
- If the customer seems frustrated, acknowledge their feelings
- Always end with asking if there's anything else you can help with

Company Context:
- Company: ${companyName}
- Industry: Customer Support Software
- Main Product: AI-powered customer support platform`;
  }

  buildConversationContext(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return 'This is the start of a new conversation.';
    }

    const context = conversationHistory
      .slice(-5) // Only use last 5 messages for context
      .map(msg => {
        const sender = msg.senderType === 'customer' ? 'Customer' : 
                     msg.senderType === 'ai' ? 'Assistant' : 'Agent';
        return `${sender}: ${msg.content}`;
      })
      .join('\n');

    return `Previous conversation:\n${context}`;
  }

  calculateConfidence(customerMessage, aiResponse) {
    // Simple confidence calculation based on message characteristics
    let confidence = 0.5; // Base confidence

    // Increase confidence for common support queries
    const commonPatterns = [
      /how.*work/i,
      /what.*is/i,
      /can.*help/i,
      /problem.*with/i,
      /need.*help/i,
      /thank.*you/i,
      /hello|hi|hey/i
    ];

    const hasCommonPattern = commonPatterns.some(pattern => pattern.test(customerMessage));
    if (hasCommonPattern) confidence += 0.2;

    // Increase confidence if response is not too long (indicates clarity)
    if (aiResponse.length < 200) confidence += 0.1;

    // Increase confidence if response doesn't contain uncertainty phrases
    const uncertaintyPhrases = ['not sure', 'might be', 'possibly', 'maybe'];
    const hasUncertainty = uncertaintyPhrases.some(phrase => 
      aiResponse.toLowerCase().includes(phrase)
    );
    if (!hasUncertainty) confidence += 0.1;

    // Decrease confidence for very short customer messages (might be unclear)
    if (customerMessage.length < 10) confidence -= 0.2;

    return Math.max(0.1, Math.min(0.95, confidence));
  }

  async shouldAutoReply(customerMessage, conversationHistory = []) {
    if (!this.isAIEnabled()) {
      return false;
    }

    // Don't auto-reply if a human agent has already responded in this conversation
    const hasHumanResponse = conversationHistory.some(msg => msg.senderType === 'agent');
    if (hasHumanResponse) {
      return false;
    }

    // Don't auto-reply to very short or unclear messages
    if (customerMessage.length < 5) {
      return false;
    }

    return true;
  }
}

// Create singleton instance
const aiService = new AIService();

module.exports = aiService;