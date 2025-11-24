import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#14b8a6', '#f59e0b', '#ef4444'];

export default function CarbonBreakdownChart({ data }) {
    const chartData = data || [
        { name: 'Sourcing', value: 40 },
        { name: 'Transport', value: 30 },
        { name: 'Storage', value: 20 },
        { name: 'Waste', value: 10 },
    ];

    return (
        <Card className="bg-white border-slate-200">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Carbon Footprint Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}