import React, { useState, useEffect } from "react";
import { LineChart, Package, Leaf, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import StatsCard from "../components/dashboard/StatsCard";
import DemandTrendChart from "../components/dashboard/DemandTrendChart";
import CarbonBreakdownChart from "../components/dashboard/CarbonBreakdownChart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dummyProjects, dummyMaterials, dummyCarbonData } from "@/lib/mockData";

export default function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [carbonData, setCarbonData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setProjects(dummyProjects);
            setMaterials(dummyMaterials);
            setCarbonData(dummyCarbonData);
            setIsLoading(false);
        }, 500);
    };

    const totalCarbon = carbonData.reduce((sum, item) => sum + (item.emissions_kg || 0), 0);
    const inTransitMaterials = materials.filter(m => m.status === 'In Transit').length;
    const activeProjects = projects.filter(p => p.status !== 'Completed').length;

    return (
        <div className="p-6 md:p-8 space-y-6 bg-[#f5f8fd]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Supply Chain Dashboard</h1>
                    <p className="text-slate-500 mt-1">Real-time insights for POWERGRID operations</p>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-300 px-4 py-2">
                    <Leaf className="w-4 h-4 mr-2" />
                    Sustainability Mode Active
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <StatsCard
                    title="Carbon Emissions"
                    value={`${(totalCarbon / 1000).toFixed(1)}T`}
                    subtitle="Total CO2 this month"
                    icon={Leaf}
                    trend="15% reduction"
                    trendUp={false}
                />
                <StatsCard
                    title="Forecast Accuracy"
                    value="94.2%"
                    subtitle="ML prediction confidence"
                    icon={TrendingUp}
                    trend="2% improvement"
                    trendUp={true}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DemandTrendChart />
                <CarbonBreakdownChart />
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
                                {projects.map((project) => (
                                    <div key={project.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                        <div>
                                            <p className="font-medium text-slate-900">{project.project_name}</p>
                                            <p className="text-sm text-slate-500">{project.location} • ₹{(project.budget / 10000000).toFixed(1)}Cr</p>
                                        </div>
                                        <Badge variant="outline" className={
                                            project.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-300' :
                                                project.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                                                    'bg-yellow-50 text-yellow-700 border-yellow-300'
                                        }>
                                            {project.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-900">System Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-yellow-900 text-sm">High carbon footprint detected</p>
                                    <p className="text-xs text-yellow-700 mt-1">Consider switching to eco-friendly suppliers</p>
                                </div>
                            </div>
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
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}