"use client"

import { useState, useEffect } from "react";
import { Plus, Tag, Calendar, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/utils/supabase/client";
import { getSellerCampaigns, createCampaign, toggleCampaignStatus, Campaign } from "@/services/campaignService";
import { format } from "date-fns";

export default function SellerCampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form inputs
    const [formData, setFormData] = useState({
        title: "",
        code: "",
        discount_type: "percentage",
        value: 0,
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10) // +7 days
    });

    const supabase = createClient();

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', user.id).single();
            if (!seller) return;

            const data = await getSellerCampaigns(seller.id);
            setCampaigns(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleCreate = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', user.id).single();
            if (!seller) return;

            await createCampaign({
                ...formData,
                seller_id: seller.id,
                value: Number(formData.value),
                discount_type: formData.discount_type as "percentage" | "fixed"
            });
            setIsCreateOpen(false);
            setFormData({ title: "", code: "", discount_type: "percentage", value: 0, start_date: new Date().toISOString().slice(0, 10), end_date: "" });
            fetchCampaigns();
        } catch (error) {
            alert("Failed to create campaign. Code might be duplicate.");
        }
    };

    const handleToggle = async (id: string, status: boolean) => {
        try {
            await toggleCampaignStatus(id, status);
            fetchCampaigns();
        } catch (error) {
            alert("Action failed");
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900">Campaigns & Promos</h1>
                    <p className="text-neutral-500 mt-1">Create discount codes and track usage.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary-600 hover:bg-primary-700 text-white">
                            <Plus className="w-4 h-4 mr-2" /> New Campaign
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Promo Code</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Campaign Title</label>
                                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Summer Sale" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Promo Code (Unique)</label>
                                <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="SUMMER20" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Discount Type</label>
                                    <Select value={formData.discount_type} onValueChange={(val) => setFormData({ ...formData, discount_type: val })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                                            <SelectItem value="fixed">Fixed Amount (৳)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Value</label>
                                    <Input type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Start Date</label>
                                    <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">End Date</label>
                                    <Input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                                </div>
                            </div>
                            <Button onClick={handleCreate} disabled={!formData.code || !formData.value} className="w-full">Create Campaign</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((camp) => (
                    <Card key={camp.id} className={`border-l-4 ${camp.is_active ? 'border-l-green-500' : 'border-l-neutral-300'}`}>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{camp.title}</CardTitle>
                                <Switch checked={camp.is_active} onCheckedChange={(val) => handleToggle(camp.id, camp.is_active)} />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="bg-neutral-100 text-neutral-800 font-mono font-bold px-2 py-1 rounded text-sm flex items-center gap-1">
                                    <Tag className="w-3 h-3" /> {camp.code}
                                </div>
                                <span className="text-sm font-bold text-primary-600">
                                    {camp.discount_type === 'percentage' ? `${camp.value}% OFF` : `৳${camp.value} OFF`}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center text-sm text-neutral-500 mb-2">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {format(new Date(camp.end_date), 'MMM d, yyyy')}
                                </div>
                                <div className="flex items-center gap-1">
                                    <BarChart2 className="w-3 h-3" /> {camp.usage_count} uses
                                </div>
                            </div>
                            {!camp.is_active && <div className="text-xs text-red-500 font-medium">Paused / Expired</div>}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
