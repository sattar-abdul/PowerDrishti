import { Schema, model } from 'mongoose';

const procurementOrderSchema = Schema({
    project: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Project'
    },
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    material_name: {
        type: String,
        required: true
    },
    material_id: {
        type: String,
        required: true // e.g., "ACSR_Moose_tons"
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    unit: {
        type: String,
        required: true
    },
    month_number: {
        type: Number,
        required: true,
        min: 1
    },
    order_date: {
        type: Date,
        default: Date.now
    },
    expected_delivery_date: {
        type: Date,
        required: true
    },
    actual_delivery_date: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Ordered', 'Processing', 'In Transit', 'Delivered', 'Delayed', 'Cancelled'],
        default: 'Ordered'
    },
    supplier: {
        name: String,
        contact: String,
        address: String
    },
    cost: {
        type: Number,
        min: 0
    },
    tracking_id: {
        type: String,
        unique: true,
        sparse: true
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'],
        default: 'Medium'
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Generate tracking ID before saving
procurementOrderSchema.pre('save', function () {
    if (!this.tracking_id) {
        this.tracking_id = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
});

// Index for faster queries
procurementOrderSchema.index({ project: 1, status: 1 });
procurementOrderSchema.index({ tracking_id: 1 });
procurementOrderSchema.index({ user: 1 });

const ProcurementOrder = model('ProcurementOrder', procurementOrderSchema);
export { ProcurementOrder };
