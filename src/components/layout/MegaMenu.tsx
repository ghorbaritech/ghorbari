"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Category } from "@/services/categoryService";
import { ChevronRight } from "lucide-react";

interface MegaMenuProps {
    isOpen: boolean;
    activeSection: 'all' | 'design' | 'product' | 'service' | null;
    categories: Category[];
    onMouseLeave?: () => void;
    onClose: () => void;
}

const CategoryTree = ({
    categories,
    parentId,
    onClose,
    getLink,
    depth = 0
}: {
    categories: Category[],
    parentId: string,
    onClose: () => void,
    getLink: (c: Category) => string,
    depth?: number
}) => {
    const children = categories.filter(c => c.parent_id === parentId);
    if (children.length === 0) return null;

    if (depth === 0) {
        // Direct children of the active root (Level 1 typically, Column Headers like "Specific Area" or "Full Apartment")
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {children.map(child => (
                    <div key={child.id} className="flex flex-col gap-3">
                        <Link
                            href={getLink(child)}
                            onClick={onClose}
                            className="font-bold text-neutral-900 hover:text-primary-600 pb-2 border-b text-[15px] uppercase tracking-wide"
                        >
                            {child.name}
                        </Link>
                        <CategoryTree
                            categories={categories}
                            parentId={child.id}
                            onClose={onClose}
                            getLink={getLink}
                            depth={depth + 1}
                        />
                    </div>
                ))}
            </div>
        );
    }

    // Nested children recursively displayed (Levels 2, 3, 4...)
    return (
        <ul className={`flex flex-col ${depth === 1 ? "gap-4" : depth === 2 ? "gap-2 mt-2" : "gap-1.5 pl-3 mt-1.5 border-l-2 border-neutral-100"}`}>
            {children.map(child => {
                // Determine styling based on depth
                let linkStyle = "";
                if (depth === 1) {
                    // Level 2 (e.g. Bed Room, Full House Design)
                    linkStyle = "font-bold text-[14px] text-neutral-800 hover:text-primary-600";
                } else if (depth === 2) {
                    // Level 3 (e.g. Living Room Design, Regular Bedroom Design)
                    linkStyle = "text-sm text-neutral-600 hover:text-primary-600 font-medium";
                } else {
                    // Level 4+ (e.g. full remodelling)
                    linkStyle = "text-xs text-neutral-500 hover:text-primary-600";
                }

                return (
                    <li key={child.id} className={depth === 1 ? "flex flex-col" : ""}>
                        <Link
                            href={getLink(child)}
                            onClick={onClose}
                            className={`transition-colors block ${linkStyle}`}
                        >
                            {child.name}
                        </Link>
                        <CategoryTree
                            categories={categories}
                            parentId={child.id}
                            onClose={onClose}
                            getLink={getLink}
                            depth={depth + 1}
                        />
                    </li>
                );
            })}
        </ul>
    );
};

export function MegaMenu({ isOpen, activeSection, categories, onMouseLeave, onClose }: MegaMenuProps) {
    const [activeRootId, setActiveRootId] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setActiveRootId(null);
            return;
        }

        const roots = categories.filter((c) => c.level === 0 && (activeSection === 'all' || c.type === activeSection));
        if (roots.length > 0) {
            if (!activeRootId || !roots.find(r => r.id === activeRootId)) {
                setActiveRootId(roots[0].id);
            }
        } else {
            setActiveRootId(null);
        }
    }, [isOpen, activeSection, categories]);

    if (!isOpen || !activeSection) return null;

    let currentCategories = categories;
    if (activeSection !== 'all') {
        currentCategories = categories.filter(c => c.type === activeSection);
    }

    const rootCategories = currentCategories.filter(c => c.level === 0);
    const activeRoot = rootCategories.find(c => c.id === activeRootId);

    const getLink = (category: Category) => {
        if (category.type === 'product') {
            return `/products?category=${category.slug}`;
        }
        if (category.type === 'service') {
            return `/services`;
        }
        if (category.type === 'design') {
            return `/services/design/book`;
        }
        return '/';
    };

    return (
        <div
            className="absolute left-0 top-full w-full bg-white shadow-2xl border-t z-50 animate-in fade-in slide-in-from-top-1 duration-200"
            onMouseLeave={onMouseLeave}
        >
            <div className="section-container max-h-[80vh] flex overflow-hidden">
                {/* Level 0: Sidebar roots */}
                <div className="w-1/4 min-w-[280px] bg-neutral-50 border-r py-6 overflow-y-auto no-scrollbar">
                    {rootCategories.length === 0 ? (
                        <div className="px-8 py-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">No categories</div>
                    ) : (
                        rootCategories.map((root) => (
                            <div
                                key={root.id}
                                onMouseEnter={() => setActiveRootId(root.id)}
                                className={`group flex items-center justify-between px-8 py-3.5 cursor-pointer transition-all border-l-4
                                    ${activeRootId === root.id
                                        ? 'bg-white text-primary-950 border-l-primary-950 shadow-sm'
                                        : 'text-neutral-500 hover:bg-white hover:text-primary-950 border-l-transparent'}`
                                }
                            >
                                <Link
                                    href={getLink(root)}
                                    onClick={onClose}
                                    className="text-[13px] font-bold uppercase tracking-wider"
                                >
                                    {root.name}
                                </Link>
                                <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${activeRootId === root.id ? 'translate-x-1 text-primary-950' : 'text-neutral-300'}`} />
                            </div>
                        ))
                    )}
                </div>

                {/* Main Content Area */}
                <div className="w-3/4 p-10 overflow-y-auto no-scrollbar bg-white">
                    {activeRoot ? (
                        <div>
                            <div className="mb-8 flex items-center justify-between border-b pb-4">
                                <h3 className="text-xl font-black text-primary-950 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-primary-950 rounded-full"></span>
                                    {activeRoot.name}
                                </h3>
                                <Link
                                    href={getLink(activeRoot)}
                                    onClick={onClose}
                                    className="text-xs font-bold text-accent-500 hover:text-accent-600 transition-colors uppercase tracking-widest"
                                >
                                    Explore All {activeRoot.name}
                                </Link>
                            </div>
                            <CategoryTree
                                categories={currentCategories}
                                parentId={activeRoot.id}
                                onClose={onClose}
                                getLink={getLink}
                            />
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-neutral-300 gap-4">
                            <div className="w-12 h-12 rounded-full border-2 border-dashed border-neutral-200 animate-spin"></div>
                            <p className="text-xs font-bold uppercase tracking-widest">Syncing Categories...</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-primary-950 text-white p-4">
                <div className="section-container flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Ghorbari Professional Network • 24/7 Verified Support • Secure Transactions</p>
                    <Link href="/products" onClick={onClose} className="text-xs font-black hover:text-accent-500 transition-colors uppercase tracking-widest flex items-center gap-2">
                        View All Materials <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
