import asyncHandler from 'express-async-handler';
import { Project } from '../models/Project.js';

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

// Mock forecast generator - generates forecast for 33 inventory materials
function generateMockForecast(projectData) {
    const { total_budget, project_type } = projectData;

    // Define the 33 inventory materials matching the inventory system
    const materials = [
        { material_name: 'ACSR_Moose_tons', unit: 'tons' },
        { material_name: 'ACSR_Zebra_tons', unit: 'tons' },
        { material_name: 'AAAC_tons', unit: 'tons' },
        { material_name: 'OPGW_km', unit: 'km' },
        { material_name: 'Earthwire_km', unit: 'km' },
        { material_name: 'Tower_Steel_MT', unit: 'MT' },
        { material_name: 'Angle_Tower_MT', unit: 'MT' },
        { material_name: 'Bolts_Nuts_pcs', unit: 'pcs' },
        { material_name: 'Disc_Insulators_units', unit: 'units' },
        { material_name: 'Longrod_Insulators_units', unit: 'units' },
        { material_name: 'Vibration_Dampers_pcs', unit: 'pcs' },
        { material_name: 'Spacer_Dampers_pcs', unit: 'pcs' },
        { material_name: 'Clamp_Fittings_sets', unit: 'sets' },
        { material_name: 'Conductor_Accessories_sets', unit: 'sets' },
        { material_name: 'Earth_Rods_units', unit: 'units' },
        { material_name: 'Foundation_Concrete_m3', unit: 'm3' },
        { material_name: 'Control_Cable_m', unit: 'm' },
        { material_name: 'Power_Cable_m', unit: 'm' },
        { material_name: 'Transformer_MVA_units', unit: 'units' },
        { material_name: 'Power_Transformer_units', unit: 'units' },
        { material_name: 'Circuit_Breaker_units', unit: 'units' },
        { material_name: 'Isolator_units', unit: 'units' },
        { material_name: 'CT_PT_sets', unit: 'sets' },
        { material_name: 'Relay_Panels_units', unit: 'units' },
        { material_name: 'Busbar_MT', unit: 'MT' },
        { material_name: 'Cement_MT', unit: 'MT' },
        { material_name: 'Sand_m3', unit: 'm3' },
        { material_name: 'Aggregate_m3', unit: 'm3' },
        { material_name: 'Earthing_Mat_sets', unit: 'sets' },
        { material_name: 'MC501_units', unit: 'units' },
        { material_name: 'Cable_Trays_m', unit: 'm' },
        { material_name: 'Lighting_Protection_sets', unit: 'sets' },
        { material_name: 'Misc_Hardware_lots', unit: 'lots' }
    ];

    // Generate mock quantities based on budget (simple mock logic)
    const budgetFactor = total_budget / 100; // Scale based on budget

    const materialsWithQuantities = materials.map(material => {
        // Generate random quantity based on material type and budget
        let baseQuantity = Math.floor(Math.random() * 100 * budgetFactor);

        // Adjust based on unit type
        if (material.unit === 'tons' || material.unit === 'MT') {
            baseQuantity = Math.floor(baseQuantity * 0.5); // Lower for heavy materials
        } else if (material.unit === 'km' || material.unit === 'm') {
            baseQuantity = Math.floor(baseQuantity * 2); // Higher for length materials
        } else if (material.unit === 'pcs') {
            baseQuantity = Math.floor(baseQuantity * 10); // Much higher for pieces
        }

        return {
            material_name: material.material_name,
            quantity: Math.max(baseQuantity, 10), // Minimum 10
            unit: material.unit
        };
    });

    return {
        materials: materialsWithQuantities
    };
}

export {
    createProject,
    getProjects,
};
