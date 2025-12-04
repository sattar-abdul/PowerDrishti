import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, Leaf, AlertCircle, Sliders, Upload, FileText, X, FileUp, Edit3, Calendar } from "lucide-react";
import { LOCAL_URL } from "@/api/api";



const ProjectForecast = () => {
    const { token } = useAuth();
    const [inputMode, setInputMode] = useState("form"); // "form" or "pdf"
    const [isProcessing, setIsProcessing] = useState(false);
    const [forecastResults, setForecastResults] = useState(null);
    console.log(`token is : ${token}`); //just for test

    // PDF Upload State
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [isUploadingPdf, setIsUploadingPdf] = useState(false);

    const [formData, setFormData] = useState({
        // 1. Project Information
        project_name: "",
        project_start_date: "",
        expected_completion_period: "",

        // 2. Geographic & Site Information
        state_region: "",
        district: "",
        terrain_type: "",

        // 3. Technical Fields
        project_type: "",
        line_voltage_level: "",
        substation_type: "None",
        expected_towers: "",
        tower_types: [], // Array of strings
        route_km: "", // Required for ML
        avg_span_m: "300", // Default 300m, required for ML
        num_circuits: "1", // Default 1, required for ML
        no_of_bays: "0", // Required for ML

        // 4. Financial Inputs
        total_budget: "",
        taxes_duty: "",
    });

    const handlePdfSelect = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                alert("Please upload a PDF file");
                return;
            }
            setSelectedPdf(file);

            setIsUploadingPdf(true);
            setTimeout(() => {
                setPdfUrl("https://dummyimage.com/600x400/cccccc/000000&text=PDF+Preview");
                setIsUploadingPdf(false);
            }, 500);
        }
    };

    const handleRemovePdf = () => {
        setSelectedPdf(null);
        setPdfUrl(null);
    };

    const handleSubmitPdf = async () => {
        setIsUploadingPdf(true);
        setTimeout(() => {
            setPdfUrl("https://dummyimage.com/600x400/cccccc/000000&text=PDF+Preview");
            setIsUploadingPdf(false);
        }, 500);
    };

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const response = await fetch(`${LOCAL_URL}/api/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to generate forecast');
            }

            const data = await response.json();

            setForecastResults({
                materials: data.boq?.materials || [],
                project: data.project
            });
            setIsProcessing(false);

        } catch (error) {
            console.error(error);
            setIsProcessing(false);
            
            // Parse error message from backend
            let errorMessage = 'Failed to generate forecast. Please try again.';
            if (error.message) {
                errorMessage = error.message;
            }
            
            // Show error to user
            alert(`Error: ${errorMessage}`);
        }
    };

    const handleTowerTypeToggle = (type) => {
        setFormData(prev => ({
            ...prev,
            tower_types: prev.tower_types.includes(type)
                ? prev.tower_types.filter(t => t !== type)
                : [...prev.tower_types, type]
        }));
    };

    return (
        <div className=" bg-[#f5f8fd] p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Project Demand Forecast</h1>
                <p className="text-slate-500 mt-1">ML-powered material demand prediction with carbon tracking</p>
            </div>

            <Card className="bg-white border-slate-200">
                <CardHeader className="border-b border-slate-200">
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Choose Input Method
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <Tabs value={inputMode} onValueChange={setInputMode} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="form" className="flex items-center gap-2">
                                <Edit3 className="w-4 h-4" />
                                Fill Form Manually
                            </TabsTrigger>
                            <TabsTrigger value="pdf" className="flex items-center gap-2">
                                <FileUp className="w-4 h-4" />
                                Upload PDF Document
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="form">
                            <form onSubmit={handleSubmitForm} className="space-y-8">

                                {/* 1. Project Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">1. Project Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="project_name">Project Name *</Label>
                                            <Input
                                                id="project_name"
                                                value={formData.project_name}
                                                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                                                placeholder="e.g., North Region 400kV Transmission"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="project_start_date">Project Start Date *</Label>
                                            <Input
                                                id="project_start_date"
                                                type="date"
                                                value={formData.project_start_date}
                                                onChange={(e) => setFormData({ ...formData, project_start_date: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="expected_completion_period">Expected Completion (Months) *</Label>
                                            <Input
                                                id="expected_completion_period"
                                                type="number"
                                                value={formData.expected_completion_period}
                                                onChange={(e) => setFormData({ ...formData, expected_completion_period: e.target.value })}
                                                placeholder="e.g., 24"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Geographic & Site Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">2. Geographic & Site Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="state_region">State / Region *</Label>
                                            <Select value={formData.state_region} onValueChange={(value) => setFormData({ ...formData, state_region: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select State" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Delhi">Delhi</SelectItem>
                                                    <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                                                    <SelectItem value="Karnataka">Karnataka</SelectItem>
                                                    <SelectItem value="Gujarat">Gujarat</SelectItem>
                                                    <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                                                    {/* Add more states as needed */}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="district">District *</Label>
                                            <Input
                                                id="district"
                                                value={formData.district}
                                                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                                placeholder="e.g., Pune"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="terrain_type">Terrain Type</Label>
                                            <Select value={formData.terrain_type} onValueChange={(value) => setFormData({ ...formData, terrain_type: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Terrain" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Plain">Plain</SelectItem>
                                                    <SelectItem value="Hilly">Hilly</SelectItem>
                                                    <SelectItem value="Coastal">Coastal</SelectItem>
                                                    <SelectItem value="Desert">Desert</SelectItem>
                                                    <SelectItem value="Forest">Forest</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Technical Fields */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">3. Technical Fields</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="project_type">Project Type *</Label>
                                            <Select value={formData.project_type} onValueChange={(value) => setFormData({ ...formData, project_type: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Transmission Line">Transmission Line</SelectItem>
                                                    <SelectItem value="Substation">Substation</SelectItem>
                                                    <SelectItem value="Both">Both</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="line_voltage_level">Line Voltage Level *</Label>
                                            <Select value={formData.line_voltage_level} onValueChange={(value) => setFormData({ ...formData, line_voltage_level: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Voltage" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="66kV">66kV</SelectItem>
                                                    <SelectItem value="132kV">132kV</SelectItem>
                                                    <SelectItem value="220kV">220kV</SelectItem>
                                                    <SelectItem value="400kV">400kV</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="substation_type">Substation Type</Label>
                                            <Select value={formData.substation_type} onValueChange={(value) => setFormData({ ...formData, substation_type: value })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Substation Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="None">None</SelectItem>
                                                    <SelectItem value="AIS">AIS</SelectItem>
                                                    <SelectItem value="GIS">GIS</SelectItem>
                                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="expected_towers">Expected No. of Towers</Label>
                                            <Input
                                                id="expected_towers"
                                                type="number"
                                                value={formData.expected_towers}
                                                onChange={(e) => setFormData({ ...formData, expected_towers: e.target.value })}
                                                placeholder="e.g., 150"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="route_km">Route Length (km) *</Label>
                                            <Input
                                                id="route_km"
                                                type="number"
                                                value={formData.route_km}
                                                onChange={(e) => setFormData({ ...formData, route_km: e.target.value })}
                                                placeholder="e.g., 120"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="avg_span_m">Average Span (m)</Label>
                                            <Input
                                                id="avg_span_m"
                                                type="number"
                                                value={formData.avg_span_m}
                                                onChange={(e) => setFormData({ ...formData, avg_span_m: e.target.value })}
                                                placeholder="Default: 300"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="num_circuits">Number of Circuits</Label>
                                            <Input
                                                id="num_circuits"
                                                type="number"
                                                value={formData.num_circuits}
                                                onChange={(e) => setFormData({ ...formData, num_circuits: e.target.value })}
                                                placeholder="Default: 1"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="no_of_bays">Number of Bays</Label>
                                            <Input
                                                id="no_of_bays"
                                                type="number"
                                                value={formData.no_of_bays}
                                                onChange={(e) => setFormData({ ...formData, no_of_bays: e.target.value })}
                                                placeholder="Default: 0"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tower Types (Multi-select)</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Type A', 'Type B', 'Type C', 'Type D', 'Special'].map(type => (
                                                <Badge
                                                    key={type}
                                                    variant={formData.tower_types?.includes(type) ? "default" : "outline"}
                                                    className="cursor-pointer px-3 py-1"
                                                    onClick={() => handleTowerTypeToggle(type)}
                                                >
                                                    {type}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Financial Inputs */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">4. Financial Inputs</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="total_budget">Total Budget (₹ in Crores) *</Label>
                                            <Input
                                                id="total_budget"
                                                type="number"
                                                value={formData.total_budget}
                                                onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
                                                placeholder="e.g., 500"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="taxes_duty">Local Taxes / GST / Import Duty (%)</Label>
                                            <Input
                                                id="taxes_duty"
                                                type="number"
                                                step="0.1"
                                                value={formData.taxes_duty}
                                                onChange={(e) => setFormData({ ...formData, taxes_duty: e.target.value })}
                                                placeholder="e.g., 18"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" disabled={isProcessing} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 mt-6">
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Generating AI Forecast...
                                        </>
                                    ) : (
                                        <>
                                            <TrendingUp className="w-4 h-4 mr-2" />
                                            Generate Forecast
                                        </>
                                    )}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="pdf">
                            <div className="space-y-6">
                                <Alert className="bg-blue-50 border-blue-200">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-blue-800">
                                        Upload a project DPR, technical specifications, or any document containing project details.
                                        AI will automatically extract all information and generate the forecast.
                                    </AlertDescription>
                                </Alert>

                                {!selectedPdf ? (
                                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={handlePdfSelect}
                                            className="hidden"
                                            id="pdf-upload"
                                            disabled={isUploadingPdf}
                                        />
                                        <label htmlFor="pdf-upload" className="cursor-pointer">
                                            <FileText className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                                            <p className="text-lg text-slate-600 font-medium mb-2">
                                                {isUploadingPdf ? "Uploading..." : "Click to upload project PDF"}
                                            </p>
                                            <p className="text-sm text-slate-500">PDF files only, up to 10MB</p>
                                        </label>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-4 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
                                            <FileText className="w-12 h-12 text-blue-600 shrink-0" />
                                            <div className="flex-1">
                                                <p className="font-semibold text-slate-900 text-lg">{selectedPdf.name}</p>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    {(selectedPdf.size / 1024 / 1024).toFixed(2)} MB • Uploaded successfully
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleRemovePdf}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <X className="w-5 h-5" />
                                            </Button>
                                        </div>

                                        <Button
                                            onClick={handleSubmitPdf}
                                            disabled={isProcessing}
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                            size="lg"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Analyzing PDF & Generating Forecast...
                                                </>
                                            ) : (
                                                <>
                                                    <TrendingUp className="w-5 h-5 mr-2" />
                                                    Generate Forecast from PDF
                                                </>
                                            )}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

                        {forecastResults && (
                <Card className="bg-white border-slate-200">
                    <CardHeader className="border-b border-slate-200">
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            Material Demand Forecast
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700 w-12">#</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Material Name</th>
                                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Required Quantity</th>
                                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Unit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {forecastResults.materials?.map((material, index) => (
                                        <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-4 text-slate-500 font-medium">{index + 1}</td>
                                            <td className="py-3 px-4 font-medium text-slate-900">{material.material_name}</td>
                                            <td className="text-right py-3 px-4 text-slate-700 font-semibold">
                                                {material.quantity.toLocaleString()}
                                            </td>
                                            <td className="text-right py-3 px-4 text-slate-600">
                                                {material.unit}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                             <div className="flex justify-end">
          <Button
            onClick={() => {
              // Navigate to month-wise forecast page
              // For now, we'll create a state to show the component inline
              // You can also use router.push('/month-wise-forecast')
              window.location.href = `/monthly`;
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Generate Month-wise Forecast & Order
          </Button>
        </div>
                        </div>
                    </CardContent>
                </Card>
            )}


{/* // Update the ProjectForecast component - Add this after the materials table */}
{forecastResults && (
  <>
    <Card className="bg-white border-slate-200">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Material Demand Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 w-12">#</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Material Name</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Required Quantity</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Unit</th>
              </tr>
            </thead>
            <tbody>
              {forecastResults.materials?.map((material, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-slate-500 font-medium">{index + 1}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{material.material_name}</td>
                  <td className="text-right py-3 px-4 text-slate-700 font-semibold">
                    {material.quantity.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4 text-slate-600">
                    {material.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* NEW BUTTON TO GENERATE MONTH-WISE FORECAST */}
        <div className="flex justify-end">
          <Button
            onClick={() => {
              // Navigate to month-wise forecast page
              // For now, we'll create a state to show the component inline
              // You can also use router.push('/month-wise-forecast')
              window.location.href = `/monthly`;
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Generate Month-wise Forecast & Order
          </Button>
        </div>
      </CardContent>
    </Card>
  </>
)}
        </div>
    );
};

export default ProjectForecast;