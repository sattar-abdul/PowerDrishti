# IMPORTANT: Add Gemini API Key to .env

To enable the file parsing feature, you need to add your Gemini API key to the backend `.env` file.

## Steps:

1. Get your Gemini API key from: https://aistudio.google.com/app/apikey

2. Add this line to `d:\Projects\PowerDrishti\BACKEND\.env`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Restart the backend server after adding the key

## Example .env file:
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=AIzaSy...your_key_here
```

Without this API key, the file parsing feature will not work.
