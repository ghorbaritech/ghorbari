"use client"

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createClient } from "@/utils/supabase/client";
import { getServicePackages, createServicePackage, updateServicePackage, deleteServicePackage, ServicePackage } from "@/services/packageService";
import { getCategories, Category } from "@/services/categoryService";
import { Badge } from "@/components/ui/badge";

export default function ServiceProviderPackagesPage() {
    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<ServicePackage>>({
        title: "",
        description: "",
        price: 0,
        unit: "job",
        images: []
    });

    const supabase = createClient();

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: provider } = await supabase.from('service_providers').select('id').eq('user_id', user.id).single();
            if (!provider) return;

            const [pData, cData] = await Promise.all([
                getServicePackages(provider.id),
                getCategories()
            ]);
            setPackages(pData);
            setCategories(cData.filter(c => c.type === 'service'));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: provider } = await supabase.from('service_providers').select('id').eq('user_id', user.id).single();
            if (!provider) return;

            if (editingPackage) {
                await updateServicePackage(editingPackage.id, formData);
            } else {
                await createServicePackage({ ...formData, provider_id: provider.id });
            }
            setIsDialogOpen(false);
            setEditingPackage(null);
            setFormData({ title: "", description: "", price: 0, unit: "job", images: [] });
            fetchData();
        } catch (error) {
            alert("Operation failed");
        }
    };

    const handleEdit = (pkg: ServicePackage) => {
        setEditingPackage(pkg);
        setFormData(pkg);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this package?")) return;
        try {
            await deleteServicePackage(id);
            fetchData();
        } catch (error) {
            alert("Failed to delete");
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900">My Service Packages</h1>
                    <p className="text-neutral-500 mt-1">Manage specific service offerings and pricing.</p>
                </div>
                <Button onClick={() => { setEditingPackage(null); setFormData({ title: "", description: "", price: 0, unit: "job" }); setIsDialogOpen(true); }} className="bg-primary-600 hover:bg-primary-700 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Add Package
                </Button>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingPackage ? 'Edit Package' : 'New Service Package'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Full House Painting" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <Select value={formData.category_id} onValueChange={(val) => setFormData({ ...formData, category_id: val })}>
                                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Price (৳)</label>
                                <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Unit</label>
                                <Select value={formData.unit} onValueChange={(val) => setFormData({ ...formData, unit: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="job">Per Job</SelectItem>
                                        <SelectItem value="sqft">Per Sq. Ft</SelectItem>
                                        <SelectItem value="hour">Per Hour</SelectItem>
                                        <SelectItem value="day">Per Day</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="h-24" />
                        </div>
                        <Button onClick={handleSubmit} disabled={!formData.title || !formData.price} className="w-full">
                            {editingPackage ? 'Update Package' : 'Create Package'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                    <Card key={pkg.id} className="group hover:border-primary-200 transition-colors">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className="mb-2">{pkg.category?.name || 'Uncategorized'}</Badge>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500" onClick={() => handleEdit(pkg)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(pkg.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <CardTitle className="line-clamp-1">{pkg.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-3">
                            <p className="text-sm text-neutral-500 line-clamp-2 h-10">{pkg.description}</p>
                            <div className="mt-4 font-bold text-lg text-primary-600">
                                ৳{pkg.price} <span className="text-sm text-neutral-400 font-normal">/ {pkg.unit}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {packages.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-neutral-50 rounded-xl border border-dashed text-neutral-400">
                        No service packages found. Create one to list your services.
                    </div>
                )}
            </div>
        </div>
    );
}
