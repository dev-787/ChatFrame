# Render Environment Variables Checklist

## ✅ Required Environment Variables for Production

Add these in your Render Dashboard → Your Service → Environment:

### Database & Cache
```
MONGO_URI=mongodb+srv://notexotic555_db_user:YGJzlTezYYoWFMBd@cluster0.z9tzttc.mongodb.net/chatFrame
REDIS_HOST=redis-19039.crce217.ap-south-1-1.ec2.cloud.redislabs.com
REDIS_PORT=19039
REDIS_PASSWORD=OiNPMIFNTcfdwvY40w2nraQU3psTu9aj
REDIS_DB=0
```

### JWT Authentication
```
JWT_SECRET=b1f4897f4c1ee04d2b1d2e62785fa3dab0a5e99cc57321404b569d09afae0d8a
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=20f491de8ad5718ab9fe63a7fae145cc031c9f6f271f4c52ed8060fd7beda705
JWT_REFRESH_EXPIRES_IN=30d
```

### CORS & URLs
```
ALLOWED_ORIGINS=https://chatframe-chi.vercel.app,http://localhost:5173,http://localhost:3000
BACKEND_URL=https://chatframe-y2j7.onrender.com
```

### AI Configuration (⚠️ MISSING - This is why AI isn't working!)
```
GEMINI_API_KEY=AIzaSyDwk9tJO6TZLihpFSsSdR72V2gHO8uynPk
AI_AUTO_REPLY_ENABLED=true
AI_CONFIDENCE_THRESHOLD=0.7
```

### Rate Limiting
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Other
```
NODE_ENV=production
PORT=5000
BCRYPT_SALT_ROUNDS=12
```

---

## 🚀 How to Add Environment Variables to Render

1. Go to https://dashboard.render.com
2. Click on your **chatframe** service
3. Click **Environment** in the left sidebar
4. Click **Add Environment Variable**
5. Add each variable one by one (or use "Add from .env" if available)
6. Click **Save Changes**
7. Render will automatically redeploy your service

---

## 🧪 How to Test AI is Working

After adding the variables and Render redeploys:

1. Open https://chatframe-chi.vercel.app
2. Click the chat widget
3. Send a message like "Hello, I need help"
4. You should get an AI response within 2-3 seconds

---

## 🔍 Debugging

Check Render logs for these messages:

**✅ Success:**
```
✅ Gemini AI initialized (gemini-1.5-flash)
🤖 Generating AI response for ticket: ...
✅ AI response generated with confidence: 0.75
```

**❌ Missing API Key:**
```
⚠️  AI_AUTO_REPLY_ENABLED=true but GEMINI_API_KEY is not set. AI disabled.
```

**❌ AI Disabled:**
```
🤖 AI auto-reply not appropriate for this conversation
```
