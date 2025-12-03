// DashboardProjectsCard.jsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, AlertTriangle, ExternalLink, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const DashboardProjectsCard = () => {
    const [dummyProjects, setDummyProjects] = useState([
        {
            id: 1,
            name: "North Region 400kV Transmission",
            startDate: "2024-01-15",
            currentMonth: 5,
            totalMonths: 12,
            status: "In Progress",
            materialsOrdered: [
                { month: 1, ordered: true },
                { month: 2, ordered: true },
                { month: 3, ordered: true },
                { month: 4, ordered: true },
                { month: 5, ordered: false }, // Current month - not ordered
                { month: 6, ordered: false },
            ],
            budget: "₹500 Cr",
            completion: 42,
            riskLevel: "Medium"
        },
        {
            id: 2,
            name: "Western Grid Substation Upgrade",
            startDate: "2024-02-01",
            currentMonth: 4,
            totalMonths: 10,
            status: "In Progress",
            materialsOrdered: [
                { month: 1, ordered: true },
                { month: 2, ordered: true },
                { month: 3, ordered: true },
                { month: 4, ordered: false }, // Current month - not ordered
                { month: 5, ordered: false },
            ],
            budget: "₹320 Cr",
            completion: 30,
            riskLevel: "Low"
        },
        {
            id: 3,
            name: "Eastern Corridor 220kV Line",
            startDate: "2024-03-10",
            currentMonth: 3,
            totalMonths: 9,
            status: "Delayed",
            materialsOrdered: [
                { month: 1, ordered: true },
                { month: 2, ordered: false }, // Past month - not ordered (DELAYED!)
                { month: 3, ordered: false }, // Current month - not ordered
                { month: 4, ordered: false },
            ],
            budget: "₹280 Cr",
            completion: 11,
            riskLevel: "High"
        },
        {
            id: 4,
            name: "Coastal Wind Farm Connection",
            startDate: "2023-11-01",
            currentMonth: 9,
            totalMonths: 14,
            status: "On Schedule",
            materialsOrdered: [
                { month: 1, ordered: true },
                { month: 2, ordered: true },
                { month: 3, ordered: true },
                { month: 4, ordered: true },
                { month: 5, ordered: true },
                { month: 6, ordered: true },
                { month: 7, ordered: true },
                { month: 8, ordered: true },
                { month: 9, ordered: true }, // Current month - ordered
                { month: 10, ordered: false },
            ],
            budget: "₹650 Cr",
            completion: 64,
            riskLevel: "Low"
        },
    ]);

    const handleOrderCurrentMonth = (projectId) => {
        setDummyProjects(prev => prev.map(project => {
            if (project.id === projectId) {
                const updatedMaterials = project.materialsOrdered.map(item =>
                    item.month === project.currentMonth ? { ...item, ordered: true } : item
                );
                return { ...project, materialsOrdered: updatedMaterials };
            }
            return project;
        }));
    };

    const getCurrentMonthStatus = (project) => {
        const currentMonthOrder = project.materialsOrdered.find(
            item => item.month === project.currentMonth
        );

        if (!currentMonthOrder) return { status: "error", text: "No Data" };

        if (currentMonthOrder.ordered) {
            return { status: "success", text: "Ordered", icon: <CheckCircle className="w-4 h-4" /> };
        }

        // Check if any previous month is not ordered (delayed)
        const hasDelayedOrder = project.materialsOrdered.some(
            item => item.month < project.currentMonth && !item.ordered
        );

        if (hasDelayedOrder) {
            return {
                status: "delayed",
                text: "Delayed",
                icon: <AlertTriangle className="w-4 h-4" />
            };
        }

        return {
            status: "pending",
            text: "Pending Order",
            icon: <Clock className="w-4 h-4" />
        };
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "success":
                return "bg-green-100 text-green-800 border-green-200";
            case "delayed":
                return "bg-red-100 text-red-800 border-red-200";
            case "pending":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getRiskBadge = (riskLevel) => {
        switch (riskLevel) {
            case "High":
                return <Badge variant="destructive">High Risk</Badge>;
            case "Medium":
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium Risk</Badge>;
            default:
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low Risk</Badge>;
        }
    };

    return (
        <Card className="border-slate-200">
            <CardHeader className="border-b border-slate-200">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            Active Projects Material Status
                        </CardTitle>
                        <CardDescription>
                            Track material ordering status for current month across all projects
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-blue-600">
                        {dummyProjects.length} Projects
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-4">
                    {dummyProjects.map((project) => {
                        const currentStatus = getCurrentMonthStatus(project);

                        return (
                            <div key={project.id} className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold text-slate-900 text-lg">{project.name}</h3>
                                            {getRiskBadge(project.riskLevel)}
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>Month {project.currentMonth} of {project.totalMonths}</span>
                                            </div>
                                            <div>Budget: {project.budget}</div>
                                            <div>Started: {new Date(project.startDate).toLocaleDateString()}</div>
                                        </div>

                                        <div className="w-full md:w-64">
                                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                                                <span>Progress</span>
                                                <span>{project.completion}%</span>
                                            </div>
                                            <Progress value={project.completion} className="h-2" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-3">
                                        <div className="text-right">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(currentStatus.status)}`}>
                                                {currentStatus.icon}
                                                <span className="font-medium">{currentStatus.text}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Material Status for Month {project.currentMonth}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant={currentStatus.status === "success" ? "outline" : "default"}
                                                onClick={() => handleOrderCurrentMonth(project.id)}
                                                disabled={currentStatus.status === "success"}
                                                className={currentStatus.status === "delayed" ? "bg-red-600 hover:bg-red-700" : ""}
                                            >
                                                {currentStatus.status === "success" ? (
                                                    <>
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Ordered
                                                    </>
                                                ) : currentStatus.status === "delayed" ? (
                                                    <>
                                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                                        Order Delayed
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock className="w-4 h-4 mr-2" />
                                                        Order Now
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => window.location.href = `/month-wise-forecast?project=${encodeURIComponent(project.name)}`}
                                            >
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Month-by-month quick view */}
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-sm font-medium text-slate-700 mb-2">Material Ordering Timeline:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {project.materialsOrdered.map((monthOrder) => (
                                            <div
                                                key={monthOrder.month}
                                                className={`flex flex-col items-center p-2 rounded border ${monthOrder.month === project.currentMonth
                                                        ? "border-blue-300 bg-blue-50"
                                                        : "border-slate-200"
                                                    }`}
                                            >
                                                <span className={`text-xs font-medium ${monthOrder.month === project.currentMonth ? "text-blue-700" : "text-slate-600"
                                                    }`}>
                                                    Month {monthOrder.month}
                                                </span>
                                                <div className={`w-6 h-6 rounded-full mt-1 flex items-center justify-center ${monthOrder.ordered
                                                        ? "bg-green-100 text-green-700"
                                                        : monthOrder.month < project.currentMonth
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-slate-100 text-slate-500"
                                                    }`}>
                                                    {monthOrder.ordered ? (
                                                        <CheckCircle className="w-3 h-3" />
                                                    ) : monthOrder.month < project.currentMonth ? (
                                                        <AlertTriangle className="w-3 h-3" />
                                                    ) : (
                                                        <Clock className="w-3 h-3" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

export default DashboardProjectsCard;