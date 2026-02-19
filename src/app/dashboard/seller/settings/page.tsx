"use client"

import { useState, useEffect } from "react";
import { User, Store, Save, Briefcase, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";

export default function SellerSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    const supabase = createClient();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('sellers')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (data) {
            setProfile(data);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('sellers')
                .update({
                    business_name: profile.business_name,
                    business_type: profile.business_type,
                    commission_rate: profile.commission_rate, // Usually read-only but just in case
                })
                .eq('id', profile.id);

            if (error) throw error;
            alert("Settings saved successfully!");
        } catch (error) {
            alert("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-neutral-500 font-bold">Loading settings...</div>;

    return (
        <div className="p-8 space-y-8 min-h-screen bg-[#F0F2F5]">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-neutral-900 italic tracking-tighter uppercase">Store Settings</h1>
                    <p className="text-neutral-500 font-bold uppercase text-xs tracking-widest mt-2">Manage your business profile and preferences</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="h-12 px-8 bg-neutral-900 text-white font-black uppercase tracking-widest rounded-xl shadow-xl hover:bg-black transition-all">
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Business Info */}
                <div className="md:col-span-2 space-y-8">
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                        <CardHeader className="bg-white p-8 pb-0">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Store className="w-5 h-5 text-blue-600" />
                                </div>
                                <CardTitle className="text-xl font-black text-neutral-900 uppercase">Business Profile</CardTitle>
                            </div>
                            <CardDescription className="text-neutral-500 font-bold text-xs uppercase tracking-widest">
                                This information is visible to customers on your storefront.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Business Name</label>
                                    <Input
                                        value={profile?.business_name || ''}
                                        onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                                        className="h-14 bg-neutral-50 border-none rounded-2xl font-bold text-lg"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Business Type</label>
                                    <Input
                                        value={profile?.business_type || ''}
                                        onChange={(e) => setProfile({ ...profile, business_type: e.target.value })}
                                        className="h-14 bg-neutral-50 border-none rounded-2xl font-bold"
                                        placeholder="e.g. Retailer, Wholesaler"
                                    />
                                </div>
                            </div>

                            {/* Disabled Fields (Admin Controlled) */}
                            <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 opacity-70">
                                <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Lock className="w-3 h-3" /> System Controlled (Contact Admin to Change)
                                </h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Commission Rate</label>
                                        <div className="h-12 flex items-center px-4 bg-white rounded-xl font-black text-neutral-900 border border-neutral-200">
                                            {profile?.commission_rate}%
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Status</label>
                                        <div className="h-12 flex items-center px-4 bg-white rounded-xl font-black text-green-600 border border-neutral-200 uppercase text-xs">
                                            {profile?.verification_status}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Account Security (Placeholder) */}
                <div className="space-y-8">
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden bg-neutral-900 text-white">
                        <CardHeader className="p-8 pb-0">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                                    <ShieldCheck className="w-5 h-5 text-white" />
                                </div>
                                <CardTitle className="text-xl font-black text-white uppercase">Account Security</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Email Address</label>
                                <div className="h-14 flex items-center px-4 bg-white/5 rounded-2xl font-bold text-white border border-white/10">
                                    {/* Ideally fetch email from Auth user, but simplified here */}
                                    protected-email@example.com
                                </div>
                            </div>
                            <Button variant="outline" className="w-full h-12 bg-transparent text-white border-white/20 hover:bg-white/10 font-bold rounded-xl">
                                Change Password
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
