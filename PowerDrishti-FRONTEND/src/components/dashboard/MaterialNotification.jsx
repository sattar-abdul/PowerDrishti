import React, { useEffect, useState } from 'react';
import { Bell, X, Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function MaterialNotification({ materials, onViewMaterials, onDismiss, onOrder }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (materials && materials.length > 0) {
            setIsVisible(true);
        }
    }, [materials]);

    const handleDismiss = () => {
        setIsVisible(false);
        if (onDismiss) onDismiss();
    };

    const handleOrder = (material) => {
        if (onOrder) onOrder(material);
        handleDismiss();
    };

    if (!isVisible || !materials || materials.length === 0) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 animate-fade-in"
                onClick={handleDismiss}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden pointer-events-auto animate-scale-in"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/20 rounded-full">
                                    <Bell className="w-6 h-6 animate-pulse" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">High Priority Alert</h2>
                                    <p className="text-orange-100 text-sm mt-1">
                                        {materials.length} material{materials.length !== 1 ? 's' : ''} require immediate ordering
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDismiss}
                                className="text-white hover:bg-white/20 h-8 w-8 p-0"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
                        <div className="space-y-3">
                            {materials.map((material) => (
                                <div
                                    key={material._id}
                                    className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                                >
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <Package className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-slate-900">
                                                    {material.material_name.replace(/_/g, ' ')}
                                                </h4>
                                                <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">
                                                    High Priority
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-600">
                                                <span className="font-medium">{material.quantity}</span> {material.unit}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">
                                                {material.project?.project_name}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleOrder(material)}
                                        className="bg-orange-600 hover:bg-orange-700 text-white ml-3"
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Order Now
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-200 p-4 bg-slate-50 flex justify-between items-center">
                        <Button
                            variant="outline"
                            onClick={() => {
                                onViewMaterials();
                                handleDismiss();
                            }}
                            className="text-slate-700"
                        >
                            View All Materials
                        </Button>
                        <Button
                            onClick={handleDismiss}
                            className="bg-slate-600 hover:bg-slate-700 text-white"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
