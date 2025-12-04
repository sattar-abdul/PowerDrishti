import { Schema, model } from 'mongoose';

const boqSchema = Schema({
    project: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Project',
        unique: true // One BOQ per project
    },
    materials: [{
        material_name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            required: true
        }
    }],
    prediction_date: {
        type: Date,
        default: Date.now
    },
    ml_model_version: {
        type: String,
        default: '1.0'
    },
    input_parameters: {
        project_type: String,
        state: String,
        voltage_kV: Number,
        route_km: Number,
        avg_span_m: Number,
        tower_count: Number,
        num_circuits: Number,
        terrain_type: String,
        logistics_difficulty_score: Number,
        substation_type: String,
        no_of_bays: Number,
        project_budget_in_crores: Number
    }
}, {
    timestamps: true
});

const BOQ = model('BOQ', boqSchema);
export { BOQ };
