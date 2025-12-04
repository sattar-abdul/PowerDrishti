import { Schema, model } from 'mongoose';

const projectSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
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
        enum: ['Plain', 'Hilly', 'Forest', 'Coastal', 'Urban Dense', 'Mountainous', 'Desert'],
        required: [true, 'Please select a terrain type']
    },

    // 3. Technical Fields
    project_type: {
        type: String,
        enum: ['Transmission Line', 'Substation', 'Both'],
        required: [true, 'Please select a project type']
    },
    tower_types: {
        type: [String],
        default: []
    },
    line_voltage_level: {
        type: String,
        enum: ['66kV', '132kV', '220kV', '400kV'],
        required: [true, 'Please select line voltage level']
    },
    substation_type: {
        type: String,
        enum: ['AIS', 'GIS', 'Hybrid', 'None'],
        default: 'None'
    },
    expected_towers: {
        type: Number,
        default: 0
    },
    route_km: {
        type: Number,
        default: 0
    },
    avg_span_m: {
        type: Number,
        default: 300
    },
    num_circuits: {
        type: Number,
        default: 1
    },
    no_of_bays: {
        type: Number,
        default: 0
    },

    // 4. Financial Inputs
    total_budget: {
        type: Number,
        required: [true, 'Please add total budget']
    },
    taxes_duty: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Project = model('Project', projectSchema);
export { Project };
