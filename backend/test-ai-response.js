require('dotenv').config();
const mongoose = require('mongoose');
const aiService = require('./src/services/aiService');
const WidgetConfig = require('./src/models/WidgetConfig');
const Ticket = require('./src/models/Ticket');
const Message = require('./src/models/Message');

async function testAIResponse() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check AI status
    console.log('AI Status:');
    console.log('- Enabled:', aiService.isAIEnabled());
    console.log('- API Key:', process.env.GEMINI_API_KEY ? 'Set' : 'Not set');
    console.log('- Auto Reply:', process.env.AI_AUTO_REPLY_ENABLED);
    console.log('- Confidence Threshold:', process.env.AI_CONFIDENCE_THRESHOLD);
    console.log('');

    // Get widget config
    const widgetKey = 'cfwk_84e6fbc99ebd4174859a';
    const config = await WidgetConfig.findOne({ widgetKey });
    
    if (!config) {
      console.log('❌ Widget not found');
      return;
    }
    
    console.log('Widget Config:');
    console.log('- Company:', config.companyName);
    console.log('- Online:', config.isOnline);
    console.log('- Tenant ID:', config.tenantId);
    console.log('');

    // Test message
    const testMessage = 'Hello, I need help with my account';
    console.log('Testing message:', testMessage);
    console.log('');

    // Check if should auto-reply
    const shouldRespond = await aiService.shouldAutoReply(testMessage, []);
    console.log('Should auto-reply:', shouldRespond);
    
    if (!shouldRespond) {
      console.log('❌ AI decided not to respond');
      return;
    }

    // Generate AI response
    console.log('Generating AI response...');
    const aiResult = await aiService.generateResponse(
      testMessage,
      [],
      { companyName: config.companyName }
    );

    if (!aiResult) {
      console.log('❌ AI returned null');
      return;
    }

    console.log('');
    console.log('✅ AI Response:');
    console.log('- Response:', aiResult.response);
    console.log('- Confidence:', aiResult.confidence);
    console.log('- Should Auto Reply:', aiResult.shouldAutoReply);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nConnection closed');
  }
}

testAIResponse();
