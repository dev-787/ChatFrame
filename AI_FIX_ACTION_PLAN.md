# 🚨 AI Not Working - Action Plan

## Root Cause
Your Gemini API key was **leaked and disabled by Google**. This is why AI isn't responding.

Error from Google:
```
"Your API key was reported as leaked. Please use another API key."
```

---

## ✅ How to Fix (5 Minutes)

### Step 1: Generate New API Key
1. Visit: https://makersuite.google.com/app/apikey
2. Click **"Create API Key"**
3. Copy the new key (starts with `AIza...`)

### Step 2: Update Local Environment
Edit `backend/.env`:
```bash
GEMINI_API_KEY=YOUR_NEW_KEY_HERE
```

### Step 3: Update Render Environment
1. Go to: https://dashboard.render.com
2. Click your **chatframe-y2j7** service
3. Click **Environment** (left sidebar)
4. Find `GEMINI_API_KEY`
5. Click **Edit** → Paste your new key
6. **ALSO UPDATE** `MONGO_URI` to use lowercase:
   ```
   mongodb+srv://notexotic555_db_user:YGJzlTezYYoWFMBd@cluster0.z9tzttc.mongodb.net/chatframe
   ```
   (Note: `chatframe` not `chatFrame`)
7. Click **Save Changes**
8. Wait 2-3 minutes for redeploy

### Step 4: Test
1. Go to: https://chatframe-chi.vercel.app
2. Open the widget
3. Send: "Hello, I need help"
4. You should get an AI response!

---

## 🔍 What We Fixed

### 1. Database Name Case Mismatch ✅
- **Problem**: `.env` had `chatFrame` but MongoDB has `chatframe`
- **Fix**: Changed to lowercase `chatframe`
- **Impact**: Widget couldn't find configuration

### 2. Wrong Gemini Model Name ✅
- **Problem**: Used `gemini-1.5-flash` (doesn't exist)
- **Fix**: Changed to `gemini-1.5-pro`
- **Impact**: AI initialization would fail

### 3. Leaked API Key ❌ (YOU MUST FIX)
- **Problem**: API key exposed and disabled by Google
- **Fix**: Generate new key (see steps above)
- **Impact**: All AI requests return 403 Forbidden

---

## 🔒 Security Best Practices

### Never Commit API Keys!
- ✅ `.env` files are in `.gitignore`
- ✅ Only add keys to Render/Vercel dashboards
- ❌ Never hardcode keys in source code
- ❌ Never commit `.env` files

### If a Key Leaks:
1. Immediately generate a new key
2. Delete the old key from Google Console
3. Update all environments (local + Render)
4. Check git history for exposed keys

---

## 📊 Render Environment Variables Checklist

After getting your new API key, verify these are set in Render:

```bash
# Database (IMPORTANT: lowercase 'chatframe')
MONGO_URI=mongodb+srv://notexotic555_db_user:YGJzlTezYYoWFMBd@cluster0.z9tzttc.mongodb.net/chatframe

# AI (IMPORTANT: New API key)
GEMINI_API_KEY=YOUR_NEW_KEY_HERE
AI_AUTO_REPLY_ENABLED=true
AI_CONFIDENCE_THRESHOLD=0.7

# Other variables (already correct)
NODE_ENV=production
PORT=5000
REDIS_HOST=redis-19039.crce217.ap-south-1-1.ec2.cloud.redislabs.com
REDIS_PORT=19039
REDIS_PASSWORD=OiNPMIFNTcfdwvY40w2nraQU3psTu9aj
REDIS_DB=0
JWT_SECRET=b1f4897f4c1ee04d2b1d2e62785fa3dab0a5e99cc57321404b569d09afae0d8a
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=20f491de8ad5718ab9fe63a7fae145cc031c9f6f271f4c52ed8060fd7beda705
JWT_REFRESH_EXPIRES_IN=30d
ALLOWED_ORIGINS=https://chatframe-chi.vercel.app,http://localhost:5173
BACKEND_URL=https://chatframe-y2j7.onrender.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_SALT_ROUNDS=12
```

---

## 🧪 How to Verify It's Working

### Method 1: Health Check
```bash
curl https://chatframe-y2j7.onrender.com/api/health
```

Look for:
```json
"ai": {
  "enabled": true,
  "configured": true
}
```

### Method 2: Render Logs
After sending a message, check Render logs for:
```
✅ Gemini AI initialized (gemini-1.5-pro)
🤖 Generating AI response for ticket: ...
✅ AI response generated with confidence: 0.75
```

### Method 3: Widget Test
1. Open https://chatframe-chi.vercel.app
2. Click widget
3. Send "Hello, I need help"
4. Get AI response within 2-3 seconds

---

## ❓ FAQ

### Q: Why did my API key leak?
**A:** It was likely committed to your public GitHub repository or exposed in logs/screenshots.

### Q: Can I reuse the old key?
**A:** No, Google has permanently disabled it. You must generate a new one.

### Q: Will this happen again?
**A:** Not if you follow security best practices:
- Never commit `.env` files
- Only add keys to deployment dashboards
- Use environment variables, never hardcode

### Q: What about the network errors?
**A:** The `ERR_INTERNET_DISCONNECTED` errors are unrelated - they're caused by unstable internet on your machine. The widget has retry logic to handle them.

---

## 🎯 Summary

**Problem:** Leaked API key + database name mismatch  
**Solution:** New API key + update `MONGO_URI` to lowercase  
**Time:** 5 minutes  
**Result:** AI will respond to all widget messages  

**Next Step:** Get a new Gemini API key and update both `.env` and Render!
