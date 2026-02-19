"use client"

import { useState, useEffect } from "react";
import { Save, Loader2, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPlatformConfigs, PlatformConfig, updatePlatformConfig, createPlatformConfig } from "@/services/settingsService";
import { getCategories, Category } from "@/services/categoryService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminSettingsPage() {
    const [configs, setConfigs] = useState<PlatformConfig[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [configsData, categoriesData] = await Promise.all([
                getPlatformConfigs(),
                getCategories()
            ]);
            setConfigs(configsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdate = async (id: string, field: keyof PlatformConfig, value: string) => {
        // Optimistic update
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;

        setConfigs(prev => prev.map(c => c.id === id ? { ...c, [field]: numValue } : c));
    };

    const handleSave = async (config: PlatformConfig) => {
        setSaving(config.id);
        try {
            await updatePlatformConfig(config.id, {
                vat_rate: config.vat_rate,
                platform_fee_rate: config.platform_fee_rate,
                advance_payment_rate: config.advance_payment_rate
            });
            // Optional: Show success toast
        } catch (error) {
            alert("Failed to save settings");
        } finally {
            setSaving(null);
        }
    };

    const handleAddConfig = async (categoryId: string) => {
        // Check if config already exists for this category
        if (configs.find(c => c.category_id === categoryId)) {
            alert("Configuration for this category already exists.");
            return;
        }

        try {
            await createPlatformConfig({
                category_id: categoryId,
                vat_rate: 7.5,
                platform_fee_rate: 2.0,
                advance_payment_rate: 10.0
            });
            fetchData();
        } catch (error) {
            alert("Failed to add configuration");
        }
    };

    // Filter out categories that already have a config
    const availableCategories = categories.filter(cat => !configs.find(c => c.category_id === cat.id));

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-neutral-700 to-neutral-900 bg-clip-text text-transparent">
                    Platform Settings
                </h1>
                <p className="text-neutral-500 mt-1">Configure VAT, Platform Fees, and Advance Payment rates.</p>
            </div>

            {/* Global/Default Config */}
            {configs.filter(c => c.category_id === null).map(config => (
                <Card key={config.id} className="border-primary-100 bg-primary-50/30">
                    <CardHeader>
                        <CardTitle className="text-primary-900">Default Global Settings</CardTitle>
                        <CardDescription>Applied to all categories unless overridden below.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700">VAT Rate (%)</label>
                            <Input
                                type="number" step="0.1"
                                value={config.vat_rate}
                                onChange={(e) => handleUpdate(config.id, 'vat_rate', e.target.value)}
                                className="bg-white border-primary-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700">Platform Fee (%)</label>
                            <Input
                                type="number" step="0.1"
                                value={config.platform_fee_rate}
                                onChange={(e) => handleUpdate(config.id, 'platform_fee_rate', e.target.value)}
                                className="bg-white border-primary-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral-700">Advance (%)</label>
                            <Input
                                type="number" step="0.1"
                                value={config.advance_payment_rate}
                                onChange={(e) => handleUpdate(config.id, 'advance_payment_rate', e.target.value)}
                                className="bg-white border-primary-200"
                            />
                        </div>
                        <Button
                            onClick={() => handleSave(config)}
                            disabled={saving === config.id}
                            className="bg-primary-600 hover:bg-primary-700 text-white"
                        >
                            {saving === config.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Defaults
                        </Button>
                    </CardContent>
                </Card>
            ))}

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-neutral-800">Category Overrides</h2>
                {availableCategories.length > 0 && (
                    <div className="flex gap-2">
                        <Select onValueChange={handleAddConfig}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Add Category Override" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableCategories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {/* Category Configs */}
            <div className="grid gap-4">
                {configs.filter(c => c.category_id !== null).map(config => (
                    <Card key={config.id}>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
                            <div className="md:col-span-1">
                                <span className="text-xs font-bold uppercase text-neutral-400 block mb-1">{config.category?.type}</span>
                                <span className="font-bold text-lg text-neutral-900">{config.category?.name}</span>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-neutral-500">VAT Rate (%)</label>
                                <Input
                                    type="number" step="0.1"
                                    value={config.vat_rate}
                                    onChange={(e) => handleUpdate(config.id, 'vat_rate', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-neutral-500">Platform Fee (%)</label>
                                <Input
                                    type="number" step="0.1"
                                    value={config.platform_fee_rate}
                                    onChange={(e) => handleUpdate(config.id, 'platform_fee_rate', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-neutral-500">Advance (%)</label>
                                <Input
                                    type="number" step="0.1"
                                    value={config.advance_payment_rate}
                                    onChange={(e) => handleUpdate(config.id, 'advance_payment_rate', e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={() => handleSave(config)}
                                disabled={saving === config.id}
                                variant="outline"
                            >
                                {saving === config.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
                {configs.filter(c => c.category_id !== null).length === 0 && (
                    <div className="text-center py-12 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                        <p className="text-neutral-500">No category-specific overrides. All categories use the Global Default.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
