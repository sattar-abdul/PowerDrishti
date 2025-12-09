// MonthWiseForecast.jsx - Enhanced with Order Placement and Tracking
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar, CheckCircle, Clock, AlertTriangle, ShoppingCart, Truck, Info, ChevronDown, Edit, Trash2, Check, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LOCAL_URL } from "@/api/api";
import { getTooltipForMaterial } from "@/constants/materialTooltips";

const MonthWiseForecast = () => {
    const { projectId } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    const [projectName, setProjectName] = useState("");
    const [forecastData, setForecastData] = useState([]);
    const [phaseWiseData, setPhaseWiseData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("monthwise");
    const [currentPhase, setCurrentPhase] = useState("Phase 1 - Pre-Construction / Early Civil Works");
    const [isUpdatingPhase, setIsUpdatingPhase] = useState(false);
    const [inventoryData, setInventoryData] = useState({});
    const [orders, setOrders] = useState({}); // Store orders by materialId
    const [isOrdering, setIsOrdering] = useState(false);
    const [expandedMonths, setExpandedMonths] = useState({ 1: true }); // Month 1 expanded by default
    const [editingItem, setEditingItem] = useState(null);

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
            fetchProcurementOrders();
        }
    }, [projectId]);

    const fetchProcurementOrders = async () => {
        try {
            const response = await fetch(`${LOCAL_URL}/api/procurement/orders/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const ordersData = await response.json();
                // Create a map of material_id + month_number to order info
                const ordersMap = {};
                ordersData.forEach(order => {
                    // Use combination of material_id and month_number as key
                    const key = `${order.material_id}_month_${order.month_number}`;
                    ordersMap[key] = {
                        ordered: true,
                        orderDate: new Date(order.order_date).toLocaleDateString(),
                        trackingId: order.tracking_id,
                        orderId: order._id,
                        status: order.status,
                        monthNumber: order.month_number
                    };
                });
                setOrders(ordersMap);
            }
        } catch (error) {
            console.error('Error fetching procurement orders:', error);
            setOrders({});
        }
    };

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

                // Generate phase-wise data
                const phaseData = aggregateMaterialsByPhase(transformedData);
                setPhaseWiseData(phaseData);
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
    // Map months to phases based on project duration
    const getPhaseForMonth = (monthNumber, totalMonths) => {
        const percentage = (monthNumber / totalMonths) * 100;

        if (percentage <= 20) return 1;
        if (percentage <= 35) return 2;
        if (percentage <= 50) return 3;
        if (percentage <= 75) return 4;
        if (percentage <= 90) return 5;
        return 6;
    };

    // Get current phase number from phase name
    const getCurrentPhaseNumber = () => {
        const phaseIndex = PHASES.findIndex(phase => phase === currentPhase);
        return phaseIndex !== -1 ? phaseIndex + 1 : 1;
    };

    // Filter months that belong to the current phase
    const getFilteredMonthsByPhase = () => {
        if (!forecastData || forecastData.length === 0) return [];

        const currentPhaseNum = getCurrentPhaseNumber();
        const totalMonths = forecastData.length;

        return forecastData.filter(monthData => {
            const monthPhase = getPhaseForMonth(monthData.monthNumber, totalMonths);
            return monthPhase === currentPhaseNum;
        });
    };

    // Aggregate materials by phase
    const aggregateMaterialsByPhase = (monthlyData) => {
        if (!monthlyData || monthlyData.length === 0) return [];

        const totalMonths = monthlyData.length;
        const phaseMap = {};

        // Initialize phases
        for (let i = 1; i <= 6; i++) {
            phaseMap[i] = {
                phaseNumber: i,
                phaseName: PHASES[i - 1],
                months: [],
                materials: {}
            };
        }

        // Group months by phase and aggregate materials
        monthlyData.forEach(monthData => {
            const phase = getPhaseForMonth(monthData.monthNumber, totalMonths);
            phaseMap[phase].months.push(monthData.monthNumber);

            // Aggregate materials
            monthData.materials.forEach(material => {
                if (!phaseMap[phase].materials[material.id]) {
                    phaseMap[phase].materials[material.id] = {
                        id: material.id,
                        name: material.name,
                        quantity: 0,
                        unit: material.unit
                    };
                }
                phaseMap[phase].materials[material.id].quantity += material.quantity;
            });
        });

        // Convert to array and filter empty phases
        return Object.values(phaseMap)
            .filter(phase => phase.months.length > 0)
            .map(phase => ({
                ...phase,
                materials: Object.values(phase.materials)
                    .sort((a, b) => {
                        const priorityOrder = { "High": 0, "Medium": 1, "Low": 2 };
                        const aPriority = getMaterialPriority(a.id);
                        const bPriority = getMaterialPriority(b.id);
                        return priorityOrder[aPriority] - priorityOrder[bPriority];
                    })
            }));
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
        // Find the material details
        const monthData = forecastData.find(m => m.monthNumber === monthNumber);
        const material = monthData?.materials.find(m => m.id === materialId);
        console.log("material", material);

        if (!material) {
            alert('Material not found');
            return;
        }

        // Calculate inventory-aware quantity
        const orderInfo = getQuantityToOrder(materialId, material.quantity);

        // Check if order is needed
        if (orderInfo.toOrder <= 0) {
            alert(`No order needed!\n\nRequired: ${orderInfo.predicted} ${material.unit}\nAvailable in inventory: ${orderInfo.available} ${material.unit}\n\nYou have sufficient inventory for this material.`);
            return;
        }

        // Show order confirmation with inventory details
        const confirmOrder = window.confirm(
            `Order Details:\n\n` +
            `Material: ${material.name}\n` +
            `Required: ${orderInfo.predicted} ${material.unit}\n` +
            `Available in inventory: ${orderInfo.available} ${material.unit}\n` +
            `Quantity to order: ${orderInfo.toOrder} ${material.unit}\n\n` +
            `Proceed with order?`
        );

        if (!confirmOrder) {
            return;
        }

        // Redirect to Material Tracking page with ACTUAL quantity to order
        navigate(`/material-tracking?projectId=${projectId}&materialId=${materialId}&materialName=${encodeURIComponent(material.name)}&quantity=${orderInfo.toOrder}&unit=${material.unit}&monthNumber=${monthNumber}`);
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
            console.error("Error updating material:", error);
            alert("An error occurred while updating the material.");
        }
    };

    const handleStartEdit = (monthNumber, materialId, currentQuantity) => {
        setEditingItem({
            monthNumber,
            materialId,
            value: currentQuantity
        });
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
    };

    const handleSaveEdit = async () => {
        if (!editingItem) return;

        const { monthNumber, materialId, value } = editingItem;
        const parsedQuantity = parseFloat(value);

        if (isNaN(parsedQuantity) || parsedQuantity < 0) {
            alert("Please enter a valid positive number.");
            return;
        }

        try {
            const response = await fetch(`${LOCAL_URL}/api/boq/monthly/${projectId}/material`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    monthNumber,
                    materialId,
                    quantity: parsedQuantity
                })
            });

            if (response.ok) {
                // Update local state
                setForecastData(prevData => {
                    return prevData.map(month => {
                        if (month.monthNumber === monthNumber) {
                            return {
                                ...month,
                                materials: month.materials.map(mat => {
                                    if (mat.id === materialId) {
                                        return { ...mat, quantity: parsedQuantity };
                                    }
                                    return mat;
                                })
                            };
                        }
                        return month;
                    });
                });
                setEditingItem(null);
                alert("Material updated successfully!");
            } else {
                const errorData = await response.json();
                alert(`Failed to update material: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Error updating material:", error);
            alert("An error occurred while updating the material.");
        }
    };

    const handleDeleteMaterial = async (monthNumber, materialId) => {
        if (!window.confirm("Are you sure you want to delete this material from the forecast?")) {
            return;
        }

        try {
            const response = await fetch(`${LOCAL_URL}/api/boq/monthly/${projectId}/material`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    monthNumber,
                    materialId
                })
            });

            if (response.ok) {
                // Update local state
                setForecastData(prevData => {
                    return prevData.map(month => {
                        if (month.monthNumber === monthNumber) {
                            return {
                                ...month,
                                materials: month.materials.filter(mat => mat.id !== materialId)
                            };
                        }
                        return month;
                    });
                });
                alert("Material deleted successfully!");
            } else {
                const errorData = await response.json();
                alert(`Failed to delete material: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Error deleting material:", error);
            alert("An error occurred while deleting the material.");
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
                                    className={`h-auto min-h-[80px] py-3 px-3 text-s whitespace-normal ${currentPhase === phase
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
                    <TabsTrigger value="monthwise">Month Wise Schedule</TabsTrigger>
                    <TabsTrigger value="phasewise">Phase Wise Schedule</TabsTrigger>
                </TabsList>

                <TabsContent value="monthwise" className="space-y-4">
                    {(() => {
                        const filteredMonths = getFilteredMonthsByPhase();

                        if (filteredMonths.length === 0) {
                            return (
                                <Card className="border-slate-200">
                                    <CardContent className="p-8 text-center">
                                        <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                        <p className="text-slate-600 font-medium">No months found for the current phase</p>
                                        <p className="text-slate-500 text-sm mt-2">
                                            Select a different phase to view its monthly schedule
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        }

                        return filteredMonths.map((monthData) => (
                            <Collapsible
                                key={monthData.monthNumber}
                                open={expandedMonths[monthData.monthNumber] || false}
                                onOpenChange={(isOpen) => setExpandedMonths(prev => ({ ...prev, [monthData.monthNumber]: isOpen }))}
                            >
                                <Card className="border-slate-200">
                                    <CardHeader className="bg-slate-50 border-b">
                                        <div className="flex justify-between items-center">
                                            <CollapsibleTrigger asChild>
                                                <div className="flex items-center gap-2 cursor-pointer flex-1">
                                                    <ChevronDown className={`w-5 h-5 text-slate-600 transition-transform ${expandedMonths[monthData.monthNumber] ? 'transform rotate-0' : 'transform -rotate-90'}`} />
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Calendar className="w-5 h-5 text-blue-600" />
                                                        {monthData.month}
                                                    </CardTitle>
                                                </div>
                                            </CollapsibleTrigger>
                                            <div className="flex items-center gap-3">
                                                {getStatusBadge(monthData.overallStatus)}
                                                {/* <Button
                                                size="sm"
                                                onClick={() => handleOrderAllForMonth(monthData.monthNumber)}
                                                disabled={monthData.overallStatus === "Ordered" || isOrdering}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <ShoppingCart className="w-4 h-4 mr-2" />
                                                Order All
                                            </Button> */}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CollapsibleContent>
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
                                                            <TableCell className="font-medium">
                                                                {(() => {
                                                                    const priority = getMaterialPriority(material.id);
                                                                    const tooltip = getTooltipForMaterial(material.id);

                                                                    if (priority === "High" && tooltip) {
                                                                        return (
                                                                            <TooltipProvider>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <div className="flex items-center gap-2 cursor-help">
                                                                                            <span>{material.name}</span>
                                                                                            <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                                                        </div>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent className="max-w-xs">
                                                                                        <p className="text-sm">{tooltip}</p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </TooltipProvider>
                                                                        );
                                                                    }
                                                                    return material.name;
                                                                })()}
                                                            </TableCell>
                                                            <TableCell>{getPriorityBadge(getMaterialPriority(material.id))}</TableCell>
                                                            <TableCell>
                                                                {(() => {
                                                                    if (editingItem?.monthNumber === monthData.monthNumber && editingItem?.materialId === material.id) {
                                                                        return (
                                                                            <Input
                                                                                type="number"
                                                                                value={editingItem.value}
                                                                                onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                                                                                className="w-32 h-8"
                                                                            />
                                                                        );
                                                                    }

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
                                                                {(() => {
                                                                    // Use month-specific key
                                                                    const orderKey = `${material.id}_month_${monthData.monthNumber}`;
                                                                    const orderInfo = orders[orderKey];
                                                                    if (orderInfo?.ordered) {
                                                                        return (
                                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                                <CheckCircle className="w-3 h-3 mr-1" /> Ordered
                                                                                {orderInfo.orderDate && (
                                                                                    <span className="text-xs ml-2">({orderInfo.orderDate})</span>
                                                                                )}
                                                                            </Badge>
                                                                        );
                                                                    }
                                                                    return (
                                                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                                                            <AlertTriangle className="w-3 h-3 mr-1" /> Pending
                                                                        </Badge>
                                                                    );
                                                                })()}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex gap-2">
                                                                    {(() => {
                                                                        // Use month-specific key
                                                                        const orderKey = `${material.id}_month_${monthData.monthNumber}`;
                                                                        const orderInfo = orders[orderKey];

                                                                        // If currently editing this item
                                                                        if (editingItem?.monthNumber === monthData.monthNumber && editingItem?.materialId === material.id) {
                                                                            return (
                                                                                <>
                                                                                    <Button size="sm" onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0">
                                                                                        <Check className="w-4 h-4" />
                                                                                    </Button>
                                                                                    <Button size="sm" variant="outline" onClick={handleCancelEdit} className="text-red-600 border-red-200 hover:bg-red-50 h-8 w-8 p-0">
                                                                                        <X className="w-4 h-4" />
                                                                                    </Button>
                                                                                </>
                                                                            );
                                                                        }

                                                                        if (orderInfo?.ordered && orderInfo?.trackingId) {
                                                                            return (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    onClick={() => handleTrackMaterial(orderInfo.trackingId)}
                                                                                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                                                                                >
                                                                                    <Truck className="w-3 h-3 mr-1" />
                                                                                    Track Now
                                                                                </Button>
                                                                            );
                                                                        }
                                                                        return (
                                                                            <>
                                                                                <Button
                                                                                    size="sm"
                                                                                    onClick={() => handleOrderMaterial(monthData.monthNumber, material.id)}
                                                                                    disabled={isOrdering}
                                                                                    className="bg-blue-600 hover:bg-blue-700"
                                                                                >
                                                                                    <ShoppingCart className="w-3 h-3 mr-1" />
                                                                                    Order Now
                                                                                </Button>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    onClick={() => handleStartEdit(monthData.monthNumber, material.id, material.quantity)}
                                                                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                                                >
                                                                                    <Edit className="w-4 h-4" />
                                                                                </Button>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    onClick={() => handleDeleteMaterial(monthData.monthNumber, material.id)}
                                                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                                                >
                                                                                    <Trash2 className="w-4 h-4" />
                                                                                </Button>
                                                                            </>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>
                        ))
                    })()}
                </TabsContent>

                <TabsContent value="phasewise" className="space-y-4">
                    {(() => {
                        const currentPhaseNum = getCurrentPhaseNumber();
                        const currentPhaseData = phaseWiseData.find(phase => phase.phaseNumber === currentPhaseNum);

                        if (!currentPhaseData || currentPhaseData.materials.length === 0) {
                            return (
                                <Card className="border-slate-200">
                                    <CardContent className="p-8 text-center">
                                        <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                        <p className="text-slate-600 font-medium">No materials found for the current phase</p>
                                        <p className="text-slate-500 text-sm mt-2">
                                            Select a different phase to view its material requirements
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        }

                        return (
                            <Card className="border-slate-200">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Calendar className="w-5 h-5 text-blue-600" />
                                                Phase {currentPhaseData.phaseNumber}
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                {currentPhaseData.phaseName.split(' - ')[1]} • Months: {currentPhaseData.months.join(', ')}
                                            </CardDescription>
                                        </div>
                                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                            {currentPhaseData.materials.length} Materials
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Material</TableHead>
                                                <TableHead>Priority</TableHead>
                                                <TableHead>Total Quantity</TableHead>
                                                <TableHead>Unit</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentPhaseData.materials.map((material) => (
                                                <TableRow key={material.id}>
                                                    <TableCell className="font-medium">
                                                        {(() => {
                                                            const priority = getMaterialPriority(material.id);
                                                            const tooltip = getTooltipForMaterial(material.id);

                                                            if (priority === "High" && tooltip) {
                                                                return (
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <div className="flex items-center gap-2 cursor-help">
                                                                                    <span>{material.name}</span>
                                                                                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                                                                </div>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent className="max-w-xs">
                                                                                <p className="text-sm">{tooltip}</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                );
                                                            }
                                                            return material.name;
                                                        })()}
                                                    </TableCell>
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
                                                        <Button
                                                            size="sm"
                                                            onClick={() => navigate(`/material-tracking?projectId=${projectId}&materialId=${material.id}&materialName=${encodeURIComponent(material.name)}&quantity=${material.quantity}&unit=${material.unit}`)}
                                                            className="bg-blue-600 hover:bg-blue-700"
                                                        >
                                                            <ShoppingCart className="w-3 h-3 mr-1" />
                                                            Order
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        );
                    })()}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MonthWiseForecast;

