import React, { useState, useMemo } from 'react';
import { X, Package, ShoppingCart, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function MaterialOrderSidebar({ materials, isOpen, onClose, onOrderMaterial }) {
    const [selectedProject, setSelectedProject] = useState('all');

    // Extract unique projects from materials
    const projects = useMemo(() => {
        const projectMap = new Map();
        materials.forEach(material => {
            if (material.project) {
                projectMap.set(material.project._id, material.project.project_name);
            }
        });
        return Array.from(projectMap, ([id, name]) => ({ id, name }));
    }, [materials]);

    // Filter materials based on selected project
    const filteredMaterials = useMemo(() => {
        if (selectedProject === 'all') {
            return materials;
        }
        return materials.filter(material => material.project?._id === selectedProject);
    }, [materials, selectedProject]);

    const handleBackdropClick = () => {
        onClose();
    };

    const handleSidebarClick = (e) => {
        e.stopPropagation();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 z-40 animate-in fade-in duration-200"
                onClick={handleBackdropClick}
            />

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-full md:w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                onClick={handleSidebarClick}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2.5 rounded-lg">
                                <Package className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">High Priority Materials</h2>
                                <p className="text-orange-100 text-sm mt-0.5">
                                    {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 's' : ''} to order
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Project Filter */}
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                            <Filter className="w-4 h-4" />
                            <label className="text-sm font-medium">Filter by Project</label>
                        </div>
                        <select
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white/95 text-slate-900 rounded-lg border-0 focus:ring-2 focus:ring-white/50 transition-all cursor-pointer font-medium"
                        >
                            <option value="all">All Projects ({materials.length})</option>
                            {projects.map(project => {
                                const count = materials.filter(m => m.project?._id === project.id).length;
                                return (
                                    <option key={project.id} value={project.id}>
                                        {project.name} ({count})
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                {/* Materials List */}
                <div className="overflow-y-auto h-[calc(100vh-240px)] p-6">
                    {filteredMaterials.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">No materials found</p>
                            <p className="text-slate-400 text-sm mt-1">Try selecting a different project</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredMaterials.map((material) => (
                                <div
                                    key={material._id}
                                    className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-slate-900 text-base">
                                                    {material.material_name}
                                                </h3>
                                                <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">
                                                    High Priority
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-600 mb-1">
                                                <span className="font-medium">Project:</span>{' '}
                                                {material.project?.project_name || 'N/A'}
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                <span className="font-medium">Quantity:</span>{' '}
                                                <span className="text-orange-600 font-bold">
                                                    {material.quantity} {material.unit}
                                                </span>
                                            </p>
                                            {material.month_number && (
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Month {material.month_number}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => onOrderMaterial(material)}
                                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium shadow-lg hover:shadow-orange-500/25 transition-all"
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Order Now
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 bg-slate-50 border-t border-slate-200 p-4">
                    <p className="text-xs text-slate-500 text-center">
                        Click "Order Now" to proceed to material tracking and place your order
                    </p>
                </div>
            </div>
        </>
    );
}
