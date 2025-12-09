import asyncHandler from 'express-async-handler';
import { ConsumptionTracking } from '../models/ConsumptionTracking.js';
import { MonthlyBOQ } from '../models/MonthlyBOQ.js';
import { Project } from '../models/Project.js';

// @desc    Get actual consumption data for a project
// @route   GET /api/forecast/consumption/:projectId
// @access  Private
const getActualConsumption = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    // Verify project belongs to user
    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (project.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    // Get all consumption records for this project
    const consumptionRecords = await ConsumptionTracking.find({ project: projectId })
        .sort({ month: 1 });

    res.status(200).json(consumptionRecords);
});

// @desc    Save/update actual consumption data
// @route   POST /api/forecast/consumption/:projectId
// @access  Private
const saveActualConsumption = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { month, materials } = req.body;

    // Verify project belongs to user
    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (project.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    // Validate input
    if (!month || !materials) {
        res.status(400);
        throw new Error('Month and materials data are required');
    }

    // Convert materials object to Map
    const materialsMap = new Map(Object.entries(materials));

    // Update or create consumption record
    const consumptionRecord = await ConsumptionTracking.findOneAndUpdate(
        { project: projectId, month },
        {
            project: projectId,
            month,
            materials: materialsMap,
            updated_by: req.user.id
        },
        { new: true, upsert: true }
    );

    res.status(200).json(consumptionRecord);
});

// @desc    Forecast next month's material consumption
// @route   POST /api/forecast/predict/:projectId
// @access  Private
const forecastNextMonth = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { currentMonth, actualCumulative } = req.body;

    // Verify project belongs to user
    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (project.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    // Validate input
    if (!currentMonth || !actualCumulative) {
        res.status(400);
        throw new Error('Current month and actual cumulative consumption are required');
    }

    // Get monthly BOQ for the project
    const monthlyBOQ = await MonthlyBOQ.findOne({ project: projectId });
    if (!monthlyBOQ) {
        res.status(404);
        throw new Error('Monthly BOQ not found for this project');
    }

    // Extract planned monthly data
    const plannedMonthly = monthlyBOQ.monthly_breakdown.map(monthData => {
        const materialsObj = {};
        monthData.materials.forEach((quantity, materialName) => {
            materialsObj[materialName] = quantity;
        });
        return {
            Month: monthData.month,
            ...materialsObj
        };
    });

    // Get all material names (excluding 'Month')
    const materials = Object.keys(plannedMonthly[0]).filter(k => k !== 'Month');

    // Convert to map by Month for easy access
    const df = {};
    plannedMonthly.forEach(row => {
        df[row.Month] = row;
    });

    const nextMonth = currentMonth + 1;
    const lastMonth = Math.max(...plannedMonthly.map(r => r.Month));

    const clipPF = [0.5, 1.5]; // Progress Factor clipping range
    const forecastResults = [];

    materials.forEach(mat => {
        // 1. Planned cumulative till current month
        let plannedCum = 0;
        for (let m = 1; m <= currentMonth; m++) {
            if (df[m]) {
                plannedCum += df[m][mat] || 0;
            }
        }

        // 2. Actual cumulative
        const actualCum = (mat in actualCumulative) ? Number(actualCumulative[mat]) : plannedCum;

        // 3. Planned next month
        const plannedNext = (nextMonth <= lastMonth && df[nextMonth])
            ? (df[nextMonth][mat] || 0)
            : 0;

        // 4. Total planned BOQ
        let totalPlanned = 0;
        plannedMonthly.forEach(r => {
            totalPlanned += r[mat] || 0;
        });

        // 5. Progress Factor (PF)
        let PF = plannedCum > 0 ? actualCum / plannedCum : 1.0;

        // Clip PF
        PF = Math.max(clipPF[0], Math.min(clipPF[1], PF));

        // 6. Remaining BOQ
        const remaining = Math.max(0, totalPlanned - actualCum);

        // 7. Forecast next month
        let forecastNext = plannedNext * PF;

        // Don't exceed remaining BOQ
        forecastNext = Math.min(forecastNext, remaining);

        forecastResults.push({
            Material: mat,
            Planned_for_next_month_before: Math.round(plannedNext),
            New_forecast_based_on_actual_consumption: Math.round(forecastNext),
            Progress_Factor: PF.toFixed(2),
            Remaining_BOQ: Math.round(remaining),
            Actual_Cumulative: Math.round(actualCum),
            Planned_Cumulative: Math.round(plannedCum)
        });
    });

    res.status(200).json({
        projectId,
        currentMonth,
        nextMonth,
        forecast: forecastResults
    });
});

export {
    getActualConsumption,
    saveActualConsumption,
    forecastNextMonth
};
