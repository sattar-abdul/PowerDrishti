
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log('Fetching models from:', url.replace(apiKey, 'HIDDEN_KEY'));

fetch(url)
    .then(res => res.json())
    .then(data => {
        console.log('Models fetched successfully.');
        fs.writeFileSync('models_list.json', JSON.stringify(data, null, 2));
        console.log('Saved to models_list.json');
    })
    .catch(err => {
        console.error('Error fetching models:', err);
        fs.writeFileSync('models_list_error.txt', err.toString());
    });
