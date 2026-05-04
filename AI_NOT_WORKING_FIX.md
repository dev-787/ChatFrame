# 🤖 AI Not Responding - Fix Guide

## Problem
Widget loads and messages send successfully, but AI doesn't reply. The issue is **missing environment variables on Render**.

---

## ✅ Solution: Add AI Environment Variables to Render

### Step 1: Go to Render Dashboard
1. Visit https://dashboard.render.com
2. Click on your **chatframe-y2j7** service
3. Click **Environment** in the left sidebar

### Step 2: Add These 3 Variables
Click "Add Environment Variable" and add each one:

```
GEMINI_API_KEY=AIzaSyDwk9tJO6TZLihpFSsSdR72V2gHO8uynPk
AI_AUTO_REPLY_ENABLED=true
AI_CONFIDENCE_THRESHOLD=0.7
```

### Step 3: Save and Wait for Redeploy
1. Click **Save Changes**
2. Render will automatically redeploy (takes ~2-3 minutes)
3. Wait for the deploy to complete

---

## 🧪 How to Verify It's Working

### Method 1: Check Health Endpoint
Visit: https://chatframe-y2j7.onrender.com/api/health

You should see:
```json
{
  "success": true,
  "message": "ChatFrame API is running",
  "environment": "production",
  "timestamp": "2026-05-04T06:00:00.000Z",
  "ai": {
    "enabled": true,
    "configured": true,
    "autoReplyEnabled": true,
    "confidenceThreshold": "0.7"
  }
}
```

**If `ai.enabled` is `false`**, the environment variables are missing or incorrect.

### Method 2: Check Render Logs
In Render Dashboard → Logs, look for:

**✅ Success (AI working):**
```
✅ Gemini AI initialized (gemini-1.5-flash)
```

**❌ Failure (missing API key):**
```
⚠️  AI_AUTO_REPLY_ENABLED=true but GEMINI_API_KEY is not set. AI disabled.
```

### Method 3: Test the Widget
1. Go to https://chatframe-chi.vercel.app
2. Click the chat widget
3. Send: "Hello, I need help"
4. You should get an AI response within 2-3 seconds

---

## 🔍 Understanding the Logs

When a message is sent, you'll see these logs in Render:

```
🤖 Generating AI response for ticket: 69f8357e23ec1f7ca082bfb5
🤖 Generating AI response (attempt 1) for: "Hello, I need help..."
✅ AI response generated with confidence: 0.75
```

If AI confidence is too low (<0.7), you'll see:
```
🤖 AI confidence too low, no auto-reply
```

---

## 📋 Complete Environment Variables List

For reference, here are ALL the environment variables your Render service needs:

```bash
# Node
NODE_ENV=production
PORT=5000

# Database
MONGO_URI=mongodb+srv://notexotic555_db_user:YGJzlTezYYoWFMBd@cluster0.z9tzttc.mongodb.net/chatFrame

# Redis
REDIS_HOST=redis-19039.crce217.ap-south-1-1.ec2.cloud.redislabs.com
REDIS_PORT=19039
REDIS_PASSWORD=OiNPMIFNTcfdwvY40w2nraQU3psTu9aj
REDIS_DB=0

# JWT
JWT_SECRET=b1f4897f4c1ee04d2b1d2e62785fa3dab0a5e99cc57321404b569d09afae0d8a
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=20f491de8ad5718ab9fe63a7fae145cc031c9f6f271f4c52ed8060fd7beda705
JWT_REFRESH_EXPIRES_IN=30d

# CORS & URLs
ALLOWED_ORIGINS=https://chatframe-chi.vercel.app,http://localhost:5173,http://localhost:3000
BACKEND_URL=https://chatframe-y2j7.onrender.com

# AI (⚠️ ADD THESE!)
GEMINI_API_KEY=AIzaSyDwk9tJO6TZLihpFSsSdR72V2gHO8uynPk
AI_AUTO_REPLY_ENABLED=true
AI_CONFIDENCE_THRESHOLD=0.7

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_SALT_ROUNDS=12
```

---

## ❓ FAQ

### Q: Why does the widget show "ERR_INTERNET_DISCONNECTED"?
**A:** This is a network connectivity issue on your machine, not a code bug. The widget has retry logic and will recover when your connection stabilizes. This is separate from the AI issue.

### Q: Can I test AI locally?
**A:** Yes! Your local `backend/.env` already has the AI variables. Just run:
```bash
cd backend
npm start
```
Then test at http://localhost:5173

### Q: What if AI still doesn't work after adding variables?
**A:** Check these:
1. Variables are spelled exactly as shown (case-sensitive)
2. No extra spaces in the values
3. Render has finished redeploying
4. Check Render logs for error messages

### Q: How do I know if a message got an AI response?
**A:** In the widget, AI responses appear within 2-3 seconds. In Render logs, you'll see:
```
✅ AI response generated with confidence: 0.75
```

---

## 🎯 Summary

**The Problem:** Render doesn't have AI environment variables  
**The Fix:** Add 3 variables to Render Dashboard → Environment  
**The Test:** Visit `/api/health` and check `ai.enabled: true`  
**The Result:** Widget will get AI responses within 2-3 seconds  

After adding the variables, Render will redeploy automatically and AI will start working!
