import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DemandTrendChart({ data }) {
    const chartData = data || [
        { month: 'Jan', steel: 4000, insulators: 2400, conductors: 2400 },
        { month: 'Feb', steel: 3000, insulators: 1398, conductors: 2210 },
        { month: 'Mar', steel: 2000, insulators: 9800, conductors: 2290 },
        { month: 'Apr', steel: 2780, insulators: 3908, conductors: 2000 },
        { month: 'May', steel: 1890, insulators: 4800, conductors: 2181 },
        { month: 'Jun', steel: 2390, insulators: 3800, conductors: 2500 },
    ];

    return (
        <Card className="bg-white border-slate-200">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">Material Demand Trends</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="steel" stroke="#3b82f6" strokeWidth={2} name="Steel (tons)" />
                        <Line type="monotone" dataKey="insulators" stroke="#14b8a6" strokeWidth={2} name="Insulators (units)" />
                        <Line type="monotone" dataKey="conductors" stroke="#8b5cf6" strokeWidth={2} name="Conductors (km)" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}