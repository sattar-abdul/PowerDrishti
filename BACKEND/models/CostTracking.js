import { Schema, model } from 'mongoose';

const costTrackingSchema = Schema({
    project: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Project'
    },
    category: {
        type: String,
        enum: ['Material', 'Labor', 'Equipment', 'Transport', 'Overhead', 'Other'],
        required: true
    },
    item_name: {
        type: String,
        required: true
    },
    budgeted_amount: {
        type: Number,
        required: true,
        min: 0
    },
    actual_amount: {
        type: Number,
        default: 0,
        min: 0
    },
    variance: {
        type: Number,
        default: 0
    },
    variance_percent: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String
    },
    invoice_number: {
        type: String
    },
    vendor: {
        type: String
    },
    approved_by: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    approval_status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    payment_status: {
        type: String,
        enum: ['Unpaid', 'Partially Paid', 'Paid'],
        default: 'Unpaid'
    }
}, {
    timestamps: true
});

// Calculate variance before saving
costTrackingSchema.pre('save', function () {
    this.variance = this.actual_amount - this.budgeted_amount;
    if (this.budgeted_amount > 0) {
        this.variance_percent = (this.variance / this.budgeted_amount) * 100;
    }
});

// Index for faster queries
costTrackingSchema.index({ project: 1, category: 1 });
costTrackingSchema.index({ date: -1 });

const CostTracking = model('CostTracking', costTrackingSchema);
export { CostTracking };
