import * as React from "react"
import { cn } from "@/lib/utils"

function Badge({ className, variant = "default", ...props }: { className?: string, variant?: string } & React.HTMLAttributes<HTMLDivElement>) {
    const variants: Record<string, string> = {
        default: "border-transparent bg-neutral-900 text-white hover:bg-neutral-900/80",
        secondary: "border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80",
        outline: "text-neutral-900 border-neutral-200",
        error: "border-transparent bg-red-500 text-white hover:bg-red-500/80"
    }

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variants[variant] || variants.default,
                className
            )}
            {...props}
        />
    )
}

export { Badge }
