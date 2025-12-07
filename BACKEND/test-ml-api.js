// Test script to verify ML API connection
import fetch from 'node-fetch';

const ML_API_URL = 'https://boq-api.onrender.com';

// Sample test data matching your ML model requirements
const testData = {
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
    "project_budget_in_crores": 180,
    "months": 12
};

async function testMLAPI() {
    console.log('🔍 Testing ML API Connection...');
    console.log('API URL:', ML_API_URL);
    console.log('\n📤 Sending test data:', JSON.stringify(testData, null, 2));

    const startTime = Date.now();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

        const response = await fetch(ML_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log(`\n⏱️  Response time: ${duration} seconds`);
        console.log('📊 Status:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Error response:', errorText);
            return;
        }

        const data = await response.json();
        console.log('\n✅ Success! Received data:');
        console.log('Number of materials:', Array.isArray(data) ? data.length : 'Not an array');

        if (Array.isArray(data)) {
            console.log('\n📦 First 5 materials:');
            data.slice(0, 5).forEach((item, index) => {
                console.log(`${index + 1}. ${item.Material}: ${item['Predicted Quantity']} ${item.Unit}`);
            });

            if (data.length === 33) {
                console.log('\n✅ Perfect! Received all 33 materials as expected.');
            } else {
                console.log(`\n⚠️  Warning: Expected 33 materials, got ${data.length}`);
            }
        } else {
            console.log('Full response:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        if (error.name === 'AbortError') {
            console.error(`\n❌ Request timeout after ${duration} seconds`);
            console.error('💡 The model might be in cold start (waking up from sleep)');
            console.error('💡 Try running the test again - it should be faster');
        } else {
            console.error(`\n❌ Error after ${duration} seconds:`, error.message);
        }
    }
}

// Run the test
testMLAPI();
