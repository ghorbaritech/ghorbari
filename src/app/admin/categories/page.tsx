"use client"

import { useState, useEffect } from "react";
import * as Icons from "lucide-react"; // Import all for dynamic rendering
import { Plus, Search, Edit, Trash2, Tag, Layers, PenTool, FolderPlus, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCategories, Category, deleteCategory } from "@/services/categoryService";
import { CategoryDialog } from "@/components/admin/CategoryDialog";

// Helper component for dynamic icons
const DynamicIcon = ({ name, className }: { name?: string; className?: string }) => {
    if (!name) return <Tag className={className} />;
    const Icon = (Icons as any)[name];
    return Icon ? <Icon className={className} /> : <Tag className={className} />;
};

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<"all" | "product" | "service" | "design">("all");

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
    const [defaultType, setDefaultType] = useState<"product" | "service" | "design" | undefined>(undefined);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this category? All subcategories and items under it will also be deleted.")) {
            try {
                await deleteCategory(id);
                fetchCategories();
            } catch (error: any) {
                console.error("Delete failed:", error);
                alert(`Failed to delete category: ${error.message || error.code || "Unknown error"}`);
            }
        }
    };

    const openAddRootDialog = () => {
        setSelectedCategory(null);
        setDefaultParentId(null);
        setDefaultType(undefined);
        setIsDialogOpen(true);
    };

    const openAddSubDialog = (parent: Category) => {
        setSelectedCategory(null);
        setDefaultParentId(parent.id);
        setDefaultType(parent.type);
        setIsDialogOpen(true);
    };

    const openAddItemDialog = (parent: Category) => {
        setSelectedCategory(null);
        setDefaultParentId(parent.id);
        setDefaultType(parent.type);
        setIsDialogOpen(true);
    };

    const openAddSubItemDialog = (parent: Category) => {
        setSelectedCategory(null);
        setDefaultParentId(parent.id);
        setDefaultType(parent.type);
        setIsDialogOpen(true);
    };

    const openEditDialog = (category: Category) => {
        setSelectedCategory(category);
        setDefaultParentId(null);
        setDefaultType(undefined);
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedCategory(null);
        setDefaultParentId(null);
        setDefaultType(undefined);
    };

    const filteredCategories = categories.filter(cat => {
        const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === "all" || cat.type === filterType;
        return matchesSearch && matchesType;
    });

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'product': return <Tag className="w-4 h-4 text-orange-500" />;
            case 'service': return <Layers className="w-4 h-4 text-blue-500" />;
            case 'design': return <PenTool className="w-4 h-4 text-purple-500" />;
            default: return <Tag className="w-4 h-4" />;
        }
    };

    const getSortedCategories = (cats: Category[]) => {
        const roots = cats.filter(c => !c.parent_id);
        const sorted: Category[] = [];

        const addChildren = (parent: Category) => {
            sorted.push(parent);
            const children = cats.filter(c => c.parent_id === parent.id);
            children.sort((a, b) => a.name.localeCompare(b.name));
            children.forEach(child => addChildren(child));
        };

        roots.sort((a, b) => {
            if (a.type !== b.type) return a.type.localeCompare(b.type);
            return a.name.localeCompare(b.name);
        });

        roots.forEach(root => addChildren(root));
        return sorted;
    };

    const sortedFilteredCategories = getSortedCategories(filteredCategories);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight italic">
                        Category Management
                    </h1>
                    <p className="text-neutral-400 mt-1 font-medium">Manage products, services, and design categories.</p>
                </div>
                <Button onClick={openAddRootDialog} className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20">
                    <Plus className="w-4 h-4 mr-2" /> Add Root Category
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-neutral-900 p-4 rounded-3xl shadow-sm border border-neutral-800 backdrop-blur-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 w-5 h-5" />
                    <Input
                        placeholder="Search categories..."
                        className="pl-12 h-14 rounded-2xl border-neutral-800 bg-neutral-950 text-white focus:ring-blue-500/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex bg-neutral-950 border border-neutral-800 p-1.5 rounded-2xl items-center">
                    {['all', 'product', 'service', 'design'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type as any)}
                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterType === type
                                ? 'bg-neutral-800 text-white shadow-sm'
                                : 'text-neutral-500 hover:text-white hover:bg-neutral-900'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-neutral-500 bg-neutral-900/30 p-4 rounded-xl border border-neutral-800/50">
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] inline-block" /> Root Category</span>
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-neutral-400 inline-block" /> Subcategory</span>
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-neutral-600 inline-block" /> Item</span>
                <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-neutral-800 border border-neutral-700 inline-block" /> Sub-Item</span>
                <span className="flex items-center gap-2 ml-auto text-blue-400">{categories.length} total categories</span>
            </div>

            {/* List */}
            <div className="bg-neutral-900 rounded-[2.5rem] shadow-xl border border-neutral-800 overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto p-4">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="p-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest border-b border-neutral-800">Name</th>
                                <th className="p-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest border-b border-neutral-800">Type</th>
                                <th className="p-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest border-b border-neutral-800">Level</th>
                                <th className="p-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest border-b border-neutral-800">Metadata</th>
                                <th className="p-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest border-b border-neutral-800 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-neutral-500 font-bold tracking-widest uppercase text-xs">Loading categories...</td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-neutral-500 font-bold tracking-widest uppercase text-xs">No categories found.</td>
                                </tr>
                            ) : (
                                sortedFilteredCategories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-neutral-800/30 transition-colors group">
                                        <td className="p-4 font-bold text-white">
                                            <div style={{ paddingLeft: `${(cat.level || 0) * 24}px` }} className="flex items-center gap-3">
                                                {cat.level > 0 && <span className="text-neutral-600">└─</span>}
                                                {cat.icon_url && cat.icon_url.startsWith('http') ? (
                                                    <img src={cat.icon_url} alt="" className="w-6 h-6 rounded object-cover border border-neutral-700" />
                                                ) : (
                                                    <DynamicIcon name={cat.icon || cat.icon_url || undefined} className={`w-5 h-5 ${cat.level === 0 ? 'text-blue-400' : 'text-neutral-500'}`} />
                                                )}
                                                <span className={cat.level === 0 ? 'text-base font-black' : 'text-sm text-neutral-300'}>{cat.name}</span>
                                            </div>
                                        </td>

                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-neutral-400">
                                                {getTypeIcon(cat.type)}
                                                {cat.type}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${cat.level === 0 ? 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]' :
                                                cat.level === 1 ? 'bg-neutral-700 text-white' :
                                                    cat.level === 2 ? 'bg-neutral-800 text-neutral-300' :
                                                        'bg-neutral-900 border border-neutral-700 text-neutral-500'
                                                }`}>
                                                {cat.level === 0 ? 'Root' : cat.level === 1 ? 'Sub' : cat.level === 2 ? 'Item' : `Sub-Item L${cat.level}`}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs">
                                            {cat.level >= 2 && cat.metadata ? (
                                                <div className="space-y-1 font-medium bg-neutral-950 p-2 rounded-xl border border-neutral-800/50 inline-block">
                                                    {cat.metadata.unit && <div><span className="text-neutral-500">Unit:</span> <span className="text-neutral-300">{cat.metadata.unit}</span></div>}
                                                    {cat.metadata.price && <div><span className="text-neutral-500">Price:</span> <span className="text-emerald-400">৳{cat.metadata.price}</span></div>}
                                                    {cat.metadata.brands && cat.metadata.brands.length > 0 && (
                                                        <div className="truncate max-w-[200px]" title={cat.metadata.brands.join(', ')}>
                                                            <span className="text-neutral-500">Brands:</span> <span className="text-blue-400">{cat.metadata.brands.length}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : <span className="text-neutral-600">-</span>}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2 outline-none">
                                                {cat.level === 0 && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 px-3 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-xl"
                                                        onClick={() => openAddSubDialog(cat)}
                                                        title={`Add subcategory under ${cat.name}`}
                                                    >
                                                        <FolderPlus className="w-3.5 h-3.5 mr-1.5" />
                                                        +Sub
                                                    </Button>
                                                )}
                                                {cat.level === 1 && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 px-3 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl"
                                                        onClick={() => openAddItemDialog(cat)}
                                                        title={`Add item under ${cat.name}`}
                                                    >
                                                        <FilePlus className="w-3.5 h-3.5 mr-1.5" />
                                                        +Item
                                                    </Button>
                                                )}
                                                {cat.level >= 2 && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 px-3 text-[10px] font-black uppercase tracking-widest text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-xl"
                                                        onClick={() => openAddSubItemDialog(cat)}
                                                        title={`Add sub-item under ${cat.name}`}
                                                    >
                                                        <FilePlus className="w-3.5 h-3.5 mr-1.5" />
                                                        +Sub-Item
                                                    </Button>
                                                )}
                                                <div className="w-px h-6 bg-neutral-800 mx-1"></div>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl text-neutral-500 hover:text-white hover:bg-neutral-800" onClick={() => openEditDialog(cat)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10" onClick={() => handleDelete(cat.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CategoryDialog
                isOpen={isDialogOpen}
                onClose={handleCloseDialog}
                category={selectedCategory}
                allCategories={categories}
                onSuccess={fetchCategories}
                defaultParentId={defaultParentId}
                defaultType={defaultType}
            />
        </div>
    );
}
