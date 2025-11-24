import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, TrendingUp, Package, ShoppingCart, Leaf, DollarSign, AlertTriangle, BarChart3, Clock } from "lucide-react";
import ReportDemandForecast from "../components/reports/ReportDemandForecast";
import ReportInventoryStatus from "../components/reports/ReportInventoryStatus";
import ReportProcurement from "../components/reports/ReportProcurement";
import ReportCarbonEmissions from "../components/reports/ReportCarbonEmissions";
import ReportCostOverrun from "../components/reports/ReportCostOverrun";
import ReportSupplyChainRisk from "../components/reports/ReportSupplyChainRisk";
import ReportKPIDashboard from "../components/reports/ReportKPIDashboard";
import ReportHistoricalTrends from "../components/reports/ReportHistoricalTrends";

export default function Reports() {
    const [activeTab, setActiveTab] = useState("demand");

    const reportTypes = [
        { id: "demand", label: "Demand Forecast", icon: TrendingUp, component: ReportDemandForecast },
        { id: "inventory", label: "Inventory Status", icon: Package, component: ReportInventoryStatus },
        { id: "procurement", label: "Procurement", icon: ShoppingCart, component: ReportProcurement },
        { id: "carbon", label: "Carbon Emissions", icon: Leaf, component: ReportCarbonEmissions },
        { id: "cost", label: "Cost Overrun", icon: DollarSign, component: ReportCostOverrun },
        { id: "risk", label: "Supply Chain Risk", icon: AlertTriangle, component: ReportSupplyChainRisk },
        { id: "kpi", label: "KPI Dashboard", icon: BarChart3, component: ReportKPIDashboard },
        { id: "trends", label: "Historical Trends", icon: Clock, component: ReportHistoricalTrends },
    ];

    const ActiveComponent = reportTypes.find(r => r.id === activeTab)?.component;

    return (
        <div className="p-6 md:p-8 space-y-6 bg-[#f5f8fd] ">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
                    <p className="text-slate-500 mt-1">Deep insights with AI-powered analysis</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-2" />
                    Export All Reports
                </Button>
            </div>

            <Card className="bg-white border-slate-200">
                <CardContent className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 h-auto bg-slate-100 p-2">
                            {reportTypes.map((report) => (
                                <TabsTrigger
                                    key={report.id}
                                    value={report.id}
                                    className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                                >
                                    <report.icon className="w-5 h-5" />
                                    <span className="text-xs font-medium text-center">{report.label}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {reportTypes.map((report) => (
                            <TabsContent key={report.id} value={report.id} className="mt-6">
                                {ActiveComponent && <ActiveComponent />}
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}