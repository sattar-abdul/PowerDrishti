import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Calendar, AlertCircle, CheckCircle2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { LOCAL_URL } from "@/api/api";

const TimeSeriesPrediction = () => {
    const { token } = useAuth();
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [currentMonth, setCurrentMonth] = useState(1);
    const [monthlyBOQ, setMonthlyBOQ] = useState(null);
    const [actualConsumption, setActualConsumption] = useState({});
    const [forecastResults, setForecastResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch all projects on mount
    useEffect(() => {
        fetchProjects();
    }, []);

    // Fetch monthly BOQ when project is selected
    useEffect(() => {
        if (selectedProject) {
            fetchMonthlyBOQ();
            fetchSavedConsumption();
        }
    }, [selectedProject]);

    const fetchProjects = async () => {
        try {
            const response = await fetch(`${LOCAL_URL}/api/projects`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            setError('Failed to load projects');
        }
    };

    const fetchMonthlyBOQ = async () => {
        setError(""); // Clear previous errors
        setMonthlyBOQ(null); // Clear previous BOQ data
        setActualConsumption({}); // Clear consumption data

        try {
            const response = await fetch(`${LOCAL_URL}/api/boq/monthly/${selectedProject}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log(response);

            if (response.ok) {
                const data = await response.json();
                console.log(data);

                setMonthlyBOQ(data);
                // Initialize actual consumption with zeros
                const materials = {};
                if (data.monthly_breakdown && data.monthly_breakdown.length > 0) {
                    const firstMonth = data.monthly_breakdown[0];
                    // materials is an object, not a Map, so use Object.entries()
                    Object.entries(firstMonth.materials).forEach(([materialName, quantity]) => {
                        materials[materialName] = 0;
                    });
                }
                setActualConsumption(materials);
            } else if (response.status === 404) {
                setError('No monthly forecast found for this project. Please go to "Project Forecast" page and generate a monthly forecast first.');
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to load monthly BOQ');
            }
        } catch (error) {
            console.error('Error fetching monthly BOQ:', error);
            setError('Failed to load monthly BOQ. Please check your connection and try again.');
        }
    };

    const fetchSavedConsumption = async () => {
        try {
            const response = await fetch(`${LOCAL_URL}/api/forecast/consumption/${selectedProject}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const savedRecords = await response.json();
                console.log('✅ Saved consumption records:', savedRecords);
                console.log('📊 Number of records:', savedRecords?.length);

                // If we have saved consumption data, use the most recent one
                if (savedRecords && savedRecords.length > 0) {
                    // Sort by month descending to get the latest
                    const latestRecord = savedRecords.sort((a, b) => b.month - a.month)[0];
                    console.log('📌 Latest record:', latestRecord);
                    console.log('📅 Latest month:', latestRecord.month);
                    console.log('🔧 Materials type:', typeof latestRecord.materials);
                    console.log('🔧 Materials value:', latestRecord.materials);

                    // Convert the materials Map/object to our state format
                    const savedMaterials = {};

                    // Handle both Map and plain object
                    const materialsData = latestRecord.materials instanceof Map
                        ? Array.from(latestRecord.materials.entries())
                        : Object.entries(latestRecord.materials || {});

                    console.log('🔍 Materials entries:', materialsData);

                    materialsData.forEach(([materialName, quantity]) => {
                        savedMaterials[materialName] = quantity;
                        console.log(`   ➡️ ${materialName}: ${quantity}`);
                    });

                    console.log('💾 Saved materials object:', savedMaterials);

                    // Update actual consumption with saved data
                    setActualConsumption(prev => {
                        console.log('🔄 Previous consumption:', prev);
                        const updated = {
                            ...prev,
                            ...savedMaterials
                        };
                        console.log('✨ Updated consumption:', updated);
                        return updated;
                    });

                    // Also update current month if available
                    if (latestRecord.month) {
                        setCurrentMonth(latestRecord.month);
                    }
                } else {
                    console.log('⚠️ No saved consumption records found');
                }
            } else {
                console.log('❌ Failed to fetch consumption records, status:', response.status);
            }
        } catch (error) {
            console.error('Error fetching saved consumption:', error);
            // Don't show error to user - it's okay if no saved data exists
        }
    };

    const handleConsumptionChange = (materialName, value) => {
        setActualConsumption(prev => ({
            ...prev,
            [materialName]: parseFloat(value) || 0
        }));
    };

    const generateForecast = async () => {
        if (!selectedProject || !currentMonth) {
            setError('Please select a project and enter current month');
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(`${LOCAL_URL}/api/forecast/predict/${selectedProject}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentMonth: parseInt(currentMonth),
                    actualCumulative: actualConsumption
                })
            });

            if (response.ok) {
                const data = await response.json();
                setForecastResults(data);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to generate forecast');
            }
        } catch (error) {
            console.error('Error generating forecast:', error);
            setError('Failed to generate forecast');
        } finally {
            setIsLoading(false);
        }
    };

    const saveConsumption = async () => {
        if (!selectedProject || !currentMonth) {
            setError('Please select a project and enter current month');
            return;
        }

        try {
            const response = await fetch(`${LOCAL_URL}/api/forecast/consumption/${selectedProject}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    month: parseInt(currentMonth),
                    materials: actualConsumption
                })
            });

            if (response.ok) {
                alert('Consumption data saved successfully!');
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to save consumption data');
            }
        } catch (error) {
            console.error('Error saving consumption:', error);
            setError('Failed to save consumption data');
        }
    };

    const getProgressIndicator = (pf) => {
        const pfValue = parseFloat(pf);
        if (pfValue > 1.0) {
            return (
                <div className="flex items-center gap-1 text-green-600">
                    <ArrowUpCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Ahead</span>
                </div>
            );
        } else if (pfValue < 1.0) {
            return (
                <div className="flex items-center gap-1 text-red-600">
                    <ArrowDownCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Behind</span>
                </div>
            );
        } else {
            return (
                <div className="flex items-center gap-1 text-blue-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">On Track</span>
                </div>
            );
        }
    };

    const getMaterialUnit = (materialName) => {
        if (materialName.includes('_tons')) return 'tons';
        if (materialName.includes('_km')) return 'km';
        if (materialName.includes('_m3')) return 'm³';
        if (materialName.includes('_m') && !materialName.includes('_m3')) return 'm';
        if (materialName.includes('_MT')) return 'MT';
        if (materialName.includes('_pcs')) return 'pcs';
        if (materialName.includes('_units')) return 'units';
        if (materialName.includes('_sets')) return 'sets';
        if (materialName.includes('_lots')) return 'lots';
        return 'units';
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                    Time Series Material Prediction
                </h1>
                <p className="text-slate-500 mt-1">
                    Forecast next month's material consumption based on actual progress
                </p>
            </div>

            {/* Input Section */}
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardHeader>
                    <CardTitle>Input Parameters</CardTitle>
                    <CardDescription>Select project and enter actual consumption data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="project">Select Project</Label>
                            <Select value={selectedProject} onValueChange={setSelectedProject}>
                                <SelectTrigger id="project">
                                    <SelectValue placeholder="Choose a project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project) => (
                                        <SelectItem key={project._id} value={project._id}>
                                            {project.project_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="currentMonth">Current Month</Label>
                            <Input
                                id="currentMonth"
                                type="number"
                                min="1"
                                max={monthlyBOQ?.total_months || 12}
                                value={currentMonth}
                                onChange={(e) => setCurrentMonth(e.target.value)}
                                placeholder="Enter current month number"
                            />
                        </div>
                    </div>

                    {/* Actual Consumption Input - Temporarily Disabled */}
                    {/* {selectedProject && monthlyBOQ && (
                        <div className="space-y-3">
                            <Label className="text-base font-semibold">Actual Cumulative Consumption (Till Month {currentMonth})</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2 bg-white rounded-lg border">
                                {Object.keys(actualConsumption).map((materialName) => (
                                    <div key={materialName} className="space-y-1">
                                        <Label htmlFor={materialName} className="text-sm">
                                            {materialName.replace(/_/g, ' ')}
                                        </Label>
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                id={materialName}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={actualConsumption[materialName]}
                                                onChange={(e) => handleConsumptionChange(materialName, e.target.value)}
                                                className="flex-1"
                                            />
                                            <span className="text-xs text-slate-500 min-w-[40px]">
                                                {getMaterialUnit(materialName)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )} */}

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button
                            onClick={saveConsumption}
                            disabled={!selectedProject || !monthlyBOQ}
                            variant="outline"
                            className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                            size="lg"
                        >
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Save Consumption Data
                        </Button>

                        <Button
                            onClick={generateForecast}
                            disabled={!selectedProject || isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            size="lg"
                        >
                            {isLoading ? (
                                <>
                                    <Calendar className="w-5 h-5 mr-2 animate-pulse" />
                                    Generating Forecast...
                                </>
                            ) : (
                                <>
                                    <TrendingUp className="w-5 h-5 mr-2" />
                                    Generate Forecast for Month {parseInt(currentMonth) + 1}
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Results Section */}
            {forecastResults && (
                <Card className="border-slate-200">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            Forecast Results for Month {forecastResults.nextMonth}
                        </CardTitle>
                        <CardDescription>
                            Based on actual consumption data till month {forecastResults.currentMonth}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Material</TableHead>
                                        <TableHead className="text-center">Progress Status</TableHead>
                                        <TableHead className="text-right">Progress Factor</TableHead>
                                        <TableHead className="text-right">Planned (Original)</TableHead>
                                        <TableHead className="text-right">Forecast (Adjusted)</TableHead>
                                        <TableHead className="text-right">Actual Cumulative</TableHead>
                                        <TableHead className="text-right">Remaining BOQ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {forecastResults.forecast.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">
                                                {item.Material.replace(/_/g, ' ')}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {getProgressIndicator(item.Progress_Factor)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        parseFloat(item.Progress_Factor) > 1.0
                                                            ? "bg-green-50 text-green-700 border-green-200"
                                                            : parseFloat(item.Progress_Factor) < 1.0
                                                                ? "bg-red-50 text-red-700 border-red-200"
                                                                : "bg-blue-50 text-blue-700 border-blue-200"
                                                    }
                                                >
                                                    {item.Progress_Factor}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-slate-500">
                                                {item.Planned_for_next_month_before.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-blue-600">
                                                {item.New_forecast_based_on_actual_consumption.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.Actual_Cumulative.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.Remaining_BOQ.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Info Card */}
            <Card className="border-slate-200 bg-slate-50">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                        How It Works
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 space-y-2">
                    <p>
                        <strong>Progress Factor (PF):</strong> Calculated as Actual Cumulative ÷ Planned Cumulative.
                        Values are clipped between 0.5 and 1.5 to prevent extreme predictions.
                    </p>
                    <p>
                        <strong>Forecast Calculation:</strong> Next month's forecast = Planned quantity × Progress Factor,
                        capped at remaining BOQ to ensure realistic predictions.
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong className="text-green-600">PF &gt; 1.0:</strong> Project is ahead of schedule</li>
                        <li><strong className="text-blue-600">PF = 1.0:</strong> Project is on track</li>
                        <li><strong className="text-red-600">PF &lt; 1.0:</strong> Project is behind schedule</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
};

export default TimeSeriesPrediction;
