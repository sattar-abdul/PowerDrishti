import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function ReportCostOverrun() {
    const data = [
        { project: 'North Grid', budget: 500, actual: 485, variance: -3 },
        { project: 'South Grid', budget: 650, actual: 690, variance: 6.2 },
        { project: 'East Grid', budget: 420, actual: 425, variance: 1.2 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Cost Overrun Analysis</h2>
                    <p className="text-slate-500 mt-1">Budget vs. actual spending</p>
                </div>
                <Button size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Budget vs. Actual (₹ Crores)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="project" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                            <Bar dataKey="actual" fill="#ef4444" name="Actual" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader>
                    <CardTitle className="text-yellow-900">Root Causes & Savings</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-yellow-600">•</span>
                            <span><strong>South Grid:</strong> Delayed material delivery added ₹40 Cr in logistics costs</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-yellow-600">•</span>
                            <span><strong>ML Prediction:</strong> Better demand forecasting could save ₹15 Cr annually</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}