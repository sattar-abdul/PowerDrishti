import asyncHandler from 'express-async-handler';
import { Inventory } from '../models/Inventory.js';
import { Project } from '../models/Project.js';

// Default 33 inventory items for POWERGRID projects
const DEFAULT_ITEMS = [
    { item_name: 'ACSR_Moose_tons', quantity: 0, unit: 'tons' },
    { item_name: 'ACSR_Zebra_tons', quantity: 0, unit: 'tons' },
    { item_name: 'AAAC_tons', quantity: 0, unit: 'tons' },
    { item_name: 'OPGW_km', quantity: 0, unit: 'km' },
    { item_name: 'Earthwire_km', quantity: 0, unit: 'km' },
    { item_name: 'Tower_Steel_MT', quantity: 0, unit: 'MT' },
    { item_name: 'Angle_Tower_MT', quantity: 0, unit: 'MT' },
    { item_name: 'Bolts_Nuts_pcs', quantity: 0, unit: 'pcs' },
    { item_name: 'Disc_Insulators_units', quantity: 0, unit: 'units' },
    { item_name: 'Longrod_Insulators_units', quantity: 0, unit: 'units' },
    { item_name: 'Vibration_Dampers_pcs', quantity: 0, unit: 'pcs' },
    { item_name: 'Spacer_Dampers_pcs', quantity: 0, unit: 'pcs' },
    { item_name: 'Clamp_Fittings_sets', quantity: 0, unit: 'sets' },
    { item_name: 'Conductor_Accessories_sets', quantity: 0, unit: 'sets' },
    { item_name: 'Earth_Rods_units', quantity: 0, unit: 'units' },
    { item_name: 'Foundation_Concrete_m3', quantity: 0, unit: 'm3' },
    { item_name: 'Control_Cable_m', quantity: 0, unit: 'm' },
    { item_name: 'Power_Cable_m', quantity: 0, unit: 'm' },
    { item_name: 'Transformer_MVA_units', quantity: 0, unit: 'units' },
    { item_name: 'Power_Transformer_units', quantity: 0, unit: 'units' },
    { item_name: 'Circuit_Breaker_units', quantity: 0, unit: 'units' },
    { item_name: 'Isolator_units', quantity: 0, unit: 'units' },
    { item_name: 'CT_PT_sets', quantity: 0, unit: 'sets' },
    { item_name: 'Relay_Panels_units', quantity: 0, unit: 'units' },
    { item_name: 'Busbar_MT', quantity: 0, unit: 'MT' },
    { item_name: 'Cement_MT', quantity: 0, unit: 'MT' },
    { item_name: 'Sand_m3', quantity: 0, unit: 'm3' },
    { item_name: 'Aggregate_m3', quantity: 0, unit: 'm3' },
    { item_name: 'Earthing_Mat_sets', quantity: 0, unit: 'sets' },
    { item_name: 'MC501_units', quantity: 0, unit: 'units' },
    { item_name: 'Cable_Trays_m', quantity: 0, unit: 'm' },
    { item_name: 'Lighting_Protection_sets', quantity: 0, unit: 'sets' },
    { item_name: 'Misc_Hardware_lots', quantity: 0, unit: 'lots' }
];

// @desc    Get inventory for a project
// @route   GET /api/inventory/:projectId
// @access  Private
const getInventory = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    // Verify project exists and belongs to user
    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (project.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized');
    }

    let inventory = await Inventory.findOne({ project: projectId });

    // If no inventory exists, create one with default items
    if (!inventory) {
        inventory = await Inventory.create({
            project: projectId,
            user: req.user.id,
            items: DEFAULT_ITEMS
        });
    }

    res.status(200).json(inventory);
});

// @desc    Update inventory for a project
// @route   PUT /api/inventory/:projectId
// @access  Private
const updateInventory = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { items } = req.body;

    // Verify project exists and belongs to user
    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (project.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized');
    }

    let inventory = await Inventory.findOne({ project: projectId });

    if (!inventory) {
        // Create new inventory
        inventory = await Inventory.create({
            project: projectId,
            user: req.user.id,
            items: items || DEFAULT_ITEMS,
            last_updated: Date.now()
        });
    } else {
        // Update existing inventory
        inventory.items = items;
        inventory.last_updated = Date.now();
        await inventory.save();
    }

    res.status(200).json(inventory);
});

// @desc    Get all inventories for user
// @route   GET /api/inventory
// @access  Private
const getAllInventories = asyncHandler(async (req, res) => {
    const inventories = await Inventory.find({ user: req.user.id }).populate('project', 'project_name');
    res.status(200).json(inventories);
});

export {
    getInventory,
    updateInventory,
    getAllInventories
};
