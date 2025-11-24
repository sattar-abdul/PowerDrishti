import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ReportProcurement() {
    const recommendations = [
        { material: 'Steel', quantity: 1500, timeline: '2 weeks', cost: '₹18.5 Cr', supplier: 'Tata Steel', score: 9.2, savings: '₹2.1 Cr' },
        { material: 'Conductors', quantity: 300, timeline: '3 weeks', cost: '₹4.2 Cr', supplier: 'Sterlite Power', score: 8.9, savings: '₹0.8 Cr' },
        { material: 'Insulators', quantity: 800, timeline: '10 days', cost: '₹1.9 Cr', supplier: 'NGK Insulators', score: 9.5, savings: '₹0.3 Cr' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Procurement Recommendations</h2>
                    <p className="text-slate-500 mt-1">AI-optimized buying decisions</p>
                </div>
                <Button size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-blue-700">Total Procurement Value</p>
                        <p className="text-2xl font-bold text-blue-900">₹24.6 Cr</p>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-700">Potential Savings</p>
                        <p className="text-2xl font-bold text-green-900">₹3.2 Cr</p>
                    </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-purple-700">Avg Supplier Score</p>
                        <p className="text-2xl font-bold text-purple-900">9.2/10</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recommended Purchases</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recommendations.map((rec, index) => (
                            <div key={index} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900">{rec.material}</h3>
                                        <p className="text-sm text-slate-500">Qty: {rec.quantity.toLocaleString()} units</p>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800 border-green-300">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Recommended
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500">Cost</p>
                                        <p className="font-semibold">{rec.cost}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Timeline</p>
                                        <p className="font-semibold">{rec.timeline}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Supplier</p>
                                        <p className="font-semibold">{rec.supplier}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Score</p>
                                        <p className="font-semibold text-green-600">{rec.score}/10</p>
                                    </div>
                                </div>
                                <div className="mt-3 p-2 bg-green-50 rounded text-sm text-green-800">
                                    <strong>Cost Benefit:</strong> Save {rec.savings} vs. next best option
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}