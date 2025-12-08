import { Schema, model } from 'mongoose';

const locationSchema = new Schema({
    lat: {
        type: Number,
        required: true
    },
    lng: {
        type: Number,
        required: true
    },
    address: {
        type: String
    }
}, { _id: false });

const trackingHistorySchema = new Schema({
    timestamp: {
        type: Date,
        default: Date.now
    },
    location: locationSchema,
    status: {
        type: String,
        required: true
    },
    notes: {
        type: String
    }
}, { _id: false });

const materialTrackingSchema = Schema({
    order: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'ProcurementOrder',
        unique: true
    },
    project: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Project'
    },
    tracking_id: {
        type: String,
        required: true,
        unique: true
    },
    current_location: {
        type: locationSchema,
        required: true
    },
    source_location: {
        type: locationSchema,
        required: true
    },
    destination_location: {
        type: locationSchema,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Transit', 'Delivered', 'Delayed', 'Cancelled', 'Ordered'],
        default: 'Pending'
    },
    eta: {
        type: Date
    },
    distance_km: {
        type: Number
    },
    distance_covered_km: {
        type: Number,
        default: 0
    },
    speed_kmh: {
        type: Number
    },
    vehicle_info: {
        vehicle_number: String,
        driver_name: String,
        driver_contact: String
    },
    tracking_history: [trackingHistorySchema],
    last_updated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Update last_updated on save
materialTrackingSchema.pre('save', function () {
    this.last_updated = new Date();
});

// Index for faster queries
materialTrackingSchema.index({ order: 1 });
materialTrackingSchema.index({ tracking_id: 1 });
materialTrackingSchema.index({ project: 1, status: 1 });

const MaterialTracking = model('MaterialTracking', materialTrackingSchema);
export { MaterialTracking };
