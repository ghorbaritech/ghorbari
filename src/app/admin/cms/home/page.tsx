"use client"

import { useState, useEffect } from "react";
import { Save, Image as ImageIcon, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getHomeContent, updateHomeContent } from "@/services/cmsService";

export default function AdminCMSPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Content State
    const [heroBanner, setHeroBanner] = useState({
        title: "Build Your Dream Home",
        subtitle: "Connect with top architects, designers, and suppliers in Bangladesh.",
        ctaText: "Explore Services",
        ctaLink: "/services",
        imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
    });

    const [promoBanner, setPromoBanner] = useState({
        title: "Summer Sale on Fittings",
        description: "Get up to 30% off on premium bath fittings.",
        backgroundColor: "bg-blue-600",
        link: "/products?category=fittings"
    });

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {
                const hero = await getHomeContent('hero_banner');
                if (hero) setHeroBanner(hero.content);

                const promo = await getHomeContent('promotional_banner');
                if (promo) setPromoBanner(promo.content);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    const handleSave = async (section: string, data: any) => {
        setSaving(true);
        try {
            await updateHomeContent(section, data);
            alert("Content updated successfully!");
        } catch (error) {
            alert("Failed to save content");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-neutral-900">Home Page CMS</h1>
                <p className="text-neutral-500 mt-1">Manage banner text, images, and highlighted sections.</p>
            </div>

            <Tabs defaultValue="hero">
                <TabsList className="bg-neutral-100">
                    <TabsTrigger value="hero">Hero Banner</TabsTrigger>
                    <TabsTrigger value="promo">Promotional Banner</TabsTrigger>
                    <TabsTrigger value="featured">Featured Sections</TabsTrigger>
                </TabsList>

                <TabsContent value="hero" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Main Hero Section</CardTitle>
                            <CardDescription>The first thing users see on the home page.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Headline</label>
                                <Input value={heroBanner.title} onChange={(e) => setHeroBanner({ ...heroBanner, title: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subtitle</label>
                                <Textarea value={heroBanner.subtitle} onChange={(e) => setHeroBanner({ ...heroBanner, subtitle: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">CTA Text</label>
                                    <Input value={heroBanner.ctaText} onChange={(e) => setHeroBanner({ ...heroBanner, ctaText: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">CTA Link</label>
                                    <Input value={heroBanner.ctaLink} onChange={(e) => setHeroBanner({ ...heroBanner, ctaLink: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Background Image URL</label>
                                <div className="flex gap-2">
                                    <Input value={heroBanner.imageUrl} onChange={(e) => setHeroBanner({ ...heroBanner, imageUrl: e.target.value })} />
                                    <Button variant="outline" size="icon"><ImageIcon className="w-4 h-4" /></Button>
                                </div>
                                {heroBanner.imageUrl && (
                                    <div className="mt-2 h-40 w-full rounded-lg overflow-hidden relative">
                                        <img src={heroBanner.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center p-4">
                                            <h3 className="text-2xl font-bold">{heroBanner.title}</h3>
                                            <p className="text-sm">{heroBanner.subtitle}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <Button onClick={() => handleSave('hero_banner', heroBanner)} disabled={saving} className="w-full">
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="promo" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Promotional Strip</CardTitle>
                            <CardDescription>A thin banner for announcements or sales.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Promo Title</label>
                                <Input value={promoBanner.title} onChange={(e) => setPromoBanner({ ...promoBanner, title: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Input value={promoBanner.description} onChange={(e) => setPromoBanner({ ...promoBanner, description: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Background Color Class</label>
                                    <Select value={promoBanner.backgroundColor} onValueChange={(val) => setPromoBanner({ ...promoBanner, backgroundColor: val })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bg-blue-600">Blue</SelectItem>
                                            <SelectItem value="bg-red-600">Red</SelectItem>
                                            <SelectItem value="bg-green-600">Green</SelectItem>
                                            <SelectItem value="bg-neutral-900">Black</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Link URL</label>
                                    <Input value={promoBanner.link} onChange={(e) => setPromoBanner({ ...promoBanner, link: e.target.value })} />
                                </div>
                            </div>
                            <div className={`p-4 rounded text-white ${promoBanner.backgroundColor} flex justify-between items-center`}>
                                <div>
                                    <div className="font-bold">{promoBanner.title}</div>
                                    <div className="text-sm opacity-90">{promoBanner.description}</div>
                                </div>
                                <Button variant="secondary" size="sm">Shop Now</Button>
                            </div>
                            <Button onClick={() => handleSave('promotional_banner', promoBanner)} disabled={saving} className="w-full">
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="featured">
                    <div className="text-center py-12 bg-neutral-50 rounded-xl border border-dashed text-neutral-400">
                        Featured Categories CMS coming soon...
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
