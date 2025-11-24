import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, trendUp }) {
    return (
        <Card className="bg-white border-slate-200 hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                        <h3 className="text-3xl font-bold text-slate-900 mb-2">{value}</h3>
                        {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
                        {trend && (
                            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                                {trendUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                <span>{trend}</span>
                            </div>
                        )}
                    </div>
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl">
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}