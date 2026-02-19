"use client"

import { useState, useEffect } from "react";
import { User, Store, Briefcase, PenTool, Save, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";

interface ProfileSettingsProps {
    table: 'sellers' | 'service_providers' | 'designers';
    title: string;
    description: string;
}

export default function ProfileSettings({ table, title, description }: ProfileSettingsProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [roleId, setRoleId] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (data) {
                    setProfile(data);
                    setRoleId(data.id);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [table]);

    const handleSave = async () => {
        if (!roleId || !profile) return;
        setSaving(true);
        try {
            // Filter out non-editable fields if necessary, but for now we update what's in state
            // excluding system fields handled by triggers
            const { created_at, updated_at, id, user_id, ...updates } = profile;

            const { error } = await supabase
                .from(table)
                .update(updates)
                .eq('id', roleId);

            if (error) throw error;
            alert("Profile updated successfully!");
        } catch (error) {
            alert("Failed to update profile");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading settings...</div>;
    if (!profile) return <div>Profile not found.</div>;

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
                <p className="text-neutral-500 mt-1">{description}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription>Public details visible to customers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {table === 'designers' ? 'Company / Brand Name' : 'Business Name'}
                            </label>
                            <Input
                                value={profile.business_name || profile.company_name || ''}
                                onChange={(e) => setProfile({ ...profile, [table === 'designers' ? 'company_name' : 'business_name']: e.target.value })}
                            />
                        </div>

                        {(table === 'sellers') && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Business Type</label>
                                <Input
                                    value={profile.business_type || ''}
                                    onChange={(e) => setProfile({ ...profile, business_type: e.target.value })}
                                    placeholder="e.g. Distributor, Manufacturer"
                                />
                            </div>
                        )}

                        {(table === 'service_providers' || table === 'designers') && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Years of Experience</label>
                                <Input
                                    type="number"
                                    value={profile.experience_years || 0}
                                    onChange={(e) => setProfile({ ...profile, experience_years: parseInt(e.target.value) })}
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Bio / Description</label>
                        <Textarea
                            value={profile.bio || ''}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            className="h-32"
                            placeholder="Tell customers about your expertise..."
                        />
                    </div>

                    {(table === 'service_providers' || table === 'designers') && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Location / Coverage Area</label>
                            <Input
                                value={profile.location || ''}
                                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                placeholder="e.g. Dhaka, Chittagong"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Portfolio / Branding Image URL</label>
                        <div className="flex gap-2">
                            <Input
                                value={profile.portfolio_url || (Array.isArray(profile.images) ? profile.images[0] : '') || ''}
                                // Simplified handling for demo - mapping various image fields
                                onChange={(e) => {
                                    if (table === 'designers') setProfile({ ...profile, portfolio_url: e.target.value });
                                    // logic for others if needed
                                }}
                                placeholder="https://..."
                            />
                            <Button variant="outline" size="icon"><ImageIcon className="w-4 h-4" /></Button>
                        </div>
                        <p className="text-xs text-neutral-400">Past the URL of your logo or main portfolio image.</p>
                    </div>

                    <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
                        {saving ? <><Save className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
