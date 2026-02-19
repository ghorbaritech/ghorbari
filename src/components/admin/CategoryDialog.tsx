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
}

export function CategoryDialog({ isOpen, onClose, category, allCategories, onSuccess }: CategoryDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Category>>({
        name: "",
        type: "product",
        parent_id: "none",
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
                type: "product",
                parent_id: "none",
                icon: "",
                icon_url: "",
                metadata: { unit: "", price: "", frequency: "Monthly", brands: [] }
            });
            setBrandsInput("");
        }
    }, [category, isOpen]);

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
        (c.level === undefined || c.level < 2) // Can only be parent if level < 2 (so max depth is 3: 0->1->2)
    );

    // Check if we should show metadata fields (only if parent is selected and parent is level 1, meaning we are creating level 2 item)
    // OR if we are editing a level 2 item
    const parentCategory = allCategories.find(c => c.id === formData.parent_id);
    const isItemLevel = (parentCategory?.level === 1) || (category?.level === 2);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{category ? "Edit Category" : "Add New Category"}</DialogTitle>
                    <DialogDescription>
                        {category ? "Modify existing category details." : "Create a new category, subcategory, or item."}
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
                            disabled={!!category}
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
                                <SelectItem value="none">None (Top Level)</SelectItem>
                                {availableParents.map(p => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.level === 1 ? "-- " : ""}{p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-[10px] text-neutral-500">
                            Select a parent to create a Subcategory or Item. Max depth is 3 levels.
                        </p>
                    </div>

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

                    {isItemLevel && (
                        <div className="p-4 bg-neutral-50 rounded-lg space-y-3 border border-neutral-100">
                            <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wide">Item Metadata</h4>

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
                                    <Label htmlFor="price" className="text-xs">Benchmark Price</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        className="h-8 text-xs"
                                        placeholder="e.g. 550"
                                        value={formData.metadata?.price || 0}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            metadata: { ...formData.metadata, price: parseFloat(e.target.value) }
                                        })}
                                    />
                                </div>
                            </div>

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
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="iconName">Icon Name (Lucide)</Label>
                            <div className="relative">
                                <Input
                                    id="iconName"
                                    value={formData.icon || ""}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="e.g. Hammer, Zap"
                                />
                                {formData.icon && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-neutral-100 p-1 rounded">
                                        {/* @ts-ignore */}
                                        <Loader2 className="w-0 h-0 hidden" /> {/* Dummy to keep import if needed, but we need dynamic icon here too */}
                                        {/* We can't easily render dynamic icon here without the helper, but distinct component logic applies. 
                                            Let's just show the text for now or add a helper if easy. 
                                            Actually, let's keep it simple. */}
                                    </div>
                                )}
                            </div>
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
                            {category ? "Save Changes" : "Create Category"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
