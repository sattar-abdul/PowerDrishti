import React, { useState, useEffect, useRef } from "react";
import { LineChart, Package, Leaf, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import StatsCard from "../components/dashboard/StatsCard";
import DemandTrendChart from "../components/dashboard/DemandTrendChart";
import CarbonBreakdownChart from "../components/dashboard/CarbonBreakdownChart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import HighPriorityMaterialCard from "@/components/dashboard/HighPriorityMaterialCard";
import SideNotificationToast from "@/components/dashboard/SideNotificationToast";
import MaterialOrderSidebar from "@/components/dashboard/MaterialOrderSidebar";
import { LOCAL_URL } from "@/api/api";
import { dummyMaterials, dummyCarbonData } from "@/lib/mockData";

export default function Dashboard() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [highPriorityMaterials, setHighPriorityMaterials] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [carbonData, setCarbonData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showNotification, setShowNotification] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const notificationIntervalRef = useRef(null);
    const materialsRef = useRef(null);

    useEffect(() => {
        loadDashboardData();

        // Set up notification interval (every 5 seconds)
        notificationIntervalRef.current = setInterval(() => {
            if (highPriorityMaterials.length > 0) {
                setShowNotification(true);
            }
        }, 5000); // 5 seconds

        return () => {
            if (notificationIntervalRef.current) {
                clearInterval(notificationIntervalRef.current);
            }
        };
    }, [highPriorityMaterials.length]);

    const loadDashboardData = async () => {
        setIsLoading(true);
        try {
            // Fetch real projects
            await fetchProjects();
            // Fetch high-priority materials
            await fetchHighPriorityMaterials();
            // Use dummy data for materials and carbon for now
            setMaterials(dummyMaterials);
            setCarbonData(dummyCarbonData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await fetch(`${LOCAL_URL}/api/projects`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            setProjects([]);
        }
    };

    const fetchHighPriorityMaterials = async () => {
        try {
            const response = await fetch(`${LOCAL_URL}/api/procurement/high-priority`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setHighPriorityMaterials(data);
            }
        } catch (error) {
            console.error('Error fetching high-priority materials:', error);
            setHighPriorityMaterials([]);
        }
    };

    const handleNotificationClick = () => {
        setShowNotification(false);
        setShowSidebar(true);
    };

    const handleProjectClick = (projectId) => {
        // Navigate to monthly prediction page
        navigate(`/monthly/${projectId}`);
    };

    const handleOrderMaterial = async (material) => {
        // Navigate to material tracking page for ordering
        navigate(`/material-tracking?projectId=${material.project._id}&materialId=${material.material_id}&materialName=${encodeURIComponent(material.material_name)}&quantity=${material.quantity}&unit=${material.unit}&monthNumber=${material.month_number || 1}`);
    };

    const scrollToMaterials = () => {
        materialsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const totalCarbon = carbonData.reduce((sum, item) => sum + (item.emissions_kg || 0), 0);
    const inTransitMaterials = materials.filter(m => m.status === 'In Transit').length;
    const activeProjects = projects.filter(p => p.status !== 'Completed').length;

    return (
        <div className="p-6 md:p-8 space-y-6 bg-[#f5f8fd]">
            {/* Side Notification Toast */}
            {showNotification && (
                <SideNotificationToast
                    materialCount={highPriorityMaterials.length}
                    onClose={() => setShowNotification(false)}
                    onClick={handleNotificationClick}
                />
            )}

            {/* Material Order Sidebar */}
            <MaterialOrderSidebar
                materials={highPriorityMaterials}
                isOpen={showSidebar}
                onClose={() => setShowSidebar(false)}
                onOrderMaterial={handleOrderMaterial}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Project Management Dashboard</h1>
                    <p className="text-slate-500 mt-1">Real-time insights for POWERGRID operations</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                <StatsCard
                    title="Active Projects"
                    value={activeProjects}
                    subtitle={`${projects.length} total projects`}
                    icon={LineChart}
                    trend="12% from last month"
                    trendUp={true}
                />
                <StatsCard
                    title="Materials in Transit"
                    value={inTransitMaterials}
                    subtitle={`${materials.length} total materials`}
                    icon={Package}
                    trend="8% on schedule"
                    trendUp={true}
                />
                {/* <StatsCard
                    title="Carbon Emissions"
                    value={`${(totalCarbon / 1000).toFixed(1)}T`}
                    subtitle="Total CO2 this month"
                    icon={Leaf}
                    trend="15% reduction"
                    trendUp={false}
                /> */}
                <StatsCard
                    title="High Priority Items"
                    value={highPriorityMaterials.length}
                    subtitle="Materials need ordering"
                    icon={AlertTriangle}
                    trend="Immediate attention"
                    trendUp={false}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DemandTrendChart />
                <Card className="bg-white border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-900">System Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {highPriorityMaterials.length > 0 && (
                                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-red-900 text-sm">High priority materials pending</p>
                                        <p className="text-xs text-red-700 mt-1">
                                            {highPriorityMaterials.length} material{highPriorityMaterials.length !== 1 ? 's' : ''} need immediate ordering
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-green-900 text-sm">Forecast accuracy improved</p>
                                    <p className="text-xs text-green-700 mt-1">ML model updated with latest data</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-blue-900 text-sm">Material delivery on schedule</p>
                                    <p className="text-xs text-blue-700 mt-1">All shipments tracking normally</p>
                                </div>
                            </div>
                        </div >
                    </CardContent >
                </Card >
                {/* <CarbonBreakdownChart /> */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-900">Recent Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {projects.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">No projects yet. Create your first forecast!</p>
                        ) : (
                            <div className="space-y-3">
                                {projects.slice(25,28).map((project) => (
                                    <div
                                        key={project._id}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                                        onClick={() => handleProjectClick(project._id)}
                                    >
                                        <div>
                                            <p className="font-medium text-slate-900">{project.project_name}</p>
                                            <p className="text-sm text-slate-500">
                                                {project.district}, {project.state_region} • ₹{(project.total_budget / 10000000).toFixed(1)}Cr
                                            </p>
                                        </div>
                                        <Badge variant="outline" className={
                                            project.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-300' :
                                                project.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                                                    'bg-yellow-50 text-yellow-700 border-yellow-300'
                                        }>
                                            {project.current_phase?.split(' - ')[0] || 'Phase 1'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* <Card className="bg-white border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-900">System Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {highPriorityMaterials.length > 0 && (
                                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-red-900 text-sm">High priority materials pending</p>
                                        <p className="text-xs text-red-700 mt-1">
                                            {highPriorityMaterials.length} material{highPriorityMaterials.length !== 1 ? 's' : ''} need immediate ordering
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-green-900 text-sm">Forecast accuracy improved</p>
                                    <p className="text-xs text-green-700 mt-1">ML model updated with latest data</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-blue-900 text-sm">Material delivery on schedule</p>
                                    <p className="text-xs text-blue-700 mt-1">All shipments tracking normally</p>
                                </div>
                            </div>
                        </div >
                    </CardContent >
                </Card > */}
            </div >

            {/* High Priority Materials Section */}
            {
                highPriorityMaterials.length > 0 && (
                    <div ref={materialsRef}>
                        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                                            High Priority Materials
                                        </CardTitle>
                                        <p className="text-sm text-slate-600 mt-1">
                                            Materials requiring immediate ordering across all projects
                                        </p>
                                    </div>
                                    <Badge className="bg-red-100 text-red-700 border-red-300">
                                        {highPriorityMaterials.length} Items
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {highPriorityMaterials.map((material) => (
                                        <HighPriorityMaterialCard
                                            key={material._id}
                                            material={material}
                                            onOrder={handleOrderMaterial}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
            }
        </div >
    );
}