import { Schema, model } from 'mongoose';

const inventoryItemSchema = Schema({
    item_name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    unit: {
        type: String,
        required: true,
        default: 'units'
    }
});

const inventorySchema = Schema({
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
    items: [inventoryItemSchema],
    last_updated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Inventory = model('Inventory', inventorySchema);
export { Inventory };
