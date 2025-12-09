import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    LineChart,
    Warehouse,
    MapPin,
    Leaf,
    FileText,
    Zap,
    Menu,
    X,
    LogOut,
    Package,
    ListChecks,
    TrendingUp
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
    SidebarProvider,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";

const navigationItems = [
    {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Project Forecast",
        url: "/forecast",
        icon: LineChart,
    },
    {
        title: "Predicted Materials",
        url: "/predicted-materials",
        icon: ListChecks,
    },
    {
        title: "Time Series Prediction",
        url: "/time-series-prediction",
        icon: TrendingUp,
    },
    {
        title: "Inventory Management",
        url: "/inventory-management",
        icon: Package,
    },
    {
        title: "Material Tracking",
        url: "/material-tracking",
        icon: MapPin,
    },
    // {
    //     title: "Carbon Tracking",
    //     url: "/carbon-tracking",
    //     icon: Leaf,
    // },
    // {
    //     title: "Inventory Analyzer",
    //     url: "/inventory",
    //     icon: Warehouse,
    // },
    // {
    //     title: "Reports",
    //     url: "/reports",
    //     icon: FileText,
    // },
];

function SidebarContentWrapper() {
    const location = useLocation();
    const { expanded } = useSidebar();
    const { user, logout } = useAuth();

    return (
        <>
            <SidebarHeader className="border-b border-slate-200">
                <div className="flex items-center justify-between w-full">
                    {expanded ? (
                        <>
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 min-w-10 bg-gradient-to-br from-blue-600 to-teal-500 rounded-lg flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <div className="truncate">
                                    <h2 className="font-bold text-slate-900 text-lg truncate">PowerDrishti AI</h2>
                                    <p className="text-xs text-slate-500 truncate">For POWERGRID</p>
                                </div>
                            </div>
                            <SidebarTrigger className="text-slate-400 hover:text-slate-600" />
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-2 w-full">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-500 rounded-lg flex items-center justify-center">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <SidebarTrigger className="text-slate-400 hover:text-slate-600" />
                        </div>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent className="p-2">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2 py-2">
                        Main Menu
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigationItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        className={`hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 rounded-lg mb-1 ${location.pathname === item.url ? 'bg-blue-100 text-blue-700' : ''
                                            }`}
                                    >
                                        <Link to={item.url} className={`flex items-center px-3 py-2 ${expanded ? 'gap-3' : 'justify-center'}`}>
                                            <item.icon className="w-5 h-5 min-w-5" />
                                            {expanded && <span className="font-medium">{item.title}</span>}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {expanded && (
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2 py-2 mt-4">
                            What we offer
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <div className="px-3 py-2 space-y-3">
                                {/* <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Leaf className="w-4 h-4 text-green-600" />
                                        <span className="text-xs font-semibold text-green-900">Sustainability</span>
                                    </div>
                                    <p className="text-xs text-green-700">AI-powered carbon tracking</p>
                                </div> */}
                                <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Zap className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs font-semibold text-blue-900">ML Forecasting</span>
                                    </div>
                                    <p className="text-xs text-blue-700">Predictive demand analysis</p>
                                </div>
                            </div>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-200">
                {expanded ? (
                    <div className="flex items-center gap-3 justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">{user?.name?.charAt(0) || 'U'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 text-sm truncate">{user?.name || 'User'}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
                            </div>
                        </div>
                        <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">{user?.name?.charAt(0) || 'U'}</span>
                        </div>
                        <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </SidebarFooter>
        </>
    );
}

export default function Layout({ children, currentPageName }) {
    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
                <Sidebar className="border-r border-slate-200 bg-white">
                    <SidebarContentWrapper />
                </Sidebar>

                <main className="flex-1 flex flex-col overflow-hidden">
                    <header className="bg-white border-b border-slate-200 px-6 py-4 md:hidden">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
                            <h1 className="text-xl font-semibold text-slate-900">PowerDrishtiAI</h1>
                        </div>
                    </header>

                    <div className="flex-1 overflow-auto">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}