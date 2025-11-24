import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ReportInventoryStatus() {
    const inventory = [
        { material: 'Steel', stock: 8500, demand: 10000, turnover: 2.3, status: 'Low' },
        { material: 'Insulators', stock: 5000, demand: 4000, turnover: 3.1, status: 'Optimal' },
        { material: 'Conductors', stock: 3200, demand: 3500, turnover: 2.8, status: 'Low' },
        { material: 'Transformers', stock: 220, demand: 180, turnover: 1.9, status: 'High' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Inventory Status Report</h2>
                    <p className="text-slate-500 mt-1">Current stock levels vs. projected demand</p>
                </div>
                <Button size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500">Total Stock Value</p>
                        <p className="text-2xl font-bold">₹125.8 Cr</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500">Avg Turnover Ratio</p>
                        <p className="text-2xl font-bold">2.5x</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-slate-500">Stockout Risk Items</p>
                        <p className="text-2xl font-bold text-red-600">2</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Material-wise Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {inventory.map((item) => (
                            <div key={item.material} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-slate-900">{item.material}</p>
                                        <p className="text-sm text-slate-500">
                                            Stock: {item.stock.toLocaleString()} | Demand: {item.demand.toLocaleString()}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.status === 'Low' ? 'bg-red-100 text-red-800' :
                                            item.status === 'High' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                        }`}>
                                        {item.status}
                                    </span>
                                </div>
                                <Progress value={(item.stock / item.demand) * 100} />
                                <p className="text-xs text-slate-500">
                                    Turnover: {item.turnover}x | Coverage: {((item.stock / item.demand) * 100).toFixed(0)}%
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}