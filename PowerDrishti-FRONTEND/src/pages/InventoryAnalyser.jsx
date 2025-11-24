import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, Warehouse, AlertTriangle, TrendingUp, Image as ImageIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function InventoryAnalyzer() {
    const [inventoryName, setInventoryName] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile || !inventoryName) {
            alert("Please provide inventory warehouse name and upload a photo");
            return;
        }

        setIsProcessing(true);
        try {
            // Simulate API call
            const file_url = "https://dummyimage.com/600x400/cccccc/000000&text=Warehouse+Photo";

            const result = {
                estimated_capacity_m3: 1200,
                current_utilization_percent: 75,
                overstock_risk: "Medium",
                carbon_waste_kg: 180,
                recommendations: [
                    "Improve aisle organization for better accessibility.",
                    "Install energy-efficient lighting.",
                    "Optimize stacking height to maximize space."
                ],
                analysis_notes: "Estimates based on visible racks and stacking height."
            };

            setAnalysisResult({
                ...result,
                photo_url: file_url
            });

        } catch (error) {
            console.error("Error analyzing inventory warehouse:", error);
            alert("Failed to analyze inventory warehouse. Please try again.");
        }
        setIsProcessing(false);
    };

    const getRiskColor = (risk) => {
        switch (risk) {
            case 'Low': return 'bg-green-100 text-green-800 border-green-300';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'High': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <div className=" bg-[#f5f8fd] p-6 md:p-8 max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Inventory Storage Analyzer</h1>
                <p className="text-slate-500 mt-1">AI-powered capacity estimation using computer vision</p>
            </div>

            <Card className="bg-white border-slate-200">
                <CardHeader className="border-b border-slate-200">
                    <CardTitle className="flex items-center gap-2">
                        <Warehouse className="w-5 h-5 text-blue-600" />
                        Upload Warehouse Photo
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="inventory_name">Warehouse Name/ID</Label>
                        <Input
                            id="inventory_name"
                            value={inventoryName}
                            onChange={(e) => setInventoryName(e.target.value)}
                            placeholder="e.g., Warehouse-A-North"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>Upload Photo</Label>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer">
                                {previewUrl ? (
                                    <div className="space-y-3">
                                        <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-md" />
                                        <p className="text-sm text-slate-500">Click to change photo</p>
                                    </div>
                                ) : (
                                    <>
                                        <ImageIcon className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                                        <p className="text-slate-600 font-medium">Click to upload warehouse photo</p>
                                        <p className="text-sm text-slate-500 mt-1">PNG, JPG up to 10MB</p>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    <Button
                        onClick={handleAnalyze}
                        disabled={isProcessing || !selectedFile || !inventoryName}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing with AI...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4 mr-2" />
                                Analyze Storage Capacity
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {analysisResult && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-linear-to-br from-blue-50 to-cyan-50 border-blue-200">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <Warehouse className="w-5 h-5 text-blue-600" />
                                    <span className="text-sm font-medium text-slate-600">Estimated Capacity</span>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">
                                    {analysisResult.estimated_capacity_m3?.toLocaleString()} m³
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-linear-to-br from-purple-50 to-pink-50 border-purple-200">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                    <span className="text-sm font-medium text-slate-600">Current Utilization</span>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">
                                    {analysisResult.current_utilization_percent}%
                                </p>
                                <Progress value={analysisResult.current_utilization_percent} className="mt-2" />
                            </CardContent>
                        </Card>

                        <Card className={`border-2 ${getRiskColor(analysisResult.overstock_risk)}`}>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span className="text-sm font-medium">Overstock Risk</span>
                                </div>
                                <p className="text-3xl font-bold">
                                    {analysisResult.overstock_risk}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                        <CardHeader>
                            <CardTitle className="text-green-900">Carbon Impact</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-slate-700">Estimated carbon waste from excess storage:</span>
                                <span className="text-2xl font-bold text-green-900">
                                    {analysisResult.carbon_waste_kg?.toFixed(2)} kg CO₂
                                </span>
                            </div>
                            <Alert className="bg-white border-green-300">
                                <AlertDescription className="text-slate-700">
                                    Excess storage increases energy consumption for lighting, climate control, and security systems.
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-slate-200">
                        <CardHeader>
                            <CardTitle>Optimization Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {analysisResult.recommendations?.map((rec, index) => (
                                    <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <span className="text-blue-600 font-bold text-lg mt-0.5">{index + 1}.</span>
                                        <p className="text-slate-700">{rec}</p>
                                    </div>
                                ))}
                            </div>
                            {analysisResult.analysis_notes && (
                                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-600">
                                        <strong>Analysis Notes:</strong> {analysisResult.analysis_notes}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}