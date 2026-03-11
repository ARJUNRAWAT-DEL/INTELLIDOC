# GROQ Configuration Guide

## Current Status

✅ **Local Models Working** - Your system is successfully using local AI models for document summarization and search

⚠️ **GROQ Not Configured** - Optional GROQ AI integration is not active (GROQ_API_KEY not set)

---

## What This Means

### Local Models (Currently Active)
- ✅ Document summarization working
- ✅ Text extraction working
- ✅ Search functionality working
- ✅ No API key required
- ⚙️ Powered by BART, T5, and other open-source models

### GROQ (Optional Enhancement)
- 🔄 Would provide secondary AI analysis
- 🚀 Faster response times for complex queries
- 📊 Better for comparative analysis
- 🎯 Requires GROQ API key (free tier available)

---

## How to Enable GROQ (Optional)

### Step 1: Get a GROQ API Key
1. Visit https://console.groq.com
2. Sign up for a free account
3. Create an API key in the console
4. Copy your API key

### Step 2: Configure GROQ in Your Backend

**Option A: Using .env File** (Recommended)
```bash
# In backend/.env or backend/app/.env, add:
GROQ_API_KEY=your_api_key_here
```

**Option B: Using Environment Variable** (Windows PowerShell)
```powershell
$env:GROQ_API_KEY = "your_api_key_here"
```

**Option C: Using Environment Variable** (Windows CMD)
```cmd
set GROQ_API_KEY=your_api_key_here
```

### Step 3: Restart the Backend Server
```bash
cd backend
python start_server.py
```

---

## Troubleshooting

### Issue: "GROQ not available" or "GROQ not configured"
**Solution:** 
- Verify your API key is correctly set in .env or environment
- Check that the API key is not expired
- Restart the backend server after setting the API key
- Visit https://console.groq.com to confirm your key is valid

### Issue: "Client.__init__() got an unexpected keyword argument 'proxies'"
**Status:** ✅ **FIXED** - We've upgraded groq and httpx to compatible versions
- Already updated in your requirements.txt
- Run: `pip install --upgrade groq httpx`
- Restart backend server

### Issue: GROQ responses are slow
**Solution:**
- This is normal for API calls - GROQ is cloud-based
- Local models are used as fallback for faster responses
- The system automatically selects the best answer between local and GROQ responses

---

## Architecture

```
Your App
    │
    ├─→ Local Models (Always Available)
    │   ├─ BART (Summarization)
    │   ├─ T5 (Text Generation)  
    │   └─ MiniLM (Embeddings)
    │
    └─→ GROQ API (Optional)
        ├─ llama-3.1-70b-versatile
        ├─ llama-3.1-8b-instant
        ├─ mixtral-8x7b-32768
        └─ gemma2-9b-it
```

When you ask a question:
1. **Local models** process immediately for fast response
2. **GROQ API** processes in parallel (if enabled)
3. **System compares** both answers and selects the best one
4. **You get the best result** - speed + quality!

---

## What to Expect

### Without GROQ (Current)
- ⚡ **Speed:** Instant (< 2 seconds)
- 📊 **Quality:** Good (using open-source models)
- 💰 **Cost:** Free
- 🔌 **Requirements:** None

### With GROQ Enabled
- ⚡ **Speed:** Fast (< 5 seconds for dual answers)
- 📊 **Quality:** Excellent (using powerful large language models)
- 💰 **Cost:** Free tier available, then $0.00005 per token
- 🔌 **Requirements:** GROQ API key

---

## Environment File Examples

### Complete .env example for backend:
```
# Database
DATABASE_URL=sqlite:///./ai_docs.db
POSTGRES_URL=optional_if_using_postgres

# GROQ Configuration (OPTIONAL)
GROQ_API_KEY=gsk_your_key_here

# Optional OAuth
GOOGLE_CLIENT_ID=optional
GOOGLE_CLIENT_SECRET=optional

# SMTP for email notifications (OPTIONAL)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourdomain.com

# Frontend URL
FRONTEND_BASE_URL=http://localhost:5173
```

---

## Best Practices

1. **Keep your GROQ API key private**
   - Never commit .env files to git
   - Don't share your API key

2. **Monitor your GROQ usage**
   - Free tier includes monthly limits
   - Check https://console.groq.com for usage stats

3. **Use local models as default**
   - They're fast and free
   - GROQ provides enhancement, not replacement

4. **Test both systems**
   - Compare local vs GROQ answers
   - See the quality difference

---

## Performance Tips

### For Better Speed:
- Use local models only for initial responses
- GROQ works best for complex queries
- Enable caching for frequent queries

### For Better Quality:
- Enable GROQ for comparative analysis
- Ask follow-up questions to clarify
- Use the dual-answer system for important queries

---

## Support & Resources

- 🌐 GROQ Website: https://groq.com
- 📚 GROQ Documentation: https://console.groq.com/docs
- 💬 Get API Key: https://console.groq.com
- 🆓 Free Tier: Generous limits for testing

---

## Summary

Your system is **fully functional right now** with local models. GROQ integration is **optional** and can enhance your results when you need them. Feel free to:

1. ✅ Use the system as-is (works perfectly)
2. 🚀 Add GROQ for better results (recommended)
3. 🔄 Switch between them as needed

You're all set! Start asking questions and let the AI summarize your documents. 🎉
