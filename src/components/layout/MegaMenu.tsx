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

export function MegaMenu({ isOpen, activeSection, categories, onMouseLeave, onClose }: MegaMenuProps) {
    const [activeRootId, setActiveRootId] = useState<string | null>(null);

    // Reset active root category when section changes or menu opens
    useEffect(() => {
        if (!isOpen) {
            setActiveRootId(null);
            return;
        }

        const roots = categories.filter((c) => c.level === 0 && (activeSection === 'all' || c.type === activeSection));
        if (roots.length > 0) {
            // Only set first item if nothing active or current active root is not in this section
            if (!activeRootId || !roots.find(r => r.id === activeRootId)) {
                setActiveRootId(roots[0].id);
            }
        } else {
            setActiveRootId(null);
        }
    }, [isOpen, activeSection, categories]); // Do not include activeRootId in dependencies to avoid reset on hover

    if (!isOpen || !activeSection) return null;

    // Filter categories for the current active section
    let currentCategories = categories;
    if (activeSection !== 'all') {
        currentCategories = categories.filter(c => c.type === activeSection);
    }

    const rootCategories = currentCategories.filter(c => c.level === 0);
    const getChildren = (parentId: string) => currentCategories.filter(c => c.parent_id === parentId);

    const activeRoot = rootCategories.find(c => c.id === activeRootId);
    let subCategories: Category[] = [];
    if (activeRootId) {
        subCategories = getChildren(activeRootId);
    }

    // Determine target link based on type
    const getLink = (category: Category) => {
        if (category.type === 'product') {
            return `/products?category=${category.slug}`;
        }
        if (category.type === 'service') {
            return `/services`; // Update if there's a specific route like /services?category=
        }
        if (category.type === 'design') {
            return `/services/design/book`;
        }
        return '/';
    };

    return (
        <div
            className="absolute left-0 top-full w-full bg-white shadow-2xl border-t z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseLeave={onMouseLeave}
        >
            <div className="container mx-auto px-8 max-h-[70vh] flex overflow-hidden">
                {/* Level 0: Root Categories */}
                <div className="w-1/4 min-w-[250px] bg-neutral-50/50 border-r py-4 overflow-y-auto no-scrollbar max-h-[70vh]">
                    {rootCategories.length === 0 ? (
                        <div className="px-6 py-4 text-sm text-neutral-500">No categories found.</div>
                    ) : (
                        rootCategories.map((root) => (
                            <Link
                                key={root.id}
                                href={getLink(root)}
                                onClick={onClose}
                                onMouseEnter={() => setActiveRootId(root.id)}
                                className={`flex items-center justify-between px-6 py-3 text-sm font-semibold transition-colors
                                    ${activeRootId === root.id ? 'bg-white text-primary-600 border-l-4 border-l-primary-600 shadow-sm' : 'text-neutral-700 hover:bg-white hover:text-primary-600 border-l-4 border-l-transparent'}`
                                }
                            >
                                <span>{root.name}</span>
                                <ChevronRight className={`w-4 h-4 ${activeRootId === root.id ? 'text-primary-600' : 'text-neutral-400'}`} />
                            </Link>
                        ))
                    )}
                </div>

                {/* Level 1 & Level 2: Subcategories and their items */}
                <div className="w-3/4 p-8 overflow-y-auto no-scrollbar max-h-[70vh]">
                    {activeRoot && subCategories.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {subCategories.map((sub) => {
                                const items = getChildren(sub.id);
                                return (
                                    <div key={sub.id} className="flex flex-col gap-3">
                                        <Link
                                            href={getLink(sub)}
                                            onClick={onClose}
                                            className="font-bold text-neutral-900 hover:text-primary-600 pb-1 border-b"
                                        >
                                            {sub.name}
                                        </Link>
                                        {items.length > 0 && (
                                            <ul className="flex flex-col gap-2">
                                                {items.map(item => (
                                                    <li key={item.id}>
                                                        <Link
                                                            href={getLink(item)}
                                                            onClick={onClose}
                                                            className="text-sm text-neutral-600 hover:text-primary-600 transition-colors"
                                                        >
                                                            {item.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-neutral-400">
                            {activeRoot ? (
                                <p>View all {activeRoot.name}</p>
                            ) : (
                                <p>Select a category</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="h-px bg-neutral-100" />
            <div className="bg-neutral-50 p-4 text-center">
                <Link href="/products" onClick={onClose} className="text-sm font-bold text-primary-600 hover:underline">
                    BROWSE ALL CATEGORIES
                </Link>
            </div>
        </div>
    );
}
