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

    const project = await create({
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

    res.status(201).json(project);
});

// @desc    Get user projects
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
    const projects = await find({ user: req.user.id });
    res.status(200).json(projects);
});

export  {
    createProject,
    getProjects,
};
