import { Schema, model } from 'mongoose';

const supplierSchema = Schema({
    name: {
        type: String,
        required: [true, 'Please add supplier name'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please add supplier category'],
        enum: [
            'Conductors & OPGW',
            'Tower Steel',
            'Insulators',
            'Civil Materials',
            'Power Equipment',
            'Cables',
            'Safety Equipment'
        ]
    },
    items_sold: [{
        type: String,
        required: true
    }],
    location: {
        lat: {
            type: Number,
            required: [true, 'Please add latitude']
        },
        lng: {
            type: Number,
            required: [true, 'Please add longitude']
        }
    },
    address: {
        type: String,
        required: [true, 'Please add address']
    },
    contact: {
        phone: {
            type: String
        },
        email: {
            type: String
        },
        person: {
            type: String
        }
    },
    reliability_score: {
        type: Number,
        min: 0,
        max: 10,
        default: 7
    },
    past_deliveries: {
        type: Number,
        default: 0
    },
    average_delivery_days: {
        type: Number,
        default: 14
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster queries
supplierSchema.index({ category: 1 });
supplierSchema.index({ 'location.lat': 1, 'location.lng': 1 });
supplierSchema.index({ active: 1 });

const Supplier = model('Supplier', supplierSchema);
export { Supplier };
