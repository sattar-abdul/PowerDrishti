import asyncHandler from 'express-async-handler';
import { BOQ } from '../models/BOQ.js';
import { MonthlyBOQ } from '../models/MonthlyBOQ.js';
import { Project } from '../models/Project.js';

// @desc    Get BOQ for a specific project
// @route   GET /api/boq/project/:projectId
// @access  Private
const getBOQByProject = asyncHandler(async (req, res) => {
    const boq = await BOQ.findOne({ project: req.params.projectId }).populate('project', 'project_name');

    if (!boq) {
        res.status(404);
        throw new Error('BOQ not found for this project');
    }

    // Verify the project belongs to the user
    const project = await Project.findById(req.params.projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (project.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    res.status(200).json(boq);
});

// @desc    Get monthly BOQ for a specific project
// @route   GET /api/boq/monthly/:projectId
// @access  Private
const getMonthlyBOQByProject = asyncHandler(async (req, res) => {
    const monthlyBOQ = await MonthlyBOQ.findOne({ project: req.params.projectId }).populate('project', 'project_name');

    if (!monthlyBOQ) {
        res.status(404);
        throw new Error('Monthly BOQ not found for this project');
    }

    // Verify the project belongs to the user
    const project = await Project.findById(req.params.projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (project.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    res.status(200).json(monthlyBOQ);
});

// @desc    Get all BOQs for user's projects
// @route   GET /api/boq
// @access  Private
const getAllBOQs = asyncHandler(async (req, res) => {
    // Get all user's projects
    const projects = await Project.find({ user: req.user.id });
    const projectIds = projects.map(p => p._id);

    // Get BOQs for those projects
    const boqs = await BOQ.find({ project: { $in: projectIds } }).populate('project', 'project_name');

    res.status(200).json(boqs);
});

// @desc    Delete BOQ
// @route   DELETE /api/boq/:id
// @access  Private
const deleteBOQ = asyncHandler(async (req, res) => {
    const boq = await BOQ.findById(req.params.id);

    if (!boq) {
        res.status(404);
        throw new Error('BOQ not found');
    }

    // Verify the project belongs to the user
    const project = await Project.findById(boq.project);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (project.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await BOQ.findByIdAndDelete(req.params.id);

    res.status(200).json({ id: req.params.id });
});

export {
    getBOQByProject,
    getMonthlyBOQByProject,
    getAllBOQs,
    deleteBOQ
};
