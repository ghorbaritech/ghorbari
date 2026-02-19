"use client"

import * as React from "react"
import { X } from "lucide-react"

export function Toaster() {
    // We need to import useToast locally to avoid circular dependencies if we were to import from the file we are defining?
    // Actually, we can import from use-toast.
    const { toasts, dismiss } = require("./use-toast").useToast()

    if (!toasts.length) return null

    return (
        <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
            {toasts.map(function ({ id, title, description, variant, action, ...props }: any) {
                return (
                    <div
                        key={id}
                        className={`${variant === "destructive"
                                ? "destructive group border-red-500 bg-red-600 text-white"
                                : "border bg-white text-neutral-950"
                            } group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full`}
                        {...props}
                    >
                        <div className="grid gap-1">
                            {title && <div className="text-sm font-semibold">{title}</div>}
                            {description && (
                                <div className="text-sm opacity-90">{description}</div>
                            )}
                        </div>
                        {action}
                        <button
                            onClick={() => dismiss(id)}
                            className="absolute right-2 top-2 rounded-md p-1 text-neutral-500 opacity-0 transition-opacity hover:text-neutral-900 group-hover:opacity-100 dark:text-neutral-400 dark:hover:text-neutral-50"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
