import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SideNotificationToast({ materialCount, onClose, onClick }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (materialCount > 0) {
            // Delay for smooth entrance animation
            setTimeout(() => setIsVisible(true), 100);
        }
    }, [materialCount]);

    const handleClose = (e) => {
        e.stopPropagation();
        setIsVisible(false);
        setTimeout(() => {
            if (onClose) onClose();
        }, 300);
    };

    if (materialCount === 0) return null;

    return (
        <div
            className={`fixed top-6 right-6 z-50 cursor-pointer transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                }`}
            onClick={onClick}
        >
            <div className="bg-white/95 backdrop-blur-sm border border-orange-200 rounded-xl shadow-2xl hover:shadow-orange-500/25 transition-all hover:scale-105 max-w-sm">
                <div className="p-4">
                    <div className="flex items-start gap-3">
                        {/* Icon with pulse animation */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-20"></div>
                            <div className="relative bg-gradient-to-br from-orange-500 to-red-500 p-2.5 rounded-full">
                                <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-slate-900 text-sm">
                                    High Priority Alert
                                </h3>
                                <Badge className="bg-red-100 text-red-700 border-red-300 text-xs px-2 py-0">
                                    {materialCount}
                                </Badge>
                            </div>
                            <p className="text-xs text-slate-600">
                                {materialCount} material{materialCount !== 1 ? 's' : ''} need{materialCount === 1 ? 's' : ''} immediate ordering
                            </p>
                            <p className="text-xs text-blue-600 font-medium mt-1.5">
                                Click to view details →
                            </p>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Bottom accent bar */}
                <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-b-xl"></div>
            </div>
        </div>
    );
}
