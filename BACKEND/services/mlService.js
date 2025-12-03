import fetch from 'node-fetch';

// Hugging Face ML Model Configuration
const HF_API_URL = process.env.HF_API_URL || 'https://router.huggingface.co/models/Aunny/boq-forecast-xgb-33models';
const HF_API_TOKEN = process.env.HF_API_TOKEN || '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';
const USE_MOCK_ML = process.env.USE_MOCK_ML === 'true';

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
        tower_types
    } = projectData;

    // Extract voltage value (e.g., "220kV" -> 220)
    const voltageMatch = line_voltage_level?.match(/(\d+)/);
    const voltage_kV = voltageMatch ? parseInt(voltageMatch[1]) : 220;

    // Calculate route_km and avg_span_m based on tower count
    const tower_count = parseInt(expected_towers) || 0;
    const avg_span_m = 300; // Default average span
    const route_km = tower_count > 0 ? (tower_count * avg_span_m) / 1000 : 0;

    // Determine number of circuits based on tower types
    const num_circuits = tower_types?.length > 0 ? tower_types.length : 1;

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

    // Calculate logistics difficulty score (1-10 based on terrain)
    const logisticsScoreMap = {
        'plain': 2,
        'hilly': 5,
        'mountainous': 8,
        'coastal': 4,
        'desert': 6,
        'forest': 7
    };

    const terrain = terrainMap[terrain_type] || 'plain';
    const logistics_difficulty_score = logisticsScoreMap[terrain] || 4;

    // Determine bay count for substations
    const no_of_bays = substation_type !== 'None' ? 4 : 0;

    return {
        project_type: projectTypeMap[project_type] || 'Transmission_Line',
        state: state_region || 'Bihar',
        voltage_kV,
        route_km: Math.round(route_km),
        avg_span_m,
        tower_count,
        num_circuits,
        terrain_type: terrain,
        logistics_difficulty_score,
        substation_type: substation_type === 'None' ? 'None' : substation_type,
        no_of_bays,
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

/**
 * Call Hugging Face ML model for BOQ prediction
 */
async function getPrediction(projectData) {
    try {
        // Transform input data
        const modelInput = transformToModelInput(projectData);

        console.log('Calling ML model with input:', modelInput);

        // Call Hugging Face API
        const response = await fetch(HF_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${HF_API_TOKEN}`
            },
            body: JSON.stringify(modelInput),
            timeout: 30000 // 30 second timeout
        });

        if (!response.ok) {
            throw new Error(`ML API error: ${response.status} ${response.statusText}`);
        }

        const modelResponse = await response.json();
        console.log('ML model response received:', modelResponse);

        // Transform output
        const materials = transformModelOutput(modelResponse);

        // Validate we have all 33 materials
        if (materials.length !== 33) {
            console.warn(`Expected 33 materials, got ${materials.length}`);
        }

        return {
            materials,
            source: 'ml_model'
        };

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
