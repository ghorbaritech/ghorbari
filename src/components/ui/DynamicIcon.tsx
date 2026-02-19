"use client";

import { memo } from "react";
import * as Icons from "lucide-react";
import { Loader2 } from "lucide-react";

interface DynamicIconProps extends React.SVGProps<SVGSVGElement> {
    name: string;
}

export const DynamicIcon = memo(({ name, className, ...props }: DynamicIconProps) => {
    const Icon = (Icons as any)[name];

    if (!Icon) {
        // Fallback or empty if not found
        return <div className={`bg-neutral-100 rounded-full ${className}`} />;
    }

    return <Icon className={className} {...props} />;
});

DynamicIcon.displayName = "DynamicIcon";
