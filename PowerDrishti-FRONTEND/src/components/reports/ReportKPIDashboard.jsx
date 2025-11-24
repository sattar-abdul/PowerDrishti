import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Download, TrendingUp } from "lucide-react";

export default function ReportKPIDashboard() {
    const trendData = [
        { month: 'Jan', delivery: 92, accuracy: 89, utilization: 78 },
        { month: 'Feb', delivery: 94, accuracy: 91, utilization: 82 },
        { month: 'Mar', delivery: 91, accuracy: 93, utilization: 85 },
        { month: 'Apr', delivery: 95, accuracy: 94, utilization: 88 },
        { month: 'May', delivery: 96, accuracy: 95, utilization: 90 },
        { month: 'Jun', delivery: 97, accuracy: 96, utilization: 92 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">KPI Dashboard</h2>
                    <p className="text-slate-500 mt-1">Key performance indicators</p>
                </div>
                <Button size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            <p className="text-sm text-blue-700">On-Time Delivery</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-900">97%</p>
                        <p className="text-xs text-blue-600 mt-1">+5% vs. last month</p>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-700 mb-2">Forecast Accuracy</p>
                        <p className="text-2xl font-bold text-green-900">96%</p>
                        <p className="text-xs text-green-600 mt-1">+2% improvement</p>
                    </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-purple-700 mb-2">Resource Utilization</p>
                        <p className="text-2xl font-bold text-purple-900">92%</p>
                        <p className="text-xs text-purple-600 mt-1">+7% increase</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="delivery" stroke="#3b82f6" strokeWidth={2} name="On-Time Delivery %" />
                            <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} name="Forecast Accuracy %" />
                            <Line type="monotone" dataKey="utilization" stroke="#8b5cf6" strokeWidth={2} name="Resource Utilization %" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}