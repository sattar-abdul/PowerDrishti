import asyncHandler from 'express-async-handler';
import { ProcurementOrder } from '../models/ProcurementOrder.js';
import { MaterialTracking } from '../models/MaterialTracking.js';
import { Project } from '../models/Project.js';

// Indian Cities Coordinates for tracking
const CITIES = {
    "Delhi": { lat: 28.6139, lng: 77.2090 },
    "Mumbai": { lat: 19.0760, lng: 72.8777 },
    "Bangalore": { lat: 12.9716, lng: 77.5946 },
    "Chennai": { lat: 13.0827, lng: 80.2707 },
    "Kolkata": { lat: 22.5726, lng: 88.3639 },
    "Hyderabad": { lat: 17.3850, lng: 78.4867 },
    "Pune": { lat: 18.5204, lng: 73.8567 },
    "Ahmedabad": { lat: 23.0225, lng: 72.5714 },
    "Jaipur": { lat: 26.9124, lng: 75.7873 },
    "Lucknow": { lat: 26.8467, lng: 80.9462 }
};

// @desc    Create new procurement order
// @route   POST /api/procurement/order
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const {
        projectId,
        material_name,
        material_id,
        quantity,
        unit,
        month_number,
        expected_delivery_days = 14,
        supplier_name,
        supplier_id,
        cost,
        priority,
        source_city = "Mumbai",
        destination_city
    } = req.body;

    // Validate required fields
    if (!projectId || !material_name || !material_id || !quantity || !unit) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    // Verify project exists and belongs to user
    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (project.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('User not authorized');
    }

    // Calculate expected delivery date
    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + expected_delivery_days);

    // Create procurement order
    const order = await ProcurementOrder.create({
        project: projectId,
        user: req.user.id,
        material_name,
        material_id,
        quantity,
        unit,
        month_number,
        expected_delivery_date: expectedDeliveryDate,
        status: 'Ordered',
        supplier: {
            name: supplier_name || 'Default Supplier',
            contact: '+91-9876543210',
            address: source_city || 'Mumbai, Maharashtra'
        },
        cost: cost || 0,
        priority: priority || 'Medium'
    });

    // Determine locations
    let sourceLocation = CITIES[source_city] || CITIES["Mumbai"];
    let destinationLocation = CITIES[destination_city] || CITIES["Delhi"];
    let sourceAddress = `${source_city}, India`;
    let destAddress = `${destination_city || project.district || "Delhi"}, India`;

    // 1. Get precise source location from Supplier if ID provided
    if (supplier_id) {
        try {
            const { Supplier } = await import('../models/Supplier.js');
            const supplier = await Supplier.findById(supplier_id);
            if (supplier && supplier.location) {
                sourceLocation = {
                    lat: supplier.location.lat,
                    lng: supplier.location.lng
                };
                sourceAddress = supplier.address;
            }
        } catch (error) {
            console.error("Error fetching supplier location:", error);
        }
    }

    // 2. Get precise destination from Project location if set
    if (project.location_set && project.location) {
        destinationLocation = {
            lat: project.location.lat,
            lng: project.location.lng
        };
        destAddress = `${project.district}, ${project.state_region}`;
    } else if (project.district && CITIES[project.district]) {
        destinationLocation = CITIES[project.district];
    }

    // Create material tracking entry
    const tracking = await MaterialTracking.create({
        order: order._id,
        project: projectId,
        tracking_id: order.tracking_id,
        current_location: {
            lat: sourceLocation.lat,
            lng: sourceLocation.lng,
            address: sourceAddress
        },
        source_location: {
            lat: sourceLocation.lat,
            lng: sourceLocation.lng,
            address: sourceAddress
        },
        destination_location: {
            lat: destinationLocation.lat,
            lng: destinationLocation.lng,
            address: destAddress
        },
        status: 'Pending',
        eta: expectedDeliveryDate,
        distance_km: calculateDistance(sourceLocation, destinationLocation),
        distance_covered_km: 0,
        speed_kmh: 0,
        tracking_history: [{
            timestamp: new Date(),
            location: {
                lat: sourceLocation.lat,
                lng: sourceLocation.lng,
                address: sourceAddress
            },
            status: 'Order Placed',
            notes: 'Material order has been placed'
        }]
    });

    res.status(201).json({
        success: true,
        order,
        tracking
    });
});

// @desc    Get all orders for a project
// @route   GET /api/procurement/orders/:projectId
// @access  Private
const getOrdersByProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    // Verify project belongs to user
    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    if (project.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('User not authorized');
    }

    const orders = await ProcurementOrder.find({ project: projectId })
        .sort({ order_date: -1 })
        .populate('project', 'project_name');

    res.status(200).json(orders);
});

// @desc    Get all orders for user
// @route   GET /api/procurement/orders
// @access  Private
const getAllOrders = asyncHandler(async (req, res) => {
    // Get all user's projects
    const projects = await Project.find({ user: req.user.id });
    const projectIds = projects.map(p => p._id);

    const orders = await ProcurementOrder.find({ project: { $in: projectIds } })
        .sort({ order_date: -1 })
        .populate('project', 'project_name');

    res.status(200).json(orders);
});

// @desc    Get high-priority materials across all user projects
// @route   GET /api/procurement/high-priority
// @access  Private
const getHighPriorityMaterials = asyncHandler(async (req, res) => {
    // Get all user's projects
    const projects = await Project.find({ user: req.user.id });
    const projectIds = projects.map(p => p._id);

    // Find all high-priority orders from user's projects
    const highPriorityOrders = await ProcurementOrder.find({
        // project: { $in: projectIds },
        priority: 'High',
        status: 'Ordered' 
        

    })
        .sort({ order_date: -1 })
        .populate('project', 'project_name district state_region')
    console.log(highPriorityOrders);
    console.log(await ProcurementOrder.find({project: { $in: projectIds }}));
    res.status(200).json(highPriorityOrders);
    
});

// @desc    Update order status
// @route   PATCH /api/procurement/orders/:orderId/status
// @access  Private
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await ProcurementOrder.findById(orderId);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // Verify user owns the project
    const project = await Project.findById(order.project);
    if (project.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('User not authorized');
    }

    order.status = status;
    if (status === 'Delivered') {
        order.actual_delivery_date = new Date();
    }

    await order.save();

    // Update tracking status as well
    const tracking = await MaterialTracking.findOne({ order: orderId });
    if (tracking) {
        tracking.status = status === 'Delivered' ? 'Delivered' :
            status === 'In Transit' ? 'In Transit' :
                status === 'Delayed' ? 'Delayed' : 'Pending';
        await tracking.save();
    }

    res.status(200).json(order);
});

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

export {
    createOrder,
    getOrdersByProject,
    getAllOrders,
    updateOrderStatus,
    getHighPriorityMaterials
};
