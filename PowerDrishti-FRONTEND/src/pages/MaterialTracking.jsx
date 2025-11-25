import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Navigation, PlayCircle, StopCircle, Truck } from "lucide-react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { truckIcon } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";

// Indian Cities Coordinates
const CITIES = {
    "Delhi": [28.6139, 77.2090],
    "Mumbai": [19.0760, 72.8777],
    "Bangalore": [12.9716, 77.5946],
    "Chennai": [13.0827, 80.2707],
    "Kolkata": [22.5726, 88.3639],
    "Hyderabad": [17.3850, 78.4867],
    "Pune": [18.5204, 73.8567],
    "Ahmedabad": [23.0225, 72.5714],
    "Jaipur": [26.9124, 75.7873],
    "Lucknow": [26.8467, 80.9462],
    "Chandigarh": [30.7333, 76.7794],
    "Bhopal": [23.2599, 77.4126]
};

// Detailed Mumbai-Pune Expressway Route
const MUMBAI_PUNE_ROUTE = [
    [19.025770, 73.101570],   // Kalamboli (start of M–P Expressway)
    [19.015000, 73.110000],
    [19.000000, 73.115000],
    [18.990713, 73.116844],   // Panvel
    [18.950000, 73.150000],
    [18.900000, 73.200000],
    [18.834003, 73.288712],   // Khalapur
    [18.810000, 73.290000],
    [18.792609, 73.295589],   // mid-expressway
    [18.770000, 73.340000],
    [18.750000, 73.383000],   // Khandala
    [18.748060, 73.407219],   // Lonavala
    [18.740000, 73.450000],
    [18.735000, 73.540000],   // between Lonavala and Talegaon
    [18.733000, 73.600000],
    [18.732103, 73.676376],   // Talegaon Dabhade
    [18.700000, 73.700000],
    [18.659077, 73.721300],   // Kiwale
    [18.652252, 73.741905],   // Ravet
    [18.600000, 73.780000],
    [18.550000, 73.820000],
    [18.520430, 73.856744]    // Pune
];

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
        if (route) {
            const bounds = L.latLngBounds(route);
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (source && destination) {
            const bounds = L.latLngBounds([source, destination]);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [source, destination, route, map]);
    return null;
}

// Helper to get position along a polyline
function getPositionAlongRoute(route, progress) {
    if (!route || route.length < 2) return route[0];

    const totalPoints = route.length - 1;
    const exactIndex = progress * totalPoints;
    const index = Math.floor(exactIndex);
    const nextIndex = Math.min(index + 1, totalPoints);
    const segmentProgress = exactIndex - index;

    const start = route[index];
    const end = route[nextIndex];

    const lat = start[0] + (end[0] - start[0]) * segmentProgress;
    const lng = start[1] + (end[1] - start[1]) * segmentProgress;

    return [lat, lng];
}

export default function MaterialTracking() {
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [sourceCity, setSourceCity] = useState("");
    const [destinationCity, setDestinationCity] = useState("");
    const [isTracking, setIsTracking] = useState(false);
    const [progress, setProgress] = useState(0);
    const [truckPosition, setTruckPosition] = useState(null);
    const [eta, setEta] = useState(null);
    const { token } = useAuth();

    // Animation ref
    const requestRef = useRef();
    const startTimeRef = useRef();
    const duration = 60000; // 60 seconds

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/projects', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setProjects(data);
                }
            } catch (error) {
                console.error("Failed to fetch projects", error);
            }
        };

        if (token) {
            fetchProjects();
        }
    }, [token]);

    const handleStartTracking = () => {
        if (!selectedProjectId || !sourceCity || !destinationCity) {
            alert("Please fill in all fields");
            return;
        }
        if (sourceCity === destinationCity) {
            alert("Source and Destination cannot be the same");
            return;
        }

        setIsTracking(true);
        setProgress(0);
        setTruckPosition(CITIES[sourceCity]);

        const mockEta = new Date();
        mockEta.setDate(mockEta.getDate() + 2);
        setEta(mockEta);

        startTimeRef.current = Date.now();
        requestRef.current = requestAnimationFrame(animate);
    };

    const handleStopTracking = () => {
        setIsTracking(false);
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
        setProgress(0);
        setTruckPosition(null);
        setEta(null);
    };

    const animate = () => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        const newProgress = Math.min(elapsed / duration, 1);

        setProgress(newProgress * 100);

        if (newProgress < 1) {
            let pos;
            if (sourceCity === "Mumbai" && destinationCity === "Pune") {
                pos = getPositionAlongRoute(MUMBAI_PUNE_ROUTE, newProgress);
            } else if (sourceCity === "Pune" && destinationCity === "Mumbai") {
                // Reverse route
                const reversedRoute = [...MUMBAI_PUNE_ROUTE].reverse();
                pos = getPositionAlongRoute(reversedRoute, newProgress);
            } else {
                // Linear interpolation
                const start = CITIES[sourceCity];
                const end = CITIES[destinationCity];
                const lat = start[0] + (end[0] - start[0]) * newProgress;
                const lng = start[1] + (end[1] - start[1]) * newProgress;
                pos = [lat, lng];
            }

            setTruckPosition(pos);
            requestRef.current = requestAnimationFrame(animate);
        } else {
            setTruckPosition(CITIES[destinationCity]);
            setIsTracking(false);
        }
    };

    useEffect(() => {
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, []);

    const getActiveRoute = () => {
        if (sourceCity === "Mumbai" && destinationCity === "Pune") return MUMBAI_PUNE_ROUTE;
        if (sourceCity === "Pune" && destinationCity === "Mumbai") return [...MUMBAI_PUNE_ROUTE].reverse();
        if (sourceCity && destinationCity) return [CITIES[sourceCity], CITIES[destinationCity]];
        return null;
    };

    return (
        <div className="bg-[#f5f8fd] p-6 md:p-8 space-y-6 min-h-screen">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Live Material Tracking</h1>
                <p className="text-slate-500 mt-1">Monitor project logistics and shipment status</p>
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
                            <Label htmlFor="project">Select Project</Label>
                            <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={isTracking}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a Project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.length > 0 ? (
                                        projects.map(project => (
                                            <SelectItem key={project._id} value={project._id}>
                                                {project.project_name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>No projects found</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Source Location</Label>
                            <Select value={sourceCity} onValueChange={setSourceCity} disabled={isTracking}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Source City" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(CITIES).map(city => (
                                        <SelectItem key={city} value={city}>{city}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Destination Location</Label>
                            <Select value={destinationCity} onValueChange={setDestinationCity} disabled={isTracking}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Destination City" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(CITIES).map(city => (
                                        <SelectItem key={city} value={city}>{city}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {!isTracking ? (
                            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleStartTracking}>
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
                                    <span className="text-slate-600">Status:</span>
                                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">In Transit</Badge>
                                </div>
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
                                    <span className="text-slate-600">ETA:</span>
                                    <span className="font-medium text-slate-900">{eta?.toLocaleDateString()}</span>
                                </div>
                            </div>
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

                            {sourceCity && (
                                <Marker position={CITIES[sourceCity]} icon={pinIcon}>
                                    <Popup>Source: {sourceCity}</Popup>
                                </Marker>
                            )}

                            {destinationCity && (
                                <Marker position={CITIES[destinationCity]} icon={pinIcon}>
                                    <Popup>Destination: {destinationCity}</Popup>
                                </Marker>
                            )}

                            {truckPosition && (
                                <Marker position={truckPosition} icon={truckIcon}>
                                    <Popup>
                                        <div className="text-sm">
                                            <p className="font-bold">Project ID: {selectedProjectId}</p>
                                            <p>Status: In Transit</p>
                                            <p>Speed: 65 km/h</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}

                            {sourceCity && destinationCity && isTracking && (
                                <>
                                    <Polyline
                                        positions={getActiveRoute()}
                                        color="#3b82f6"
                                        weight={4}
                                        opacity={0.6}
                                        dashArray="10, 10"
                                    />
                                    <RouteFitter source={CITIES[sourceCity]} destination={CITIES[destinationCity]} route={getActiveRoute()} />
                                </>
                            )}
                        </MapContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
}