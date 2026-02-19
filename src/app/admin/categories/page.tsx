"use client"

import { useState, useEffect } from "react";
import * as Icons from "lucide-react"; // Import all for dynamic rendering
import { Plus, Search, Edit, Trash2, Tag, Layers, PenTool } from "lucide-react";
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
        if (confirm("Are you sure you want to delete this category?")) {
            try {
                await deleteCategory(id);
                fetchCategories();
            } catch (error: any) {
                console.error("Delete failed:", error);
                alert(`Failed to delete category: ${error.message || error.code || "Unknown error"}`);
            }
        }
    };

    const openAddDialog = () => {
        setSelectedCategory(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (category: Category) => {
        setSelectedCategory(category);
        setIsDialogOpen(true);
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

    // Helper to sort categories into a tree structure flat list
    const getSortedCategories = (cats: Category[]) => {
        const roots = cats.filter(c => !c.parent_id);
        const sorted: Category[] = [];

        const addChildren = (parent: Category) => {
            sorted.push(parent);
            const children = cats.filter(c => c.parent_id === parent.id);
            // Sort children by name
            children.sort((a, b) => a.name.localeCompare(b.name));
            children.forEach(child => addChildren(child));
        };

        // Sort roots by type then name
        roots.sort((a, b) => {
            if (a.type !== b.type) return a.type.localeCompare(b.type);
            return a.name.localeCompare(b.name);
        });

        roots.forEach(root => addChildren(root));
        return sorted;
    };

    const sortedFilteredCategories = getSortedCategories(filteredCategories);

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                        Category Management
                    </h1>
                    <p className="text-neutral-500 mt-1">Manage products, services, and design categories.</p>
                </div>
                <Button onClick={openAddDialog} className="bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-200">
                    <Plus className="w-4 h-4 mr-2" /> Add Category
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-neutral-100">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <Input
                        placeholder="Search categories..."
                        className="pl-10 border-neutral-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex bg-neutral-100 p-1 rounded-lg">
                    {['all', 'product', 'service', 'design'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type as any)}
                            className={`px-4 py-2 rounded-md text-sm font-bold capitalize transition-all ${filterType === type
                                ? 'bg-white text-neutral-900 shadow-sm'
                                : 'text-neutral-500 hover:text-neutral-900'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-50 border-b border-neutral-100">
                            <tr>
                                <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Name</th>
                                <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Type</th>
                                <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Level</th>
                                <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Metadata</th>
                                <th className="p-4 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-neutral-500">Loading categories...</td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-neutral-500">No categories found.</td>
                                </tr>
                            ) : (
                                sortedFilteredCategories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="p-4 font-bold text-neutral-900 flex items-center gap-3">
                                            <div style={{ paddingLeft: `${(cat.level || 0) * 24}px` }} className="flex items-center gap-2">
                                                {cat.level > 0 && <span className="text-neutral-300">└─</span>}
                                                {/* Render Icon: Priority to Lucide name, then URL, then default */}
                                                {cat.icon_url && cat.icon_url.startsWith('http') ? (
                                                    <img src={cat.icon_url} alt="" className="w-6 h-6 rounded object-cover" />
                                                ) : (
                                                    <DynamicIcon name={cat.icon || cat.icon_url || undefined} className={`w-5 h-5 ${cat.level === 0 ? 'text-primary-600' : 'text-neutral-400'
                                                        }`} />
                                                )}
                                                {cat.name}
                                            </div>
                                        </td>


                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm font-medium capitalize text-neutral-600">
                                                {getTypeIcon(cat.type)}
                                                {cat.type}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${cat.level === 0 ? 'bg-neutral-900 text-white' :
                                                cat.level === 1 ? 'bg-neutral-200 text-neutral-700' :
                                                    'bg-neutral-100 text-neutral-500'
                                                }`}>
                                                {cat.level === 0 ? 'Root' : cat.level === 1 ? 'Sub' : 'Item'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs">
                                            {cat.level === 2 && cat.metadata ? (
                                                <div className="space-y-1">
                                                    {cat.metadata.unit && <div><span className="text-neutral-400">Unit:</span> {cat.metadata.unit}</div>}
                                                    {cat.metadata.price && <div><span className="text-neutral-400">Price:</span> ৳{cat.metadata.price}</div>}
                                                    {cat.metadata.brands && cat.metadata.brands.length > 0 && (
                                                        <div className="truncate max-w-[200px]" title={cat.metadata.brands.join(', ')}>
                                                            <span className="text-neutral-400">Brands:</span> {cat.metadata.brands.length}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : <span className="text-neutral-300">-</span>}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary-600" onClick={() => openEditDialog(cat)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-rose-500" onClick={() => handleDelete(cat.id)}>
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
                onClose={() => setIsDialogOpen(false)}
                category={selectedCategory}
                allCategories={categories}
                onSuccess={fetchCategories}
            />
        </div>
    );
}
