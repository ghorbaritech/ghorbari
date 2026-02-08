"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext<{
    activeTab: string
    setActiveTab: (value: string) => void
} | undefined>(undefined)

const Tabs = ({ defaultValue, className, children, ...props }: { defaultValue: string, className?: string, children: React.ReactNode }) => {
    const [activeTab, setActiveTab] = React.useState(defaultValue)

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={cn("space-y-4", className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

const useTabs = () => {
    const context = React.useContext(TabsContext)
    if (!context) throw new Error("Tabs components must be used within a Tabs provider")
    return context
}

const TabsList = ({ className, children, ...props }: any) => (
    <div
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-md bg-neutral-100 p-1 text-neutral-500",
            className
        )}
        {...props}
    >
        {children}
    </div>
)

const TabsTrigger = ({ className, value, children, ...props }: any) => {
    const { activeTab, setActiveTab } = useTabs()
    const isActive = activeTab === value
    return (
        <button
            onClick={() => setActiveTab(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
                isActive ? "bg-white text-neutral-900 shadow-sm" : "hover:text-neutral-900 font-bold",
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}

const TabsContent = ({ className, value, children, ...props }: any) => {
    const { activeTab } = useTabs()
    if (activeTab !== value) return null
    return (
        <div
            className={cn(
                "mt-2 focus-visible:outline-none",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
