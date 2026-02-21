"use client"

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Category, CategoryType, createCategory, updateCategory } from "@/services/categoryService";
import { Loader2 } from "lucide-react";

interface CategoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    category?: Category | null;
    allCategories: Category[];
    onSuccess: () => void;
    // Pre-fill parent and type when adding sub/item inline
    defaultParentId?: string | null;
    defaultType?: CategoryType;
}

export function CategoryDialog({ isOpen, onClose, category, allCategories, onSuccess, defaultParentId, defaultType }: CategoryDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Category>>({
        name: "",
        type: defaultType || "product",
        parent_id: defaultParentId || "none",
        icon_url: "",
        metadata: { unit: "", price: "", frequency: "Monthly", brands: [] }
    });
    const [brandsInput, setBrandsInput] = useState("");

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                name_bn: category.name_bn || "",
                type: category.type,
                parent_id: category.parent_id || "none",
                icon: category.icon || "",
                icon_url: category.icon_url || "",
                metadata: { unit: "", price: "", frequency: "Monthly", brands: [] }
            });
            setBrandsInput(category.metadata?.brands?.join(", ") || "");
        } else {
            setFormData({
                name: "",
                type: defaultType || "product",
                parent_id: defaultParentId || "none",
                icon: "",
                icon_url: "",
                metadata: { unit: "", price: "", frequency: "Monthly", brands: [] }
            });
            setBrandsInput("");
        }
    }, [category, isOpen, defaultParentId, defaultType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Determine level based on parent
            let level = 0;
            if (formData.parent_id && formData.parent_id !== "none") {
                const parent = allCategories.find(c => c.id === formData.parent_id);
                if (parent) {
                    level = (parent.level || 0) + 1;
                }
            }

            const payload: Partial<Category> = {
                name: formData.name,
                name_bn: formData.name_bn,
                type: formData.type,
                parent_id: formData.parent_id === "none" ? null : formData.parent_id,
                icon: formData.icon,
                icon_url: formData.icon_url,
                level: level,
                metadata: {
                    ...formData.metadata,
                    brands: brandsInput.split(",").map(b => b.trim()).filter(b => b)
                }
            };

            if (category) {
                await updateCategory(category.id, payload);
            } else {
                await createCategory(payload);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to save category");
        } finally {
            setLoading(false);
        }
    };

    // Filter potential parents: must be same type, and cannot be self or children
    const availableParents = allCategories.filter(c =>
        c.type === formData.type &&
        c.id !== category?.id &&
        (c.level === undefined || c.level < 3) // Allow up to level 3 (Root→Sub→Item→Sub-Item)
    );

    // Determine what level we'll be creating
    const parentCategory = allCategories.find(c => c.id === formData.parent_id);
    const parentLevel = parentCategory?.level ?? -1;
    const isSubLevel = parentLevel === 0 || category?.level === 1;
    const isItemLevel = parentLevel === 1 || category?.level === 2;
    const isSubItemLevel = parentLevel === 2 || category?.level === 3;
    // Show price/unit for any level with a parent (sub, item, sub-item)
    const showMetadata = isSubLevel || isItemLevel || isSubItemLevel;

    // Contextual title
    const getDialogTitle = () => {
        if (category) return "Edit Category";
        if (defaultParentId && parentCategory) {
            if (isSubItemLevel) return `Add Sub-Item under "${parentCategory.name}"`;
            if (isItemLevel) return `Add Item under "${parentCategory.name}"`;
            return `Add Subcategory under "${parentCategory.name}"`;
        }
        return "Add New Category";
    };

    const getLevelLabel = () => {
        if (isSubItemLevel) return "Sub-Item (Level 3)";
        if (isItemLevel) return "Item (Level 2)";
        if (isSubLevel) return "Subcategory (Level 1)";
        return "Root Category (Level 0)";
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{getDialogTitle()}</DialogTitle>
                    <DialogDescription>
                        {category ? "Modify existing category details." : (
                            <span className="inline-flex items-center gap-1.5">
                                Creating
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${isItemLevel ? 'bg-neutral-100 text-neutral-600' : isSubLevel ? 'bg-neutral-200 text-neutral-700' : 'bg-neutral-900 text-white'}`}>
                                    {getLevelLabel()}
                                </span>
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(val: CategoryType) => {
                                setFormData({ ...formData, type: val, parent_id: "none" }); // Reset parent when type changes
                            }}
                            disabled={!!category || !!defaultType}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="product">Product</SelectItem>
                                <SelectItem value="service">Service</SelectItem>
                                <SelectItem value="design">Design</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Only show parent selector when not using inline add (no defaultParentId) */}
                    {!defaultParentId && (
                        <div className="space-y-2">
                            <Label htmlFor="parent">Parent Category (Optional)</Label>
                            <Select
                                value={formData.parent_id || "none"}
                                onValueChange={(val: string) => setFormData({ ...formData, parent_id: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select parent" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None (Root Category)</SelectItem>
                                    {availableParents.map(p => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.level === 1 ? "── " : ""}{p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-neutral-500">
                                Select a parent to create a Subcategory or Item. Max depth is 3 levels.
                            </p>
                        </div>
                    )}

                    {/* Show pre-filled parent info when using inline add */}
                    {defaultParentId && parentCategory && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-100 text-sm">
                            <span className="text-neutral-500 text-xs font-medium">Parent:</span>
                            <span className="font-bold text-neutral-900">{parentCategory.name}</span>
                            <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${parentCategory.level === 0 ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-700'}`}>
                                {parentCategory.level === 0 ? 'Root' : 'Sub'}
                            </span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Name (English)</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Cement"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name_bn">Name (Bangla)</Label>
                        <Input
                            id="name_bn"
                            value={formData.name_bn || ""}
                            onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                            placeholder="e.g. সিমেন্ট"
                        />
                    </div>

                    {showMetadata && (
                        <div className="p-4 bg-neutral-50 rounded-lg space-y-3 border border-neutral-100">
                            <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wide">
                                {isSubItemLevel ? 'Sub-Item Details' : isItemLevel ? 'Item Details' : 'Pricing & Unit'}
                            </h4>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="unit" className="text-xs">Unit</Label>
                                    <Input
                                        id="unit"
                                        className="h-8 text-xs"
                                        placeholder="e.g. kg, bag, sqft"
                                        value={formData.metadata?.unit || ""}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            metadata: { ...formData.metadata, unit: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="price" className="text-xs">Price (৳)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        className="h-8 text-xs"
                                        placeholder="e.g. 550"
                                        value={formData.metadata?.price || ""}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            metadata: { ...formData.metadata, price: parseFloat(e.target.value) || 0 }
                                        })}
                                    />
                                </div>
                            </div>

                            {(isItemLevel || isSubItemLevel) && (
                                <div className="space-y-1">
                                    <Label htmlFor="brands" className="text-xs">Brands (Comma separated)</Label>
                                    <Input
                                        id="brands"
                                        className="h-8 text-xs"
                                        placeholder="e.g. Shah, Bashundhara, Seven Rings"
                                        value={brandsInput}
                                        onChange={(e) => setBrandsInput(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="iconName">Icon Name (Lucide)</Label>
                            <Input
                                id="iconName"
                                value={formData.icon || ""}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                placeholder="e.g. Hammer, Zap"
                            />
                            <p className="text-[10px] text-neutral-500">
                                See <a href="https://lucide.dev/icons" target="_blank" className="text-primary-600 underline">Lucide Icons</a>
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="icon">Icon URL (Image)</Label>
                            <Input
                                id="icon"
                                value={formData.icon_url || ""}
                                onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {category ? "Save Changes" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
