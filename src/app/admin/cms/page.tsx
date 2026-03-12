'use client'

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
    LayoutTemplate,
    Image as ImageIcon,
    Layers,
    Briefcase,
    Tag,
    Save,
    Loader2,
    Plus,
    Trash2,
    ArrowUp,
    ArrowDown,
    Eye,
    EyeOff,
    GripVertical,
    Star
} from 'lucide-react'
import { getHomeContent, updateHomeSection, getCMSDependencies } from './actions'

import { GenericCardSlider } from "@/components/sections/GenericCardSlider"
import { IconCategories } from "@/components/sections/IconCategories"
import { PromoBannerSection } from "@/components/sections/PromoBannerSection"
import { HeroContainer } from "@/components/sections/HeroContainer"
import { SingleSlider } from "@/components/sections/SingleSlider"
import { MovingIconSlider } from "@/components/sections/MovingIconSlider"
import { InfoCardSlider } from "@/components/sections/InfoCardSlider"
import { BlogSlider } from "@/components/sections/BlogSlider"
import TestimonialSlider from "@/components/sections/TestimonialSlider"

export default function CMSPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saveAlert, setSaveAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [content, setContent] = useState<any>({})
    const [dependencies, setDependencies] = useState<any>({ categories: [], designPackages: [], servicePackages: [] })
    const [activeTab, setActiveTab] = useState('layout')

    const [customSegmentType, setCustomSegmentType] = useState('CardSlider')
    const [customSegmentTitle, setCustomSegmentTitle] = useState('')
    const [customSegmentItems, setCustomSegmentItems] = useState<any[]>([])
    const [editingKey, setEditingKey] = useState<string | null>(null)

    const CONTAINER_CONFIG: Record<string, { label: string, maxItems: number, minItems: number, guidance: string, fields: ('title' | 'image' | 'link' | 'description' | 'subtitle')[], autoFillKey?: string }> = {
        CardSlider: { label: 'Standard Card Slider', maxItems: 15, minItems: 3, guidance: 'Recommended size: 800x600px (4:3 Ratio for Products)', fields: ['title', 'image', 'link'] },
        IconSlider: { label: 'Circular Icon Slider', maxItems: 15, minItems: 4, guidance: 'Recommended size: 256x256px (1:1 Ratio for App Icons)', fields: ['title', 'image', 'link'], autoFillKey: 'featured_categories' },
        ThreeSliderBanner: { label: '3 Banner Slider', maxItems: 3, minItems: 3, guidance: 'Recommended size: 600x400px per banner (3 side-by-side)', fields: ['title', 'image', 'link'], autoFillKey: 'promo_banners' },
        HeroContainer: { label: 'Hero Container (3-item layout)', maxItems: 3, minItems: 3, guidance: 'Requires exactly 3 items. Item 1: Large Main Card, Item 2: Top Right, Item 3: Bottom Right.', fields: ['title', 'subtitle', 'description', 'image', 'link'], autoFillKey: 'hero_section' },
        SingleSlider: { label: 'Single Slider Banner (Full Width)', maxItems: 1, minItems: 1, guidance: 'Recommended size: 1200x180px (Wide Showcase, short height)', fields: ['title', 'image', 'link'] },
        MovingIconSlider: { label: 'Moving Icon Slider (Auto-rotating)', maxItems: 30, minItems: 5, guidance: 'Recommended size: 256x256px (1:1 Ratio for App Icons). Constantly moving.', fields: ['title', 'image', 'link'] },
        InfoCardSlider: { label: 'Information Slider (Taller Cards)', maxItems: 15, minItems: 3, guidance: 'Recommended size: 800x1200px (Portrait Cards for Info)', fields: ['title', 'description', 'image', 'link'] },
        BlogSlider: { label: 'Blog Post Slider', maxItems: 10, minItems: 2, guidance: 'Recommended size: 1200x600px (Standard Blog Post Thumbnails)', fields: ['title', 'subtitle', 'description', 'image', 'link'] },
        TestimonialSlider: { label: 'User Testimonial Slider', maxItems: 10, minItems: 2, guidance: 'Recommended: Large 5-star reviews with user avatars.', fields: ['title', 'subtitle', 'description', 'image'], autoFillKey: 'user_reviews' },
    };

    // Auto-fill logic when container type changes
    useEffect(() => {
        if (editingKey) return;
        const config = CONTAINER_CONFIG[customSegmentType];
        if (config && config.autoFillKey && content[config.autoFillKey]) {
            const data = content[config.autoFillKey];
            let itemsToFill: any[] = [];

            if (Array.isArray(data)) itemsToFill = data;
            else if (data.items && Array.isArray(data.items)) itemsToFill = data.items;
            else if (typeof data === 'object') itemsToFill = [data]; // for single item like old hero_section if it was an obj

            // Map old fields to new generic fields if possible
            const mappedItems = itemsToFill.slice(0, config.maxItems).map((i, idx) => ({
                id: Date.now() + idx,
                title: i.title || i.name || '',
                subtitle: i.subtitle || '',
                description: i.description || i.content || '',
                image: i.image_url || i.icon || i.image || '',
                link: i.link_url || i.link || ''
            }));

            // Pad if less than minItems
            while (mappedItems.length < config.minItems) {
                mappedItems.push({ id: Date.now() + Math.random(), title: '', subtitle: '', description: '', image: '', link: '' });
            }

            setCustomSegmentItems(mappedItems);
        } else {
            // Default blank state
            const blanks = Array.from({ length: config.minItems }).map((_, i) => ({ id: Date.now() + i, title: '', subtitle: '', description: '', image: '', link: '' }));
            setCustomSegmentItems(blanks);
        }
    }, [customSegmentType]);

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            const [contentData, deps] = await Promise.all([
                getHomeContent(),
                getCMSDependencies()
            ])
            // Sync featured categories with latest dependency data (e.g. icons) and remove ghost items
            if (contentData?.featured_categories?.items && deps.categories) {
                contentData.featured_categories.items = contentData.featured_categories.items
                    .filter((item: any) => deps.categories.some((c: any) => c.id === item.id)) // Filter ghosts
                    .map((item: any) => {
                        const latest = deps.categories.find((c: any) => c.id === item.id);
                        if (latest) {
                            return {
                                ...item,
                                name: latest.name,
                                icon: latest.icon || (latest as any).icon_url || ''
                            };
                        }
                        return item;
                    });
            }

            setContent(contentData || {})
            setDependencies(deps)
            setLoading(false)
        }
        loadData()
    }, [])

    const handleSave = async (sectionKey: string, sectionContent: any) => {
        setSaving(true)
        setSaveAlert(null)
        try {
            const result = await updateHomeSection(sectionKey, sectionContent)
            if (result.success) {
                setContent({ ...content, [sectionKey]: sectionContent })
                setSaveAlert({ type: 'success', message: 'Saved successfully! Home page will reflect changes shortly.' })
            } else {
                console.error(result.message)
                setSaveAlert({ type: 'error', message: `Save failed: ${result.message}` })
            }
        } catch (err: any) {
            console.error('Save exception:', err)
            setSaveAlert({ type: 'error', message: `Save error: ${err?.message || 'Unknown error'}` })
        }
        setSaving(false)
        setTimeout(() => setSaveAlert(null), 6000)
    }

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-neutral-400" /></div>

    return (
        <div className="min-h-screen pb-20 space-y-8 animate-in fade-in duration-700">
            <header>
                <h1 className="text-3xl font-extrabold text-white tracking-tight italic">CMS Manager</h1>
                <p className="text-neutral-400 font-medium">Control dynamic content on the home page.</p>
            </header>

            {/* Save Alert Banner */}
            {saveAlert && (
                <div className={`px-5 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 ${saveAlert.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    <span>{saveAlert.type === 'success' ? '✅' : '❌'}</span>
                    {saveAlert.message}
                </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="bg-neutral-950 p-1.5 rounded-3xl h-auto flex-wrap shadow-sm border border-neutral-800">
                    <TabsTrigger value="layout" className="flex-1 h-12 px-6 rounded-2xl font-bold text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest gap-2">
                        <GripVertical className="w-4 h-4" />
                        Layout Controller
                    </TabsTrigger>
                    <TabsTrigger value="categories" className="flex-1 h-12 px-6 rounded-2xl font-bold text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest gap-2">
                        <Tag className="w-4 h-4" />
                        Categories
                    </TabsTrigger>
                    <TabsTrigger value="design" className="flex-1 h-12 px-6 rounded-2xl font-bold text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest gap-2">
                        <Layers className="w-4 h-4" />
                        Design & Planning
                    </TabsTrigger>
                    <TabsTrigger value="products" className="flex-1 h-12 px-6 rounded-2xl font-bold text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest gap-2">
                        <LayoutTemplate className="w-4 h-4" />
                        Product Sections
                    </TabsTrigger>
                    <TabsTrigger value="promos" className="flex-1 h-12 px-6 rounded-2xl font-bold text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Promos
                    </TabsTrigger>
                    <TabsTrigger value="services" className="flex-1 h-12 px-6 rounded-2xl font-bold text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest gap-2">
                        <Briefcase className="w-4 h-4" />
                        Services
                    </TabsTrigger>
                    <TabsTrigger value="hero" className="flex-1 h-12 px-6 rounded-2xl font-bold text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest gap-2">
                        <LayoutTemplate className="w-4 h-4" />
                        Hero Section
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="flex-1 h-12 px-6 rounded-2xl font-bold text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        User Reviews
                    </TabsTrigger>
                    <TabsTrigger value="custom" className="flex-1 h-12 px-6 rounded-2xl font-bold text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest gap-2">
                        <Plus className="w-4 h-4" />
                        Custom Segments
                    </TabsTrigger>
                </TabsList>

                {/* CUSTOM SEGMENTS TAB */}
                <TabsContent value="custom" className="space-y-6">
                    <Card className="p-8 rounded-[2.5rem] border border-neutral-800 shadow-2xl bg-neutral-900">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter">Segment <span className="text-blue-500">Builder</span></h2>
                                <p className="text-neutral-500 font-medium text-sm mt-1">Create fully custom sections to appear on your home page with strict variations.</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-6 bg-neutral-950/50 p-6 rounded-2xl border border-neutral-800/50">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Section Title (Internal/Display)</label>
                                        <span className="text-[8px] font-black uppercase text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">Required</span>
                                    </div>
                                    <Input
                                        value={customSegmentTitle}
                                        onChange={(e) => setCustomSegmentTitle(e.target.value)}
                                        placeholder="e.g. Summer Collection"
                                        className={`h-12 text-sm bg-neutral-950 text-white rounded-xl transition-colors ${!customSegmentTitle ? 'border-blue-500/50 focus-visible:ring-blue-500' : 'border-neutral-800'}`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Container Type</label>
                                    <select
                                        value={customSegmentType}
                                        onChange={(e) => setCustomSegmentType(e.target.value)}
                                        disabled={!!editingKey}
                                        className="w-full h-12 px-4 border border-neutral-800 bg-neutral-950 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                                    >
                                        <option value="CardSlider">Standard Card Slider</option>
                                        <option value="IconSlider">Circular Icon Slider</option>
                                        <option value="ThreeSliderBanner">3 Banner Slider</option>
                                        <option value="HeroContainer">Hero Container (3-item layout)</option>
                                        <option value="SingleSlider">Single Slider Banner</option>
                                        <option value="MovingIconSlider">Moving Icon Slider</option>
                                        <option value="InfoCardSlider">Information Slider</option>
                                        <option value="BlogSlider">Blog Post Slider</option>
                                    </select>
                                    {CONTAINER_CONFIG[customSegmentType] && (
                                        <p className="text-[11px] text-blue-400 font-medium px-2 py-1.5 bg-blue-500/10 rounded-lg mt-2 flex items-center gap-1.5">
                                            👉 {CONTAINER_CONFIG[customSegmentType].guidance}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-white">Container Items</h3>
                                        {CONTAINER_CONFIG[customSegmentType] && (
                                            <p className="text-xs text-neutral-500 mt-1">Required items: {CONTAINER_CONFIG[customSegmentType].minItems} to {CONTAINER_CONFIG[customSegmentType].maxItems}</p>
                                        )}
                                    </div>
                                    <Button
                                        onClick={() => setCustomSegmentItems([...customSegmentItems, { id: Date.now(), title: '', subtitle: '', description: '', image: '', link: '' }])}
                                        disabled={!CONTAINER_CONFIG[customSegmentType] || customSegmentItems.length >= CONTAINER_CONFIG[customSegmentType].maxItems}
                                        variant="outline"
                                        className="h-9 border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Item
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {customSegmentItems.map((item, index) => {
                                        const cfgFields = CONTAINER_CONFIG[customSegmentType]?.fields || [];
                                        return (
                                            <div key={item.id} className="flex gap-3 p-4 border border-neutral-800 rounded-2xl bg-neutral-950 relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 bottom-0 w-1 bg-neutral-800 group-hover:bg-blue-500 transition-colors" />
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 pl-2">
                                                    {cfgFields.includes('title') && (
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[9px] font-black uppercase text-neutral-500 tracking-widest">Item Title</label>
                                                                <span className="text-[8px] font-bold uppercase text-neutral-600 bg-neutral-900 px-1.5 py-0.5 rounded">Optional</span>
                                                            </div>
                                                            <Input
                                                                placeholder="e.g. Heavy Duty Drill"
                                                                value={item.title || ''}
                                                                onChange={e => {
                                                                    const newI = [...customSegmentItems];
                                                                    newI[index].title = e.target.value;
                                                                    setCustomSegmentItems(newI);
                                                                }}
                                                                className="h-10 border-neutral-800 bg-neutral-900 text-white text-sm"
                                                            />
                                                        </div>
                                                    )}
                                                    {cfgFields.includes('subtitle') && (
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[9px] font-black uppercase text-neutral-500 tracking-widest">Badge / Date / Subtitle</label>
                                                                <span className="text-[8px] font-bold uppercase text-neutral-600 bg-neutral-900 px-1.5 py-0.5 rounded">Optional</span>
                                                            </div>
                                                            <Input
                                                                placeholder="e.g. New Arrival"
                                                                value={item.subtitle || ''}
                                                                onChange={e => {
                                                                    const newI = [...customSegmentItems];
                                                                    newI[index].subtitle = e.target.value;
                                                                    setCustomSegmentItems(newI);
                                                                }}
                                                                className="h-10 border-neutral-800 bg-neutral-900 text-white text-sm"
                                                            />
                                                        </div>
                                                    )}
                                                    {cfgFields.includes('description') && (
                                                        <div className="space-y-1.5 lg:col-span-2">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[9px] font-black uppercase text-neutral-500 tracking-widest">Short Description</label>
                                                                <span className="text-[8px] font-bold uppercase text-neutral-600 bg-neutral-900 px-1.5 py-0.5 rounded">Optional</span>
                                                            </div>
                                                            <Input
                                                                placeholder="A brief description of the item..."
                                                                value={item.description || ''}
                                                                onChange={e => {
                                                                    const newI = [...customSegmentItems];
                                                                    newI[index].description = e.target.value;
                                                                    setCustomSegmentItems(newI);
                                                                }}
                                                                className="h-10 border-neutral-800 bg-neutral-900 text-white text-sm"
                                                            />
                                                        </div>
                                                    )}
                                                    {cfgFields.includes('image') && (
                                                        <div className="space-y-1.5 lg:col-span-2">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[9px] font-black uppercase text-blue-400 tracking-widest">Image Source URL</label>
                                                                <span className="text-[8px] font-black uppercase text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">Required</span>
                                                            </div>
                                                            <Input
                                                                placeholder="https://images.unsplash.com/..."
                                                                value={item.image || ''}
                                                                onChange={e => {
                                                                    const newI = [...customSegmentItems];
                                                                    newI[index].image = e.target.value;
                                                                    setCustomSegmentItems(newI);
                                                                }}
                                                                className={`h-10 text-sm bg-neutral-900 text-white transition-colors ${!item.image ? 'border-blue-500/50 focus-visible:ring-blue-500' : 'border-neutral-800'}`}
                                                            />
                                                        </div>
                                                    )}
                                                    {cfgFields.includes('link') && (
                                                        <div className="space-y-1.5 lg:col-span-3">
                                                            <div className="flex items-center justify-between">
                                                                <label className="text-[9px] font-black uppercase text-neutral-500 tracking-widest">Redirect Action URL</label>
                                                                <span className="text-[8px] font-bold uppercase text-neutral-600 bg-neutral-900 px-1.5 py-0.5 rounded">Optional</span>
                                                            </div>
                                                            <Input
                                                                placeholder="/products?category=tools"
                                                                value={item.link || ''}
                                                                onChange={e => {
                                                                    const newI = [...customSegmentItems];
                                                                    newI[index].link = e.target.value;
                                                                    setCustomSegmentItems(newI);
                                                                }}
                                                                className="h-10 border-neutral-800 bg-neutral-900 text-white text-sm"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setCustomSegmentItems(customSegmentItems.filter((_, i) => i !== index))}
                                                    disabled={!CONTAINER_CONFIG[customSegmentType] || customSegmentItems.length <= CONTAINER_CONFIG[customSegmentType].minItems}
                                                    className="h-10 w-10 mt-6 p-0 text-neutral-600 hover:bg-red-500/10 hover:text-red-400 rounded-xl shrink-0 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )
                                    })}
                                    {customSegmentItems.length === 0 && (
                                        <div className="text-center py-10 border border-dashed border-neutral-800 rounded-2xl bg-neutral-950/30">
                                            <p className="text-sm text-neutral-500 font-medium">No items added to this segment yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-4">
                                {editingKey && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setEditingKey(null);
                                            setCustomSegmentTitle('');
                                            setCustomSegmentItems([]);
                                            setCustomSegmentType('CardSlider');
                                        }}
                                        className="h-12 border-neutral-800 text-neutral-400 hover:text-white rounded-xl whitespace-nowrap px-8 font-black uppercase text-xs tracking-widest"
                                    >
                                        Cancel Edit
                                    </Button>
                                )}
                                <Button
                                    disabled={
                                        saving ||
                                        !customSegmentTitle ||
                                        !CONTAINER_CONFIG[customSegmentType] ||
                                        customSegmentItems.length < CONTAINER_CONFIG[customSegmentType].minItems ||
                                        customSegmentItems.some(item => !item.image)
                                    }
                                    onClick={async () => {
                                        if (!customSegmentTitle) return;
                                        setSaving(true);
                                        const segmentKey = editingKey || `custom_${Date.now()}`;
                                        const newSection = {
                                            title: customSegmentTitle,
                                            items: customSegmentItems
                                        };

                                        const r1 = await updateHomeSection(segmentKey, newSection);

                                        if (r1.success) {
                                            let newLayout = content['page_layout'] || [];
                                            if (!editingKey) {
                                                const newLayoutItem = {
                                                    id: segmentKey,
                                                    type: customSegmentType,
                                                    data_key: segmentKey,
                                                    hidden: false,
                                                    title: customSegmentTitle
                                                };
                                                newLayout = [...newLayout, newLayoutItem];
                                                await updateHomeSection('page_layout', newLayout);
                                            } else {
                                                const layoutItemIndex = newLayout.findIndex((l: any) => l.data_key === segmentKey);
                                                if (layoutItemIndex >= 0) {
                                                    newLayout[layoutItemIndex].title = customSegmentTitle;
                                                    await updateHomeSection('page_layout', newLayout);
                                                }
                                            }

                                            setContent({
                                                ...content,
                                                [segmentKey]: newSection,
                                                page_layout: newLayout
                                            });

                                            setSaveAlert({ type: 'success', message: editingKey ? 'Saved! Click SAVE LAYOUT SEQUENCE to apply.' : 'Created & added to Layout!' });

                                            if (!editingKey) {
                                                setCustomSegmentTitle('');
                                                const config = CONTAINER_CONFIG[customSegmentType];
                                                if (config) {
                                                    const blanks = Array.from({ length: config.minItems }).map((_, i) => ({ id: Date.now() + i, title: '', image: '', link: '' }));
                                                    setCustomSegmentItems(blanks);
                                                }
                                            } else {
                                                setEditingKey(null);
                                                setCustomSegmentTitle('');
                                                setCustomSegmentItems([]);
                                            }
                                        }
                                        setSaving(false);
                                        setTimeout(() => setSaveAlert(null), 8000);
                                    }}
                                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase text-xs tracking-widest disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed transition-all"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (editingKey ? 'Update Segment' : 'Create & Add to Layout')}
                                </Button>
                            </div>

                            {/* EXISTING SEGMENTS LIST */}
                            <div className="mt-12 pt-8 border-t border-neutral-800">
                                <div className="mb-6 flex items-center gap-3">
                                    <h3 className="text-xl font-black uppercase text-white tracking-widest flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-neutral-500" />
                                        Existing <span className="text-blue-500">Segments</span>
                                    </h3>
                                    <div className="h-px flex-1 bg-gradient-to-r from-neutral-800 to-transparent"></div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {Object.keys(content).filter(k => k.startsWith('custom_')).map(key => {
                                        const layoutItem = (content['page_layout'] || []).find((l: any) => l.data_key === key);
                                        const segType = layoutItem ? layoutItem.type : 'Unknown Type';
                                        return (
                                            <div key={key} className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex justify-between items-center">
                                                <div className="truncate pr-4">
                                                    <h4 className="text-sm font-bold text-white uppercase tracking-wider truncate">{content[key].title}</h4>
                                                    <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-widest mt-1.5">{segType} &bull; {content[key].items?.length || 0} ITEMS</p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={!!editingKey}
                                                    onClick={() => {
                                                        setEditingKey(key);
                                                        setCustomSegmentTitle(content[key].title || '');
                                                        if (layoutItem?.type) setCustomSegmentType(layoutItem.type);
                                                        // Ensure all fields exist to avoid uncontrolled input warnings
                                                        const existingItems = (content[key].items || []).map((item: any) => ({
                                                            id: item.id || Date.now() + Math.random(),
                                                            title: item.title || '',
                                                            subtitle: item.subtitle || '',
                                                            description: item.description || '',
                                                            image: item.image || '',
                                                            link: item.link || ''
                                                        }));
                                                        setCustomSegmentItems(existingItems);
                                                        window.scrollTo({ top: 300, behavior: 'smooth' });
                                                    }}
                                                    className="h-8 bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 font-bold uppercase tracking-widest text-[10px] shrink-0"
                                                >
                                                    Edit
                                                </Button>
                                            </div>
                                        )
                                    })}
                                    {Object.keys(content).filter(k => k.startsWith('custom_')).length === 0 && (
                                        <div className="col-span-full text-center py-8 text-neutral-500 text-sm font-medium border border-dashed border-neutral-800 rounded-xl bg-neutral-950/50">
                                            No custom segments exist. Build one above to see it here.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* LIVE PREVIEW SECTION */}
                            <div className="mt-12 pt-8 border-t border-neutral-800">
                                <div className="mb-6 flex items-center gap-3">
                                    <h3 className="text-xl font-black uppercase text-white tracking-widest flex items-center gap-2">
                                        <LayoutTemplate className="w-5 h-5 text-neutral-500" />
                                        Live <span className="text-blue-500">Preview</span>
                                    </h3>
                                    <div className="h-px flex-1 bg-gradient-to-r from-neutral-800 to-transparent"></div>
                                </div>
                                <div className="bg-[#f8f9fa] rounded-[1.5rem] overflow-hidden border border-neutral-800 relative shadow-2xl origin-top">
                                    <div className="absolute top-4 right-4 bg-black/80 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full z-10 backdrop-blur-md">
                                        Consumer View
                                    </div>
                                    <div className="w-full max-h-[800px] overflow-y-auto no-scrollbar pointer-events-none opacity-95">
                                        {customSegmentType === 'CardSlider' && (
                                            <GenericCardSlider
                                                title={customSegmentTitle || 'Segment Title'}
                                                items={customSegmentItems}
                                            />
                                        )}
                                        {customSegmentType === 'IconSlider' && (
                                            <IconCategories
                                                title={customSegmentTitle || 'Segment Title'}
                                                items={customSegmentItems}
                                            />
                                        )}
                                        {customSegmentType === 'ThreeSliderBanner' && (
                                            <PromoBannerSection
                                                title={customSegmentTitle || 'Promotions'}
                                                banners={customSegmentItems}
                                            />
                                        )}
                                        {customSegmentType === 'HeroContainer' && (
                                            <HeroContainer
                                                title={customSegmentTitle || 'Hero Section'}
                                                items={customSegmentItems}
                                            />
                                        )}
                                        {customSegmentType === 'SingleSlider' && (
                                            <SingleSlider
                                                title={customSegmentTitle || 'Single Slider'}
                                                items={customSegmentItems}
                                            />
                                        )}
                                        {customSegmentType === 'MovingIconSlider' && (
                                            <MovingIconSlider
                                                title={customSegmentTitle || 'Segment Title'}
                                                items={customSegmentItems}
                                            />
                                        )}
                                        {customSegmentType === 'InfoCardSlider' && (
                                            <InfoCardSlider
                                                title={customSegmentTitle || 'Segment Title'}
                                                items={customSegmentItems}
                                            />
                                        )}
                                        {customSegmentType === 'BlogSlider' && (
                                            <BlogSlider
                                                title={customSegmentTitle || 'Segment Title'}
                                                items={customSegmentItems}
                                            />
                                        )}
                                        {customSegmentType === 'TestimonialSlider' && ( // Added TestimonialSlider to live preview
                                            <TestimonialSlider
                                                title={customSegmentTitle || 'Segment Title'}
                                                items={customSegmentItems}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </TabsContent>
                {/* 7. USER REVIEWS TAB */}
                <TabsContent value="reviews" className="space-y-6">
                    <Card className="p-8 rounded-[2.5rem] border border-neutral-800 shadow-2xl bg-neutral-900">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black uppercase text-white tracking-widest">Customer Testimonials</h2>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        const current = content['user_reviews'] || { title: '', items: [] };
                                        const items = current.items || [];
                                        setContent({
                                            ...content,
                                            user_reviews: {
                                                ...current,
                                                items: [...items, { id: Date.now(), title: '', subtitle: '', description: '', image: '' }]
                                            }
                                        });
                                    }}
                                    variant="outline"
                                    className="rounded-xl font-bold uppercase text-xs border-neutral-700 text-white hover:bg-neutral-800"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Review
                                </Button>
                                <Button
                                    onClick={() => handleSave('user_reviews', content['user_reviews'])}
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase text-xs px-6"
                                >
                                    {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Reviews'}
                                </Button>
                            </div>
                        </div>

                        <div className="mb-8 max-w-md space-y-2">
                            <label className="text-xs font-black uppercase text-neutral-500 tracking-widest">Section Title (Bengali Recommended)</label>
                            <Input
                                value={content['user_reviews']?.title || ''}
                                onChange={(e) => setContent({ ...content, user_reviews: { ...content['user_reviews'], title: e.target.value } })}
                                className="font-bold border-neutral-800 bg-neutral-950 text-white h-12 rounded-xl"
                                placeholder="e.g. ক্লায়েন্টদের গল্প"
                            />
                        </div>

                        <div className="space-y-6">
                            {(content['user_reviews']?.items || []).map((review: any, index: number) => (
                                <div key={review.id} className="p-6 border border-neutral-800 bg-neutral-950 rounded-2xl space-y-4 relative group hover:border-neutral-700 transition-all shadow-sm">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-4 right-4 text-neutral-500 hover:text-red-400 hover:bg-red-500/10"
                                        onClick={() => {
                                            const newItems = content['user_reviews'].items.filter((r: any) => r.id !== review.id)
                                            setContent({ ...content, user_reviews: { ...content['user_reviews'], items: newItems } })
                                        }}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>

                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-black text-xs border border-blue-500/20">
                                            {index + 1}
                                        </div>
                                        <span className="font-black text-neutral-400 uppercase tracking-widest text-xs">Customer Review</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">User Name</label>
                                                <Input
                                                    value={review.title || ''}
                                                    onChange={(e) => {
                                                        const newItems = [...content['user_reviews'].items]
                                                        newItems[index].title = e.target.value
                                                        setContent({ ...content, user_reviews: { ...content['user_reviews'], items: newItems } })
                                                    }}
                                                    className="font-bold text-sm border-neutral-800 bg-neutral-900 text-white"
                                                    placeholder="e.g. Ahmed Kabir"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Designation / Location</label>
                                                <Input
                                                    value={review.subtitle || ''}
                                                    onChange={(e) => {
                                                        const newItems = [...content['user_reviews'].items]
                                                        newItems[index].subtitle = e.target.value
                                                        setContent({ ...content, user_reviews: { ...content['user_reviews'], items: newItems } })
                                                    }}
                                                    className="text-xs border-neutral-800 bg-neutral-900 text-white"
                                                    placeholder="e.g. Dhaka, Bangladesh"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Review Text (Feedback)</label>
                                                <Input
                                                    value={review.description || ''}
                                                    onChange={(e) => {
                                                        const newItems = [...content['user_reviews'].items]
                                                        newItems[index].description = e.target.value
                                                        setContent({ ...content, user_reviews: { ...content['user_reviews'], items: newItems } })
                                                    }}
                                                    className="text-sm border-neutral-800 bg-neutral-900 text-white italic"
                                                    placeholder="Write the review content here..."
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">User Avatar URL</label>
                                                <div className="flex gap-4">
                                                    <div className="w-20 h-20 rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                                                        {review.image ? <img src={review.image} className="w-full h-full object-cover" /> : <Star className="w-6 h-6 text-neutral-700" />}
                                                    </div>
                                                    <Input
                                                        value={review.image || ''}
                                                        onChange={(e) => {
                                                            const newItems = [...content['user_reviews'].items]
                                                            newItems[index].image = e.target.value
                                                            setContent({ ...content, user_reviews: { ...content['user_reviews'], items: newItems } })
                                                        }}
                                                        className="flex-1 text-xs border-neutral-800 bg-neutral-900 text-white self-end"
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>

                {/* 0. LAYOUT CONTROLLER TAB */}
                <TabsContent value="layout" className="space-y-6">
                    <Card className="p-8 rounded-[2.5rem] border border-neutral-800 shadow-2xl bg-neutral-900">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter">Central <span className="text-blue-500">Controller</span></h2>
                                <p className="text-neutral-500 font-medium text-sm mt-1">Reorder and toggle sections to design your home page flow.</p>
                            </div>
                            <Button
                                onClick={() => handleSave('page_layout', content['page_layout'])}
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-6 shadow-lg shadow-blue-900/40"
                            >
                                {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Layout Sequence
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {(content['page_layout'] || []).map((section: any, index: number) => (
                                <div key={section.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${section.hidden ? 'bg-neutral-950/50 border-neutral-800/50 opacity-70' : 'bg-neutral-950 border-neutral-800 shadow-sm'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => {
                                                    if (index === 0) return;
                                                    const newLayout = [...content['page_layout']];
                                                    const temp = newLayout[index - 1];
                                                    newLayout[index - 1] = newLayout[index];
                                                    newLayout[index] = temp;
                                                    setContent({ ...content, page_layout: newLayout });
                                                }}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${index === 0 ? 'text-neutral-800 cursor-not-allowed' : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white'}`}
                                            >
                                                <ArrowUp className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const newLayout = [...content['page_layout']];
                                                    if (index === newLayout.length - 1) return;
                                                    const temp = newLayout[index + 1];
                                                    newLayout[index + 1] = newLayout[index];
                                                    newLayout[index] = temp;
                                                    setContent({ ...content, page_layout: newLayout });
                                                }}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${index === (content['page_layout']?.length || 0) - 1 ? 'text-neutral-800 cursor-not-allowed' : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white'}`}
                                            >
                                                <ArrowDown className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-neutral-900 flex items-center justify-center text-neutral-500 border border-neutral-800">
                                            {section.type === 'HeroSlider' ? <LayoutTemplate className="w-5 h-5 text-purple-400" /> :
                                                section.type === 'IconSlider' ? <Tag className="w-5 h-5 text-orange-400" /> :
                                                    section.type === 'CardSlider' ? <Layers className="w-5 h-5 text-blue-400" /> :
                                                        section.type === 'PromoBanners' ? <ImageIcon className="w-5 h-5 text-emerald-400" /> :
                                                            <Briefcase className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h3 className={`font-black uppercase tracking-widest text-sm ${section.hidden ? 'text-neutral-500' : 'text-white'}`}>{section.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-black uppercase text-neutral-600 bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-800">
                                                    {section.type}
                                                </span>
                                                <span className="text-xs font-medium text-neutral-500">Key: {section.data_key}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                const newLayout = [...content['page_layout']];
                                                newLayout[index].hidden = !newLayout[index].hidden;
                                                setContent({ ...content, page_layout: newLayout });
                                            }}
                                            className={`rounded-xl w-12 h-12 transition-all ${section.hidden ? 'text-neutral-600 hover:text-white hover:bg-neutral-800' : 'text-blue-500 bg-blue-500/10 hover:bg-blue-500/20'}`}
                                            title={section.hidden ? 'Show Section' : 'Hide Section'}
                                        >
                                            {section.hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>

                {/* 1. CATEGORIES TAB */}
                <TabsContent value="categories" className="space-y-6">
                    <Card className="p-8 rounded-[2.5rem] border border-neutral-800 shadow-2xl bg-neutral-900">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black uppercase text-white">Featured Categories</h2>
                            <Button
                                onClick={() => handleSave('featured_categories', content['featured_categories'])}
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase text-xs"
                            >
                                {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Changes'}
                            </Button>
                        </div>
                        <div className="mb-8 max-w-md space-y-2">
                            <label className="text-xs font-bold uppercase text-neutral-500 tracking-widest">Section Title</label>
                            <Input
                                value={content['featured_categories']?.title || 'Explore Categories'}
                                onChange={(e) => {
                                    const currentData = content['featured_categories'] || {}
                                    const items = Array.isArray(currentData) ? currentData : (currentData.items || [])

                                    setContent({
                                        ...content,
                                        featured_categories: {
                                            title: e.target.value,
                                            items: items
                                        }
                                    })
                                }}
                                className="font-bold border-neutral-700 bg-neutral-950 text-white h-12 rounded-xl focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-8">
                            {/* Products Group */}
                            <div>
                                <h3 className="text-sm font-black uppercase text-neutral-500 mb-4 border-b border-neutral-800 pb-2">Product Categories</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {dependencies.categories.filter((c: any) => c.type === 'product').map((cat: any) => {
                                        const formattedCat = { id: cat.id, name: cat.name, icon: cat.icon || cat.icon_url || '', type: cat.type }
                                        const isSelected = content['featured_categories']?.items?.some((c: any) => c.id === cat.id)
                                        return (
                                            <label key={cat.id} className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${isSelected ? 'border-orange-500 bg-orange-500/10' : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'}`}>
                                                <div className="flex items-center gap-3 text-white">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={(checked) => {
                                                            const currentItems = content['featured_categories']?.items || []
                                                            let newItems
                                                            if (checked) {
                                                                newItems = [...currentItems, formattedCat]
                                                            } else {
                                                                newItems = currentItems.filter((c: any) => c.id !== cat.id)
                                                            }
                                                            setContent({
                                                                ...content,
                                                                featured_categories: { ...content['featured_categories'], items: newItems }
                                                            })
                                                        }}
                                                        className="border-neutral-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                                    />
                                                    <span className="font-bold text-sm">{cat.name}</span>
                                                </div>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Services Group */}
                            <div>
                                <h3 className="text-sm font-black uppercase text-neutral-500 mb-4 border-b border-neutral-800 pb-2">Service Categories</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {dependencies.categories.filter((c: any) => c.type === 'service').map((cat: any) => {
                                        const formattedCat = { id: cat.id, name: cat.name, icon: cat.icon || cat.icon_url || '', type: cat.type }
                                        const isSelected = content['featured_categories']?.items?.some((c: any) => c.id === cat.id)
                                        return (
                                            <label key={cat.id} className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'}`}>
                                                <div className="flex items-center gap-3 text-white">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={(checked) => {
                                                            const currentItems = content['featured_categories']?.items || []
                                                            let newItems
                                                            if (checked) {
                                                                newItems = [...currentItems, formattedCat]
                                                            } else {
                                                                newItems = currentItems.filter((c: any) => c.id !== cat.id)
                                                            }
                                                            setContent({
                                                                ...content,
                                                                featured_categories: { ...content['featured_categories'], items: newItems }
                                                            })
                                                        }}
                                                        className="border-neutral-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                                    />
                                                    <span className="font-bold text-sm">{cat.name}</span>
                                                </div>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Design Group */}
                            <div>
                                <h3 className="text-sm font-black uppercase text-neutral-500 mb-4 border-b border-neutral-800 pb-2">Design Categories</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {dependencies.categories.filter((c: any) => c.type === 'design').map((cat: any) => {
                                        const formattedCat = { id: cat.id, name: cat.name, icon: cat.icon || cat.icon_url || '', type: cat.type }
                                        const isSelected = content['featured_categories']?.items?.some((c: any) => c.id === cat.id)
                                        return (
                                            <label key={cat.id} className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${isSelected ? 'border-purple-500 bg-purple-500/10' : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700'}`}>
                                                <div className="flex items-center gap-3 text-white">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={(checked) => {
                                                            const currentItems = content['featured_categories']?.items || []
                                                            let newItems
                                                            if (checked) {
                                                                newItems = [...currentItems, formattedCat]
                                                            } else {
                                                                newItems = currentItems.filter((c: any) => c.id !== cat.id)
                                                            }
                                                            setContent({
                                                                ...content,
                                                                featured_categories: { ...content['featured_categories'], items: newItems }
                                                            })
                                                        }}
                                                        className="border-neutral-600 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                                                    />
                                                    <span className="font-bold text-sm">{cat.name}</span>
                                                </div>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                {/* 3. PRODUCT SECTIONS TAB */}
                <TabsContent value="products" className="space-y-6">
                    <Card className="p-8 rounded-[2.5rem] border border-neutral-800 shadow-2xl bg-neutral-900">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black uppercase text-white">Product Showcases</h2>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        const currentSections = content['product_sections'] || []
                                        setContent({ ...content, product_sections: [...currentSections, { id: Date.now(), title: '', category_id: '', bg_style: 'bg-white' }] })
                                    }}
                                    variant="outline"
                                    className="rounded-xl font-bold uppercase text-xs border-neutral-700 text-white hover:bg-neutral-800 hover:text-white"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Section
                                </Button>
                                <Button
                                    onClick={() => handleSave('product_sections', content['product_sections'])}
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase text-xs"
                                >
                                    {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Changes'}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {(content['product_sections'] || []).map((section: any, index: number) => (
                                <div key={section.id} className="p-6 border border-neutral-800 bg-neutral-950 rounded-2xl space-y-4 relative group hover:border-neutral-700 transition-all">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-4 right-4 text-neutral-500 hover:text-red-400 hover:bg-red-500/10"
                                        onClick={async () => {
                                            const newSections = content['product_sections'].filter((s: any) => s.id !== section.id)
                                            setContent({ ...content, product_sections: newSections })
                                            await handleSave('product_sections', newSections)
                                        }}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>

                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-neutral-800 text-white flex items-center justify-center font-bold text-xs ring-4 ring-neutral-900">
                                            {index + 1}
                                        </div>
                                        <span className="font-black text-neutral-400 uppercase tracking-widest text-xs">Showcase Section</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-neutral-500 tracking-widest">Section Title</label>
                                            <Input
                                                value={section.title || ''}
                                                onChange={(e) => {
                                                    const newSections = content['product_sections'].map((s: any, i: number) =>
                                                        i === index ? { ...s, title: e.target.value } : s
                                                    )
                                                    setContent({ ...content, product_sections: newSections })
                                                }}
                                                className="font-bold border-neutral-800 bg-neutral-900 text-white"
                                                placeholder="e.g. Building Materials"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-neutral-500 tracking-widest">Category Source</label>
                                            <select
                                                value={section.category_id || ''}
                                                onChange={(e) => {
                                                    const newSections = content['product_sections'].map((s: any, i: number) =>
                                                        i === index ? { ...s, category_id: e.target.value } : s
                                                    )
                                                    setContent({ ...content, product_sections: newSections })
                                                }}
                                                className="w-full h-10 px-3 rounded-md border border-neutral-800 bg-neutral-900 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select Category...</option>
                                                {dependencies.categories.map((c: any) => (
                                                    <option key={c.id} value={c.name}>{c.name}</option> // Storing Name for now to match component prop, or should use ID? Component uses name for filtering.
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-neutral-500 tracking-widest">Background Style</label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        const newSections = content['product_sections'].map((s: any, i: number) =>
                                                            i === index ? { ...s, bg_style: 'bg-white' } : s
                                                        )
                                                        setContent({ ...content, product_sections: newSections })
                                                    }}
                                                    className={`flex-1 h-10 rounded-lg border-2 font-bold text-xs uppercase transition-all ${section.bg_style === 'bg-white' ? 'border-white bg-neutral-800 text-white' : 'border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-700'}`}
                                                >
                                                    White
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const newSections = content['product_sections'].map((s: any, i: number) =>
                                                            i === index ? { ...s, bg_style: 'bg-neutral-50' } : s
                                                        )
                                                        setContent({ ...content, product_sections: newSections })
                                                    }}
                                                    className={`flex-1 h-10 rounded-lg border-2 font-bold text-xs uppercase transition-all ${section.bg_style === 'bg-neutral-50' ? 'border-white bg-neutral-800 text-white' : 'border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-700'}`}
                                                >
                                                    Grey
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {(!content['product_sections'] || content['product_sections'].length === 0) && (
                                <div className="text-center py-10 text-neutral-500 font-medium bg-neutral-950 rounded-2xl border border-neutral-800">
                                    No product showcases added. Click "Add Section" to begin.
                                </div>
                            )}
                        </div>
                    </Card>
                </TabsContent>

                {/* 4. PROMOS TAB */}
                <TabsContent value="promos" className="space-y-6">
                    <Card className="p-8 rounded-[2.5rem] border border-neutral-800 shadow-2xl bg-neutral-900">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black uppercase text-white">Promotional Banners</h2>
                            <Button
                                onClick={() => handleSave('promo_banners', content['promo_banners'])}
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase text-xs"
                            >
                                {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Changes'}
                            </Button>
                        </div>

                        <div className="mb-8 max-w-md space-y-2">
                            <label className="text-xs font-bold uppercase text-neutral-500 tracking-widest">Section Title</label>
                            <Input
                                value={content['promo_banners']?.title || 'Our current deals'}
                                onChange={(e) => {
                                    const currentData = content['promo_banners'] || {}
                                    // Handle migration from array to object if needed
                                    const baseData = Array.isArray(currentData) ? { items: currentData } : currentData

                                    setContent({
                                        ...content,
                                        promo_banners: {
                                            ...baseData,
                                            title: e.target.value
                                        }
                                    })
                                }}
                                className="font-bold border-neutral-800 bg-neutral-950 text-white"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[0, 1, 2].map((i) => {
                                // Handle both array key and object structure for backward compatibility during dev
                                const currentData = content['promo_banners'] || {}
                                const banners = Array.isArray(currentData) ? currentData : (currentData.items || [])
                                const banner = banners[i] || { image_url: '', link_url: '' }

                                return (
                                    <div key={i} className="space-y-4 p-4 border border-neutral-800 rounded-2xl bg-neutral-950">
                                        <div className="aspect-[2/1] bg-neutral-800 rounded-xl overflow-hidden relative group flex items-center justify-center">
                                            {banner.image_url || (i === 0 ? 'https://res.cloudinary.com/dcbcex2pe/image/upload/v1738749841/samples/ecommerce/accessories-bag.jpg' : i === 1 ? 'https://res.cloudinary.com/dcbcex2pe/image/upload/v1738749839/samples/ecommerce/leather-bag-gray.jpg' : 'https://res.cloudinary.com/dcbcex2pe/image/upload/v1740924976/Frame_1618868661_3_gqqxyw.png') ? (
                                                <img src={banner.image_url || (i === 0 ? 'https://res.cloudinary.com/dcbcex2pe/image/upload/v1738749841/samples/ecommerce/accessories-bag.jpg' : i === 1 ? 'https://res.cloudinary.com/dcbcex2pe/image/upload/v1738749839/samples/ecommerce/leather-bag-gray.jpg' : 'https://res.cloudinary.com/dcbcex2pe/image/upload/v1740924976/Frame_1618868661_3_gqqxyw.png')} alt="Promo" className="h-[80%] w-auto object-contain z-10 relative" />
                                            ) : (
                                                <div className="text-white/50 font-bold uppercase text-[10px]">No Image</div>
                                            )}
                                            <div className="absolute inset-0 flex flex-col justify-center p-4 bg-gradient-to-r from-black/80 to-transparent z-20">
                                                <p className="text-white font-black text-lg leading-tight line-clamp-2 w-2/3">{banner.title || (i === 0 ? 'Smart Tools' : i === 1 ? 'Premium Gear' : 'New Arrivals')}</p>
                                                <p className="text-blue-300 text-xs font-medium w-2/3">{banner.subtitle || (i === 0 ? 'Up to 30% off' : i === 1 ? 'Explore now' : 'Shop latest')}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Title</label>
                                                <Input
                                                    value={banner.title ?? (i === 0 ? 'Smart Tools' : i === 1 ? 'Premium Gear' : 'New Arrivals')}
                                                    onChange={(e) => {
                                                        const currentData = content['promo_banners'] || {}
                                                        const banners = Array.isArray(currentData) ? currentData : (currentData.items || [])
                                                        const newBanners = [...banners]
                                                        if (!newBanners[i]) newBanners[i] = {}
                                                        newBanners[i].title = e.target.value

                                                        const newData = Array.isArray(currentData)
                                                            ? { title: 'Our current deals', items: newBanners }
                                                            : { ...currentData, items: newBanners }

                                                        setContent({ ...content, promo_banners: newData })
                                                    }}
                                                    className="h-8 text-xs font-bold border-neutral-800 bg-neutral-900 text-white"
                                                    placeholder="Main Title"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Subtitle</label>
                                                <Input
                                                    value={banner.subtitle ?? (i === 0 ? 'Up to 30% off' : i === 1 ? 'Explore now' : 'Shop latest')}
                                                    onChange={(e) => {
                                                        const currentData = content['promo_banners'] || {}
                                                        const banners = Array.isArray(currentData) ? currentData : (currentData.items || [])
                                                        const newBanners = [...banners]
                                                        if (!newBanners[i]) newBanners[i] = {}
                                                        newBanners[i].subtitle = e.target.value

                                                        const newData = Array.isArray(currentData)
                                                            ? { title: 'Our current deals', items: newBanners }
                                                            : { ...currentData, items: newBanners }

                                                        setContent({ ...content, promo_banners: newData })
                                                    }}
                                                    className="h-8 text-xs border-neutral-800 bg-neutral-900 text-white"
                                                    placeholder="Subtitle"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Image URL</label>
                                            <Input
                                                value={banner.image_url ?? (i === 0 ? 'https://res.cloudinary.com/dcbcex2pe/image/upload/v1738749841/samples/ecommerce/accessories-bag.jpg' : i === 1 ? 'https://res.cloudinary.com/dcbcex2pe/image/upload/v1738749839/samples/ecommerce/leather-bag-gray.jpg' : 'https://res.cloudinary.com/dcbcex2pe/image/upload/v1740924976/Frame_1618868661_3_gqqxyw.png')}
                                                onChange={(e) => {
                                                    const currentData = content['promo_banners'] || {}
                                                    const banners = Array.isArray(currentData) ? currentData : (currentData.items || [])
                                                    const newBanners = [...banners]
                                                    if (!newBanners[i]) newBanners[i] = {}
                                                    newBanners[i].image_url = e.target.value

                                                    const newData = Array.isArray(currentData)
                                                        ? { title: 'Our current deals', items: newBanners }
                                                        : { ...currentData, items: newBanners }

                                                    setContent({ ...content, promo_banners: newData })
                                                }}
                                                className="h-8 text-xs border-neutral-800 bg-neutral-900 text-white"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Link URL</label>
                                            <Input
                                                value={banner.link_url ?? '/'}
                                                onChange={(e) => {
                                                    const currentData = content['promo_banners'] || {}
                                                    const banners = Array.isArray(currentData) ? currentData : (currentData.items || [])
                                                    const newBanners = [...banners]
                                                    if (!newBanners[i]) newBanners[i] = {}
                                                    newBanners[i].link_url = e.target.value

                                                    const newData = Array.isArray(currentData)
                                                        ? { title: 'Our current deals', items: newBanners }
                                                        : { ...currentData, items: newBanners }

                                                    setContent({ ...content, promo_banners: newData })
                                                }}
                                                className="h-8 text-xs border-neutral-800 bg-neutral-900 text-white"
                                                placeholder="/category/..."
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>
                </TabsContent>
                <TabsContent value="design" className="space-y-6">
                    <Card className="p-8 rounded-[2.5rem] border border-neutral-800 shadow-2xl bg-neutral-900">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-black uppercase text-white">Design &amp; Planning Config</h2>
                                <p className="text-xs text-neutral-400 mt-1">Checked items appear in both the Home page slider and the app Design tab</p>
                            </div>
                            <Button
                                onClick={() => handleSave('design_display_config', content['design_display_config'])}
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase text-xs"
                            >
                                {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Changes'}
                            </Button>
                        </div>

                        {/* Stats bar */}
                        {(() => {
                            const selectedIds: string[] = content['design_display_config']?.selected_ids || []
                            const totalCheckable = (dependencies.allDesignCategories || []).filter((c: any) => c.level >= 2).length
                            return (
                                <div className="flex items-center gap-4 mb-6 p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                                    <span className="text-purple-400 font-black text-sm">{selectedIds.length} selected</span>
                                    <span className="text-neutral-700">|</span>
                                    <span className="text-neutral-400 text-xs font-semibold">{totalCheckable} total items available</span>
                                    {selectedIds.length > 0 && (
                                        <>
                                            <span className="text-neutral-700">|</span>
                                            <button
                                                onClick={() => setContent({ ...content, design_display_config: { ...content['design_display_config'], selected_ids: [] } })}
                                                className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-widest bg-red-500/10 px-3 py-1.5 rounded-lg"
                                            >
                                                Clear all
                                            </button>
                                        </>
                                    )}
                                </div>
                            )
                        })()}

                        {/* Category Tree */}
                        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {(() => {
                                const allCats: any[] = dependencies.allDesignCategories || []
                                const selectedIds: string[] = content['design_display_config']?.selected_ids || []

                                const toggleItem = (id: string) => {
                                    const current: string[] = content['design_display_config']?.selected_ids || []
                                    const newIds = current.includes(id) ? current.filter((x: string) => x !== id) : [...current, id]
                                    setContent({ ...content, design_display_config: { ...content['design_display_config'], selected_ids: newIds } })
                                }

                                const roots = allCats.filter((c: any) => c.level === 0)
                                const byParent = (parentId: string) => allCats.filter((c: any) => c.parent_id === parentId)

                                const levelLabels: Record<number, string> = {
                                    0: 'ROOT', 1: 'SUB', 2: 'ITEM', 3: 'SUB-ITEM L3', 4: 'SUB-ITEM L4'
                                }
                                const levelColors: Record<number, string> = {
                                    0: 'bg-purple-600 text-white',
                                    1: 'bg-purple-500/20 text-purple-400',
                                    2: 'bg-blue-500/20 text-blue-400',
                                    3: 'bg-green-500/20 text-green-400',
                                    4: 'bg-yellow-500/20 text-yellow-400'
                                }

                                const renderNode = (cat: any, depth: number): React.ReactNode => {
                                    const children = byParent(cat.id)
                                    const isCheckable = cat.level >= 2
                                    const isChecked = selectedIds.includes(cat.id)

                                    return (
                                        <div key={cat.id} style={{ marginLeft: `${depth * 20}px` }}>
                                            <div className={`flex items-center gap-3 py-2 px-3 rounded-xl transition-all ${isCheckable ? (isChecked ? 'bg-purple-500/10 border border-purple-500/30' : 'hover:bg-neutral-800 border border-transparent') : 'border border-transparent'}`}>
                                                {isCheckable ? (
                                                    <Checkbox
                                                        checked={isChecked}
                                                        onCheckedChange={() => toggleItem(cat.id)}
                                                        className="border-purple-300 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                                                    />
                                                ) : (
                                                    <span className="w-4 h-4 flex-shrink-0" />
                                                )}
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest flex-shrink-0 ${levelColors[cat.level] || 'bg-neutral-800 text-neutral-400'}`}>
                                                    {levelLabels[cat.level] || `L${cat.level}`}
                                                </span>
                                                <span
                                                    className={`text-sm ${isCheckable ? 'font-semibold cursor-pointer text-neutral-200 hover:text-white' : 'font-black text-neutral-400'}`}
                                                    onClick={() => isCheckable && toggleItem(cat.id)}
                                                >
                                                    {cat.name}
                                                </span>
                                                {cat.name_bn && <span className="text-xs text-neutral-600 font-medium ml-1">{cat.name_bn}</span>}
                                            </div>
                                            {children.length > 0 && (
                                                <div className="mt-1 space-y-1">
                                                    {children.map((child: any) => renderNode(child, depth + 1))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                }

                                if (roots.length === 0) return (
                                    <div className="text-center py-12 text-neutral-500">
                                        <p className="font-bold">No design categories found</p>
                                        <p className="text-xs mt-1">Add design categories in the Categories section first</p>
                                    </div>
                                )

                                return roots.map((root: any) => (
                                    <div key={root.id} className="border border-neutral-800 rounded-2xl p-4 mb-3 bg-neutral-950/50 shadow-sm">
                                        {renderNode(root, 0)}
                                    </div>
                                ))
                            })()}
                        </div>
                    </Card>
                </TabsContent>

                {/* 5. SERVICES TAB */}
                <TabsContent value="services" className="space-y-6">
                    <Card className="p-8 rounded-[2.5rem] border border-neutral-800 shadow-2xl bg-neutral-900">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black uppercase text-white">Service Showcases</h2>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        const currentSections = content['service_sections'] || []
                                        setContent({ ...content, service_sections: [...currentSections, { id: Date.now(), title: '', category_id: '', bg_style: 'bg-blue-50' }] })
                                    }}
                                    variant="outline"
                                    className="rounded-xl font-bold uppercase text-xs border-neutral-700 text-white hover:bg-neutral-800"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Section
                                </Button>
                                <Button
                                    onClick={() => handleSave('service_sections', content['service_sections'])}
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase text-xs"
                                >
                                    {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Changes'}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {(content['service_sections'] || []).map((section: any, index: number) => (
                                <div key={section.id} className="p-6 border border-neutral-800 bg-neutral-950 rounded-2xl space-y-4 relative group hover:border-neutral-700 transition-all">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-4 right-4 text-neutral-500 hover:text-red-400 hover:bg-red-500/10"
                                        onClick={async () => {
                                            const newSections = content['service_sections'].filter((s: any) => s.id !== section.id)
                                            setContent({ ...content, service_sections: newSections })
                                            await handleSave('service_sections', newSections)
                                        }}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>

                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-neutral-800 text-white flex items-center justify-center font-bold text-xs">
                                            {index + 1}
                                        </div>
                                        <span className="font-black text-neutral-400 uppercase tracking-widest text-xs">Service Showcase</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-neutral-500 tracking-widest">Section Title</label>
                                            <Input
                                                value={section.title || ''}
                                                onChange={(e) => {
                                                    const newSections = content['service_sections'].map((s: any, i: number) =>
                                                        i === index ? { ...s, title: e.target.value } : s
                                                    )
                                                    setContent({ ...content, service_sections: newSections })
                                                }}
                                                className="font-bold border-neutral-800 bg-neutral-900 text-white"
                                                placeholder="e.g. Repair Services"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-neutral-500 tracking-widest">Category Source</label>
                                            <select
                                                value={section.category_id || ''}
                                                onChange={(e) => {
                                                    const newSections = content['service_sections'].map((s: any, i: number) =>
                                                        i === index ? { ...s, category_id: e.target.value } : s
                                                    )
                                                    setContent({ ...content, service_sections: newSections })
                                                }}
                                                className="w-full h-10 px-3 rounded-md border border-neutral-800 bg-neutral-900 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">Select Category...</option>
                                                {dependencies.categories.filter((c: any) => c.type === 'service').map((c: any) => (
                                                    <option key={c.id} value={c.name}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-neutral-500 tracking-widest">Background Style</label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        const newSections = content['service_sections'].map((s: any, i: number) =>
                                                            i === index ? { ...s, bg_style: 'bg-white' } : s
                                                        )
                                                        setContent({ ...content, service_sections: newSections })
                                                    }}
                                                    className={`flex-1 h-10 rounded-lg border-2 font-bold text-xs uppercase transition-all ${section.bg_style === 'bg-white' ? 'border-white bg-neutral-800 text-white' : 'border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-700'}`}
                                                >
                                                    White
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const newSections = content['service_sections'].map((s: any, i: number) =>
                                                            i === index ? { ...s, bg_style: 'bg-blue-50' } : s
                                                        )
                                                        setContent({ ...content, service_sections: newSections })
                                                    }}
                                                    className={`flex-1 h-10 rounded-lg border-2 font-bold text-xs uppercase transition-all ${section.bg_style === 'bg-blue-50' ? 'border-white bg-neutral-800 text-white' : 'border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-700'}`}
                                                >
                                                    Blue
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {(!content['service_sections'] || content['service_sections'].length === 0) && (
                                <div className="text-center py-10 text-neutral-500 font-medium bg-neutral-950 rounded-2xl border border-neutral-800">
                                    No service showcases added. Click "Add Section" to begin.
                                </div>
                            )}
                        </div>
                    </Card>
                </TabsContent>
                {/* 6. HERO TAB */}
                <TabsContent value="hero" className="space-y-6">
                    <Card className="p-8 rounded-[2.5rem] border border-neutral-800 shadow-2xl bg-neutral-900">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black uppercase text-white">Hero Section Config</h2>
                            <Button
                                onClick={() => handleSave('hero_section', content['hero_section'])}
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase text-xs"
                            >
                                {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Changes'}
                            </Button>
                        </div>

                        <div className="space-y-8">
                            {['main', 'top_right', 'bottom_right'].map((slot, idx) => {
                                const currentData = content['hero_section'] || {};
                                const items = currentData.items || [];
                                const item = items.find((i: any) => i.id === slot) || { id: slot, overlay_color: '#000000', overlay_opacity: 50 };
                                const slotName = slot === 'main' ? 'Main Banner (Left)' : slot === 'top_right' ? 'Top Banner (Right)' : 'Bottom Banner (Right)';

                                return (
                                    <div key={slot} className="p-6 border border-neutral-800 rounded-2xl bg-neutral-950">
                                        <h3 className="font-black text-sm uppercase text-neutral-500 mb-4 border-b border-neutral-800 pb-2 tracking-widest">{slotName}</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Title</label>
                                                    <Input
                                                        value={item.title ?? (slot === 'main' ? 'Construction Marketplace' : slot === 'top_right' ? 'Premium Hardware' : 'Expert Services')}
                                                        onChange={(e) => {
                                                            const newItems = [...items.filter((i: any) => i.id !== slot), { ...item, title: e.target.value }];
                                                            setContent({ ...content, hero_section: { ...currentData, items: newItems } });
                                                        }}
                                                        className="font-bold text-sm border-neutral-800 bg-neutral-900 text-white"
                                                        placeholder="Title"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Subtitle</label>
                                                    <Input
                                                        value={item.subtitle ?? (slot === 'main' ? 'Everything for your dream home' : slot === 'top_right' ? 'Top Brands' : 'Hire Professionals')}
                                                        onChange={(e) => {
                                                            const newItems = [...items.filter((i: any) => i.id !== slot), { ...item, subtitle: e.target.value }];
                                                            setContent({ ...content, hero_section: { ...currentData, items: newItems } });
                                                        }}
                                                        className="text-xs border-neutral-800 bg-neutral-900 text-white"
                                                        placeholder="Subtitle"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Description</label>
                                                    <Input
                                                        value={item.desc ?? (slot === 'main' ? 'Find everything you need' : slot === 'top_right' ? 'Quality tools to match' : 'Get the job done')}
                                                        onChange={(e) => {
                                                            const newItems = [...items.filter((i: any) => i.id !== slot), { ...item, desc: e.target.value }];
                                                            setContent({ ...content, hero_section: { ...currentData, items: newItems } });
                                                        }}
                                                        className="text-xs border-neutral-800 bg-neutral-900 text-white"
                                                        placeholder="Short description"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Image URL</label>
                                                    <Input
                                                        value={item.image ?? (slot === 'main' ? 'https://res.cloudinary.com/dcbcex2pe/image/upload/v1740924976/Frame_1618868661_2_w1oab5.png' : slot === 'top_right' ? 'https://res.cloudinary.com/dcbcex2pe/image/upload/v1738749842/samples/ecommerce/shoes.png' : 'https://res.cloudinary.com/dcbcex2pe/image/upload/v1740924974/Frame_1618868661_f7o0v4.png')}
                                                        onChange={(e) => {
                                                            const newItems = [...items.filter((i: any) => i.id !== slot), { ...item, image: e.target.value }];
                                                            setContent({ ...content, hero_section: { ...currentData, items: newItems } });
                                                        }}
                                                        className="text-xs border-neutral-800 bg-neutral-900 text-white"
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Link URL</label>
                                                    <Input
                                                        value={item.href || ''}
                                                        onChange={(e) => {
                                                            const newItems = [...items.filter((i: any) => i.id !== slot), { ...item, href: e.target.value }];
                                                            setContent({ ...content, hero_section: { ...currentData, items: newItems } });
                                                        }}
                                                        className="text-xs border-neutral-800 bg-neutral-900 text-white"
                                                        placeholder="/..."
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Overlay Color</label>
                                                        <div className="flex gap-2 items-center">
                                                            <input
                                                                type="color"
                                                                value={item.overlay_color || '#000000'}
                                                                onChange={(e) => {
                                                                    const newItems = [...items.filter((i: any) => i.id !== slot), { ...item, overlay_color: e.target.value }];
                                                                    setContent({ ...content, hero_section: { ...currentData, items: newItems } });
                                                                }}
                                                                className="h-8 w-8 rounded cursor-pointer border-none bg-transparent"
                                                            />
                                                            <span className="text-xs font-mono text-neutral-300">{item.overlay_color}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Opacity (%)</label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={item.overlay_opacity || 50}
                                                            onChange={(e) => {
                                                                const newItems = [...items.filter((i: any) => i.id !== slot), { ...item, overlay_opacity: parseInt(e.target.value) }];
                                                                setContent({ ...content, hero_section: { ...currentData, items: newItems } });
                                                            }}
                                                            className="text-xs border-neutral-800 bg-neutral-900 text-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
