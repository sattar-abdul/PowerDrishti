// Simple test to check ML API
const https = require('https');

const testData = JSON.stringify({
    "project_type": "Transmission_Line",
    "state": "Bihar",
    "voltage_kV": 220,
    "route_km": 120,
    "avg_span_m": 300,
    "tower_count": 350,
    "num_circuits": 2,
    "terrain_type": "plain",
    "logistics_difficulty_score": 4,
    "substation_type": "None",
    "no_of_bays": 0,
    "project_budget_in_crores": 180
});

const options = {
    hostname: 'boq-api.onrender.com',
    port: 443,
    path: '/predict',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': testData.length
    }
};

console.log('Testing ML API at: https://boq-api.onrender.com/predict');
console.log('Sending test data...\n');

const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));

    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('\nResponse:');
        try {
            const parsed = JSON.parse(data);
            console.log(JSON.stringify(parsed, null, 2));

            if (Array.isArray(parsed)) {
                console.log(`\n✅ Received ${parsed.length} materials`);
            }
        } catch (e) {
            console.log(data);
        }
    });
});

req.on('error', (error) => {
    console.error('Error:', error.message);
});

req.write(testData);
req.end();
