
// Mock logic from fileParserService.js
function normalize(cleanValue) {
    let result = cleanValue;
    const date = new Date(cleanValue);
    // Be careful: new Date('01-02-2025') might be Feb 1st (US) or Jan 2nd (International) depending on locale/browser.
    // In Node (V8), 'YYYY-MM-DD' is UTC. 'MM/DD/YYYY' is local.

    // My implemented logic:
    if (!isNaN(date.getTime()) && cleanValue.includes('-') && cleanValue.split('-')[0].length === 4) {
        // It was a valid ISO-like string
        result = date.toISOString().split('T')[0];
    } else {
        const parts = cleanValue.split(/[-/]/);
        if (parts.length === 3) {
            // Heuristic:
            if (parts[0].length === 4) {
                // YYYY-MM-DD
                result = `${parts[0]}-${parts[1]}-${parts[2]}`;
            } else {
                // DD-MM-YYYY -> YYYY-MM-DD
                result = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }
    }
    return result;
}

const tests = [
    "2025-01-15",
    "15-01-2025",
    "15/01/2025",
    "2025/01/15"
];

tests.forEach(t => console.log(`${t} -> ${normalize(t)}`));
