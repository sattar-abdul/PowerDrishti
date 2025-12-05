import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Navigation, PlayCircle, StopCircle, Truck, Package, Calendar } from "lucide-react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from "@/context/AuthContext";
import { LOCAL_URL } from "@/api/api.js";

// Custom Pin Icon
const pinIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#ef4444" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
    </svg>
  `),
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

// Truck Icon
const truckIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="1" y="3" width="15" height="13"></rect>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
      <circle cx="5.5" cy="18.5" r="2.5" fill="#3b82f6"></circle>
      <circle cx="18.5" cy="18.5" r="2.5" fill="#3b82f6"></circle>
    </svg>
  `),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

// Component to invalidate map size when container changes
function MapResizer() {
    const map = useMap();
    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            map.invalidateSize();
        });
        const container = map.getContainer();
        resizeObserver.observe(container);
        return () => {
            resizeObserver.disconnect();
        };
    }, [map]);
    return null;
}

// Component to fit bounds to route
function RouteFitter({ source, destination, route }) {
    const map = useMap();
    useEffect(() => {
        if (route && route.length > 0) {
            const bounds = L.latLngBounds(route);
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (source && destination) {
            const bounds = L.latLngBounds([source, destination]);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [source, destination, route, map]);
    return null;
}

export default function MaterialTracking() {
    const [searchParams] = useSearchParams();
    const { token } = useAuth();
    const [activeOrders, setActiveOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [trackingData, setTrackingData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isTracking, setIsTracking] = useState(false);
    const [progress, setProgress] = useState(0);

    // Animation ref
    const requestRef = useRef();
    const startTimeRef = useRef();
    const duration = 60000; // 60 seconds for simulation

    useEffect(() => {
        fetchActiveOrders();

        // Check if tracking ID is in URL
        const trackingId = searchParams.get('trackingId');
        if (trackingId) {
            fetchTrackingByTrackingId(trackingId);
        }
    }, []);

    const fetchActiveOrders = async () => {
        try {
            const response = await fetch(`${LOCAL_URL}/api/tracking/active`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setActiveOrders(data);
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Failed to fetch active orders", error);
            setIsLoading(false);
        }
    };

    const fetchTrackingByTrackingId = async (trackingId) => {
        try {
            const response = await fetch(`${LOCAL_URL}/api/tracking/${trackingId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setTrackingData(data);
                setSelectedOrder(data.order?._id);
            }
        } catch (error) {
            console.error("Failed to fetch tracking data", error);
        }
    };

    const handleOrderSelect = async (orderId) => {
        setSelectedOrder(orderId);
        try {
            const response = await fetch(`${LOCAL_URL}/api/tracking/order/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setTrackingData(data);
            }
        } catch (error) {
            console.error("Failed to fetch tracking data", error);
        }
    };

    const handleStartTracking = async () => {
        if (!trackingData) {
            alert("Please select an order to track");
            return;
        }

        try {
            const response = await fetch(`${LOCAL_URL}/api/tracking/${trackingData.tracking_id}/start`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTrackingData(data);
                setIsTracking(true);
                setProgress(0);

                startTimeRef.current = Date.now();
                requestRef.current = requestAnimationFrame(animate);
            }
        } catch (error) {
            console.error("Failed to start tracking", error);
            alert("Failed to start tracking");
        }
    };

    const handleStopTracking = () => {
        setIsTracking(false);
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
        setProgress(0);
    };

    const animate = () => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        const newProgress = Math.min(elapsed / duration, 1);

        setProgress(newProgress * 100);

        if (newProgress < 1) {
            // Calculate intermediate position
            const source = trackingData.source_location;
            const dest = trackingData.destination_location;
            const lat = source.lat + (dest.lat - source.lat) * newProgress;
            const lng = source.lng + (dest.lng - source.lng) * newProgress;

            // Update tracking location
            updateTrackingLocation(lat, lng, newProgress);

            requestRef.current = requestAnimationFrame(animate);
        } else {
            // Reached destination
            updateTrackingLocation(
                trackingData.destination_location.lat,
                trackingData.destination_location.lng,
                1,
                'Delivered'
            );
            setIsTracking(false);
        }
    };

    const updateTrackingLocation = async (lat, lng, progress, status = null) => {
        try {
            const response = await fetch(`${LOCAL_URL}/api/tracking/${trackingData.tracking_id}/location`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    lat,
                    lng,
                    status: status || (progress >= 1 ? 'Delivered' : 'In Transit'),
                    speed_kmh: 60,
                    notes: `Progress: ${(progress * 100).toFixed(0)}%`
                })
            });

            if (response.ok) {
                const data = await response.json();
                setTrackingData(data);
            }
        } catch (error) {
            console.error("Failed to update location", error);
        }
    };

    useEffect(() => {
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            case 'In Transit':
                return 'bg-blue-100 text-blue-800';
            case 'Delayed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="bg-[#f5f8fd] p-6 md:p-8 space-y-6 min-h-screen">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Live Material Tracking</h1>
                <p className="text-slate-500 mt-1">Monitor real-time shipment status and location</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-white border-slate-200 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Navigation className="w-5 h-5 text-blue-600" />
                            Tracking Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="order">Select Order</Label>
                            <Select value={selectedOrder} onValueChange={handleOrderSelect} disabled={isTracking}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an Order" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeOrders.length > 0 ? (
                                        activeOrders.map(tracking => (
                                            <SelectItem key={tracking._id} value={tracking.order._id}>
                                                {tracking.order.material_name} - {tracking.tracking_id}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>No active orders</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {trackingData && (
                            <>
                                <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Material:</span>
                                        <span className="font-medium text-slate-900">{trackingData.order?.material_name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Quantity:</span>
                                        <span className="font-medium text-slate-900">{trackingData.order?.quantity} {trackingData.order?.unit}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Tracking ID:</span>
                                        <span className="font-mono text-xs text-slate-900">{trackingData.tracking_id}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Status:</span>
                                        <Badge className={getStatusColor(trackingData.status)}>{trackingData.status}</Badge>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Distance:</span>
                                        <span className="font-medium text-slate-900">{trackingData.distance_km} km</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Covered:</span>
                                        <span className="font-medium text-slate-900">{trackingData.distance_covered_km} km</span>
                                    </div>
                                    {trackingData.eta && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">ETA:</span>
                                            <span className="font-medium text-slate-900">{new Date(trackingData.eta).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>

                                {!isTracking ? (
                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                        onClick={handleStartTracking}
                                        disabled={trackingData.status === 'Delivered'}
                                    >
                                        <PlayCircle className="w-4 h-4 mr-2" />
                                        Start Tracking
                                    </Button>
                                ) : (
                                    <Button className="w-full bg-red-600 hover:bg-red-700" onClick={handleStopTracking}>
                                        <StopCircle className="w-4 h-4 mr-2" />
                                        Stop Tracking
                                    </Button>
                                )}

                                {isTracking && (
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Progress:</span>
                                            <span className="font-medium text-slate-900">{Math.round(progress)}%</span>
                                        </div>
                                        <div className="w-full bg-blue-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Speed:</span>
                                            <span className="font-medium text-slate-900">{trackingData.speed_kmh || 60} km/h</span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 bg-white border-slate-200 overflow-hidden flex flex-col">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <MapPin className="w-5 h-5 text-green-600" />
                                Live Map View
                            </CardTitle>
                            {isTracking && (
                                <div className="flex items-center gap-2 text-sm text-slate-500 animate-pulse">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    Live Updates
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <div className="flex-1 min-h-[500px] relative">
                        <MapContainer
                            center={[20.5937, 78.9629]}
                            zoom={5}
                            style={{ height: '100%', width: '100%', position: 'absolute' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            />
                            <MapResizer />

                            {trackingData && (
                                <>
                                    {/* Source Marker */}
                                    <Marker position={[trackingData.source_location.lat, trackingData.source_location.lng]} icon={pinIcon}>
                                        <Popup>
                                            <div className="text-sm">
                                                <p className="font-bold">Source</p>
                                                <p>{trackingData.source_location.address}</p>
                                            </div>
                                        </Popup>
                                    </Marker>

                                    {/* Destination Marker */}
                                    <Marker position={[trackingData.destination_location.lat, trackingData.destination_location.lng]} icon={pinIcon}>
                                        <Popup>
                                            <div className="text-sm">
                                                <p className="font-bold">Destination</p>
                                                <p>{trackingData.destination_location.address}</p>
                                            </div>
                                        </Popup>
                                    </Marker>

                                    {/* Current Location (Truck) */}
                                    {trackingData.current_location && (
                                        <Marker position={[trackingData.current_location.lat, trackingData.current_location.lng]} icon={truckIcon}>
                                            <Popup>
                                                <div className="text-sm">
                                                    <p className="font-bold">Tracking ID: {trackingData.tracking_id}</p>
                                                    <p>Status: {trackingData.status}</p>
                                                    <p>Speed: {trackingData.speed_kmh || 60} km/h</p>
                                                    <p>Material: {trackingData.order?.material_name}</p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    )}

                                    {/* Route Line */}
                                    <Polyline
                                        positions={[
                                            [trackingData.source_location.lat, trackingData.source_location.lng],
                                            [trackingData.destination_location.lat, trackingData.destination_location.lng]
                                        ]}
                                        color="#3b82f6"
                                        weight={4}
                                        opacity={0.6}
                                        dashArray="10, 10"
                                    />

                                    <RouteFitter
                                        source={[trackingData.source_location.lat, trackingData.source_location.lng]}
                                        destination={[trackingData.destination_location.lat, trackingData.destination_location.lng]}
                                        route={null}
                                    />
                                </>
                            )}
                        </MapContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
}