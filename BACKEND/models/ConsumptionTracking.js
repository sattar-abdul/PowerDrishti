import { Schema, model } from 'mongoose';

const consumptionTrackingSchema = Schema({
    project: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Project'
    },
    month: {
        type: Number,
        required: true
    },
    materials: {
        type: Map,
        of: Number, // Material name -> actual consumed quantity mapping
        required: true
    },
    entry_date: {
        type: Date,
        default: Date.now
    },
    updated_by: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Compound index to ensure one consumption record per project per month
consumptionTrackingSchema.index({ project: 1, month: 1 }, { unique: true });

const ConsumptionTracking = model('ConsumptionTracking', consumptionTrackingSchema);
export { ConsumptionTracking };
