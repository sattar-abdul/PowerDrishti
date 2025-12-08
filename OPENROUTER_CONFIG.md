# OpenRouter API Configuration Guide

## Getting Your API Key

1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up or log in to your account
3. Navigate to the API Keys section
4. Generate a new API key
5. Copy the API key

## Configuring PowerDrishti

### Step 1: Add API Key to Environment File

Open `d:\Projects\PowerDrishti\BACKEND\.env` and add:

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx
```

Replace `sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx` with your actual API key.

### Step 2: Restart Backend Server

After adding the API key, restart your backend server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
cd d:\Projects\PowerDrishti\BACKEND
npm run dev
```

## Testing the Configuration

### Option 1: Using the Test Script

```bash
cd d:\Projects\PowerDrishti\BACKEND
node test-api-key.js
```

### Option 2: Using the Frontend

1. Navigate to Project Forecast page
2. Switch to "Upload Project File" tab
3. Upload the sample file: `d:\Projects\PowerDrishti\test-files\sample-project.csv`
4. Click "Parse & Auto-Fill Form"
5. Verify the extracted data appears in the preview modal

## Free Tier vs Paid

### Free Tier (Default)
- Model: `meta-llama/llama-3.2-3b-instruct:free`
- Rate limits apply
- Good for testing and development

### Paid Tier
- Better models available
- Higher rate limits
- More reliable for production

## Troubleshooting

### Error: "OpenRouter API error"
- Check if API key is correctly set in `.env`
- Verify the API key is valid
- Check if you've exceeded rate limits

### Error: "Failed to parse file"
- Verify file format (PDF, CSV, or XLSX)
- Check file size (must be under 10MB)
- Ensure file contains readable text

### Poor Extraction Quality
- Use structured formats (CSV/XLSX) for better results
- Ensure field names match expected patterns
- Check if file content is clear and well-formatted

## API Usage Best Practices

1. **Use Your Own Key**: Don't rely on the fallback free trial key
2. **Monitor Usage**: Track your API calls to avoid rate limits
3. **Handle Errors**: The system has error handling, but monitor logs
4. **Test First**: Always test with sample files before production use

## Alternative: Using Gemini AI

If you prefer to use Google's Gemini AI instead of OpenRouter, you can modify the `fileParserService.js` to use the existing `@google/generative-ai` package that's already installed.

Let me know if you'd like to switch to Gemini AI for file parsing!
