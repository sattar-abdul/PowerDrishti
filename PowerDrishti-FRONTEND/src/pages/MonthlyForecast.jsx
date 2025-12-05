// MonthWiseForecast.jsx - Enhanced with Order Placement and Tracking
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, CheckCircle, Clock, AlertTriangle, ShoppingCart, Truck, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LOCAL_URL } from "@/api/api";
import { getTooltipForMaterial } from "@/constants/materialTooltips";

const MonthWiseForecast = () => {
    const { projectId } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    const [projectName, setProjectName] = useState("");
    const [forecastData, setForecastData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("schedule");
    const [currentPhase, setCurrentPhase] = useState("Phase 1 - Pre-Construction / Early Civil Works");
    const [isUpdatingPhase, setIsUpdatingPhase] = useState(false);
    const [inventoryData, setInventoryData] = useState({});
    const [orders, setOrders] = useState({}); // Store orders by materialId
    const [isOrdering, setIsOrdering] = useState(false);

    // Phase-to-material priority mapping
    const PHASE_MATERIALS = {
        "Phase 1 - Pre-Construction / Early Civil Works": {
            high: ["Earth_Rods_units", "Earthing_Mat_sets", "Foundation_Concrete_m3",
                "Cement_MT", "Sand_m3", "Aggregate_m3", "Tower_Steel_MT", "Angle_Tower_MT"]
        },
        "Phase 2 - Structure Erection / Mechanical Works": {
            high: ["Bolts_Nuts_pcs", "Misc_Hardware_lots", "Vibration_Dampers_pcs",
                "Spacer_Dampers_pcs", "Clamp_Fittings_sets"],
            medium: ["Cable_Trays_m", "Lighting_Protection_sets"]
        },
        "Phase 3 - Conductor & Line Stringing": {
            high: ["ACSR_Moose_tons", "ACSR_Zebra_tons", "AAAC_tons",
                "OPGW_km", "Earthwire_km", "Conductor_Accessories_sets"]
        },
        "Phase 4 - Electrical & Substation Equipment Installation": {
            high: ["Power_Transformer_units", "Transformer_MVA_units", "Circuit_Breaker_units",
                "Isolator_units", "CT_PT_sets", "Relay_Panels_units"]
        },
        "Phase 5 - Cabling & Final Electrical Works": {
            medium: ["Control_Cable_m", "Power_Cable_m", "Busbar_MT", "MC501_units"]
        },
        "Phase 6 - Commissioning & Finishing": {
            low: ["Lighting_Protection_sets", "Misc_Hardware_lots"]
        }
    };

    const PHASES = [
        "Phase 1 - Pre-Construction / Early Civil Works",
        "Phase 2 - Structure Erection / Mechanical Works",
        "Phase 3 - Conductor & Line Stringing",
        "Phase 4 - Electrical & Substation Equipment Installation",
        "Phase 5 - Cabling & Final Electrical Works",
        "Phase 6 - Commissioning & Finishing"
    ];

    useEffect(() => {
        if (projectId) {
            fetchMonthlyBOQ();
            fetchInventory();
        }
    }, [projectId]);

    const fetchMonthlyBOQ = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${LOCAL_URL}/api/boq/monthly/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Monthly BOQ data:', data);

                // Set project name and current phase
                setProjectName(data.project?.project_name || "Project");
                setCurrentPhase(data.project?.current_phase || "Phase 1 - Pre-Construction / Early Civil Works");

                // Transform monthly_breakdown to forecastData format
                const transformedData = data.monthly_breakdown.map((monthData) => {
                    // Convert Map to array of materials
                    const materialsArray = Object.entries(monthData.materials)
                        .filter(([name, quantity]) => quantity > 0)
                        .map(([name, quantity]) => ({
                            id: name,
                            name: name.replace(/_/g, ' '),
                            quantity: quantity,
                            unit: getUnitFromMaterialName(name),
                            ordered: false,
                            orderDate: null,
                            trackingId: null,
                            orderId: null,
                            deliveryStatus: "Pending"
                        }));

                    return {
                        month: `Month ${monthData.month}`,
                        monthNumber: monthData.month,
                        materials: materialsArray,
                        overallStatus: "Not Ordered",
                        priority: monthData.month <= 3 ? "High" : monthData.month <= 6 ? "Medium" : "Low"
                    };
                });

                setForecastData(transformedData);
            } else {
                console.error('Failed to fetch monthly BOQ');
                alert('No monthly forecast found for this project');
            }
        } catch (error) {
            console.error('Error fetching monthly BOQ:', error);
            alert('Error loading monthly forecast data');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function to extract unit from material name
    const getUnitFromMaterialName = (materialName) => {
        if (materialName.includes('_tons')) return 'tons';
        if (materialName.includes('_km')) return 'km';
        if (materialName.includes('_m3')) return 'm3';
        if (materialName.includes('_m') && !materialName.includes('_m3')) return 'm';
        if (materialName.includes('_MT')) return 'MT';
        if (materialName.includes('_pcs')) return 'pcs';
        if (materialName.includes('_units')) return 'units';
        if (materialName.includes('_sets')) return 'sets';
        if (materialName.includes('_lots')) return 'lots';
        return 'units'; // default
    };
    const fetchInventory = async () => {
        try {
            const response = await fetch(`${LOCAL_URL}/api/inventory/${projectId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const inventoryMap = {};
                data.items.forEach(item => {
                    inventoryMap[item.item_name] = item.quantity;
                });
                setInventoryData(inventoryMap);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
            setInventoryData({});
        }
    };

    const getQuantityToOrder = (materialId, predictedQty) => {
        const availableQty = inventoryData[materialId] || 0;
        const toOrder = Math.max(0, predictedQty - availableQty);
        return {
            predicted: predictedQty,
            available: availableQty,
            toOrder: toOrder,
            hasInventory: availableQty > 0
        };
    };


    const handleOrderMaterial = async (monthNumber, materialId) => {
        setIsOrdering(true);
        try {
            // Find the material details
            const monthData = forecastData.find(m => m.monthNumber === monthNumber);
            const material = monthData?.materials.find(m => m.id === materialId);

            if (!material) {
                alert('Material not found');
                setIsOrdering(false);
                return;
            }

            // Place order via API
            const response = await fetch(`${LOCAL_URL}/api/procurement/order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    projectId,
                    material_name: material.name,
                    material_id: materialId,
                    quantity: material.quantity,
                    unit: material.unit,
                    month_number: monthNumber,
                    expected_delivery_days: 14,
                    priority: getMaterialPriority(materialId)
                })
            });

            if (!response.ok) {
                throw new Error('Failed to place order');
            }

            const data = await response.json();

            // Store order info
            setOrders(prev => ({
                ...prev,
                [`${monthNumber}-${materialId}`]: {
                    orderId: data.order._id,
                    trackingId: data.tracking.tracking_id,
                    status: data.order.status
                }
            }));

            // Update the ordered status in UI
            setForecastData(prev => prev.map(month => {
                if (month.monthNumber === monthNumber) {
                    const updatedMaterials = month.materials.map(mat =>
                        mat.id === materialId ? {
                            ...mat,
                            ordered: true,
                            orderDate: new Date().toLocaleDateString(),
                            trackingId: data.tracking.tracking_id,
                            orderId: data.order._id
                        } : mat
                    );

                    // Check if all materials are ordered
                    const allOrdered = updatedMaterials.every(m => m.ordered);

                    return {
                        ...month,
                        materials: updatedMaterials,
                        overallStatus: allOrdered ? "Ordered" : "Partially Ordered"
                    };
                }
                return month;
            }));

            alert(`Order placed successfully! Tracking ID: ${data.tracking.tracking_id}`);
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setIsOrdering(false);
        }
    };

    const handleOrderAllForMonth = async (monthNumber) => {
        const monthData = forecastData.find(m => m.monthNumber === monthNumber);
        if (!monthData) return;

        // Order all materials in this month
        for (const material of monthData.materials) {
            if (!material.ordered) {
                await handleOrderMaterial(monthNumber, material.id);
            }
        }
    };

    const handleTrackMaterial = (trackingId) => {
        // Navigate to material tracking page with tracking ID
        navigate(`/material-tracking?trackingId=${trackingId}`);
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

    // Get material priority based on current phase
    const getMaterialPriority = (materialId) => {
        const phaseMaterials = PHASE_MATERIALS[currentPhase];
        if (!phaseMaterials) return "Low";

        if (phaseMaterials.high?.includes(materialId)) return "High";
        if (phaseMaterials.medium?.includes(materialId)) return "Medium";
        if (phaseMaterials.low?.includes(materialId)) return "Low";

        return "Low"; // default
    };

    // Get priority badge for material
    const getPriorityBadge = (priority) => {
        switch (priority) {
            case "High":
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>;
            case "Medium":
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
            default:
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>;
        }
    };

    // Handle phase change
    const handlePhaseChange = async (newPhase) => {
        setIsUpdatingPhase(true);
        try {
            const response = await fetch(`${LOCAL_URL}/api/projects/${projectId}/phase`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ current_phase: newPhase })
            });

            if (response.ok) {
                setCurrentPhase(newPhase);
            } else {
                alert('Failed to update project phase');
            }
        } catch (error) {
            console.error('Error updating phase:', error);
            alert('Error updating project phase');
        } finally {
            setIsUpdatingPhase(false);
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

            {/* Phase Slider */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-lg">Project Phase</CardTitle>
                    <CardDescription>Select the current construction phase to prioritize materials</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2">
                            {PHASES.map((phase, index) => (
                                <Button
                                    key={phase}
                                    variant={currentPhase === phase ? "default" : "outline"}
                                    className={`h-auto min-h-[80px] py-3 px-3 text-xs whitespace-normal ${currentPhase === phase
                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                                        : "hover:bg-blue-50"
                                        }`}
                                    onClick={() => handlePhaseChange(phase)}
                                    disabled={isUpdatingPhase}
                                >
                                    <div className="text-center w-full">
                                        <div className="font-bold mb-1">Phase {index + 1}</div>
                                        <div className="leading-tight text-[10px] break-words">
                                            {phase.split(' - ')[1]}
                                        </div>
                                    </div>
                                </Button>
                            ))}
                        </div>
                        {isUpdatingPhase && (
                            <p className="text-sm text-blue-600 text-center">Updating phase...</p>
                        )}
                    </div>
                </CardContent>
            </Card>

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
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(monthData.overallStatus)}
                                        <Button
                                            size="sm"
                                            onClick={() => handleOrderAllForMonth(monthData.monthNumber)}
                                            disabled={monthData.overallStatus === "Ordered" || isOrdering}
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
                                            <TableHead>Priority</TableHead>
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
                                                <TableCell>{getPriorityBadge(getMaterialPriority(material.id))}</TableCell>
                                                <TableCell>{(() => {
                                                    const qtyInfo = getQuantityToOrder(material.id, material.quantity);
                                                    if (!qtyInfo.hasInventory) {
                                                        return qtyInfo.predicted.toLocaleString();
                                                    }
                                                    return (
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span className="line-through text-gray-400 text-sm">
                                                                    {qtyInfo.predicted.toLocaleString()}
                                                                </span>
                                                                <span className="text-gray-500">→</span>
                                                                <span className={qtyInfo.toOrder === 0 ? "text-green-600 font-semibold" : "font-medium"}>
                                                                    {qtyInfo.toOrder === 0 ? "Sufficient" : qtyInfo.toOrder.toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-0.5">
                                                                Available: {qtyInfo.available.toLocaleString()}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}</TableCell>
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
                                                    <div className="flex gap-2">
                                                        {!material.ordered ? (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleOrderMaterial(monthData.monthNumber, material.id)}
                                                                disabled={isOrdering}
                                                                className="bg-blue-600 hover:bg-blue-700"
                                                            >
                                                                <ShoppingCart className="w-3 h-3 mr-1" />
                                                                Order Now
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleTrackMaterial(material.trackingId)}
                                                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                                                            >
                                                                <Truck className="w-3 h-3 mr-1" />
                                                                Track Now
                                                            </Button>
                                                        )}
                                                    </div>
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

