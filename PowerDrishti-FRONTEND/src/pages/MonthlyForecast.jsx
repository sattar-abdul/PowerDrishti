// MonthWiseForecast.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, AlertTriangle, Download, ShoppingCart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MonthWiseForecast = () => {
    const location = useLocation();
    const [projectName, setProjectName] = useState("");
    const [forecastData, setForecastData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("schedule");

    useEffect(() => {
        // Extract project name from URL
        const params = new URLSearchParams(location.search);
        const project = params.get('project') || "Sample Project";
        setProjectName(project);

        // Generate dummy month-wise forecast data
        generateDummyForecastData(project);
    }, [location]);

    const generateDummyForecastData = (projectName) => {
        setIsLoading(true);

        // Sample materials for the project
        const materials = [
            { id: 1, name: "Steel Cables", unit: "meters" },
            { id: 2, name: "Concrete", unit: "cubic meters" },
            { id: 3, name: "Copper Wires", unit: "kg" },
            { id: 4, name: "Insulators", unit: "pieces" },
            { id: 5, name: "Transformer Oil", unit: "liters" },
        ];

        // Generate 12 months of forecast
        const months = [
            "Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6",
            "Month 7", "Month 8", "Month 9", "Month 10", "Month 11", "Month 12"
        ];

        const dummyData = months.map((month, monthIndex) => ({
            month,
            monthNumber: monthIndex + 1,
            materials: materials.map(material => ({
                ...material,
                quantity: Math.floor(Math.random() * 1000) + 500,
                ordered: Math.random() > 0.5, // Randomly set ordered status
                orderDate: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString() : null,
                deliveryStatus: Math.random() > 0.5 ? "Delivered" : Math.random() > 0.5 ? "In Transit" : "Pending"
            })),
            overallStatus: Math.random() > 0.7 ? "Ordered" : Math.random() > 0.5 ? "Partially Ordered" : "Not Ordered",
            priority: Math.random() > 0.8 ? "High" : Math.random() > 0.5 ? "Medium" : "Low"
        }));

        setForecastData(dummyData);
        setIsLoading(false);
    };

    const handleOrderMaterial = (monthNumber, materialId) => {
        // Update the ordered status
        setForecastData(prev => prev.map(month => {
            if (month.monthNumber === monthNumber) {
                return {
                    ...month,
                    materials: month.materials.map(mat =>
                        mat.id === materialId ? { ...mat, ordered: true, orderDate: new Date().toLocaleDateString() } : mat
                    ),
                    overallStatus: "Partially Ordered"
                };
            }
            return month;
        }));
    };

    const handleOrderAllForMonth = (monthNumber) => {
        setForecastData(prev => prev.map(month => {
            if (month.monthNumber === monthNumber) {
                return {
                    ...month,
                    materials: month.materials.map(mat => ({
                        ...mat,
                        ordered: true,
                        orderDate: new Date().toLocaleDateString()
                    })),
                    overallStatus: "Ordered"
                };
            }
            return month;
        }));
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "Ordered":
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" /> Ordered</Badge>;
            case "Partially Ordered":
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" /> Partial</Badge>;
            default:
                return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100"><AlertTriangle className="w-3 h-3 mr-1" /> Not Ordered</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <Calendar className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
                    <p className="text-slate-600">Loading month-wise forecast...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Month-wise Material Forecast</h1>
                <p className="text-slate-500 mt-1">Project: {projectName}</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="schedule">Monthly Schedule</TabsTrigger>
                    <TabsTrigger value="overview">Project Overview</TabsTrigger>
                </TabsList>

                <TabsContent value="schedule" className="space-y-4">
                    {forecastData.map((monthData) => (
                        <Card key={monthData.monthNumber} className="border-slate-200">
                            <CardHeader className="bg-slate-50 border-b">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                            {monthData.month}
                                        </CardTitle>
                                        <CardDescription>
                                            Priority: <Badge variant={monthData.priority === "High" ? "destructive" : "secondary"}>
                                                {monthData.priority}
                                            </Badge>
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(monthData.overallStatus)}
                                        <Button
                                            size="sm"
                                            onClick={() => handleOrderAllForMonth(monthData.monthNumber)}
                                            disabled={monthData.overallStatus === "Ordered"}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <ShoppingCart className="w-4 h-4 mr-2" />
                                            Order All
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Material</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Unit</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {monthData.materials.map((material) => (
                                            <TableRow key={material.id}>
                                                <TableCell className="font-medium">{material.name}</TableCell>
                                                <TableCell>{material.quantity.toLocaleString()}</TableCell>
                                                <TableCell>{material.unit}</TableCell>
                                                <TableCell>
                                                    {material.ordered ? (
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                            <CheckCircle className="w-3 h-3 mr-1" /> Ordered
                                                            {material.orderDate && (
                                                                <span className="text-xs ml-2">({material.orderDate})</span>
                                                            )}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                            <AlertTriangle className="w-3 h-3 mr-1" /> Pending
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        variant={material.ordered ? "outline" : "default"}
                                                        onClick={() => handleOrderMaterial(monthData.monthNumber, material.id)}
                                                        disabled={material.ordered}
                                                        className={material.ordered ? "bg-green-50 hover:bg-green-50" : ""}
                                                    >
                                                        {material.ordered ? (
                                                            <>
                                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                                Ordered
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ShoppingCart className="w-3 h-3 mr-1" />
                                                                Order Now
                                                            </>
                                                        )}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="bg-green-50 border-green-200">
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-green-700">
                                                {forecastData.filter(m => m.overallStatus === "Ordered").length}
                                            </p>
                                            <p className="text-green-600">Months Fully Ordered</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-yellow-50 border-yellow-200">
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-yellow-700">
                                                {forecastData.filter(m => m.overallStatus === "Partially Ordered").length}
                                            </p>
                                            <p className="text-yellow-600">Months Partially Ordered</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-red-50 border-red-200">
                                    <CardContent className="pt-6">
                                        <div className="text-center">
                                            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-2" />
                                            <p className="text-2xl font-bold text-red-700">
                                                {forecastData.filter(m => m.overallStatus === "Not Ordered").length}
                                            </p>
                                            <p className="text-red-600">Months Not Ordered</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MonthWiseForecast;