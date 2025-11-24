import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Download, Clock } from "lucide-react";

export default function ReportHistoricalTrends() {
    const data = [
        { quarter: 'Q1 2023', demand: 15000, cost: 180, carbon: 95 },
        { quarter: 'Q2 2023', demand: 16500, cost: 195, carbon: 88 },
        { quarter: 'Q3 2023', demand: 18000, cost: 210, carbon: 82 },
        { quarter: 'Q4 2023', demand: 19200, cost: 220, carbon: 78 },
        { quarter: 'Q1 2024', demand: 20500, cost: 235, carbon: 72 },
        { quarter: 'Q2 2024', demand: 22000, cost: 248, carbon: 68 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Historical Trends Analysis</h2>
                    <p className="text-slate-500 mt-1">Long-term patterns and accuracy review</p>
                </div>
                <Button size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        Multi-Year Trends
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="quarter" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="demand" stroke="#3b82f6" strokeWidth={2} name="Material Demand (tons)" />
                            <Line yAxisId="left" type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={2} name="Cost (₹ Cr)" />
                            <Line yAxisId="right" type="monotone" dataKey="carbon" stroke="#10b981" strokeWidth={2} name="Carbon (tons)" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-blue-900">Key Patterns & Insights</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>Material demand growing at 8.5% CAGR - plan for increased capacity</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>Carbon emissions reduced by 28% year-over-year despite growth</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>ML forecast accuracy improved from 87% to 96% over 18 months</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>Q3 consistently shows peak demand - adjust procurement schedules</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}