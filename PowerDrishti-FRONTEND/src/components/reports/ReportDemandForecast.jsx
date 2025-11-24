import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ReportDemandForecast() {
    const data = [
        { material: 'Steel', predicted: 4500, actual: 4200, variance: -6.7 },
        { material: 'Insulators', predicted: 3200, actual: 3400, variance: 6.3 },
        { material: 'Conductors', predicted: 2800, actual: 2750, variance: -1.8 },
        { material: 'Transformers', predicted: 150, actual: 155, variance: 3.3 },
    ];

    const insights = [
        "Steel demand trending 7% below forecast - consider adjusting procurement",
        "Insulator usage exceeded predictions - potential project scope expansion",
        "Overall forecast accuracy: 94.5% (above target of 90%)",
        "Recommend increasing safety stock for insulators by 10%"
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Demand Forecast Analysis</h2>
                    <p className="text-slate-500 mt-1">ML predictions vs. actual consumption</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                    <Button size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Predicted vs. Actual Demand</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="material" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="predicted" fill="#3b82f6" name="Predicted" />
                            <Bar dataKey="actual" fill="#14b8a6" name="Actual" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Variance Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4">Material</th>
                                    <th className="text-right py-3 px-4">Predicted</th>
                                    <th className="text-right py-3 px-4">Actual</th>
                                    <th className="text-right py-3 px-4">Variance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row) => (
                                    <tr key={row.material} className="border-b hover:bg-slate-50">
                                        <td className="py-3 px-4 font-medium">{row.material}</td>
                                        <td className="text-right py-3 px-4">{row.predicted.toLocaleString()}</td>
                                        <td className="text-right py-3 px-4">{row.actual.toLocaleString()}</td>
                                        <td className="text-right py-3 px-4">
                                            <Badge variant={row.variance < 0 ? "destructive" : "default"}>
                                                {row.variance > 0 ? '+' : ''}{row.variance}%
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-blue-900">AI-Generated Insights</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {insights.map((insight, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="text-blue-600 font-bold">•</span>
                                <span className="text-slate-700">{insight}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}