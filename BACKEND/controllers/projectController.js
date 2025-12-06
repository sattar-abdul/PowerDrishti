import asyncHandler from 'express-async-handler';
import { Project } from '../models/Project.js';
import { BOQ } from '../models/BOQ.js';
import { MonthlyBOQ } from '../models/MonthlyBOQ.js';
import * as mlService from '../services/mlService.js';

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
        route_km,
        avg_span_m,
        num_circuits,
        no_of_bays,
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
        route_km,
        avg_span_m,
        num_circuits,
        no_of_bays,
        total_budget,
        taxes_duty
    });

    // Get ML Forecast and create BOQ
    try {
        console.log('Calling ML model for project:', project_name);
        const forecastData = await mlService.getPrediction(req.body);

        if (forecastData.materials) {
            // Create total BOQ entry
            const boq = await BOQ.create({
                project: project._id,
                materials: forecastData.materials,
                input_parameters: {
                    project_type,
                    state: state_region,
                    voltage_kV: parseInt(line_voltage_level?.match(/(\d+)/)?.[1]) || 220,
                    route_km: parseInt(route_km) || 0,
                    avg_span_m: parseInt(avg_span_m) || 300,
                    tower_count: parseInt(expected_towers) || 0,
                    num_circuits: parseInt(num_circuits) || 1,
                    terrain_type,
                    logistics_difficulty_score: 4,
                    substation_type,
                    no_of_bays: parseInt(no_of_bays) || 0,
                    project_budget_in_crores: parseFloat(total_budget) || 0
                }
            });
            console.log('BOQ created successfully:', boq._id);

            // Create monthly BOQ entry if monthly data exists
            if (forecastData.monthly_boq && forecastData.monthly_boq.length > 0) {
                const monthlyBreakdown = forecastData.monthly_boq.map(monthData => {
                    // Convert month data to Map format (excluding the Month field)
                    const { Month, ...materials } = monthData;
                    return {
                        month: Month,
                        materials: new Map(Object.entries(materials))
                    };
                });

                const monthlyBOQ = await MonthlyBOQ.create({
                    project: project._id,
                    total_months: forecastData.total_months,
                    monthly_breakdown: monthlyBreakdown
                });
                console.log('Monthly BOQ created successfully:', monthlyBOQ._id);

                // Return project with both BOQs
                res.status(201).json({ project, boq, monthlyBOQ });
                return;
            }

            // Return project with BOQ
            res.status(201).json({ project, boq });
            return;
        }
    } catch (error) {
        console.error('ML Forecast Error:', error);
        // Delete the project since forecast failed
        await Project.findByIdAndDelete(project._id);
        res.status(500);
        throw new Error(`Failed to generate forecast: ${error.message}`);
    }

    res.status(201).json({ project });
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

// @desc    Update project phase
// @route   PATCH /api/projects/:id/phase
// @access  Private
const updateProjectPhase = asyncHandler(async (req, res) => {
    const { current_phase } = req.body;

    if (!current_phase) {
        res.status(400);
        throw new Error('Please provide a phase');
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Verify user owns the project
    if (project.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('User not authorized');
    }

    project.current_phase = current_phase;
    const updatedProject = await project.save();

    res.status(200).json(updatedProject);
});

// @desc    Update project location
// @route   PATCH /api/projects/:id/location
// @access  Private
const updateProjectLocation = asyncHandler(async (req, res) => {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
        res.status(400);
        throw new Error('Please provide latitude and longitude');
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Verify user owns the project
    if (project.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('User not authorized');
    }

    project.location = { lat, lng };
    project.location_set = true;
    const updatedProject = await project.save();

    res.status(200).json(updatedProject);
});

export {
    createProject,
    getProjects,
    updateProjectPhase,
    updateProjectLocation,
};
