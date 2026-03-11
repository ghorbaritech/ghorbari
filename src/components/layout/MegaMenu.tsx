"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, PencilRuler, Package, Wrench, Layers } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Category {
    id: string;
    name: string;
    name_bn: string | null;
    slug: string | null;
    type: "design" | "product" | "service";
    level: number;
    parent_id: string | null;
}

interface MegaMenuProps {
    language: "EN" | "BN";
    triggerLabel?: string;
}

const TYPE_CONFIG = {
    design: {
        label_en: "Design & Planning",
        label_bn: "ডিজাইন ও পরিকল্পনা",
        icon: PencilRuler,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        href: "/services/design/book",
    },
    product: {
        label_en: "Products",
        label_bn: "পণ্যসমূহ",
        icon: Package,
        color: "text-blue-600",
        bg: "bg-blue-50",
        href: "/products",
    },
    service: {
        label_en: "Services",
        label_bn: "সেবা সমূহ",
        icon: Wrench,
        color: "text-orange-600",
        bg: "bg-orange-50",
        href: "/services",
    },
};

export function MegaMenu({ language, triggerLabel }: MegaMenuProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeType, setActiveType] = useState<keyof typeof TYPE_CONFIG | null>(null);
    const [activeL1, setActiveL1] = useState<Category | null>(null);
    const [activeL2, setActiveL2] = useState<Category | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    // Position of the dropdown in viewport (fixed positioning to escape overflow:auto)
    const [panelPos, setPanelPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    const triggerRef = useRef<HTMLButtonElement>(null);
    const closeTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase
            .from("product_categories")
            .select("id, name, name_bn, slug, type, level, parent_id")
            .order("name")
            .then(({ data, error }) => {
                if (error) console.error("MegaMenu fetch error:", error);
                if (data) setCategories(data as Category[]);
            });
    }, []);

    const clearClose = () => {
        if (closeTimer.current) clearTimeout(closeTimer.current);
    };

    const scheduleClose = () => {
        closeTimer.current = setTimeout(() => {
            setIsOpen(false);
            setActiveType(null);
            setActiveL1(null);
            setActiveL2(null);
        }, 180);
    };

    const handleOpen = useCallback(() => {
        clearClose();
        // Calculate position from trigger button
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPanelPos({ top: rect.bottom, left: rect.left });
        }
        setIsOpen(true);
    }, []);

    const closeImmediate = useCallback(() => {
        clearClose();
        setIsOpen(false);
        setActiveType(null);
        setActiveL1(null);
        setActiveL2(null);
    }, []);

    const getName = (cat: Category) =>
        language === "BN" && cat.name_bn ? cat.name_bn : cat.name;

    const getHref = (cat: Category) => {
        const id = cat.slug || cat.id;
        if (cat.type === "design") return `/services/design/book`;
        if (cat.type === "product") return `/products?category=${id}`;
        return `/services?category=${id}`;
    };

    const l1Cats = activeType
        ? categories.filter((c) => c.type === activeType && (c.level === 0 || !c.parent_id))
        : [];

    const l2Cats = activeL1
        ? categories.filter((c) => c.parent_id === activeL1.id)
        : [];

    const l3Cats = activeL2
        ? categories.filter((c) => c.parent_id === activeL2.id)
        : [];

    const hasChildren = (cat: Category) =>
        categories.some((c) => c.parent_id === cat.id);

    return (
        <>
            {/* ── Trigger Button ── */}
            <button
                ref={triggerRef}
                aria-haspopup="true"
                aria-expanded={isOpen}
                onMouseEnter={handleOpen}
                onMouseLeave={scheduleClose}
                onClick={() => (isOpen ? closeImmediate() : handleOpen())}
                className={`flex items-center gap-2 py-3 border-b-2 transition-all text-[12px] font-bold uppercase tracking-wide whitespace-nowrap
          ${isOpen
                        ? "text-primary-600 border-primary-600"
                        : "text-neutral-700 border-transparent hover:text-primary-600 hover:border-primary-600"
                    }`}
            >
                <Layers className="w-4 h-4" />
                <span>{triggerLabel ?? (language === "BN" ? "সবকিছু" : "Everything")}</span>
                <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                />
            </button>

            {/* ── Panel (fixed positioning to escape overflow:auto clipping) ── */}
            {isOpen && (
                <div
                    className="flex shadow-2xl border border-neutral-200 bg-white rounded-b-2xl rounded-tr-2xl overflow-hidden"
                    style={{
                        position: "fixed",
                        top: panelPos.top,
                        left: panelPos.left,
                        zIndex: 9999,
                    }}
                    onMouseEnter={clearClose}
                    onMouseLeave={scheduleClose}
                >
                    {/* TYPE PANEL */}
                    <div className="w-80 border-r border-neutral-100 py-3 flex-shrink-0 bg-neutral-50/80">
                        <p className="px-4 pb-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            {language === "BN" ? "সব বিভাগ" : "Browse by"}
                        </p>

                        {(Object.keys(TYPE_CONFIG) as Array<keyof typeof TYPE_CONFIG>).map((type) => {
                            const cfg = TYPE_CONFIG[type];
                            const Icon = cfg.icon;
                            const isActive = activeType === type;
                            return (
                                <button
                                    key={type}
                                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold transition-colors
                    ${isActive
                                            ? "bg-white text-neutral-950 shadow-sm"
                                            : "text-neutral-600 hover:bg-white hover:text-neutral-950"
                                        }`}
                                    onMouseEnter={() => {
                                        setActiveType(type);
                                        setActiveL1(null);
                                        setActiveL2(null);
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${cfg.bg}`}>
                                            <Icon className={`w-4 h-4 ${cfg.color}`} />
                                        </span>
                                        <span className="whitespace-nowrap">{language === "BN" ? cfg.label_bn : cfg.label_en}</span>
                                    </div>
                                    <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-neutral-950" : "text-neutral-300"}`} />
                                </button>
                            );
                        })}

                        <div className="mt-3 pt-2 border-t border-neutral-200 px-4">
                            <Link
                                href="/categories"
                                onClick={closeImmediate}
                                className="text-[11px] font-bold uppercase tracking-wide text-primary-600 hover:underline"
                            >
                                {language === "BN" ? "সব বিভাগ দেখুন →" : "View all categories →"}
                            </Link>
                        </div>
                    </div>

                    {/* L1 PANEL */}
                    {activeType && l1Cats.length > 0 && (
                        <div className="w-72 border-r border-neutral-100 py-3 flex-shrink-0 max-h-[420px] overflow-y-auto bg-white">
                            <p className="px-4 pb-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                {language === "BN" ? TYPE_CONFIG[activeType].label_bn : TYPE_CONFIG[activeType].label_en}
                            </p>
                            {l1Cats.map((cat) => {
                                const isActive = activeL1?.id === cat.id;
                                const hasSub = hasChildren(cat);
                                return (
                                    <button
                                        key={cat.id}
                                        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors text-left
                      ${isActive ? "bg-neutral-50 text-neutral-950 font-semibold" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950"}`}
                                        onMouseEnter={() => { setActiveL1(cat); setActiveL2(null); }}
                                        onClick={() => { closeImmediate(); window.location.href = getHref(cat); }}
                                    >
                                        <span className="leading-snug whitespace-nowrap">{getName(cat)}</span>
                                        {hasSub && (
                                            <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-neutral-700" : "text-neutral-300"}`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* L2 PANEL */}
                    {activeL1 && l2Cats.length > 0 && (
                        <div className="w-72 border-r border-neutral-100 py-3 flex-shrink-0 max-h-[420px] overflow-y-auto bg-white">
                            <p className="px-4 pb-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 truncate">
                                {getName(activeL1)}
                            </p>
                            {l2Cats.map((cat) => {
                                const isActive = activeL2?.id === cat.id;
                                const hasSub = hasChildren(cat);
                                return (
                                    <button
                                        key={cat.id}
                                        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors text-left
                      ${isActive ? "bg-neutral-50 text-neutral-950 font-semibold" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950"}`}
                                        onMouseEnter={() => setActiveL2(cat)}
                                        onClick={() => { closeImmediate(); window.location.href = getHref(cat); }}
                                    >
                                        <span className="leading-snug whitespace-nowrap">{getName(cat)}</span>
                                        {hasSub && (
                                            <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-neutral-700" : "text-neutral-300"}`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* L3 PANEL */}
                    {activeL2 && l3Cats.length > 0 && (
                        <div className="w-72 py-3 flex-shrink-0 max-h-[420px] overflow-y-auto bg-white">
                            <p className="px-4 pb-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 truncate">
                                {getName(activeL2)}
                            </p>
                            {l3Cats.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={getHref(cat)}
                                    onClick={closeImmediate}
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950 transition-colors"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 flex-shrink-0" />
                                    <span className="leading-snug whitespace-nowrap">{getName(cat)}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
