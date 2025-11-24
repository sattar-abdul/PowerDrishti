import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ReportSupplyChainRisk() {
    const risks = [
        { category: 'Supplier Reliability', score: 75, level: 'Medium', mitigation: 'Diversify supplier base' },
        { category: 'Transport Delays', score: 40, level: 'High', mitigation: 'Implement real-time tracking' },
        { category: 'Material Quality', score: 85, level: 'Low', mitigation: 'Continue quality audits' },
        { category: 'Price Volatility', score: 60, level: 'Medium', mitigation: 'Lock long-term contracts' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Supply Chain Risk Assessment</h2>
                    <p className="text-slate-500 mt-1">Risk scores and mitigation strategies</p>
                </div>
                <Button size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {risks.map((risk, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className={`w-5 h-5 ${risk.level === 'High' ? 'text-red-600' :
                                                risk.level === 'Medium' ? 'text-yellow-600' :
                                                    'text-green-600'
                                            }`} />
                                        <p className="font-semibold">{risk.category}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${risk.level === 'High' ? 'bg-red-100 text-red-800' :
                                            risk.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                        }`}>
                                        {risk.level}
                                    </span>
                                </div>
                                <Progress value={risk.score} className="h-2" />
                                <p className="text-sm text-slate-600">
                                    <strong>Mitigation:</strong> {risk.mitigation}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}