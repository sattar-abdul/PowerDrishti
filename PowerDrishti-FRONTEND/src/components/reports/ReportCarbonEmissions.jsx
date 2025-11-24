import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Button } from "@/components/ui/button";
import { Download, Leaf } from "lucide-react";

const COLORS = ['#3b82f6', '#14b8a6', '#f59e0b', '#ef4444'];

export default function ReportCarbonEmissions() {
    const data = [
        { name: 'Sourcing', value: 45000 },
        { name: 'Transport', value: 30000 },
        { name: 'Storage', value: 15000 },
        { name: 'Waste', value: 10000 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Carbon Emissions Report</h2>
                    <p className="text-slate-500 mt-1">Environmental impact analysis</p>
                </div>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Leaf className="w-5 h-5 text-green-600" />
                            <p className="text-sm text-green-700">Total Emissions</p>
                        </div>
                        <p className="text-2xl font-bold text-green-900">100 tons CO₂</p>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-blue-700">vs. Industry Avg</p>
                        <p className="text-2xl font-bold text-blue-900">-23%</p>
                    </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-purple-700">Reduction Target</p>
                        <p className="text-2xl font-bold text-purple-900">25 tons</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Emissions Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${(value / 1000).toFixed(2)} tons`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardHeader>
                    <CardTitle className="text-green-900">Reduction Simulations</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="p-3 bg-white rounded-lg border border-green-300">
                            <p className="font-semibold">Switch to Green Suppliers</p>
                            <p className="text-sm text-slate-600">Potential reduction: <strong className="text-green-600">20 tons (20%)</strong></p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-green-300">
                            <p className="font-semibold">Optimize Transport Routes</p>
                            <p className="text-sm text-slate-600">Potential reduction: <strong className="text-green-600">8 tons (8%)</strong></p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-green-300">
                            <p className="font-semibold">Solar-Powered Storage</p>
                            <p className="text-sm text-slate-600">Potential reduction: <strong className="text-green-600">12 tons (12%)</strong></p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}