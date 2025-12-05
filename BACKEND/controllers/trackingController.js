import asyncHandler from 'express-async-handler';
import { MaterialTracking } from '../models/MaterialTracking.js';
import { ProcurementOrder } from '../models/ProcurementOrder.js';
import { Project } from '../models/Project.js';

// @desc    Get tracking info by order ID
// @route   GET /api/tracking/order/:orderId
// @access  Private
const getTrackingByOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const tracking = await MaterialTracking.findOne({ order: orderId })
        .populate({
            path: 'order',
            select: 'material_name quantity unit status expected_delivery_date tracking_id supplier'
        })
        .populate('project', 'project_name district');

    if (!tracking) {
        res.status(404);
        throw new Error('Tracking information not found');
    }

    // Verify user owns the project
    const project = await Project.findById(tracking.project);
    if (project.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('User not authorized');
    }

    res.status(200).json(tracking);
});

// @desc    Get tracking info by tracking ID
// @route   GET /api/tracking/:trackingId
// @access  Private
const getTrackingByTrackingId = asyncHandler(async (req, res) => {
    const { trackingId } = req.params;

    const tracking = await MaterialTracking.findOne({ tracking_id: trackingId })
        .populate({
            path: 'order',
            select: 'material_name quantity unit status expected_delivery_date tracking_id supplier'
        })
        .populate('project', 'project_name district');

    if (!tracking) {
        res.status(404);
        throw new Error('Tracking information not found');
    }

    // Verify user owns the project
    const project = await Project.findById(tracking.project);
    if (project.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('User not authorized');
    }

    res.status(200).json(tracking);
});

// @desc    Get all tracking for a project
// @route   GET /api/tracking/project/:projectId
// @access  Private
const getTrackingByProject = asyncHandler(async (req, res) => {
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

    const trackings = await MaterialTracking.find({ project: projectId })
        .populate({
            path: 'order',
            select: 'material_name quantity unit status expected_delivery_date tracking_id'
        })
        .sort({ createdAt: -1 });

    res.status(200).json(trackings);
});

// @desc    Get all active trackings for user
// @route   GET /api/tracking/active
// @access  Private
const getActiveTrackings = asyncHandler(async (req, res) => {
    // Get all user's projects
    const projects = await Project.find({ user: req.user.id });
    const projectIds = projects.map(p => p._id);

    const trackings = await MaterialTracking.find({
        project: { $in: projectIds },
        status: { $in: ['Pending', 'In Transit'] }
    })
        .populate({
            path: 'order',
            select: 'material_name quantity unit status expected_delivery_date tracking_id'
        })
        .populate('project', 'project_name')
        .sort({ createdAt: -1 });

    res.status(200).json(trackings);
});

// @desc    Update tracking location
// @route   PATCH /api/tracking/:trackingId/location
// @access  Private
const updateTrackingLocation = asyncHandler(async (req, res) => {
    const { trackingId } = req.params;
    const { lat, lng, address, status, notes, speed_kmh } = req.body;

    const tracking = await MaterialTracking.findOne({ tracking_id: trackingId });
    if (!tracking) {
        res.status(404);
        throw new Error('Tracking not found');
    }

    // Verify user owns the project
    const project = await Project.findById(tracking.project);
    if (project.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('User not authorized');
    }

    // Update current location
    tracking.current_location = {
        lat,
        lng,
        address: address || `Lat: ${lat}, Lng: ${lng}`
    };

    // Update status if provided
    if (status) {
        tracking.status = status;
    }

    // Update speed if provided
    if (speed_kmh) {
        tracking.speed_kmh = speed_kmh;
    }

    // Calculate distance covered
    const distanceCovered = calculateDistance(
        tracking.source_location,
        tracking.current_location
    );
    tracking.distance_covered_km = distanceCovered;

    // Add to tracking history
    tracking.tracking_history.push({
        timestamp: new Date(),
        location: {
            lat,
            lng,
            address: address || `Lat: ${lat}, Lng: ${lng}`
        },
        status: status || tracking.status,
        notes: notes || 'Location updated'
    });

    await tracking.save();

    // Update order status if delivered
    if (status === 'Delivered') {
        const order = await ProcurementOrder.findById(tracking.order);
        if (order) {
            order.status = 'Delivered';
            order.actual_delivery_date = new Date();
            await order.save();
        }
    }

    res.status(200).json(tracking);
});

// @desc    Start tracking (simulate movement)
// @route   POST /api/tracking/:trackingId/start
// @access  Private
const startTracking = asyncHandler(async (req, res) => {
    const { trackingId } = req.params;

    const tracking = await MaterialTracking.findOne({ tracking_id: trackingId });
    if (!tracking) {
        res.status(404);
        throw new Error('Tracking not found');
    }

    // Verify user owns the project
    const project = await Project.findById(tracking.project);
    if (project.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('User not authorized');
    }

    // Update status to In Transit
    tracking.status = 'In Transit';
    tracking.speed_kmh = 60; // Average speed

    // Add to history
    tracking.tracking_history.push({
        timestamp: new Date(),
        location: tracking.current_location,
        status: 'In Transit',
        notes: 'Shipment started'
    });

    await tracking.save();

    // Update order status
    const order = await ProcurementOrder.findById(tracking.order);
    if (order) {
        order.status = 'In Transit';
        await order.save();
    }

    res.status(200).json(tracking);
});

// Helper function to calculate distance
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
    getTrackingByOrder,
    getTrackingByTrackingId,
    getTrackingByProject,
    getActiveTrackings,
    updateTrackingLocation,
    startTracking
};
