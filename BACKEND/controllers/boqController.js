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

// @desc    Update material quantity in monthly BOQ
// @route   PATCH /api/boq/monthly/:projectId/material
// @access  Private
const updateMonthlyMaterial = asyncHandler(async (req, res) => {
    const { monthNumber, materialId, quantity } = req.body;

    if (!monthNumber || !materialId || quantity === undefined) {
        res.status(400);
        throw new Error('Month number, material ID, and quantity are required');
    }

    const monthlyBOQ = await MonthlyBOQ.findOne({ project: req.params.projectId });

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

    // Find the month and update the material
    const monthData = monthlyBOQ.monthly_breakdown.find(m => m.month === parseInt(monthNumber));

    if (!monthData) {
        res.status(404);
        throw new Error('Month not found in BOQ');
    }

    // Update the material quantity
    monthData.materials.set(materialId, parseFloat(quantity));

    await monthlyBOQ.save();

    res.status(200).json({
        message: 'Material updated successfully',
        monthlyBOQ
    });
});

// @desc    Delete material from monthly BOQ
// @route   DELETE /api/boq/monthly/:projectId/material
// @access  Private
const deleteMonthlyMaterial = asyncHandler(async (req, res) => {
    const { monthNumber, materialId } = req.body;

    if (!monthNumber || !materialId) {
        res.status(400);
        throw new Error('Month number and material ID are required');
    }

    const monthlyBOQ = await MonthlyBOQ.findOne({ project: req.params.projectId });

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

    // Find the month and delete the material
    const monthData = monthlyBOQ.monthly_breakdown.find(m => m.month === parseInt(monthNumber));

    if (!monthData) {
        res.status(404);
        throw new Error('Month not found in BOQ');
    }

    // Delete the material
    monthData.materials.delete(materialId);

    await monthlyBOQ.save();

    res.status(200).json({
        message: 'Material deleted successfully',
        monthlyBOQ
    });
});

export {
    getBOQByProject,
    getMonthlyBOQByProject,
    getAllBOQs,
    deleteBOQ,
    updateMonthlyMaterial,
    deleteMonthlyMaterial
};
