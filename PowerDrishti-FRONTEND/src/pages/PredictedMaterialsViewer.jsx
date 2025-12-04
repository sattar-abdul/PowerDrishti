import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Calendar, Zap, Info } from "lucide-react";
import { LOCAL_URL } from "@/api/api";
import { Button } from "@/components/ui/button";

const PredictedMaterialsViewer = () => {
    const { token } = useAuth();
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [selectedProjectData, setSelectedProjectData] = useState(null);
    const [boq, setBoq] = useState(null);
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);
    const [isLoadingBOQ, setIsLoadingBOQ] = useState(false);

    // Fetch all projects on mount
    useEffect(() => {
        fetchProjects();
    }, []);

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
        } finally {
            setIsLoadingProjects(false);
        }
    };

    const fetchBOQ = async (projectId) => {
        setIsLoadingBOQ(true);
        try {
            const response = await fetch(`${LOCAL_URL}/api/boq/project/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setBoq(data);
            } else {
                setBoq(null);
                alert('No BOQ found for this project');
            }
        } catch (error) {
            console.error('Error fetching BOQ:', error);
            setBoq(null);
        } finally {
            setIsLoadingBOQ(false);
        }
    };

    const handleProjectChange = (projectId) => {
        setSelectedProject(projectId);
        const project = projects.find(p => p._id === projectId);
        setSelectedProjectData(project);

        if (projectId) {
            fetchBOQ(projectId);
        } else {
            setBoq(null);
            setSelectedProjectData(null);
        }
    };

    return (
        <div className="bg-[#f5f8fd] p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Predicted Materials Viewer</h1>
                <p className="text-slate-500 mt-1">View ML-predicted material forecasts for your projects</p>
            </div>

            <Card className="bg-white border-slate-200">
                <CardHeader className="border-b border-slate-200">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Select Project
                    </CardTitle>
                    {isLoadingProjects ? (
                        <div className="flex items-center gap-2 text-slate-600">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading projects...
                        </div>
                    ) : (
                        <Select value={selectedProject} onValueChange={handleProjectChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choose a project to view its predicted materials" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((project) => (
                                    <SelectItem key={project._id} value={project._id}>
                                        {project.project_name} - {project.state_region}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </CardHeader>
            </Card>

            {isLoadingBOQ && (
                <Card className="bg-white border-slate-200">
                    <CardContent className="p-12">
                        <div className="flex flex-col items-center gap-3 text-slate-600">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <p>Loading predicted materials...</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {boq && !isLoadingBOQ && (
                <>
                    <Card className="bg-white border-slate-200">
                        <CardHeader className="border-b border-slate-200">
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-green-600" />
                                Prediction Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">Prediction Date</p>
                                    <p className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-blue-600" />
                                        {new Date(boq.prediction_date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">ML Model Version</p>
                                    <p className="text-lg font-semibold text-slate-900">
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                            v{boq.ml_model_version}
                                        </Badge>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Total Materials</p>
                                    <p className="text-lg font-semibold text-slate-900">
                                        {boq.materials?.length || 0} items
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-slate-200">
                        <CardHeader className="border-b border-slate-200">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Predicted Material Forecast
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="w-12">#</TableHead>
                                            <TableHead>Material Name</TableHead>
                                            <TableHead className="text-right">Required Quantity</TableHead>
                                            <TableHead className="text-right">Unit</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {boq.materials?.map((material, index) => (
                                            <TableRow key={index} className="hover:bg-slate-50">
                                                <TableCell className="font-medium text-slate-500">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className="font-medium text-slate-900">
                                                    {material.material_name}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold text-slate-700">
                                                    {material.quantity.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right text-slate-600">
                                                    {material.unit}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {selectedProjectData && (
                        <div className="">
                            <Card className="bg-white border-slate-200">
                                <CardHeader className="border-b border-slate-200">
                                    <CardTitle className="flex items-center gap-2">
                                        <Info className="w-5 h-5 text-purple-600" />
                                        ML Parameters Provided
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        {/* Project Information */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-700 mb-3 border-b pb-2">Project Information</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-sm text-slate-500">Project Name</p>
                                                    <p className="font-medium text-slate-900">{selectedProjectData.project_name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">Start Date</p>
                                                    <p className="font-medium text-slate-900">
                                                        {new Date(selectedProjectData.project_start_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">Completion Period</p>
                                                    <p className="font-medium text-slate-900">{selectedProjectData.expected_completion_period} months</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Geographic Information */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-700 mb-3 border-b pb-2">Geographic & Site Information</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-sm text-slate-500">State/Region</p>
                                                    <p className="font-medium text-slate-900">{selectedProjectData.state_region}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">District</p>
                                                    <p className="font-medium text-slate-900">{selectedProjectData.district}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">Terrain Type</p>
                                                    <p className="font-medium text-slate-900">{selectedProjectData.terrain_type}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Technical Fields */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-700 mb-3 border-b pb-2">Technical Specifications</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                <div>
                                                    <p className="text-sm text-slate-500">Project Type</p>
                                                    <p className="font-medium text-slate-900">{selectedProjectData.project_type}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">Voltage Level</p>
                                                    <p className="font-medium text-slate-900">{selectedProjectData.line_voltage_level}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">Substation Type</p>
                                                    <p className="font-medium text-slate-900">{selectedProjectData.substation_type}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">Expected Towers</p>
                                                    <p className="font-medium text-slate-900">{selectedProjectData.expected_towers}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">Route Length</p>
                                                    <p className="font-medium text-slate-900">{selectedProjectData.route_km} km</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">Average Span</p>
                                                    <p className="font-medium text-slate-900">{selectedProjectData.avg_span_m} m</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">Number of Circuits</p>
                                                    <p className="font-medium text-slate-900">{selectedProjectData.num_circuits}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">Number of Bays</p>
                                                    <p className="font-medium text-slate-900">{selectedProjectData.no_of_bays}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Financial Information */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-700 mb-3 border-b pb-2">Financial Information</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-sm text-slate-500">Total Budget</p>
                                                    <p className="font-medium text-slate-900">₹{selectedProjectData.total_budget} Crores</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500">Taxes & Duty</p>
                                                    <p className="font-medium text-slate-900">{selectedProjectData.taxes_duty}%</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end">
                                <Button
                                    onClick={() => {
                                        window.location.href = `/monthly/${selectedProject}`;
                                    }}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Generate Month-wise Forecast & Order
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {!boq && !isLoadingBOQ && selectedProject && (
                <Card className="bg-white border-slate-200">
                    <CardContent className="p-12">
                        <div className="text-center text-slate-500">
                            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p>No predicted materials found for this project</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default PredictedMaterialsViewer;
