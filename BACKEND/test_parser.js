
import fs from 'fs';
import path from 'path';
import { parseProjectFile } from './services/fileParserService.js';

const sampleCsvPath = '../test-files/sample-project.csv';

async function testParsing() {
    try {
        console.log(`Reading file from: ${sampleCsvPath}`);
        const buffer = fs.readFileSync(sampleCsvPath);

        const mockFile = {
            buffer: buffer,
            mimetype: 'text/csv'
        };

        console.log('Parsing file...');
        const result = await parseProjectFile(mockFile);

        if (result.success) {
            console.log('✅ Parsing Successful!');
            console.log('Extracted Data:', JSON.stringify(result.data, null, 2));
        } else {
            console.error('❌ Parsing Failed:', result.error);
        }

    } catch (error) {
        console.error('Test Error:', error);
    }
}

testParsing();
