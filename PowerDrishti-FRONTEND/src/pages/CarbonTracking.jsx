import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Leaf, TrendingDown, Lightbulb, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#3b82f6', '#14b8a6', '#f59e0b', '#ef4444'];

export default function CarbonTracking() {
    const [carbonData, setCarbonData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Commented out API call and replaced with dummy data
        /*
        loadCarbonData();
        */
        setIsLoading(true);
        setTimeout(() => {
            setCarbonData([
                { source: 'Sourcing', emissions_kg: 4000 },
                { source: 'Transport', emissions_kg: 3500 },
                { source: 'Storage', emissions_kg: 2500 },
                { source: 'Waste', emissions_kg: 1500 }
            ]);
            setIsLoading(false);
        }, 500);
    }, []);

    // Commented out API call and replaced with dummy function
    /*
    const loadCarbonData = async () => {
        setIsLoading(true);
        const data = await CarbonFootprint.list('-created_date');
        setCarbonData(data);
        setIsLoading(false);
    };
    */

    const pieData = [
        { name: 'Sourcing', value: carbonData.filter(d => d.source === 'Sourcing').reduce((sum, d) => sum + d.emissions_kg, 0) },
        { name: 'Transport', value: carbonData.filter(d => d.source === 'Transport').reduce((sum, d) => sum + d.emissions_kg, 0) },
        { name: 'Storage', value: carbonData.filter(d => d.source === 'Storage').reduce((sum, d) => sum + d.emissions_kg, 0) },
        { name: 'Waste', value: carbonData.filter(d => d.source === 'Waste').reduce((sum, d) => sum + d.emissions_kg, 0) },
    ];

    const totalEmissions = pieData.reduce((sum, item) => sum + item.value, 0);

    const trendData = [
        { month: 'Jan', emissions: 12000 },
        { month: 'Feb', emissions: 11500 },
        { month: 'Mar', emissions: 10800 },
        { month: 'Apr', emissions: 10200 },
        { month: 'May', emissions: 9500 },
        { month: 'Jun', emissions: 9000 },
    ];

    const suggestions = [
        {
            title: "Switch to Green Suppliers",
            description: "Identify and partner with suppliers using renewable energy",
            potential_reduction: "20%",
            impact: "high"
        },
        {
            title: "Optimize Transport Routes",
            description: "Use AI-powered route optimization to reduce fuel consumption",
            potential_reduction: "15%",
            impact: "medium"
        },
        {
            title: "Implement Solar at Godowns",
            description: "Install solar panels at storage facilities",
            potential_reduction: "30%",
            impact: "high"
        },
        {
            title: "Reduce Packaging Waste",
            description: "Switch to biodegradable and recyclable packaging materials",
            potential_reduction: "10%",
            impact: "low"
        }
    ];

    return (
        <div className="p-6 md:p-8 space-y-6 bg-[#f5f8fd]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Carbon Footprint Tracking</h1>
                    <p className="text-slate-500 mt-1">Monitor and optimize your supply chain emissions</p>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-300 px-4 py-2">
                    <Award className="w-4 h-4 mr-2" />
                    15% Reduction This Quarter
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Leaf className="w-6 h-6 text-green-600" />
                            <span className="text-sm font-medium text-slate-600">Total Emissions</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">
                            {(totalEmissions / 1000).toFixed(2)} tons
                        </p>
                        <p className="text-sm text-green-700 mt-1">CO₂ this month</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingDown className="w-6 h-6 text-blue-600" />
                            <span className="text-sm font-medium text-slate-600">Reduction Target</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">25%</p>
                        <p className="text-sm text-blue-700 mt-1">By end of year</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Lightbulb className="w-6 h-6 text-purple-600" />
                            <span className="text-sm font-medium text-slate-600">Potential Savings</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">
                            {((totalEmissions * 0.25) / 1000).toFixed(2)} tons
                        </p>
                        <p className="text-sm text-purple-700 mt-1">With optimizations</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white border-slate-200">
                    <CardHeader>
                        <CardTitle>Emissions by Source</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${(value / 1000).toFixed(2)} tons`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200">
                    <CardHeader>
                        <CardTitle>Historical Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="month" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip formatter={(value) => `${(value / 1000).toFixed(2)} tons`} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="emissions"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    name="CO₂ Emissions (kg)"
                                    dot={{ fill: '#10b981', r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white border-slate-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                        Reduction Suggestions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border-2 ${suggestion.impact === 'high'
                                    ? 'bg-green-50 border-green-300'
                                    : suggestion.impact === 'medium'
                                        ? 'bg-blue-50 border-blue-300'
                                        : 'bg-yellow-50 border-yellow-300'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-slate-900">{suggestion.title}</h4>
                                    <Badge
                                        variant="outline"
                                        className={
                                            suggestion.impact === 'high'
                                                ? 'bg-green-100 text-green-800 border-green-400'
                                                : suggestion.impact === 'medium'
                                                    ? 'bg-blue-100 text-blue-800 border-blue-400'
                                                    : 'bg-yellow-100 text-yellow-800 border-yellow-400'
                                        }
                                    >
                                        {suggestion.impact.toUpperCase()}
                                    </Badge>
                                </div>
                                <p className="text-sm text-slate-600 mb-3">{suggestion.description}</p>
                                <div className="flex items-center gap-2">
                                    <TrendingDown className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-700">
                                        Potential reduction: {suggestion.potential_reduction}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
                <CardHeader>
                    <CardTitle className="text-teal-900">Sustainability Benchmarks</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <span className="text-slate-700">Industry Average (per project)</span>
                            <span className="font-bold text-slate-900">18.5 tons CO₂</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <span className="text-slate-700">Your Average</span>
                            <span className="font-bold text-green-700">14.2 tons CO₂</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg border border-green-300">
                            <span className="text-green-900 font-medium">Better than industry by</span>
                            <span className="font-bold text-green-900 text-xl">23.2%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}