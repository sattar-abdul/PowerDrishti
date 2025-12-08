
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from 'fs';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API key found in .env");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const logStream = fs.createWriteStream('model_test_log.txt');

function log(msg) {
    console.log(msg);
    logStream.write(msg + '\n');
}

async function testModels() {
    const modelsToTry = [
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-8b",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
        "gemini-1.0-pro",
        "gemini-pro"
    ];

    log("Testing models...");

    for (const modelName of modelsToTry) {
        log(`TRYING_MODEL: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            log(`SUCCESS_MODEL: ${modelName}`);
            log(JSON.stringify(result.response.text()));
            break;
        } catch (e) {
            log(`FAIL_MODEL: ${modelName} REASON: ${e.message.replace(/\n/g, ' ')}`);
        }
        await new Promise(r => setTimeout(r, 500));
    }
}

testModels();
