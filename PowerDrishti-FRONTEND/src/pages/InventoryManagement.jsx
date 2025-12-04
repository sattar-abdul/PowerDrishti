import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Package, Upload, Save, Download, RefreshCw, FileSpreadsheet } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LOCAL_URL } from "@/api/api";

const InventoryManagement = () => {
    const { token } = useAuth();
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [inventory, setInventory] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState(null);

    // Fetch user's projects on mount
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
        }
    };

    // Fetch inventory when project is selected
    useEffect(() => {
        if (selectedProject) {
            fetchInventory();
        }
    }, [selectedProject]);

    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${LOCAL_URL}/api/inventory/${selectedProject}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setInventory(data);
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
            setMessage({ type: 'error', text: 'Failed to load inventory' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...inventory.items];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: field === 'quantity' ? parseFloat(value) || 0 : value
        };
        setInventory({ ...inventory, items: updatedItems });
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            const response = await fetch(`${LOCAL_URL}/api/inventory/${selectedProject}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ items: inventory.items })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Inventory saved successfully!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error('Error saving inventory:', error);
            setMessage({ type: 'error', text: 'Failed to save inventory' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCsvUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const csv = event.target.result;
                const lines = csv.split('\n');
                const updatedItems = [...inventory.items];

                // Skip header row, start from line 1
                for (let i = 1; i < lines.length && i <= 33; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    // Parse CSV line properly, handling quoted values
                    const values = line.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
                    const [itemName, quantity, unit] = values;

                    if (itemName && quantity !== undefined) {
                        // Find matching item by name or update by index
                        const itemIndex = updatedItems.findIndex(item =>
                            item.item_name.toLowerCase() === itemName.toLowerCase()
                        );

                        if (itemIndex !== -1) {
                            updatedItems[itemIndex].quantity = parseFloat(quantity) || 0;
                            if (unit) {
                                updatedItems[itemIndex].unit = unit;
                            }
                        } else if (i - 1 < updatedItems.length) {
                            // Update by position if name doesn't match
                            updatedItems[i - 1].quantity = parseFloat(quantity) || 0;
                            if (unit) {
                                updatedItems[i - 1].unit = unit;
                            }
                        }
                    }
                }

                setInventory({ ...inventory, items: updatedItems });
                setMessage({ type: 'success', text: 'CSV data imported successfully!' });
                setTimeout(() => setMessage(null), 3000);
            } catch (error) {
                console.error('Error parsing CSV:', error);
                setMessage({ type: 'error', text: 'Failed to parse CSV file' });
            }
        };
        reader.readAsText(file);
    };

    const downloadTemplate = () => {
        if (!inventory) return;

        // Create CSV content without extra quotes
        const csvContent = [
            ['Item Name', 'Quantity', 'Unit'],
            ...inventory.items.map(item => [item.item_name, item.quantity, item.unit])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_${selectedProject}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-[#f5f8fd] p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
                <p className="text-slate-500 mt-1">Manage material inventory per project</p>
            </div>

            {/* Project Selection */}
            <Card className="bg-white border-slate-200">
                <CardHeader className="border-b border-slate-200">
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        Select Project
                        <Select value={selectedProject} onValueChange={setSelectedProject}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a project" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((project) => (
                                    <SelectItem key={project._id} value={project._id}>
                                        {project.project_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedProject && (
                            <Button
                                onClick={fetchInventory}
                                variant="outline"
                                className="gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </Button>
                        )}
                    </CardTitle>
                </CardHeader>
                {/* <CardContent className="p-6">
                    <div className="flex gap-4 items-end">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="project">Project *</Label>
                            <Select value={selectedProject} onValueChange={setSelectedProject}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a project" />
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
                        {selectedProject && (
                            <Button
                                onClick={fetchInventory}
                                variant="outline"
                                className="gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </Button>
                        )}
                    </div>
                </CardContent> */}
            </Card>

            {/* CSV Upload Section */}
            {selectedProject && inventory && (
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader className="border-b border-blue-200">
                        <CardTitle className="flex items-center gap-2 text-blue-900">
                            <FileSpreadsheet className="w-5 h-5" />
                            CSV Import/Export
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <Label htmlFor="csv-upload" className="cursor-pointer">
                                    <div className="flex items-center gap-3 p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-100 transition-all">
                                        <Upload className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium text-blue-900">Upload CSV File</p>
                                            <p className="text-sm text-blue-700">Import inventory data from CSV</p>
                                        </div>
                                    </div>
                                    <input
                                        id="csv-upload"
                                        type="file"
                                        accept=".csv"
                                        onChange={handleCsvUpload}
                                        className="hidden"
                                    />
                                </Label>
                            </div>
                            <div className="flex items-center">
                                <Button
                                    onClick={downloadTemplate}
                                    variant="outline"
                                    className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Current Data
                                </Button>
                            </div>
                        </div>
                        <Alert className="mt-4 bg-white border-blue-300">
                            <AlertDescription className="text-blue-800 text-sm">
                                <strong>CSV Format:</strong> Item Name, Quantity, Unit (e.g., "Conductors (ACSR), 150, km")
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}

            {/* Message Alert */}
            {message && (
                <Alert className={message.type === 'success' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}>
                    <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                        {message.text}
                    </AlertDescription>
                </Alert>
            )}

            {/* Inventory Items Table */}
            {isLoading ? (
                <Card className="bg-white border-slate-200">
                    <CardContent className="p-12 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </CardContent>
                </Card>
            ) : selectedProject && inventory ? (
                <Card className="bg-white border-slate-200">
                    <CardHeader className="border-b border-slate-200 flex flex-row items-center justify-between">
                        <CardTitle>Inventory Items ({inventory.items.length})</CardTitle>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Inventory
                                </>
                            )}
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700 w-12">#</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Item Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700 w-48">Quantity</th>
                                        <th className="text-left py-3 px-4 font-semibold text-slate-700 w-40">Unit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventory.items.map((item, index) => (
                                        <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-4 text-slate-500 font-medium">{index + 1}</td>
                                            <td className="py-3 px-4">
                                                <Input
                                                    value={item.item_name}
                                                    onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                                                    className="border-slate-200 focus:border-blue-500"
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <Input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    className="border-slate-200 focus:border-blue-500"
                                                    step="0.01"
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <Input
                                                    value={item.unit}
                                                    onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                                    className="border-slate-200 focus:border-blue-500"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-white border-slate-200">
                    <CardContent className="p-12 text-center">
                        <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 text-lg">Select a project to manage inventory</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default InventoryManagement;
