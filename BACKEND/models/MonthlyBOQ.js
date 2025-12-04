import { Schema, model } from 'mongoose';

const monthlyBOQSchema = Schema({
    project: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Project',
        unique: true // One monthly BOQ per project
    },
    total_months: {
        type: Number,
        required: true
    },
    monthly_breakdown: [{
        month: {
            type: Number,
            required: true
        },
        materials: {
            type: Map,
            of: Number, // Material name -> quantity mapping
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
    }
}, {
    timestamps: true
});

const MonthlyBOQ = model('MonthlyBOQ', monthlyBOQSchema);
export { MonthlyBOQ };
