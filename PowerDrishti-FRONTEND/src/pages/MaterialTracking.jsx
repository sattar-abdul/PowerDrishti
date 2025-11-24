import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Package, Clock, TrendingUp, Leaf, RefreshCw, Truck } from "lucide-react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { truckIcon, deliveredIcon, delayedIcon, pendingIcon, trackingMaterials } from "@/lib/mockData";

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

export default function MaterialTracking() {
    const [materials, setMaterials] = useState([]);
    const [filteredMaterials, setFilteredMaterials] = useState([]);
    const [selectedProject, setSelectedProject] = useState("all");
    const [isLoading, setIsLoading] = useState(true);
    const [mapCenter] = useState([20.5937, 78.9629]); // India center

    useEffect(() => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setMaterials(trackingMaterials);
            setIsLoading(false);
        }, 500);
    }, []);

    useEffect(() => {
        if (selectedProject === "all") {
            setFilteredMaterials(materials);
        } else {
            setFilteredMaterials(materials.filter(m => m.project_id === selectedProject));
        }
    }, [selectedProject, materials]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-800 border-green-300';
            case 'In Transit': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Delayed': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        }
    };

    const getMarkerIcon = (status) => {
        switch (status) {
            case 'Delivered': return deliveredIcon;
            case 'In Transit': return truckIcon;
            case 'Delayed': return delayedIcon;
            default: return pendingIcon;
        }
    };

    const totalCarbonEnRoute = filteredMaterials
        .filter(m => m.status === 'In Transit')
        .reduce((sum, m) => sum + (m.carbon_emissions || 0), 0);

    return (
        <div className=" bg-[#f5f8fd] p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Material Tracking</h1>
                    <p className="text-slate-500 mt-1">Real-time shipment monitoring with carbon tracking</p>
                </div>
                <div className="flex gap-3">
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by project" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Projects</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Truck className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-slate-600">In Transit</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">
                            {filteredMaterials.filter(m => m.status === 'In Transit').length}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Package className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-slate-600">Delivered</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">
                            {filteredMaterials.filter(m => m.status === 'Delivered').length}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-slate-600">Delayed</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">
                            {filteredMaterials.filter(m => m.status === 'Delayed').length}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-teal-50 border-teal-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Leaf className="w-4 h-4 text-teal-600" />
                            <span className="text-sm font-medium text-slate-600">En-route CO₂</span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">
                            {(totalCarbonEnRoute / 1000).toFixed(1)}T
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white border-slate-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        Live Tracking Map
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[500px] rounded-lg overflow-hidden border border-slate-200">
                        <MapContainer
                            center={mapCenter}
                            zoom={5}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={true}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            />
                            <MapResizer />
                            {filteredMaterials.map((material) => {
                                if (material.current_location?.lat && material.current_location?.lng) {
                                    return (
                                        <Marker
                                            key={material.id}
                                            position={[material.current_location.lat, material.current_location.lng]}
                                            icon={getMarkerIcon(material.status)}
                                        >
                                            <Popup>
                                                <div className="p-2 min-w-[200px]">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Truck className="w-4 h-4 text-blue-600" />
                                                        <p className="font-semibold text-slate-900">{material.material_type}</p>
                                                    </div>
                                                    <div className="space-y-1 text-sm">
                                                        <p className="text-slate-700">
                                                            <strong>Quantity:</strong> {material.quantity} {material.unit}
                                                        </p>
                                                        <p className="text-slate-700">
                                                            <strong>Status:</strong> <Badge variant="outline" className={getStatusColor(material.status)} size="sm">{material.status}</Badge>
                                                        </p>
                                                        {material.eta && (
                                                            <p className="text-slate-700">
                                                                <strong>ETA:</strong> {new Date(material.eta).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                        <p className="text-green-600">
                                                            <strong>CO₂:</strong> {material.carbon_emissions || 0}kg
                                                        </p>
                                                        {material.current_location?.address && (
                                                            <p className="text-slate-600 text-xs mt-2">
                                                                📍 {material.current_location.address}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    );
                                }
                                return null;
                            })}
                        </MapContainer>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 flex items-center justify-center">
                                <Truck className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="text-slate-600">In Transit</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 flex items-center justify-center">
                                <Truck className="w-6 h-6 text-green-600" />
                            </div>
                            <span className="text-slate-600">Delivered</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 flex items-center justify-center">
                                <Truck className="w-6 h-6 text-red-600" />
                            </div>
                            <span className="text-slate-600">Delayed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 flex items-center justify-center">
                                <Truck className="w-6 h-6 text-yellow-600" />
                            </div>
                            <span className="text-slate-600">Pending</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
                <CardHeader>
                    <CardTitle>Shipment Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Material</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Quantity</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Location</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">ETA</th>
                                    <th className="text-right py-3 px-4 font-semibold text-slate-700">CO₂</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMaterials.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-slate-500">
                                            No materials being tracked yet
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMaterials.map((material) => (
                                        <tr key={material.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Truck className={`w-4 h-4 ${material.status === 'Delivered' ? 'text-green-600' :
                                                        material.status === 'In Transit' ? 'text-blue-600' :
                                                            material.status === 'Delayed' ? 'text-red-600' :
                                                                'text-yellow-600'
                                                        }`} />
                                                    <span className="font-medium text-slate-900">{material.material_type}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-slate-700">
                                                {material.quantity} {material.unit}
                                            </td>
                                            <td className="py-3 px-4 text-slate-700 text-sm">
                                                {material.current_location?.address || 'N/A'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline" className={getStatusColor(material.status)}>
                                                    {material.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-slate-700 text-sm">
                                                {material.eta ? new Date(material.eta).toLocaleDateString() : 'TBD'}
                                            </td>
                                            <td className="text-right py-3 px-4 text-sm text-green-600 font-medium">
                                                {material.carbon_emissions || 0}kg
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}