"use client"

import { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getMilestoneTemplates, createMilestoneTemplate, deleteMilestoneTemplate, MilestoneTemplate } from "@/services/milestoneService";
import { getCategories, Category } from "@/services/categoryService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminMilestonesPage() {
    const [templates, setTemplates] = useState<MilestoneTemplate[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [type, setType] = useState("product");
    const [categoryId, setCategoryId] = useState<string>("global");
    const [stages, setStages] = useState<string[]>(["Order Confirmed"]); // Initial stage

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tData, cData] = await Promise.all([
                getMilestoneTemplates(),
                getCategories()
            ]);
            setTemplates(tData);
            setCategories(cData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleStageAdd = () => {
        setStages([...stages, ""]);
    };

    const handleStageChange = (idx: number, value: string) => {
        const newStages = [...stages];
        newStages[idx] = value;
        setStages(newStages);
    };

    const handleStageDelete = (idx: number) => {
        const newStages = stages.filter((_, i) => i !== idx);
        setStages(newStages);
    };

    const handleCreate = async () => {
        if (!name || stages.some(s => !s.trim())) return;
        try {
            await createMilestoneTemplate({
                name,
                type,
                stages: stages.filter(s => s.trim()),
                category_id: categoryId === 'global' ? undefined : categoryId
            });
            setIsCreateOpen(false);
            setName("");
            setStages(["Order Confirmed"]);
            fetchData();
        } catch (error) {
            alert("Failed to create template");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this milestone template?")) return;
        try {
            await deleteMilestoneTemplate(id);
            fetchData();
        } catch (error) {
            alert("Failed to delete");
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900">Milestone CMS</h1>
                    <p className="text-neutral-500 mt-1">Define progress stages for orders and services.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                            <Plus className="w-4 h-4 mr-2" /> Create Template
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>New Milestone Template</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Template Name</label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Premium Construction Flow" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Type</label>
                                    <Select value={type} onValueChange={setType}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="product">Product</SelectItem>
                                            <SelectItem value="service">Service</SelectItem>
                                            <SelectItem value="design">Design</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Apply To (Category)</label>
                                    <Select value={categoryId} onValueChange={setCategoryId}>
                                        <SelectTrigger><SelectValue placeholder="Global (Default)" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="global">Global (Default)</SelectItem>
                                            {categories.filter(c => c.type === type).map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium flex justify-between">
                                    <span>Stages</span>
                                    <Button size="sm" variant="ghost" onClick={handleStageAdd} className="h-6 text-xs text-primary-600">
                                        <Plus className="w-3 h-3 mr-1" /> Add Stage
                                    </Button>
                                </label>
                                <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded p-2">
                                    {stages.map((stage, i) => (
                                        <div key={i} className="flex gap-2 items-center">
                                            <span className="text-neutral-400 text-xs font-mono w-4">{i + 1}</span>
                                            <Input className="h-8" value={stage} onChange={(e) => handleStageChange(i, e.target.value)} placeholder={`Stage ${i + 1}`} />
                                            {stages.length > 1 && (
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-neutral-400 hover:text-red-500" onClick={() => handleStageDelete(i)}>
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button onClick={handleCreate} disabled={!name || stages.length === 0} className="w-full">
                                Save Template
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                    <Card key={template.id} className="relative group">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-red-500"
                            onClick={() => handleDelete(template.id)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                        <CardHeader>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <span className="uppercase text-xs font-bold bg-neutral-100 px-2 py-0.5 rounded">{template.type}</span>
                                {template.category ? (
                                    <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded truncate max-w-[150px]">{template.category.name}</span>
                                ) : (
                                    <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded">Global Default</span>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <span className="text-xs font-bold text-neutral-500 uppercase">Workflow Stages</span>
                                <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-px before:bg-neutral-200">
                                    {template.stages.map((stage, i) => (
                                        <div key={i} className="relative pl-2 text-sm text-neutral-700">
                                            <span className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-primary-500 ring-2 ring-white" />
                                            {stage}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {templates.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-neutral-50 rounded-xl border border-dashed text-neutral-400">
                        No milestone templates defined. Create one to standardise your workflows.
                    </div>
                )}
            </div>
        </div>
    );
}
