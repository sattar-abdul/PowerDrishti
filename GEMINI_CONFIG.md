# Google Gemini API Configuration Guide

## Why Gemini?

Google Gemini offers a **generous free tier**:
- **1,500 requests per day** (vs OpenRouter's limited free tier)
- **gemini-1.5-flash** model - fast and accurate
- Already installed in your project (`@google/generative-ai`)
- No credit card required for free tier

## Getting Your API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the generated API key

## Configuring PowerDrishti

### Step 1: Add API Key to Environment File

Open `d:\Projects\PowerDrishti\BACKEND\.env` and add:

```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Replace with your actual Gemini API key.

### Step 2: Restart Backend Server

The server should automatically restart via nodemon. If not:

```bash
# Stop the current server (Ctrl+C)
# Then restart
cd d:\Projects\PowerDrishti\BACKEND
npm run dev
```

## Testing

1. Navigate to Project Forecast page
2. Switch to "Upload Project File" tab
3. Upload a PDF, CSV, or XLSX file
4. Click "Parse & Auto-Fill Form"
5. Review the extracted data

## Free Tier Limits

**Gemini 1.5 Flash (Free)**:
- 15 requests per minute (RPM)
- 1 million tokens per minute (TPM)
- 1,500 requests per day (RPD)

This is **much more generous** than OpenRouter's free tier!

## Troubleshooting

### Error: "GEMINI_API_KEY not found"
- Check if the key is added to `.env` file
- Ensure there are no extra spaces
- Restart the backend server

### Error: "API key not valid"
- Verify the API key is correct
- Check if it's properly copied (no extra characters)
- Generate a new key if needed

### Rate Limit Exceeded
- You've exceeded 1,500 requests/day
- Wait 24 hours or upgrade to paid tier

## Comparison: Gemini vs OpenRouter

| Feature | Gemini (Free) | OpenRouter (Free) |
|---------|---------------|-------------------|
| Requests/Day | 1,500 | Very Limited |
| Speed | Fast | Varies |
| Accuracy | High | Varies by model |
| Setup | Simple | Requires trial key |
| **Recommended** | ✅ Yes | ❌ No |

## Next Steps

1. Get your Gemini API key from Google AI Studio
2. Add it to `.env` file
3. Test file upload feature
4. Enjoy unlimited file parsing! (within free tier limits)
