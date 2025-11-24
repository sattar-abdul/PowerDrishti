import React, { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";

const SidebarContext = createContext({
    expanded: true,
    setExpanded: () => { },
    mobile: false,
    setMobile: () => { },
    toggleSidebar: () => { },
});

export function SidebarProvider({ children }) {
    const [expanded, setExpanded] = useState(true);
    const [mobile, setMobile] = useState(false);

    const toggleSidebar = () => setExpanded(!expanded);

    return (
        <SidebarContext.Provider value={{ expanded, setExpanded, mobile, setMobile, toggleSidebar }}>
            <div className="flex min-h-screen w-full bg-slate-50">
                {children}
            </div>
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    return useContext(SidebarContext);
}

export function Sidebar({ children, className }) {
    const { expanded } = useContext(SidebarContext);
    return (
        <aside className={cn(
            "sticky top-0 h-screen z-[1000] flex flex-col border-r bg-white transition-all duration-300",
            expanded ? "w-64" : "w-16",
            className
        )}>
            {children}
        </aside>
    );
}

export function SidebarHeader({ children, className }) {
    const { expanded } = useContext(SidebarContext);
    return (
        <div className={cn(
            "flex h-16 items-center border-b px-4 overflow-hidden",
            !expanded && "justify-center px-2",
            className
        )}>
            {children}
        </div>
    );
}

export function SidebarContent({ children, className }) {
    return <div className={cn("flex-1 overflow-auto py-4", className)}>{children}</div>;
}

export function SidebarGroup({ children, className }) {
    return <div className={cn("px-2 py-2", className)}>{children}</div>;
}

export function SidebarGroupLabel({ children, className }) {
    const { expanded } = useContext(SidebarContext);
    if (!expanded) return null;
    return <div className={cn("px-2 text-xs font-semibold text-slate-500 mb-2", className)}>{children}</div>;
}

export function SidebarGroupContent({ children }) {
    return <div className="space-y-1">{children}</div>;
}

export function SidebarMenu({ children }) {
    return <div className="space-y-1">{children}</div>;
}

export function SidebarMenuItem({ children }) {
    return <div>{children}</div>;
}

export function SidebarMenuButton({ children, isActive, className, asChild, ...props }) {
    const { expanded } = useContext(SidebarContext);
    const Comp = asChild ? React.Fragment : "button"; // Simplified handling

    return (
        <div
            className={cn(
                "flex items-center w-full rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-slate-100 text-slate-700",
                isActive && "bg-blue-50 text-blue-700",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function SidebarFooter({ children, className }) {
    const { expanded } = useContext(SidebarContext);
    return (
        <div className={cn(
            "border-t p-4",
            !expanded && "flex justify-center p-2",
            className
        )}>
            {children}
        </div>
    );
}

export function SidebarTrigger({ className }) {
    const { toggleSidebar } = useContext(SidebarContext);
    return (
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className={cn("h-8 w-8", className)}>
            <PanelLeft className="h-4 w-4" />
            <span className="sr-only">Toggle Sidebar</span>
        </Button>
    );
}
