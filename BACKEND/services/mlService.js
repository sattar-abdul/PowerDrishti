import fetch from 'node-fetch';

// ML Model Configuration (Render Deployment)
const ML_API_URL = process.env.ML_API_URL || 'https://boq-api.onrender.com/predict';
const ML_API_TIMEOUT = parseInt(process.env.ML_API_TIMEOUT) || 60000; // 60 seconds for cold starts

/**
 * Transform project data from frontend format to ML model input format
 */
function transformToModelInput(projectData) {
    const {
        project_type,
        state_region,
        line_voltage_level,
        expected_towers,
        terrain_type,
        substation_type,
        total_budget,
        route_km,
        avg_span_m,
        num_circuits,
        no_of_bays
    } = projectData;

    // Extract voltage value (e.g., "220kV" -> 220)
    const voltageMatch = line_voltage_level?.match(/(\d+)/);
    const voltage_kV = voltageMatch ? parseInt(voltageMatch[1]) : 220;

    // Use tower count from form
    const tower_count = parseInt(expected_towers) || 0;

    // Map terrain type to lowercase
    const terrainMap = {
        'Plain': 'plain',
        'Hilly': 'hilly',
        'Mountainous': 'mountainous',
        'Coastal': 'coastal',
        'Desert': 'desert',
        'Forest': 'forest'
    };

    // Map project type
    const projectTypeMap = {
        'Transmission Line': 'Transmission_Line',
        'Substation': 'Substation',
        'Both': 'Transmission_Line'
    };

    const terrain = terrainMap[terrain_type] || 'plain';

    return {
        project_type: projectTypeMap[project_type] || 'Transmission_Line',
        state: state_region || 'Bihar',
        voltage_kV,
        route_km: parseInt(route_km) || 0,
        avg_span_m: parseInt(avg_span_m) || 300,
        tower_count,
        num_circuits: parseInt(num_circuits) || 1,
        terrain_type: terrain,
        logistics_difficulty_score: 4, // Hardcoded as requested
        substation_type: substation_type === 'None' ? 'None' : substation_type,
        no_of_bays: parseInt(no_of_bays) || 0,
        project_budget_in_crores: parseFloat(total_budget) || 0
    };
}

/**
 * Transform ML model output to frontend format
 */
function transformModelOutput(modelResponse) {
    if (!Array.isArray(modelResponse)) {
        throw new Error('Invalid model response: expected array');
    }

    return modelResponse.map(item => ({
        material_name: item.Material,
        quantity: Math.round(item['Predicted Quantity']),
        unit: item.Unit
    }));
}


async function getPrediction(projectData) {
    try {
        // Transform input data
        const modelInput = transformToModelInput(projectData);

        console.log('Calling ML model with input:', modelInput);

        // Call Render ML API with timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), ML_API_TIMEOUT);

        try {
            const response = await fetch(ML_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(modelInput),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`ML API error: ${response.status} ${response.statusText}`);
            }

            const modelResponse = await response.json();
            console.log('ML model response received:', modelResponse);

            // Transform output
            const materials = transformModelOutput(modelResponse.prediction);

            // Validate we have all 33 materials
            if (materials.length !== 33) {
                console.warn(`Expected 33 materials, got ${materials.length}`);
            }

            return {
                materials,
                source: 'ml_model'
            };
        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                throw new Error('ML API request timeout - model may be waking up from cold start');
            }
            throw fetchError;
        }

    } catch (error) {
        console.error('ML Model Error:', error);
        throw error;
    }
}

export {
    getPrediction,
    transformToModelInput,
    transformModelOutput
};
