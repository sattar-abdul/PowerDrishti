import React from 'react';
import { Package, AlertCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function HighPriorityMaterialCard({ material, onOrder }) {
    const navigate = useNavigate();

    const handleCardClick = () => {
        // Navigate to monthly prediction page for this project
        navigate(`/monthly-forecast/${material.project._id}`);
    };

    const handleOrderClick = (e) => {
        e.stopPropagation(); // Prevent card click when clicking order button
        onOrder(material);
    };

    return (
        <Card
            className="bg-white border-orange-200 hover:border-orange-400 transition-all cursor-pointer hover:shadow-lg"
            onClick={handleCardClick}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <Package className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-slate-900 truncate">
                                    {material.material_name.replace(/_/g, ' ')}
                                </h4>
                                <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    High Priority
                                </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-1">
                                <span className="font-medium">{material.quantity}</span> {material.unit}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                                {material.project?.project_name}
                            </p>
                            <p className="text-xs text-slate-400">
                                {material.project?.district}, {material.project?.state_region}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                        <Button
                            size="sm"
                            onClick={handleOrderClick}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            Order Now
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCardClick}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                            View Details
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
                {material.status && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Status:</span>
                            <Badge variant="outline" className={
                                material.status === 'Delivered' ? 'bg-green-50 text-green-700 border-green-300' :
                                    material.status === 'In Transit' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                                        material.status === 'Ordered' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                                            'bg-slate-50 text-slate-700 border-slate-300'
                            }>
                                {material.status}
                            </Badge>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
