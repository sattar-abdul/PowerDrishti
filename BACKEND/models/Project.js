const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    // 1. Project Information
    project_name: {
        type: String,
        required: [true, 'Please add a project name']
    },
    project_start_date: {
        type: Date,
        required: [true, 'Please add a start date']
    },
    expected_completion_period: {
        type: Number, // in months
        required: [true, 'Please add expected completion period']
    },

    // 2. Geographic & Site Information
    state_region: {
        type: String,
        required: [true, 'Please select a state/region']
    },
    district: {
        type: String,
        required: [true, 'Please add a district']
    },
    terrain_type: {
        type: String,
        enum: ['Plain', 'Hilly', 'Forest', 'Coastal', 'Urban Dense'],
        required: [true, 'Please select a terrain type']
    },
    accessibility_difficulty: {
        type: String,
        enum: ['Easy', 'Moderate', 'Hard'],
        required: [true, 'Please select accessibility difficulty']
    },

    // 3. Technical Fields
    project_type: {
        type: String,
        enum: ['Transmission Line', 'Substation', 'Both'],
        required: [true, 'Please select a project type']
    },
    tower_types: {
        type: [String], // Multi-select
        default: []
    },
    line_voltage_level: {
        type: String,
        enum: ['66kV', '132kV', '220kV', '400kV'],
        required: [true, 'Please select line voltage level']
    },
    substation_type: {
        type: String,
        enum: ['AIS', 'GIS', 'Hybrid', 'None'], // Added None for Transmission Line only projects
        default: 'None'
    },
    expected_towers: {
        type: Number,
        default: 0
    },

    // 4. Financial Inputs
    total_budget: {
        type: Number,
        required: [true, 'Please add total budget']
    },
    taxes_duty: {
        type: Number, // Percentage or absolute value? User said "Dropdown or Number", assuming percentage for now based on previous "tax_percentage"
        default: 0
    },

    // ML Forecast Results (kept from previous version)
    estimated_cost: {
        type: Number
    },
    estimated_duration: {
        type: String
    },
    risk_level: {
        type: String
    },
    recommendations: {
        type: [String]
    },
    materials: [{
        material_name: String,
        quantity: Number,
        unit: String,
        confidence_percent: Number,
        min_quantity: Number,
        max_quantity: Number
    }],
    total_carbon_kg: {
        type: Number
    },
    carbon_reduction_tips: [{
        tip: String,
        potential_reduction_percent: Number
    }],
    risk_factors: {
        type: [String]
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
