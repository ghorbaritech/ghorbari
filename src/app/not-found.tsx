'use client'

import Link from "next/link";
import { Home, ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
            <div className="max-w-lg w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                {/* Geometric Brand Mark */}
                <div className="flex items-center justify-center">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-2xl">
                            <Compass className="w-16 h-16 text-neutral-700" strokeWidth={1.5} />
                        </div>
                        <div className="absolute -top-3 -right-3 w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                            <span className="text-white font-black text-sm">?</span>
                        </div>
                    </div>
                </div>

                {/* Error Code */}
                <div className="space-y-3">
                    <p className="text-[11px] font-black text-neutral-600 uppercase tracking-[0.3em]">
                        Error 404
                    </p>
                    <h1 className="text-4xl font-black text-white tracking-tight leading-none">
                        Page not found
                    </h1>
                    <p className="text-neutral-400 font-medium leading-relaxed text-sm max-w-sm mx-auto">
                        We couldn&apos;t find what you were looking for. The page may have moved, been removed, or never existed.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-0.5"
                    >
                        <Home className="w-4 h-4" />
                        Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-600 font-bold text-sm uppercase tracking-widest transition-all hover:bg-neutral-900"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>

                {/* Quick Links */}
                <div className="pt-4 border-t border-neutral-800">
                    <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest mb-4">
                        Try these instead
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {[
                            { label: "Products", href: "/products" },
                            { label: "Services", href: "/services" },
                            { label: "Design Studio", href: "/services/design/book" },
                            { label: "AI Consultant", href: "/ai-consultant" },
                            { label: "Cost Calculator", href: "/tools/cost-calculator" },
                        ].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 text-[11px] font-bold uppercase tracking-wider transition-all hover:bg-neutral-800"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Brand watermark */}
                <p className="text-[10px] font-bold text-neutral-700 uppercase tracking-[0.2em]">
                    Dalankotha · Quality Construction Ecosystem
                </p>
            </div>
        </div>
    );
}
