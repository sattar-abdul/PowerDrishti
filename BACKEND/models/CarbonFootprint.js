import { Schema, model } from 'mongoose';

const carbonFootprintSchema = Schema({
    project: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Project'
    },
    source: {
        type: String,
        enum: ['Sourcing', 'Transport', 'Storage', 'Waste', 'Manufacturing', 'Installation'],
        required: true
    },
    emissions_kg: {
        type: Number,
        required: true,
        min: 0
    },
    material_name: {
        type: String,
        required: false
    },
    activity_details: {
        type: String,
        required: false
    },
    calculation_method: {
        type: String,
        enum: ['Estimated', 'Measured', 'Calculated'],
        default: 'Estimated'
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Index for faster queries
carbonFootprintSchema.index({ project: 1, source: 1 });
carbonFootprintSchema.index({ date: -1 });

const CarbonFootprint = model('CarbonFootprint', carbonFootprintSchema);
export { CarbonFootprint };
