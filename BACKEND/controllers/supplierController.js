import asyncHandler from 'express-async-handler';
import { Supplier } from '../models/Supplier.js';

// Material to category mapping
const MATERIAL_CATEGORY_MAP = {
    // Conductors & OPGW
    'ACSR_Moose_tons': 'Conductors & OPGW',
    'ACSR_Zebra_tons': 'Conductors & OPGW',
    'AAAC_tons': 'Conductors & OPGW',
    'OPGW_km': 'Conductors & OPGW',
    'Earthwire_km': 'Conductors & OPGW',
    'Conductor_Accessories_sets': 'Conductors & OPGW',

    // Tower Steel
    'Tower_Steel_MT': 'Tower Steel',
    'Angle_Tower_MT': 'Tower Steel',
    'Bolts_Nuts_pcs': 'Tower Steel',
    'Misc_Hardware_lots': 'Tower Steel',

    // Insulators
    'Insulators_units': 'Insulators',
    'Disc_Insulators_units': 'Insulators',
    'Polymer_Insulators_units': 'Insulators',
    'Pin_Insulators_units': 'Insulators',
    'Long_Rod_Insulators_units': 'Insulators',
    'Earth_Rods_units': 'Insulators',
    'Earthing_Mat_sets': 'Insulators',
    'Longrod_Insulators_units': 'Insulators',  // Add this
    

    // Civil Materials
    'Foundation_Concrete_m3': 'Civil Materials',
    'Cement_MT': 'Civil Materials',
    'Sand_m3': 'Civil Materials',
    'Aggregate_m3': 'Civil Materials',

    // Power Equipment
    'Power_Transformer_units': 'Power Equipment',
    'Transformer_MVA_units': 'Power Equipment',
    'Circuit_Breaker_units': 'Power Equipment',
    'Isolator_units': 'Power Equipment',
    'CT_PT_sets': 'Power Equipment',
    'Relay_Panels_units': 'Power Equipment',

    // Cables
    'Control_Cable_m': 'Cables',
    'Power_Cable_m': 'Cables',
    'Cable_Trays_m': 'Cables',
    'Busbar_MT': 'Cables',

    // Safety Equipment
    'Lightning_Protection_sets': 'Safety Equipment',
    'Vibration_Dampers_pcs': 'Safety Equipment',
    'Spacer_Dampers_pcs': 'Safety Equipment',
    'Clamp_Fittings_sets': 'Safety Equipment'
};

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getAllSuppliers = asyncHandler(async (req, res) => {
    const suppliers = await Supplier.find({ active: true });
    res.status(200).json(suppliers);
});

// @desc    Get suppliers by category
// @route   GET /api/suppliers/category/:category
// @access  Private
const getSuppliersByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;

    const suppliers = await Supplier.find({
        category: category,
        active: true
    });

    res.status(200).json(suppliers);
});

// @desc    Get suppliers by material name
// @route   GET /api/suppliers/material/:materialId
// @access  Private
const getSuppliersByMaterial = asyncHandler(async (req, res) => {
    const { materialId } = req.params;
    const { projectLat, projectLng } = req.query;

    // Get category for this material
    const category = MATERIAL_CATEGORY_MAP[materialId];

    if (!category) {
        return res.status(404).json({
            message: 'No supplier category found for this material'
        });
    }

    // Find suppliers in this category
    let suppliers = await Supplier.find({
        category: category,
        active: true
    }).lean();

    // Calculate distance if project location is provided
    if (projectLat && projectLng) {
        const projLat = parseFloat(projectLat);
        const projLng = parseFloat(projectLng);

        suppliers = suppliers.map(supplier => {
            const distance = calculateDistance(
                projLat,
                projLng,
                supplier.location.lat,
                supplier.location.lng
            );
            return {
                ...supplier,
                distance_km: Math.round(distance)
            };
        });

        // Sort by distance
        suppliers.sort((a, b) => a.distance_km - b.distance_km);
    }

    res.status(200).json({
        category,
        suppliers
    });
});

// @desc    Create new supplier
// @route   POST /api/suppliers
// @access  Private/Admin
const createSupplier = asyncHandler(async (req, res) => {
    const {
        name,
        category,
        items_sold,
        location,
        address,
        contact,
        reliability_score
    } = req.body;

    const supplier = await Supplier.create({
        name,
        category,
        items_sold,
        location,
        address,
        contact,
        reliability_score
    });

    res.status(201).json(supplier);
});

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

export {
    getAllSuppliers,
    getSuppliersByCategory,
    getSuppliersByMaterial,
    createSupplier
};
