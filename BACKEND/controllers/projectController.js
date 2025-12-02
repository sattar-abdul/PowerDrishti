const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
    const {
        project_name,
        project_start_date,
        expected_completion_period,
        state_region,
        district,
        terrain_type,
        project_type,
        tower_types,
        line_voltage_level,
        substation_type,
        expected_towers,
        total_budget,
        taxes_duty
    } = req.body;

    // Basic validation for required fields
    if (!project_name || !total_budget || !state_region) {
        res.status(400);
        throw new Error('Please add all required fields');
    }

    const project = await Project.create({
        user: req.user.id,
        project_name,
        project_start_date,
        expected_completion_period,
        state_region,
        district,
        terrain_type,
        project_type,
        tower_types,
        line_voltage_level,
        substation_type,
        expected_towers,
        total_budget,
        taxes_duty
    });

    // Simulate ML Forecast (Internal JS Logic to mimic external API)
    try {
        const forecastData = generateMockForecast({
            project_type,
            terrain_type,
            total_budget,
            expected_completion_period,
            tower_types,
            substation_type
        });

        if (forecastData.materials) {
            project.materials = forecastData.materials;
            project.risk_level = forecastData.risk_level;
            project.project_phase = forecastData.project_phase;
            project.total_carbon_kg = forecastData.total_carbon_kg;
            project.carbon_reduction_tips = forecastData.carbon_reduction_tips;
            project.risk_factors = forecastData.risk_factors;
            project.recommendations = forecastData.recommendations;
            project.estimated_cost = forecastData.estimated_cost;
            project.estimated_duration = forecastData.estimated_duration;

            await project.save();
        }
    } catch (error) {
        console.error('ML Forecast Error:', error);
        // Continue without failing the request
    }

    res.status(201).json(project);
});

// @desc    Get user projects
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find({ user: req.user.id });
    res.status(200).json(projects);
});

// Helper function to simulate ML Model logic in JS
const generateMockForecast = (data) => {
    const {
        project_type = 'Transmission Line',
        terrain_type = 'Plain',
        total_budget = 0,
        expected_completion_period = 12,
        tower_types = [],
        substation_type = 'None'
    } = data;

    // Base multipliers
    const terrain_multipliers = {
        'Plain': 1.0,
        'Hilly': 1.5,
        'Forest': 1.3,
        'Coastal': 1.4,
        'Urban Dense': 1.2
    };
    const tm = terrain_multipliers[terrain_type] || 1.0;

    // Material Definitions
    const materials_db = {
        'Steel': { base: 50, unit: 'Tons' },
        'Cement': { base: 100, unit: 'Bags' },
        'Conductors': { base: 20, unit: 'km' },
        'Insulators': { base: 200, unit: 'Units' },
        'Hardware Fittings': { base: 500, unit: 'Sets' },
        'Transformers': { base: 0.1, unit: 'Units' }
    };

    let relevant_materials = ['Steel', 'Cement', 'Hardware Fittings'];
    if (project_type.includes('Transmission') || project_type === 'Both') {
        relevant_materials.push('Conductors', 'Insulators');
    }
    if (project_type.includes('Substation') || project_type === 'Both') {
        relevant_materials.push('Transformers');
    }

    const predicted_materials = [];

    relevant_materials.forEach(mat_name => {
        if (!materials_db[mat_name]) return;

        const mat_info = materials_db[mat_name];
        let base_qty = (total_budget / 1000000) * mat_info.base * tm; // Heuristic based on budget

        if (mat_name === 'Conductors' && tower_types.includes('High Capacity')) base_qty *= 1.2;
        if (mat_name === 'Transformers' && substation_type === 'GIS') base_qty *= 0.8;

        let total_qty = Math.max(1, Math.floor(base_qty * (0.9 + Math.random() * 0.2)));

        // Schedule Generation (Bell curve-ish)
        const schedule = [];
        let remaining_qty = total_qty;
        const duration = parseInt(expected_completion_period) || 12;

        const weights = [];
        for (let m = 1; m <= duration; m++) {
            let weight = 1;
            if (duration > 1) {
                const x = -2 + 4 * ((m - 1) / (duration - 1));
                weight = Math.exp(-(x * x));
            }
            weights.push({ month: m, weight });
        }

        const total_weight = weights.reduce((acc, curr) => acc + curr.weight, 0);

        const monthly_distribution = weights.map((w, i) => {
            let qty = 0;
            if (i === weights.length - 1) {
                qty = remaining_qty;
            } else {
                qty = Math.floor((w.weight / total_weight) * total_qty);
                remaining_qty -= qty;
            }
            return { month: w.month, quantity: qty };
        });

        predicted_materials.push({
            material_name: mat_name,
            quantity: total_qty,
            unit: mat_info.unit,
            confidence_percent: (85 + Math.random() * 13).toFixed(1),
            min_quantity: Math.floor(total_qty * 0.9),
            max_quantity: Math.ceil(total_qty * 1.1),
            schedule: monthly_distribution
        });
    });

    // Carbon Calc
    let total_carbon = 0;
    const carbon_factors = {
        'Steel': 1850, 'Cement': 50, 'Conductors': 500,
        'Insulators': 10, 'Hardware Fittings': 20, 'Transformers': 5000
    };

    predicted_materials.forEach(m => {
        total_carbon += m.quantity * (carbon_factors[m.material_name] || 0);
    });

    // Tips & Risks
    const carbon_tips = [
        { tip: "Use recycled steel for tower structures", potential_reduction_percent: 15 },
        { tip: "Optimize route to reduce total line length", potential_reduction_percent: 8 },
        { tip: "Source cement from local green-certified suppliers", potential_reduction_percent: 5 }
    ];

    const risk_factors = [];
    if (tm > 1.2) risk_factors.push("Difficult terrain may cause delays in material transport.");
    if (total_budget < 100) risk_factors.push("Budget constraints might affect material quality.");
    if (terrain_type === 'Forest') risk_factors.push("Environmental clearances for forest area may delay schedule.");

    const recommendations = [
        "Procure steel in phases to match the bell-curve demand.",
        "Ensure warehouse capacity for peak months.",
        "Lock in prices for Conductors early due to market volatility."
    ];

    return {
        materials: predicted_materials,
        risk_level: tm > 1.3 ? 'High' : (tm > 1.1 ? 'Medium' : 'Low'),
        project_phase: 'Planning',
        total_carbon_kg: total_carbon,
        carbon_reduction_tips: carbon_tips,
        risk_factors,
        recommendations,
        estimated_cost: total_budget,
        estimated_duration: `${expected_completion_period} months`
    };
};

module.exports = {
    createProject,
    getProjects,
};
