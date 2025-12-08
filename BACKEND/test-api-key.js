// Quick test to verify Gemini API key is loaded
import dotenv from 'dotenv';
dotenv.config();

console.log('=== Environment Variable Check ===');
console.log('GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);
console.log('GEMINI_API_KEY starts with AIzaSy:', process.env.GEMINI_API_KEY?.startsWith('AIzaSy'));
console.log('First 10 chars:', process.env.GEMINI_API_KEY?.substring(0, 10));
console.log('===================================');
