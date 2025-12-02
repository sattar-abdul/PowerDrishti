import asyncHandler from 'express-async-handler';
import {Project} from '../models/Project.js';

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

export  {
    createProject,
    getProjects,
};
