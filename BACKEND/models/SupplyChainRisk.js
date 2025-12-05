import { Schema, model } from 'mongoose';

const riskFactorSchema = new Schema({
    factor: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['Critical', 'Major', 'Minor'],
        required: true
    },
    description: {
        type: String
    }
}, { _id: false });

const supplierInfoSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    reliability_score: {
        type: Number,
        min: 0,
        max: 10,
        default: 5
    },
    past_delays: {
        type: Number,
        default: 0
    },
    contact: {
        type: String
    }
}, { _id: false });

const supplyChainRiskSchema = Schema({
    material_name: {
        type: String,
        required: true,
        unique: true
    },
    material_id: {
        type: String,
        required: true
    },
    risk_level: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Low'
    },
    risk_score: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
    },
    risk_factors: [riskFactorSchema],
    affected_projects: [{
        type: Schema.Types.ObjectId,
        ref: 'Project'
    }],
    primary_supplier: supplierInfoSchema,
    alternative_suppliers: [supplierInfoSchema],
    mitigation_strategy: {
        type: String
    },
    lead_time_days: {
        type: Number,
        default: 30
    },
    buffer_stock_recommended: {
        type: Number,
        default: 0
    },
    last_incident_date: {
        type: Date
    },
    last_updated: {
        type: Date,
        default: Date.now
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    auto_calculated: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Calculate risk score based on factors
supplyChainRiskSchema.pre('save', function () {
    if (this.risk_factors && this.risk_factors.length > 0) {
        let score = 0;
        this.risk_factors.forEach(factor => {
            if (factor.severity === 'Critical') score += 3;
            else if (factor.severity === 'Major') score += 2;
            else score += 1;
        });
        this.risk_score = Math.min(score, 10);

        // Set risk level based on score
        if (this.risk_score >= 7) this.risk_level = 'High';
        else if (this.risk_score >= 4) this.risk_level = 'Medium';
        else this.risk_level = 'Low';
    }
    this.last_updated = new Date();
});

// Index for faster queries
supplyChainRiskSchema.index({ material_id: 1 });
supplyChainRiskSchema.index({ risk_level: 1 });

const SupplyChainRisk = model('SupplyChainRisk', supplyChainRiskSchema);
export { SupplyChainRisk };
