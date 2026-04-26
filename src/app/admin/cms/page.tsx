'use client'

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
    Star,
    Coffee,
    Compass,
    Settings,
    Building2,
    FileText,
    CheckSquare,
    Home,
    Ruler,
    PaintBucket
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
    const [mainArea, setMainArea] = useState('home')

    const [customSegmentType, setCustomSegmentType] = useState('CardSlider')
    const [customSegmentTitle, setCustomSegmentTitle] = useState('')
    const [customSegmentItems, setCustomSegmentItems] = useState<any[]>([])
    const [editingKey, setEditingKey] = useState<string | null>(null)
    const [wizardSubTab, setWizardSubTab] = useState<'permit' | 'design'>('permit');

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
            if (config) {
                const blanks = Array.from({ length: config.minItems }).map((_, i) => ({ id: Date.now() + i, title: '', subtitle: '', description: '', image: '', link: '' }));
                setCustomSegmentItems(blanks);
            }
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

    const renderLayoutController = () => (
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
                    <div key={section.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${section.hidden ? 'bg-neutral-950/50 border-neutral-800/50 opacity-70' : 'bg-neutral-950 border-neutral-800 shadow-sm hover:border-blue-500/30'}`}>
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
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                                {section.type === 'HeroSlider' ? <LayoutTemplate className="w-5 h-5" /> :
                                    section.type === 'IconSlider' ? <Tag className="w-5 h-5" /> :
                                        section.type === 'CardSlider' ? <Layers className="w-5 h-5" /> :
                                            section.type === 'PromoBanners' ? <ImageIcon className="w-5 h-5" /> :
                                                <Briefcase className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className={`font-black uppercase tracking-widest text-sm ${section.hidden ? 'text-neutral-500' : 'text-white'}`}>{section.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                                        {section.type}
                                    </span>
                                    <span className="text-xs font-medium text-neutral-500">Key: {section.data_key}</span>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                const newLayout = [...content['page_layout']];
                                newLayout[index].hidden = !newLayout[index].hidden;
                                setContent({ ...content, page_layout: newLayout });
                            }}
                            className={`rounded-xl w-12 h-12 transition-all ${section.hidden ? 'text-neutral-600' : 'text-blue-500 bg-blue-500/10'}`}
                        >
                            {section.hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </Button>
                    </div>
                ))}
            </div>
        </Card>
    );

    const renderCategoriesEditor = () => (
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
    );

    const renderProductsEditor = () => (
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
                        className="rounded-xl font-bold uppercase text-xs border-neutral-700 text-white hover:bg-neutral-800"
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
                    <div key={section.id} className="p-6 border border-neutral-800 bg-neutral-950 rounded-2xl space-y-4 relative group">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 text-neutral-500 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => {
                                const newSections = content['product_sections'].filter((s: any) => s.id !== section.id)
                                setContent({ ...content, product_sections: newSections })
                            }}
                        >
                            <Trash2 className="w-5 h-5" />
                        </Button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-neutral-500 tracking-widest">Display Title</label>
                                <Input
                                    value={section.title || ''}
                                    onChange={(e) => {
                                        const newSections = [...content['product_sections']]
                                        newSections[index].title = e.target.value
                                        setContent({ ...content, product_sections: newSections })
                                    }}
                                    className="font-bold border-neutral-800 bg-neutral-900 text-white"
                                    placeholder="e.g. Building Materials"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-neutral-500 tracking-widest">Target Category</label>
                                <select
                                    value={section.category_id || ''}
                                    onChange={(e) => {
                                        const newSections = [...content['product_sections']]
                                        newSections[index].category_id = e.target.value
                                        setContent({ ...content, product_sections: newSections })
                                    }}
                                    className="w-full h-10 px-3 rounded-md border border-neutral-800 bg-neutral-900 text-white text-sm"
                                >
                                    <option value="">Select Category...</option>
                                    {dependencies.categories.filter((c: any) => c.type === 'product').map((c: any) => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );

    const renderHeroEditor = () => (
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
                {['main', 'top_right', 'bottom_right'].map((slot) => {
                    const currentData = content['hero_section'] || {};
                    const items = currentData.items || [];
                    const item = items.find((i: any) => i.id === slot) || { id: slot, overlay_color: '#000000', overlay_opacity: 50 };
                    const slotName = slot === 'main' ? 'Main Banner (Left)' : slot === 'top_right' ? 'Top Banner (Right)' : 'Bottom Banner (Right)';

                    return (
                        <div key={slot} className="p-6 border border-neutral-800 rounded-2xl bg-neutral-950">
                            <h3 className="font-black text-sm uppercase text-neutral-500 mb-4 border-b border-neutral-800 pb-2 tracking-widest">{slotName}</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Title (EN)</label>
                                            <Input
                                                value={item.title || ''}
                                                onChange={(e) => {
                                                    const newItems = [...items.filter((i: any) => i.id !== slot), { ...item, title: e.target.value }];
                                                    setContent({ ...content, hero_section: { ...currentData, items: newItems } });
                                                }}
                                                className="font-bold text-sm border-neutral-800 bg-neutral-900 text-white"
                                                placeholder="Title"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-500">Title (BN)</label>
                                            <Input
                                                value={item.titleBn || ''}
                                                onChange={(e) => {
                                                    const newItems = [...items.filter((i: any) => i.id !== slot), { ...item, titleBn: e.target.value }];
                                                    setContent({ ...content, hero_section: { ...currentData, items: newItems } });
                                                }}
                                                className="font-bold text-sm border-neutral-800 bg-neutral-900 text-white"
                                                placeholder="শিরোনাম"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Subtitle (EN)</label>
                                            <Input
                                                value={item.subtitle || ''}
                                                onChange={(e) => {
                                                    const newItems = [...items.filter((i: any) => i.id !== slot), { ...item, subtitle: e.target.value }];
                                                    setContent({ ...content, hero_section: { ...currentData, items: newItems } });
                                                }}
                                                className="text-xs border-neutral-800 bg-neutral-900 text-white"
                                                placeholder="Subtitle"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-500">Subtitle (BN)</label>
                                            <Input
                                                value={item.subtitleBn || ''}
                                                onChange={(e) => {
                                                    const newItems = [...items.filter((i: any) => i.id !== slot), { ...item, subtitleBn: e.target.value }];
                                                    setContent({ ...content, hero_section: { ...currentData, items: newItems } });
                                                }}
                                                className="text-xs border-neutral-800 bg-neutral-900 text-white"
                                                placeholder="সাবটাইটেল"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Description (EN)</label>
                                            <Input
                                                value={item.description || ''}
                                                onChange={(e) => {
                                                    const newItems = [...items.filter((i: any) => i.id !== slot), { ...item, description: e.target.value }];
                                                    setContent({ ...content, hero_section: { ...currentData, items: newItems } });
                                                }}
                                                className="text-xs border-neutral-800 bg-neutral-900 text-white"
                                                placeholder="Short description"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-500">Description (BN)</label>
                                            <Input
                                                value={item.descriptionBn || ''}
                                                onChange={(e) => {
                                                    const newItems = [...items.filter((i: any) => i.id !== slot), { ...item, descriptionBn: e.target.value }];
                                                    setContent({ ...content, hero_section: { ...currentData, items: newItems } });
                                                }}
                                                className="text-xs border-neutral-800 bg-neutral-900 text-white"
                                                placeholder="বিবরণ"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Image URL</label>
                                        <Input
                                            value={item.image || ''}
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
                                            value={item.link || ''}
                                            onChange={(e) => {
                                                const newItems = [...items.filter((i: any) => i.id !== slot), { ...item, link: e.target.value }];
                                                setContent({ ...content, hero_section: { ...currentData, items: newItems } });
                                            }}
                                            className="text-xs border-neutral-800 bg-neutral-900 text-white"
                                            placeholder="/..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Overlay Color</label>
                                            <div className="flex gap-2">
                                                <div className="w-9 h-9 rounded border border-neutral-800 shrink-0" style={{ backgroundColor: item.overlay_color || '#000000' }} />
                                                <Input
                                                    value={item.overlay_color || '#000000'}
                                                    onChange={(e) => {
                                                        const newItems = [...items.filter((i: any) => i.id !== slot), { ...item, overlay_color: e.target.value }];
                                                        setContent({ ...content, hero_section: { ...currentData, items: newItems } });
                                                    }}
                                                    className="text-xs border-neutral-800 bg-neutral-900 text-white"
                                                    placeholder="#000000"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Opacity (%)</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={item.overlay_opacity ?? 50}
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
    );

    const renderDesignLandingEditor = () => (
        <Card className="p-8 rounded-[2.5rem] border border-neutral-800 shadow-2xl bg-neutral-900">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-black uppercase text-white italic tracking-tighter">Hero <span className="text-blue-500">Configuration</span></h2>
                    <p className="text-neutral-500 font-medium text-sm mt-1">Manage the top banners and intro text for the Design Landing Page.</p>
                </div>
                <Button
                    onClick={() => handleSave('design_hero', content['design_hero'])}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-6 shadow-lg shadow-blue-900/40"
                >
                    {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Hero Config
                </Button>
            </div>

            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-950/50 p-6 rounded-2xl border border-neutral-800/50">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-400">PAGE MAIN TITLE (ENGLISH)</label>
                            <Input
                                value={content['design_hero']?.title || ''}
                                onChange={(e) => setContent({ ...content, design_hero: { ...content['design_hero'], title: e.target.value } })}
                                className="font-bold border-neutral-800 bg-neutral-950 text-white h-12 rounded-xl"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-400">HERO SUBTITLE (ENGLISH)</label>
                            <Input
                                value={content['design_hero']?.subtitle || ''}
                                onChange={(e) => setContent({ ...content, design_hero: { ...content['design_hero'], subtitle: e.target.value } })}
                                className="border-neutral-800 bg-neutral-950 text-white h-12 rounded-xl"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-400">PAGE MAIN TITLE (BENGALI)</label>
                            <Input
                                value={content['design_hero']?.titleBn || ''}
                                onChange={(e) => setContent({ ...content, design_hero: { ...content['design_hero'], titleBn: e.target.value } })}
                                className="font-bold border-neutral-800 bg-neutral-950 text-white h-12 rounded-xl"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-400">HERO SUBTITLE (BENGALI)</label>
                            <Input
                                value={content['design_hero']?.subtitleBn || ''}
                                onChange={(e) => setContent({ ...content, design_hero: { ...content['design_hero'], subtitleBn: e.target.value } })}
                                className="border-neutral-800 bg-neutral-950 text-white h-12 rounded-xl"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(content['design_hero']?.items || []).map((item: any, idx: number) => (
                        <div key={item.id || idx} className="p-6 border border-neutral-800 rounded-2xl bg-neutral-950 hover:border-blue-500/30 transition-all">
                            <div className="flex items-center gap-2 mb-4 border-b border-neutral-800 pb-2">
                                <ImageIcon className="w-4 h-4 text-blue-500" />
                                <h3 className="font-black text-xs uppercase text-white tracking-widest">SHOWCASE CARD {idx + 1}</h3>
                            </div>
                            
                            <div className="flex gap-4 mb-6">
                                <div className="w-24 h-24 rounded-xl bg-neutral-800 overflow-hidden shrink-0 border border-neutral-700">
                                    {item.image ? (
                                        <img src={item.image} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-600 font-bold uppercase">No Image</div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">CARD TITLE</label>
                                        <Input
                                            value={item.title || ''}
                                            onChange={(e) => {
                                                const newItems = [...content['design_hero'].items];
                                                newItems[idx] = { ...item, title: e.target.value };
                                                setContent({ ...content, design_hero: { ...content['design_hero'], items: newItems } });
                                            }}
                                            className="font-bold text-xs border-neutral-800 bg-neutral-900 text-white"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">IMAGE URL</label>
                                        <Input
                                            value={item.image || ''}
                                            onChange={(e) => {
                                                const newItems = [...content['design_hero'].items];
                                                newItems[idx] = { ...item, image: e.target.value };
                                                setContent({ ...content, design_hero: { ...content['design_hero'], items: newItems } });
                                            }}
                                            className="text-xs border-neutral-800 bg-neutral-900 text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">OVERLAY COLOR</label>
                                    <div className="flex gap-2">
                                        <div className="w-9 h-9 rounded border border-neutral-800 shrink-0" style={{ backgroundColor: item.overlay_color || '#000000' }} />
                                        <Input
                                            value={item.overlay_color || '#000000'}
                                            onChange={(e) => {
                                                const newItems = [...content['design_hero'].items];
                                                newItems[idx] = { ...item, overlay_color: e.target.value };
                                                setContent({ ...content, design_hero: { ...content['design_hero'], items: newItems } });
                                            }}
                                            className="text-xs border-neutral-800 bg-neutral-900 text-white"
                                            placeholder="#000000"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">OPACITY (%)</label>
                                    <Input
                                        type="number"
                                        value={item.overlay_opacity || 85}
                                        onChange={(e) => {
                                            const newItems = [...content['design_hero'].items];
                                            newItems[idx] = { ...item, overlay_opacity: parseInt(e.target.value) };
                                            setContent({ ...content, design_hero: { ...content['design_hero'], items: newItems } });
                                        }}
                                        className="text-xs border-neutral-800 bg-neutral-900 text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">BOOKING ACTION LINK</label>
                                <Input
                                    value={item.href || ''}
                                    onChange={(e) => {
                                        const newItems = [...content['design_hero'].items];
                                        newItems[idx] = { ...item, href: e.target.value };
                                        setContent({ ...content, design_hero: { ...content['design_hero'], items: newItems } });
                                    }}
                                    className="text-xs border-neutral-800 bg-neutral-900 text-white"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );

    const renderDesignLayoutController = () => (
        <Card className="p-8 rounded-[2.5rem] border border-neutral-800 shadow-2xl bg-neutral-900">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter">Design <span className="text-blue-500">Layout</span></h2>
                    <p className="text-neutral-500 font-medium text-sm mt-1">Manage the hierarchy of sections on the Design Landing Page.</p>
                </div>
                <Button
                    onClick={() => handleSave('design_page_layout', content['design_page_layout'])}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-6 shadow-lg shadow-blue-900/40"
                >
                    {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Layout Sequence
                </Button>
            </div>

            <div className="space-y-3">
                {(content['design_page_layout'] || []).map((section: any, index: number) => (
                    <div key={section.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${section.hidden ? 'bg-neutral-950/50 border-neutral-800/50 opacity-70' : 'bg-neutral-950 border-neutral-800 shadow-sm hover:border-blue-500/30'}`}>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => {
                                        if (index === 0) return;
                                        const newLayout = [...content['design_page_layout']];
                                        const temp = newLayout[index - 1];
                                        newLayout[index - 1] = newLayout[index];
                                        newLayout[index] = temp;
                                        setContent({ ...content, design_page_layout: newLayout });
                                    }}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${index === 0 ? 'text-neutral-800 cursor-not-allowed' : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white'}`}
                                >
                                    <ArrowUp className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        const newLayout = [...content['design_page_layout']];
                                        if (index === newLayout.length - 1) return;
                                        const temp = newLayout[index + 1];
                                        newLayout[index + 1] = newLayout[index];
                                        newLayout[index] = temp;
                                        setContent({ ...content, design_page_layout: newLayout });
                                    }}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${index === (content['design_page_layout']?.length || 0) - 1 ? 'text-neutral-800 cursor-not-allowed' : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white'}`}
                                >
                                    <ArrowDown className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                                {section.type.includes('Hero') ? <LayoutTemplate className="w-5 h-5" /> :
                                    section.type.includes('Workflow') ? <Layers className="w-5 h-5" /> :
                                        section.type.includes('Showcase') ? <Briefcase className="w-5 h-5" /> :
                                            <Star className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className={`font-black uppercase tracking-widest text-sm ${section.hidden ? 'text-neutral-500' : 'text-white'}`}>{section.title || section.type}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                                        {section.type}
                                    </span>
                                    <span className="text-xs font-medium text-neutral-500">Key: {section.data_key}</span>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                const newLayout = [...content['design_page_layout']];
                                newLayout[index].hidden = !newLayout[index].hidden;
                                setContent({ ...content, design_page_layout: newLayout });
                            }}
                            className={`rounded-xl w-12 h-12 transition-all ${section.hidden ? 'text-neutral-600' : 'text-blue-500 bg-blue-500/10'}`}
                        >
                            {section.hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </Button>
                    </div>
                ))}
            </div>
        </Card>
    );

    const renderDesignShowcaseEditor = () => {
        const data = content['design_display_config'] || { title: 'Design Categories', items: [] };
        
        return (
            <Card className="p-8 rounded-[2.5rem] border border-neutral-800 shadow-2xl bg-neutral-900">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-black uppercase text-white italic tracking-tighter">Category <span className="text-blue-500">Showcase</span></h2>
                        <p className="text-neutral-500 font-medium text-sm mt-1">Select which design categories to feature in the Showcase section.</p>
                    </div>
                    <Button
                        onClick={() => handleSave('design_display_config', content['design_display_config'])}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-6 shadow-lg shadow-blue-900/40"
                    >
                        {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Categories
                    </Button>
                </div>

                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-4 no-scrollbar">
                    {dependencies.designPackages.map((pkg: any) => {
                        const isPkgSelected = data.selected_ids?.includes(pkg.id);
                        
                        return (
                            <div key={pkg.id} className="space-y-3">
                                <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${isPkgSelected ? 'bg-blue-500 border-blue-500' : 'bg-neutral-950 border-neutral-800'}`}>
                                    <Checkbox
                                        checked={isPkgSelected}
                                        onCheckedChange={(checked) => {
                                            const currentIds = data.selected_ids || [];
                                            let newIds;
                                            if (checked) {
                                                newIds = [...currentIds, pkg.id];
                                            } else {
                                                newIds = currentIds.filter((id: string) => id !== pkg.id);
                                            }
                                            setContent({ ...content, design_display_config: { ...data, selected_ids: newIds } });
                                        }}
                                        className={`border-neutral-700 ${isPkgSelected ? 'data-[state=checked]:bg-white data-[state=checked]:text-blue-500' : 'data-[state=checked]:bg-blue-500'}`}
                                    />
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${isPkgSelected ? 'bg-white/20 text-white' : 'bg-neutral-900 text-neutral-600'}`}>ROOT</span>
                                    <span className={`text-sm font-bold ${isPkgSelected ? 'text-white' : 'text-neutral-300'}`}>{pkg.name}</span>
                                </div>

                                {pkg.subcategories?.length > 0 && (
                                    <div className="pl-8 space-y-3">
                                        {pkg.subcategories.map((sub: any) => {
                                            const isSubSelected = data.selected_ids?.includes(sub.id);
                                            return (
                                                <div key={sub.id} className="space-y-3">
                                                    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isSubSelected ? 'bg-blue-600/20 border-blue-500' : 'bg-neutral-950/40 border-neutral-900'}`}>
                                                        <Checkbox
                                                            checked={isSubSelected}
                                                            onCheckedChange={(checked) => {
                                                                const currentIds = data.selected_ids || [];
                                                                let newIds;
                                                                if (checked) {
                                                                    newIds = [...currentIds, sub.id];
                                                                } else {
                                                                    newIds = currentIds.filter((id: string) => id !== sub.id);
                                                                }
                                                                setContent({ ...content, design_display_config: { ...data, selected_ids: newIds } });
                                                            }}
                                                            className="border-neutral-700 data-[state=checked]:bg-blue-500"
                                                        />
                                                        <span className="text-[8px] font-black uppercase text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">SUB</span>
                                                        <span className="text-xs font-bold text-neutral-300">{sub.name}</span>
                                                    </div>
                                                    
                                                    <div className="pl-6 space-y-2">
                                                        {sub.subcategories?.map((l3: any) => {
                                                            const isL3Selected = data.selected_ids?.includes(l3.id);
                                                            return (
                                                                <div key={l3.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isL3Selected ? 'bg-blue-950 border-blue-800' : 'bg-neutral-950/20 border-neutral-900'}`}>
                                                                    <div className="flex items-center gap-3">
                                                                        <Checkbox
                                                                            checked={isL3Selected}
                                                                            onCheckedChange={(checked) => {
                                                                                const currentIds = data.selected_ids || [];
                                                                                let newIds;
                                                                                if (checked) {
                                                                                    newIds = [...currentIds, l3.id];
                                                                                } else {
                                                                                    newIds = currentIds.filter((id: string) => id !== l3.id);
                                                                                }
                                                                                setContent({ ...content, design_display_config: { ...data, selected_ids: newIds } });
                                                                            }}
                                                                            className="border-neutral-700 data-[state=checked]:bg-blue-600"
                                                                        />
                                                                        <span className="text-[8px] font-black uppercase text-neutral-600 bg-neutral-900 px-1.5 py-0.5 rounded">ITEM</span>
                                                                        <span className="text-xs font-bold text-neutral-400">{l3.name}</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>
        );
    };    

    const renderPromosEditor = () => (
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
                    value={content['promo_banners']?.title || ''}
                    onChange={(e) => {
                        const currentData = content['promo_banners'] || {}
                        const baseData = Array.isArray(currentData) ? { items: currentData } : currentData
                        setContent({ ...content, promo_banners: { ...baseData, title: e.target.value } })
                    }}
                    className="font-bold border-neutral-800 bg-neutral-950 text-white"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[0, 1, 2].map((i) => {
                    const currentData = content['promo_banners'] || {}
                    const banners = Array.isArray(currentData) ? currentData : (currentData.items || [])
                    const banner = banners[i] || { image_url: '', link_url: '', title: '', subtitle: '' }

                    return (
                        <div key={i} className="space-y-4 p-4 border border-neutral-800 rounded-2xl bg-neutral-950">
                            <div className="aspect-[2/1] bg-neutral-800 rounded-xl overflow-hidden relative group flex items-center justify-center">
                                {banner.image_url ? (
                                    <img src={banner.image_url} alt="Promo" className="h-[80%] w-auto object-contain z-10 relative" />
                                ) : (
                                    <div className="text-white/50 font-bold uppercase text-[10px]">No Image</div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Title</label>
                                    <Input
                                        value={banner.title || ''}
                                        onChange={(e) => {
                                            const newBanners = [...banners]
                                            newBanners[i] = { ...banner, title: e.target.value }
                                            setContent({ ...content, promo_banners: { ...currentData, items: newBanners } })
                                        }}
                                        className="h-8 text-xs font-bold border-neutral-800 bg-neutral-900 text-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Subtitle</label>
                                    <Input
                                        value={banner.subtitle || ''}
                                        onChange={(e) => {
                                            const newBanners = [...banners]
                                            newBanners[i] = { ...banner, subtitle: e.target.value }
                                            setContent({ ...content, promo_banners: { ...currentData, items: newBanners } })
                                        }}
                                        className="h-8 text-xs border-neutral-800 bg-neutral-900 text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Image URL</label>
                                <Input
                                    value={banner.image_url || ''}
                                    onChange={(e) => {
                                        const newBanners = [...banners]
                                        newBanners[i] = { ...banner, image_url: e.target.value }
                                        setContent({ ...content, promo_banners: { ...currentData, items: newBanners } })
                                    }}
                                    className="h-8 text-xs border-neutral-800 bg-neutral-900 text-white"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Link URL</label>
                                <Input
                                    value={banner.link_url || ''}
                                    onChange={(e) => {
                                        const newBanners = [...banners]
                                        newBanners[i] = { ...banner, link_url: e.target.value }
                                        setContent({ ...content, promo_banners: { ...currentData, items: newBanners } })
                                    }}
                                    className="h-8 text-xs border-neutral-800 bg-neutral-900 text-white"
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </Card>
    );

    const renderServicesEditor = () => (
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
            </div>
        </Card>
    );

    const renderReviewsEditor = () => (
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
    );



    const renderCustomSegmentsEditor = () => (
        <Card className="p-8 rounded-[2.5rem] border border-neutral-800 shadow-2xl bg-neutral-900">
            <div className="mb-8">
                <h2 className="text-3xl font-black uppercase text-white tracking-widest italic leading-none">Segment <span className="text-blue-500">Builder</span></h2>
                <p className="text-neutral-500 font-medium text-sm mt-1">Create fully custom sections to appear on your home page with strict variations.</p>
            </div>

            <div className="space-y-8">
                <div className="bg-neutral-950/40 p-6 rounded-3xl border border-neutral-800/50 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest">SECTION TITLE (INTERNAL/DISPLAY)</label>
                                <span className="text-[10px] font-black uppercase text-neutral-600 bg-neutral-900 px-2 py-0.5 rounded">REQUIRED</span>
                            </div>
                            <Input
                                placeholder="e.g. Summer Collection"
                                value={customSegmentTitle}
                                onChange={e => setCustomSegmentTitle(e.target.value)}
                                className="h-14 border-neutral-800 bg-neutral-950 text-white font-bold rounded-xl focus:ring-blue-500 focus:border-blue-500 shadow-inner"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">CONTAINER TYPE</label>
                            <div className="relative group">
                                <select
                                    value={customSegmentType}
                                    onChange={e => {
                                        if (editingKey) return;
                                        setCustomSegmentType(e.target.value);
                                    }}
                                    disabled={!!editingKey}
                                    className="w-full h-14 px-4 pr-10 rounded-xl border border-neutral-800 bg-neutral-950 text-white font-bold text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {Object.keys(CONTAINER_CONFIG).map(type => (
                                        <option key={type} value={type} className="bg-neutral-900 text-white py-2">
                                            {CONTAINER_CONFIG[type].label}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                                    <ArrowDown className="w-4 h-4" />
                                </div>
                            </div>
                            {CONTAINER_CONFIG[customSegmentType] && (
                                <div className="mt-3 flex items-center gap-2 bg-blue-500/5 border border-blue-500/10 p-3 rounded-xl">
                                    <span className="text-lg">👉</span>
                                    <p className="text-[11px] font-bold text-blue-400">
                                        {CONTAINER_CONFIG[customSegmentType].guidance}
                                    </p>
                                </div>
                            )}
                        </div>
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

                    <div className="max-h-[600px] overflow-y-auto pr-2 space-y-3 no-scrollbar">
                        {customSegmentItems.map((item, index) => {
                            const cfgFields = CONTAINER_CONFIG[customSegmentType]?.fields || [];
                            return (
                                <div key={item.id} className="p-4 border border-neutral-800 rounded-2xl bg-neutral-950 relative group">
                                    <div className="grid grid-cols-1 gap-3">
                                        {cfgFields.includes('title') && (
                                            <Input
                                                placeholder="Title"
                                                value={item.title || ''}
                                                onChange={e => {
                                                    const newI = [...customSegmentItems];
                                                    newI[index].title = e.target.value;
                                                    setCustomSegmentItems(newI);
                                                }}
                                                className="h-9 border-neutral-800 bg-neutral-900 text-white text-xs"
                                            />
                                        )}
                                        {cfgFields.includes('image') && (
                                            <Input
                                                placeholder="Image URL"
                                                value={item.image || ''}
                                                onChange={e => {
                                                    const newI = [...customSegmentItems];
                                                    newI[index].image = e.target.value;
                                                    setCustomSegmentItems(newI);
                                                }}
                                                className="h-9 border-neutral-800 bg-neutral-900 text-white text-xs"
                                            />
                                        )}
                                        {cfgFields.includes('link') && (
                                            <Input
                                                placeholder="Link"
                                                value={item.link || ''}
                                                onChange={e => {
                                                    const newI = [...customSegmentItems];
                                                    newI[index].link = e.target.value;
                                                    setCustomSegmentItems(newI);
                                                }}
                                                className="h-9 border-neutral-800 bg-neutral-900 text-white text-xs"
                                            />
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setCustomSegmentItems(customSegmentItems.filter((_, i) => i !== index))}
                                        disabled={customSegmentItems.length <= (CONTAINER_CONFIG[customSegmentType]?.minItems || 0)}
                                        className="absolute top-2 right-2 h-7 w-7 p-0 text-neutral-600 hover:text-red-400"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex gap-4">
                    {editingKey && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setEditingKey(null);
                                setCustomSegmentTitle('');
                                setCustomSegmentItems([]);
                            }}
                            className="flex-1 h-12 border-neutral-800 text-white rounded-xl font-black uppercase text-xs"
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        disabled={saving || !customSegmentTitle || customSegmentItems.some(i => !i.image)}
                        onClick={async () => {
                            setSaving(true);
                            const segmentKey = editingKey || `custom_${Date.now()}`;
                            const newSection = { title: customSegmentTitle, items: customSegmentItems };
                            const r1 = await updateHomeSection(segmentKey, newSection);
                            if (r1.success) {
                                let newLayout = content['page_layout'] || [];
                                if (!editingKey) {
                                    newLayout = [...newLayout, { id: segmentKey, type: customSegmentType, data_key: segmentKey, hidden: false, title: customSegmentTitle }];
                                    await updateHomeSection('page_layout', newLayout);
                                }
                                setContent({ ...content, [segmentKey]: newSection, page_layout: newLayout });
                                setSaveAlert({ type: 'success', message: 'Segment Updated!' });
                                setEditingKey(null);
                                setCustomSegmentTitle('');
                            }
                            setSaving(false);
                        }}
                        className="flex-[2] h-12 bg-blue-600 text-white rounded-xl font-black uppercase text-xs"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : (editingKey ? 'Update Segment' : 'Create Segment')}
                    </Button>
                </div>

                <div className="pt-8 border-t border-neutral-800">
                    <div className="flex items-center gap-3 mb-6">
                        <Layers className="w-5 h-5 text-blue-500" />
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Live <span className="text-blue-500">Preview</span></h3>
                    </div>
                    
                    <div className="bg-white rounded-[2.5rem] border border-neutral-200 p-8 shadow-2xl relative overflow-hidden min-h-[400px] flex items-center justify-center">
                        <Button 
                            className="absolute top-4 right-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-4"
                            variant="ghost"
                        >
                            Consumer View
                        </Button>

                        <div className="w-full">
                            {(() => {
                                switch (customSegmentType) {
                                    case 'CardSlider':
                                        return <GenericCardSlider title={customSegmentTitle} items={customSegmentItems} />;
                                    case 'IconSlider':
                                        return <IconCategories title={customSegmentTitle} items={customSegmentItems} />;
                                    case 'ThreeSliderBanner':
                                        return <PromoBannerSection title={customSegmentTitle} banners={customSegmentItems} />;
                                    case 'HeroContainer':
                                        return <HeroContainer title={customSegmentTitle} items={customSegmentItems} />;
                                    case 'SingleSlider':
                                        return <SingleSlider title={customSegmentTitle} items={customSegmentItems} />;
                                    case 'MovingIconSlider':
                                        return <MovingIconSlider title={customSegmentTitle} items={customSegmentItems} />;
                                    case 'InfoCardSlider':
                                        return <InfoCardSlider title={customSegmentTitle} items={customSegmentItems} />;
                                    case 'BlogSlider':
                                        return <BlogSlider title={customSegmentTitle} items={customSegmentItems} />;
                                    case 'TestimonialSlider':
                                        return <TestimonialSlider title={customSegmentTitle} items={customSegmentItems} />;
                                    default:
                                        return (
                                            <div className="flex flex-col items-center">
                                                <ImageIcon className="w-12 h-12 text-neutral-200 mb-4" />
                                                <p className="text-neutral-400 font-bold uppercase tracking-widest text-sm">Select a type to see live preview</p>
                                            </div>
                                        );
                                }
                            })()}
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-neutral-800">
                    <h3 className="text-sm font-black uppercase text-white mb-4">Existing custom segments</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.keys(content).filter(k => k.startsWith('custom_')).map(key => (
                            <div key={key} className="p-4 bg-neutral-950 border border-neutral-800 rounded-2xl flex justify-between items-center">
                                <span className="text-xs font-bold text-white truncate mr-2">{content[key].title}</span>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setEditingKey(key);
                                        setCustomSegmentTitle(content[key].title);
                                        setCustomSegmentItems(content[key].items);
                                        const layoutItem = (content['page_layout'] || []).find((l: any) => l.data_key === key);
                                        if (layoutItem) setCustomSegmentType(layoutItem.type);
                                    }}
                                    className="h-8 text-[10px] font-black uppercase bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 shadow-none border-blue-500/20 border"
                                >
                                    Edit
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );



    const renderWorkflowEditor = (sectionKey: string, title: string) => {
        const data = content[sectionKey] || { title: '', titleBn: '', steps: [] };
        return (
            <Card className="p-8 rounded-[2.5rem] border border-neutral-800 shadow-2xl bg-neutral-900">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-2xl font-black uppercase text-white italic tracking-tighter">
                            {title.split(' ')[0]} <span className="text-blue-500">{title.split(' ').slice(1).join(' ')}</span>
                        </h2>
                        <p className="text-neutral-500 font-medium text-sm mt-1">Manage the steps for this workflow slider.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                const currentData = content[sectionKey] || { title: '', titleBn: '', steps: [] };
                                const newSteps = [...(currentData.steps || []), { id: Date.now(), title: '', titleBn: '', description: '', image: '' }];
                                setContent({ ...content, [sectionKey]: { ...currentData, steps: newSteps } });
                            }}
                            className="h-12 px-6 rounded-xl font-bold uppercase text-xs border border-neutral-700 text-white hover:bg-neutral-800 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Add Step
                        </button>
                        <Button
                            onClick={() => handleSave(sectionKey, content[sectionKey])}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-6 shadow-lg shadow-blue-900/40"
                        >
                            {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Workflow
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-neutral-950/50 p-6 rounded-2xl border border-neutral-800/50">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-400">Section Header Title (English)</label>
                            <Input
                                value={data.title || ''}
                                onChange={(e) => setContent({ ...content, [sectionKey]: { ...data, title: e.target.value } })}
                                className="font-bold border-neutral-800 bg-neutral-950 text-white h-12 rounded-xl"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-400">Section Header Title (Bengali)</label>
                            <Input
                                value={data.titleBn || ''}
                                onChange={(e) => setContent({ ...content, [sectionKey]: { ...data, titleBn: e.target.value } })}
                                className="font-bold border-neutral-800 bg-neutral-950 text-white h-12 rounded-xl"
                                placeholder="ভাবনা থেকে বাড়ি"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {(data.steps || []).map((step: any, idx: number) => (
                        <div key={step.id || idx} className="p-6 border border-neutral-800 rounded-2xl bg-neutral-950 relative group hover:border-blue-500/20 transition-all">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-4 right-4 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                onClick={() => {
                                    const newSteps = data.steps.filter((_: any, i: number) => i !== idx);
                                    setContent({ ...content, [sectionKey]: { ...data, steps: newSteps } });
                                }}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>

                            <div className="flex gap-6">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-black text-xs">
                                        {(idx + 1).toString().padStart(2, '0')}
                                    </div>
                                    <div className="flex-1 w-px bg-neutral-800 my-2" />
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Step Title (English)</label>
                                            <Input
                                                value={step.title || ''}
                                                onChange={(e) => {
                                                    const newSteps = [...data.steps];
                                                    newSteps[idx] = { ...step, title: e.target.value };
                                                    setContent({ ...content, [sectionKey]: { ...data, steps: newSteps } });
                                                }}
                                                className="font-bold text-sm border-neutral-800 bg-neutral-900 text-white h-10 rounded-lg"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Step Description</label>
                                            <Input
                                                value={step.description || ''}
                                                onChange={(e) => {
                                                    const newSteps = [...data.steps];
                                                    newSteps[idx] = { ...step, description: e.target.value };
                                                    setContent({ ...content, [sectionKey]: { ...data, steps: newSteps } });
                                                }}
                                                className="text-xs border-neutral-800 bg-neutral-900 text-neutral-400 h-10 rounded-lg"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Step Title (Bengali)</label>
                                            <Input
                                                value={step.titleBn || ''}
                                                onChange={(e) => {
                                                    const newSteps = [...data.steps];
                                                    newSteps[idx] = { ...step, titleBn: e.target.value };
                                                    setContent({ ...content, [sectionKey]: { ...data, steps: newSteps } });
                                                }}
                                                className="font-bold text-sm border-neutral-800 bg-neutral-900 text-white h-10 rounded-lg"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">SKETCH IMAGE URL</label>
                                            <Input
                                                value={step.image || ''}
                                                onChange={(e) => {
                                                    const newSteps = [...data.steps];
                                                    newSteps[idx] = { ...step, image: e.target.value };
                                                    setContent({ ...content, [sectionKey]: { ...data, steps: newSteps } });
                                                }}
                                                className="text-[10px] border-neutral-800 bg-neutral-900 text-blue-400 h-10 rounded-lg placeholder:text-neutral-700"
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
        );
    };

    const renderStructuralWizardEditor = () => {
        const data = content['design_wizard_structural'] || {};
        const updateWizard = (newData: any) => {
            setContent({ ...content, design_wizard_structural: newData });
        };

        const updateStep1 = (step1: any) => updateWizard({ ...data, step1 });
        const updateStep2 = (step2: any) => updateWizard({ ...data, step2 });
        const updateStep3 = (step3: any) => updateWizard({ ...data, step3 });
        const updateStep4 = (step4: any) => updateWizard({ ...data, step4 });

        return (
            <div className="space-y-8 pb-10">
                {/* Header with Save Button and Sub-Tabs */}
                <Card className="bg-neutral-900 border-neutral-800 p-8 rounded-[32px] shadow-2xl overflow-hidden relative group">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-widest italic flex items-center gap-3">
                                <Building2 className="w-5 h-5 text-blue-500" />
                                Structural & Architectural Workflow
                            </h2>
                            <p className="text-neutral-500 text-xs font-bold uppercase tracking-tighter mt-1 ml-8">Manage Journey Steps & Requirements</p>
                        </div>
                        <Button
                            onClick={() => updateHomeSection('design_wizard_structural', data).then(res => setSaveAlert({ type: res.success ? 'success' : 'error', message: res.message }))}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-6 rounded-2xl shadow-lg shadow-blue-900/40 transition-all uppercase tracking-widest text-[10px] italic flex items-center gap-3 active:scale-95"
                        >
                            <Save className="w-4 h-4" />
                            Save Workflow Config
                        </Button>
                    </div>

                    <div className="flex gap-2 p-1 bg-neutral-950 rounded-2xl border border-neutral-800 w-fit mb-4">
                        <Button
                            onClick={() => setWizardSubTab('permit')}
                            className={`h-10 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${wizardSubTab === 'permit' ? 'bg-blue-600 text-white shadow-lg' : 'bg-transparent text-neutral-500 hover:text-white'}`}
                        >
                            Building Permit Journey
                        </Button>
                        <Button
                            onClick={() => setWizardSubTab('design')}
                            className={`h-10 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${wizardSubTab === 'design' ? 'bg-blue-600 text-white shadow-lg' : 'bg-transparent text-neutral-500 hover:text-white'}`}
                        >
                            Building Design Journey
                        </Button>
                    </div>
                </Card>

                {wizardSubTab === 'permit' ? (
                    <>
                        {/* SERVICE SELECTION (PERMIT FOCUS) */}
                        <Card className="bg-neutral-900 border-neutral-800 p-8 rounded-[32px] shadow-2xl">
                            <div className="mb-8">
                                <h3 className="text-lg font-black text-white uppercase tracking-widest italic flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-blue-400" />
                                    Step 1: Selection Options (Permit Track)
                                </h3>
                                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1 ml-8">Customize labels and visuals for permit-related choices</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Step Title (EN/BN)</Label>
                                    <div className="flex gap-4">
                                        <Input
                                            value={data.step1?.titleEn || ''}
                                            onChange={(e) => updateStep1({ ...data.step1, titleEn: e.target.value })}
                                            className="bg-neutral-950 border-neutral-800 rounded-2xl h-12 text-sm font-bold text-white px-5"
                                            placeholder="Find a Designer"
                                        />
                                        <Input
                                            value={data.step1?.title || ''}
                                            onChange={(e) => updateStep1({ ...data.step1, title: e.target.value })}
                                            className="bg-neutral-950 border-neutral-800 rounded-2xl h-12 text-sm font-bold text-white px-5"
                                            placeholder="একজন ডিজাইনার খুঁজুন"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Step Description (EN/BN)</Label>
                                    <div className="flex gap-4">
                                        <Input
                                            value={data.step1?.descriptionEn || ''}
                                            onChange={(e) => updateStep1({ ...data.step1, descriptionEn: e.target.value })}
                                            className="bg-neutral-950 border-neutral-800 rounded-2xl h-12 text-sm font-bold text-white px-5"
                                        />
                                        <Input
                                            value={data.step1?.descriptionBn || ''}
                                            onChange={(e) => updateStep1({ ...data.step1, descriptionBn: e.target.value })}
                                            className="bg-neutral-950 border-neutral-800 rounded-2xl h-12 text-sm font-bold text-white px-5"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {data.step1?.options?.filter((o: any) => o.id !== 'design').map((opt: any, idx: number) => {
                                    const actualIdx = data.step1.options.findIndex((o: any) => o.id === opt.id);
                                    return (
                                        <div key={opt.id} className="bg-neutral-950 border border-neutral-800 p-6 rounded-3xl">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-[9px] font-bold text-neutral-600 uppercase">Labels (EN / BN)</Label>
                                                    <Input
                                                        value={opt.labelEn || ''}
                                                        onChange={(e) => {
                                                            const newOpts = [...data.step1.options];
                                                            newOpts[actualIdx].labelEn = e.target.value;
                                                            updateStep1({ ...data.step1, options: newOpts });
                                                        }}
                                                        className="bg-neutral-900 border-neutral-800 rounded-xl h-10 text-xs text-white mb-2"
                                                        placeholder="English Label"
                                                    />
                                                    <Input
                                                        value={opt.label || ''}
                                                        onChange={(e) => {
                                                            const newOpts = [...data.step1.options];
                                                            newOpts[actualIdx].label = e.target.value;
                                                            updateStep1({ ...data.step1, options: newOpts });
                                                        }}
                                                        className="bg-neutral-900 border-neutral-800 rounded-xl h-10 text-xs text-white"
                                                        placeholder="Bengali Label"
                                                    />
                                                </div>
                                                <div className="space-y-2 lg:col-span-2">
                                                    <Label className="text-[9px] font-bold text-neutral-600 uppercase">Visual Identity (Icon or Image)</Label>
                                                    <div className="flex gap-4">
                                                        <div className="flex-1 space-y-1">
                                                            <Input
                                                                value={opt.icon || ''}
                                                                onChange={(e) => {
                                                                    const newOpts = [...data.step1.options];
                                                                    newOpts[actualIdx].icon = e.target.value;
                                                                    updateStep1({ ...data.step1, options: newOpts });
                                                                }}
                                                                className="bg-neutral-900 border-neutral-800 rounded-xl h-10 text-xs text-white"
                                                                placeholder="Lucide Icon Name"
                                                            />
                                                            <p className="text-[8px] text-neutral-600 ml-1">e.g., FileText, Home, Shield</p>
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <Input
                                                                value={opt.image || ''}
                                                                onChange={(e) => {
                                                                    const newOpts = [...data.step1.options];
                                                                    newOpts[actualIdx].image = e.target.value;
                                                                    updateStep1({ ...data.step1, options: newOpts });
                                                                }}
                                                                className="bg-neutral-900 border-neutral-800 rounded-xl h-10 text-xs text-white"
                                                                placeholder="Custom Image URL"
                                                            />
                                                            <p className="text-[8px] text-neutral-600 ml-1">Overrides icon if provided</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-center border-l border-neutral-800 pl-4">
                                                    <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                                                        {opt.image ? (
                                                            <img src={opt.image} className="w-10 h-10 object-contain" />
                                                        ) : (
                                                            <FileText className="w-8 h-8 text-blue-500" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* STEP 2: LEGAL DOCUMENTS */}
                        <Card className="bg-neutral-900 border-neutral-800 p-8 rounded-[32px] shadow-2xl">
                            <div className="mb-8">
                                <h3 className="text-lg font-black text-white uppercase tracking-widest italic flex items-center gap-3">
                                    <Layers className="w-5 h-5 text-purple-500" />
                                    Step 2: Legal Documents Checklist
                                </h3>
                                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1 ml-8">Legal Requirements (Deed/Mutation/Tax/NID)</p>
                            </div>

                            <div className="space-y-6 max-w-2xl">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 border-b border-neutral-800 pb-2 flex justify-between items-center">
                                    Approval Documents Checklist
                                    <Input
                                        value={data.step2?.approvalTitle || ''}
                                        onChange={(e) => updateStep2({ ...data.step2, approvalTitle: e.target.value })}
                                        className="bg-neutral-950 border-neutral-800 rounded-lg h-7 w-32 text-[9px]"
                                        placeholder="Header override"
                                    />
                                </Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {data.step2?.approvalDocs?.map((doc: any, idx: number) => (
                                        <div key={idx} className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl flex gap-3">
                                            <div className="flex-1 space-y-2">
                                                <Input value={doc.labelEn || ''} onChange={(e) => { const n = [...data.step2.approvalDocs]; n[idx].labelEn = e.target.value; updateStep2({ ...data.step2, approvalDocs: n }); }} className="h-8 text-xs bg-neutral-900 text-white" placeholder="Label EN" />
                                                <Input value={doc.label || ''} onChange={(e) => { const n = [...data.step2.approvalDocs]; n[idx].label = e.target.value; updateStep2({ ...data.step2, approvalDocs: n }); }} className="h-8 text-xs bg-neutral-900 border-blue-900/30 text-white" placeholder="Label BN" />
                                            </div>
                                            <Button size="icon" variant="ghost" onClick={() => { const n = data.step2.approvalDocs.filter((_: any, i: number) => i !== idx); updateStep2({ ...data.step2, approvalDocs: n }); }} className="text-red-500 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    ))}
                                    <Button onClick={() => { const n = [...(data.step2?.approvalDocs || []), { id: 'a' + Date.now(), label: '', labelEn: '' }]; updateStep2({ ...data.step2, approvalDocs: n }); }} variant="outline" className="w-full h-full border-dashed border-neutral-800 text-neutral-500 text-[10px] uppercase font-bold tracking-widest min-h-[80px]">
                                        <Plus className="w-3 h-3 mr-2" /> Add Legal Doc
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* STEP 3: REQUIRED APPROVALS */}
                        <Card className="bg-neutral-900 border-neutral-800 p-8 rounded-[32px] shadow-2xl">
                            <div className="mb-8">
                                <h3 className="text-lg font-black text-white uppercase tracking-widest italic flex items-center gap-3">
                                    <CheckSquare className="w-5 h-5 text-green-500" />
                                    Step 3: Required Approvals
                                </h3>
                                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1 ml-8">Which Approval is required?</p>
                            </div>

                            <div className="space-y-6 max-w-2xl">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 border-b border-neutral-800 pb-2 flex justify-between items-center">
                                    Which Approval is required?
                                    <Input
                                        value={data.step3?.designTitle || ''}
                                        onChange={(e) => updateStep3({ ...data.step3, designTitle: e.target.value })}
                                        className="bg-neutral-950 border-neutral-800 rounded-lg h-7 w-32 text-[9px]"
                                        placeholder="Header override"
                                    />
                                </Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {data.step3?.designDocs?.map((doc: any, idx: number) => (
                                        <div key={idx} className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl flex gap-3">
                                            <div className="flex-1 space-y-2">
                                                <Input value={doc.labelEn || ''} onChange={(e) => { const n = [...(data.step3?.designDocs || [])]; n[idx].labelEn = e.target.value; updateStep3({ ...data.step3, designDocs: n }); }} className="h-8 text-xs bg-neutral-900 text-white" placeholder="Label EN" />
                                                <Input value={doc.label || ''} onChange={(e) => { const n = [...(data.step3?.designDocs || [])]; n[idx].label = e.target.value; updateStep3({ ...data.step3, designDocs: n }); }} className="h-8 text-xs bg-neutral-900 border-blue-900/30 text-white" placeholder="Label BN" />
                                            </div>
                                            <Button size="icon" variant="ghost" onClick={() => { const n = data.step3.designDocs.filter((_: any, i: number) => i !== idx); updateStep3({ ...data.step3, designDocs: n }); }} className="text-red-500 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    ))}
                                    <Button onClick={() => { const n = [...(data.step3?.designDocs || []), { id: 'd' + Date.now(), label: '', labelEn: '' }]; updateStep3({ ...data.step3, designDocs: n }); }} variant="outline" className="w-full h-full border-dashed border-neutral-800 text-neutral-500 text-[10px] uppercase font-bold tracking-widest min-h-[80px]">
                                        <Plus className="w-3 h-3 mr-2" /> Add Selection
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </>
                ) : (
                    <>
                        {/* STEP 1: SERVICE SELECTION (DESIGN ONLY) */}
                        <Card className="bg-neutral-900 border-neutral-800 p-8 rounded-[32px] shadow-2xl">
                            <div className="mb-8">
                                <h3 className="text-lg font-black text-white uppercase tracking-widest italic flex items-center gap-3">
                                    <ImageIcon className="w-5 h-5 text-emerald-400" />
                                    Step 1: Selection Option (Design Track)
                                </h3>
                                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1 ml-8">Customize labels and visuals for design-only choices</p>
                            </div>

                            <div className="space-y-4">
                                {data.step1?.options?.filter((o: any) => o.id === 'design').map((opt: any) => {
                                    const actualIdx = data.step1.options.findIndex((o: any) => o.id === opt.id);
                                    return (
                                        <div key={opt.id} className="bg-neutral-950 border border-neutral-800 p-6 rounded-3xl">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-[9px] font-bold text-neutral-600 uppercase">Labels (EN / BN)</Label>
                                                    <Input
                                                        value={opt.labelEn || ''}
                                                        onChange={(e) => {
                                                            const newOpts = [...data.step1.options];
                                                            newOpts[actualIdx].labelEn = e.target.value;
                                                            updateStep1({ ...data.step1, options: newOpts });
                                                        }}
                                                        className="bg-neutral-900 border-neutral-800 rounded-xl h-10 text-xs text-white mb-2"
                                                        placeholder="English Label"
                                                    />
                                                    <Input
                                                        value={opt.label || ''}
                                                        onChange={(e) => {
                                                            const newOpts = [...data.step1.options];
                                                            newOpts[actualIdx].label = e.target.value;
                                                            updateStep1({ ...data.step1, options: newOpts });
                                                        }}
                                                        className="bg-neutral-900 border-neutral-800 rounded-xl h-10 text-xs text-white"
                                                        placeholder="Bengali Label"
                                                    />
                                                </div>
                                                <div className="space-y-2 lg:col-span-2">
                                                    <Label className="text-[9px] font-bold text-neutral-600 uppercase">Visual Identity (Icon or Image)</Label>
                                                    <div className="flex gap-4">
                                                        <div className="flex-1 space-y-1">
                                                            <Input
                                                                value={opt.icon || ''}
                                                                onChange={(e) => {
                                                                    const newOpts = [...data.step1.options];
                                                                    newOpts[actualIdx].icon = e.target.value;
                                                                    updateStep1({ ...data.step1, options: newOpts });
                                                                }}
                                                                className="bg-neutral-900 border-neutral-800 rounded-xl h-10 text-xs text-white"
                                                                placeholder="Lucide Icon Name"
                                                            />
                                                            <p className="text-[8px] text-neutral-600 ml-1">e.g., Building2, Sofa, PenTool</p>
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <Input
                                                                value={opt.image || ''}
                                                                onChange={(e) => {
                                                                    const newOpts = [...data.step1.options];
                                                                    newOpts[actualIdx].image = e.target.value;
                                                                    updateStep1({ ...data.step1, options: newOpts });
                                                                }}
                                                                className="bg-neutral-900 border-neutral-800 rounded-xl h-10 text-xs text-white"
                                                                placeholder="Custom Image URL"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-center border-l border-neutral-800 pl-4">
                                                    <div className="w-16 h-16 bg-emerald-600/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                                                        {opt.image ? (
                                                            <img src={opt.image} className="w-10 h-10 object-contain" />
                                                        ) : (
                                                            <Building2 className="w-8 h-8 text-emerald-500" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* STEP 2: LAND & LAYOUT PARAMETERS */}
                        <Card className="bg-neutral-900 border-neutral-800 p-8 rounded-[32px] shadow-2xl">
                            <div className="mb-8">
                                <h3 className="text-lg font-black text-white uppercase tracking-widest italic flex items-center gap-3">
                                    <Ruler className="w-5 h-5 text-blue-400" />
                                    Step 2: Land & Layout Parameters
                                </h3>
                                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1 ml-8">Step title, description and field labels (EN / BN)</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-neutral-950/50 p-6 rounded-2xl border border-neutral-800/50">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-blue-400">Step Title (EN / BN)</Label>
                                    <Input
                                        value={data.designStep2?.titleEn || ''}
                                        onChange={(e) => updateWizard({ ...data, designStep2: { ...data.designStep2, titleEn: e.target.value } })}
                                        className="bg-neutral-950 border-neutral-800 rounded-xl h-11 text-sm font-bold text-white"
                                        placeholder="Space & Layout"
                                    />
                                    <Input
                                        value={data.designStep2?.titleBn || ''}
                                        onChange={(e) => updateWizard({ ...data, designStep2: { ...data.designStep2, titleBn: e.target.value } })}
                                        className="bg-neutral-950 border-neutral-800 rounded-xl h-11 text-sm font-bold text-white"
                                        placeholder="জায়গা এবং লেআউট"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-blue-400">Step Description (EN / BN)</Label>
                                    <Input
                                        value={data.designStep2?.descEn || ''}
                                        onChange={(e) => updateWizard({ ...data, designStep2: { ...data.designStep2, descEn: e.target.value } })}
                                        className="bg-neutral-950 border-neutral-800 rounded-xl h-11 text-sm text-white"
                                        placeholder="Tell us about the land dimensions and floor requirements."
                                    />
                                    <Input
                                        value={data.designStep2?.descBn || ''}
                                        onChange={(e) => updateWizard({ ...data, designStep2: { ...data.designStep2, descBn: e.target.value } })}
                                        className="bg-neutral-950 border-neutral-800 rounded-xl h-11 text-sm text-white"
                                        placeholder="জমির পরিমাপ এবং ফ্লোরের প্রয়োজনীয়তা..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 border-b border-neutral-800 pb-2 flex justify-between items-center">
                                    Land Area Unit Options (editable from admin)
                                    <Button
                                        onClick={() => {
                                            const units = [...(data.designStep2?.landUnits || []), { id: 'u' + Date.now(), labelEn: '', labelBn: '' }];
                                            updateWizard({ ...data, designStep2: { ...data.designStep2, landUnits: units } });
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-[9px] font-bold uppercase tracking-widest border-neutral-700"
                                    >
                                        <Plus className="w-3 h-3 mr-1" /> Add Unit
                                    </Button>
                                </Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {(data.designStep2?.landUnits || [{ id: 'katha', labelEn: 'Katha', labelBn: 'কাঠা' }, { id: 'sqft', labelEn: 'sqft', labelBn: 'বর্গফুট' }, { id: 'sqmeter', labelEn: 'sqmeter', labelBn: 'বর্গমিটার' }]).map((unit: any, idx: number) => (
                                        <div key={unit.id || idx} className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl flex gap-3">
                                            <div className="flex-1 space-y-2">
                                                <Input value={unit.labelEn || ''} onChange={(e) => { const n = [...(data.designStep2?.landUnits || [])]; n[idx].labelEn = e.target.value; updateWizard({ ...data, designStep2: { ...data.designStep2, landUnits: n } }); }} className="h-8 text-xs bg-neutral-900 text-white" placeholder="Unit EN (e.g. Katha)" />
                                                <Input value={unit.labelBn || ''} onChange={(e) => { const n = [...(data.designStep2?.landUnits || [])]; n[idx].labelBn = e.target.value; updateWizard({ ...data, designStep2: { ...data.designStep2, landUnits: n } }); }} className="h-8 text-xs bg-neutral-900 border-blue-900/30 text-white" placeholder="Unit BN (e.g. কাঠা)" />
                                            </div>
                                            <Button size="icon" variant="ghost" onClick={() => { const n = (data.designStep2?.landUnits || []).filter((_: any, i: number) => i !== idx); updateWizard({ ...data, designStep2: { ...data.designStep2, landUnits: n } }); }} className="text-red-500 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-neutral-500">Land Area Question Label (EN / BN)</Label>
                                        <Input value={data.designStep2?.landAreaQEn || ''} onChange={(e) => updateWizard({ ...data, designStep2: { ...data.designStep2, landAreaQEn: e.target.value } })} className="bg-neutral-950 border-neutral-800 h-10 text-xs text-white" placeholder="What is the total land area?" />
                                        <Input value={data.designStep2?.landAreaQBn || ''} onChange={(e) => updateWizard({ ...data, designStep2: { ...data.designStep2, landAreaQBn: e.target.value } })} className="bg-neutral-950 border-neutral-800 h-10 text-xs text-white" placeholder="মোট জমির পরিমাণ কত?" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-neutral-500">Floors Question Label (EN / BN)</Label>
                                        <Input value={data.designStep2?.floorsQEn || ''} onChange={(e) => updateWizard({ ...data, designStep2: { ...data.designStep2, floorsQEn: e.target.value } })} className="bg-neutral-950 border-neutral-800 h-10 text-xs text-white" placeholder="How many floors?" />
                                        <Input value={data.designStep2?.floorsQBn || ''} onChange={(e) => updateWizard({ ...data, designStep2: { ...data.designStep2, floorsQBn: e.target.value } })} className="bg-neutral-950 border-neutral-800 h-10 text-xs text-white" placeholder="কতটি ফ্লোর?" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-neutral-500">Layouts Question Label (EN / BN)</Label>
                                        <Input value={data.designStep2?.layoutsQEn || ''} onChange={(e) => updateWizard({ ...data, designStep2: { ...data.designStep2, layoutsQEn: e.target.value } })} className="bg-neutral-950 border-neutral-800 h-10 text-xs text-white" placeholder="How many different layouts?" />
                                        <Input value={data.designStep2?.layoutsQBn || ''} onChange={(e) => updateWizard({ ...data, designStep2: { ...data.designStep2, layoutsQBn: e.target.value } })} className="bg-neutral-950 border-neutral-800 h-10 text-xs text-white" placeholder="কতটি ভিন্ন লেআউট?" />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* STEP 3: LAYOUT CONFIGURATION */}
                        <Card className="bg-neutral-900 border-neutral-800 p-8 rounded-[32px] shadow-2xl">
                            <div className="mb-8">
                                <h3 className="text-lg font-black text-white uppercase tracking-widest italic flex items-center gap-3">
                                    <Layers className="w-5 h-5 text-purple-400" />
                                    Step 3: Layout Configuration
                                </h3>
                                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1 ml-8">Garage, unit counts, and unit detail field labels</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 bg-neutral-950/50 p-6 rounded-2xl border border-neutral-800/50">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-purple-400">Is Garage? Label (EN / BN)</Label>
                                    <Input value={data.designStep3?.garageQEn || ''} onChange={(e) => updateWizard({ ...data, designStep3: { ...data.designStep3, garageQEn: e.target.value } })} className="bg-neutral-950 border-neutral-800 h-10 text-xs text-white" placeholder="Is this layout a Garage?" />
                                    <Input value={data.designStep3?.garageQBn || ''} onChange={(e) => updateWizard({ ...data, designStep3: { ...data.designStep3, garageQBn: e.target.value } })} className="bg-neutral-950 border-neutral-800 h-10 text-xs text-white" placeholder="এই লেআউটটি কি গ্যারেজ?" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-purple-400">No. of Units Label (EN / BN)</Label>
                                    <Input value={data.designStep3?.numUnitsQEn || ''} onChange={(e) => updateWizard({ ...data, designStep3: { ...data.designStep3, numUnitsQEn: e.target.value } })} className="bg-neutral-950 border-neutral-800 h-10 text-xs text-white" placeholder="Number of units in this layout" />
                                    <Input value={data.designStep3?.numUnitsQBn || ''} onChange={(e) => updateWizard({ ...data, designStep3: { ...data.designStep3, numUnitsQBn: e.target.value } })} className="bg-neutral-950 border-neutral-800 h-10 text-xs text-white" placeholder="এই লেআউটে কতটি ইউনিট?" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-purple-400">Identical Units? Label (EN / BN)</Label>
                                    <Input value={data.designStep3?.identicalQEn || ''} onChange={(e) => updateWizard({ ...data, designStep3: { ...data.designStep3, identicalQEn: e.target.value } })} className="bg-neutral-950 border-neutral-800 h-10 text-xs text-white" placeholder="Are the units identical?" />
                                    <Input value={data.designStep3?.identicalQBn || ''} onChange={(e) => updateWizard({ ...data, designStep3: { ...data.designStep3, identicalQBn: e.target.value } })} className="bg-neutral-950 border-neutral-800 h-10 text-xs text-white" placeholder="ইউনিটগুলো কি একই রকম?" />
                                </div>
                            </div>

                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 border-b border-neutral-800 pb-2 flex justify-between items-center mb-4">
                                Unit Detail Field Labels
                                <Button
                                    onClick={() => {
                                        const fields = [...(data.designStep3?.unitFields || []), { id: 'f' + Date.now(), labelEn: '', labelBn: '' }];
                                        updateWizard({ ...data, designStep3: { ...data.designStep3, unitFields: fields } });
                                    }}
                                    size="sm" variant="outline" className="h-7 text-[9px] font-bold uppercase tracking-widest border-neutral-700"
                                >
                                    <Plus className="w-3 h-3 mr-1" /> Add Field
                                </Button>
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {(data.designStep3?.unitFields || [
                                    { id: 'bed', labelEn: 'No of Bedroom', labelBn: 'বেডরুম সংখ্যা' },
                                    { id: 'drawing', labelEn: 'No of Drawing room', labelBn: 'ড্রয়িং রুম সংখ্যা' },
                                    { id: 'bath', labelEn: 'No of Bathroom', labelBn: 'বাথরুম সংখ্যা' },
                                    { id: 'balcony', labelEn: 'No of Balcony', labelBn: 'ব্যালকনি সংখ্যা' },
                                    { id: 'kitchen', labelEn: 'No of Kitchen', labelBn: 'রান্নাঘর সংখ্যা' },
                                    { id: 'dining', labelEn: 'No of Dining room', labelBn: 'ডাইনিং রুম সংখ্যা' },
                                    { id: 'other', labelEn: 'Additional space / requirement', labelBn: 'অতিরিক্ত জায়গা / প্রয়োজনীয়তা' },
                                ]).map((field: any, idx: number) => (
                                    <div key={field.id || idx} className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl flex gap-3">
                                        <div className="flex-1 space-y-2">
                                            <Input value={field.labelEn || ''} onChange={(e) => { const n = [...(data.designStep3?.unitFields || [])]; n[idx].labelEn = e.target.value; updateWizard({ ...data, designStep3: { ...data.designStep3, unitFields: n } }); }} className="h-8 text-xs bg-neutral-900 text-white" placeholder="Field Label EN" />
                                            <Input value={field.labelBn || ''} onChange={(e) => { const n = [...(data.designStep3?.unitFields || [])]; n[idx].labelBn = e.target.value; updateWizard({ ...data, designStep3: { ...data.designStep3, unitFields: n } }); }} className="h-8 text-xs bg-neutral-900 border-blue-900/30 text-white" placeholder="Field Label BN" />
                                        </div>
                                        <Button size="icon" variant="ghost" onClick={() => { const n = (data.designStep3?.unitFields || []).filter((_: any, i: number) => i !== idx); updateWizard({ ...data, designStep3: { ...data.designStep3, unitFields: n } }); }} className="text-red-500 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* STEP 4: PLOT FEATURES */}
                        <Card className="bg-neutral-900 border-neutral-800 p-8 rounded-[32px] shadow-2xl">
                            <div className="mb-8">
                                <h3 className="text-lg font-black text-white uppercase tracking-widest italic flex items-center gap-3">
                                    <CheckSquare className="w-5 h-5 text-teal-400" />
                                    Step 4: Plot & Features
                                </h3>
                                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1 ml-8">Orientation options, soil test, and roof features</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 bg-neutral-950/50 p-6 rounded-2xl border border-neutral-800/50">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-teal-400">Orientation Question (EN / BN)</Label>
                                    <Input value={data.designStep4?.orientQEn || ''} onChange={(e) => updateWizard({ ...data, designStep4: { ...data.designStep4, orientQEn: e.target.value } })} className="bg-neutral-950 border-neutral-800 h-10 text-xs text-white" placeholder="What is the orientation of the plot?" />
                                    <Input value={data.designStep4?.orientQBn || ''} onChange={(e) => updateWizard({ ...data, designStep4: { ...data.designStep4, orientQBn: e.target.value } })} className="bg-neutral-950 border-neutral-800 h-10 text-xs text-white" placeholder="প্লটের দিক কোনটি?" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-teal-400">Soil Test Question (EN / BN)</Label>
                                    <Input value={data.designStep4?.soilQEn || ''} onChange={(e) => updateWizard({ ...data, designStep4: { ...data.designStep4, soilQEn: e.target.value } })} className="bg-neutral-950 border-neutral-800 h-10 text-xs text-white" placeholder="Has a Soil Test been conducted?" />
                                    <Input value={data.designStep4?.soilQBn || ''} onChange={(e) => updateWizard({ ...data, designStep4: { ...data.designStep4, soilQBn: e.target.value } })} className="bg-neutral-950 border-neutral-800 h-10 text-xs text-white" placeholder="মাটি পরীক্ষা করা হয়েছে কি?" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-teal-400">Roof Features Question (EN / BN)</Label>
                                    <Input value={data.designStep4?.roofQEn || ''} onChange={(e) => updateWizard({ ...data, designStep4: { ...data.designStep4, roofQEn: e.target.value } })} className="bg-neutral-950 border-neutral-800 h-10 text-xs text-white" placeholder="Any roof garden or swimming pool?" />
                                    <Input value={data.designStep4?.roofQBn || ''} onChange={(e) => updateWizard({ ...data, designStep4: { ...data.designStep4, roofQBn: e.target.value } })} className="bg-neutral-950 border-neutral-800 h-10 text-xs text-white" placeholder="ছাদের উপরে কি কোনো বাগান বা পুল?" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 border-b border-neutral-800 pb-2 flex justify-between items-center">
                                    Roof Feature Options
                                    <Button onClick={() => { const opts = [...(data.designStep4?.roofOptions || []), { id: 'r' + Date.now(), labelEn: '', labelBn: '' }]; updateWizard({ ...data, designStep4: { ...data.designStep4, roofOptions: opts } }); }} size="sm" variant="outline" className="h-7 text-[9px] font-bold uppercase tracking-widest border-neutral-700"><Plus className="w-3 h-3 mr-1" /> Add Option</Button>
                                </Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(data.designStep4?.roofOptions || [{ id: 'garden', labelEn: 'Roof garden', labelBn: 'ছাদ বাগান' }, { id: 'pool', labelEn: 'Swimming pool', labelBn: 'সুইমিং পুল' }]).map((opt: any, idx: number) => (
                                        <div key={opt.id || idx} className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl flex gap-3">
                                            <div className="flex-1 space-y-2">
                                                <Input value={opt.labelEn || ''} onChange={(e) => { const n = [...(data.designStep4?.roofOptions || [])]; n[idx].labelEn = e.target.value; updateWizard({ ...data, designStep4: { ...data.designStep4, roofOptions: n } }); }} className="h-8 text-xs bg-neutral-900 text-white" placeholder="Label EN" />
                                                <Input value={opt.labelBn || ''} onChange={(e) => { const n = [...(data.designStep4?.roofOptions || [])]; n[idx].labelBn = e.target.value; updateWizard({ ...data, designStep4: { ...data.designStep4, roofOptions: n } }); }} className="h-8 text-xs bg-neutral-900 border-blue-900/30 text-white" placeholder="Label BN" />
                                            </div>
                                            <Button size="icon" variant="ghost" onClick={() => { const n = (data.designStep4?.roofOptions || []).filter((_: any, i: number) => i !== idx); updateWizard({ ...data, designStep4: { ...data.designStep4, roofOptions: n } }); }} className="text-red-500 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* STEP 5: DESIGN AESTHETICS */}
                        <Card className="bg-neutral-900 border-neutral-800 p-8 rounded-[32px] shadow-2xl">
                            <div className="mb-8">
                                <h3 className="text-lg font-black text-white uppercase tracking-widest italic flex items-center gap-3">
                                    <PaintBucket className="w-5 h-5 text-pink-400" />
                                    Step 5: Design Aesthetics (Vibe Options)
                                </h3>
                                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1 ml-8">Vibe cards shown to user for visual preference selection</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-neutral-950/50 p-6 rounded-2xl border border-neutral-800/50">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-pink-400">Section Title (EN / BN)</Label>
                                    <Input value={data.designStep5?.titleEn || ''} onChange={(e) => updateWizard({ ...data, designStep5: { ...data.designStep5, titleEn: e.target.value } })} className="bg-neutral-950 border-neutral-800 h-10 text-xs text-white" placeholder="Design Aesthetics" />
                                    <Input value={data.designStep5?.titleBn || ''} onChange={(e) => updateWizard({ ...data, designStep5: { ...data.designStep5, titleBn: e.target.value } })} className="bg-neutral-950 border-neutral-800 h-10 text-xs text-white" placeholder="ডিজাইনের নান্দনিকতা" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-pink-400">Description (EN / BN)</Label>
                                    <Input value={data.designStep5?.descEn || ''} onChange={(e) => updateWizard({ ...data, designStep5: { ...data.designStep5, descEn: e.target.value } })} className="bg-neutral-950 border-neutral-800 h-10 text-xs text-white" placeholder="Choose the visual vibe for your building design." />
                                    <Input value={data.designStep5?.descBn || ''} onChange={(e) => updateWizard({ ...data, designStep5: { ...data.designStep5, descBn: e.target.value } })} className="bg-neutral-950 border-neutral-800 h-10 text-xs text-white" placeholder="আপনার বিল্ডিং ডিজাইনের জন্য ভাইব বেছে নিন।" />
                                </div>
                            </div>

                            <Label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 border-b border-neutral-800 pb-2 flex justify-between items-center mb-4">
                                Vibe Options
                                <Button onClick={() => { const opts = [...(data.designStep5?.vibeOptions || []), { id: 'v' + Date.now(), labelEn: '', labelBn: '', image: '' }]; updateWizard({ ...data, designStep5: { ...data.designStep5, vibeOptions: opts } }); }} size="sm" variant="outline" className="h-7 text-[9px] font-bold uppercase tracking-widest border-neutral-700"><Plus className="w-3 h-3 mr-1" /> Add Vibe</Button>
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(data.designStep5?.vibeOptions || [
                                    { id: 'Modern', labelEn: 'Modern / Minimalist', labelBn: 'মডার্ন / মিনিমালিস্ট', image: '' },
                                    { id: 'Traditional', labelEn: 'Traditional / Brick', labelBn: 'ঐতিহ্যবাহী / ব্রিক', image: '' },
                                    { id: 'Luxury', labelEn: 'Duplex Luxury', labelBn: 'ডুপ্লেক্স লাক্সারি', image: '' },
                                    { id: 'Eco', labelEn: 'Green / Eco-Friendly', labelBn: 'সবুজ / পরিবেশ-বান্ধব', image: '' },
                                ]).map((vibe: any, idx: number) => (
                                    <div key={vibe.id || idx} className="bg-neutral-950 border border-neutral-800 p-5 rounded-2xl flex gap-4">
                                        <div className="flex-1 space-y-2">
                                            <Input value={vibe.labelEn || ''} onChange={(e) => { const n = [...(data.designStep5?.vibeOptions || [])]; n[idx].labelEn = e.target.value; updateWizard({ ...data, designStep5: { ...data.designStep5, vibeOptions: n } }); }} className="h-8 text-xs bg-neutral-900 text-white" placeholder="Label EN (e.g. Modern / Minimalist)" />
                                            <Input value={vibe.labelBn || ''} onChange={(e) => { const n = [...(data.designStep5?.vibeOptions || [])]; n[idx].labelBn = e.target.value; updateWizard({ ...data, designStep5: { ...data.designStep5, vibeOptions: n } }); }} className="h-8 text-xs bg-neutral-900 border-blue-900/30 text-white" placeholder="Label BN (e.g. মডার্ন)" />
                                            <Input value={vibe.image || ''} onChange={(e) => { const n = [...(data.designStep5?.vibeOptions || [])]; n[idx].image = e.target.value; updateWizard({ ...data, designStep5: { ...data.designStep5, vibeOptions: n } }); }} className="h-8 text-[10px] bg-neutral-900 text-blue-400" placeholder="Image URL (https://...)" />
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-14 h-14 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900">
                                                {vibe.image ? <img src={vibe.image} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-5 h-5 text-neutral-700" /></div>}
                                            </div>
                                            <Button size="icon" variant="ghost" onClick={() => { const n = (data.designStep5?.vibeOptions || []).filter((_: any, i: number) => i !== idx); updateWizard({ ...data, designStep5: { ...data.designStep5, vibeOptions: n } }); }} className="text-red-500 hover:bg-red-500/10 h-8 w-8"><Trash2 className="w-3 h-3" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* STEP 6: DESIGNER ROUTE SELECTION */}
                        <Card className="bg-neutral-900 border-neutral-800 p-8 rounded-[32px] shadow-2xl overflow-hidden relative group">
                            <div className="mb-8">
                                <h3 className="text-lg font-black text-white uppercase tracking-widest italic flex items-center gap-3">
                                    <Settings className="w-5 h-5 text-emerald-500" />
                                    Step 6: Designer Route Selection
                                </h3>
                                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1 ml-8">Dalankotha vs Profile Route options</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {data.step4?.options?.map((opt: any, idx: number) => (
                                    <div key={idx} className="bg-neutral-950 border border-neutral-800 p-6 rounded-3xl">
                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[9px] font-bold text-neutral-600 uppercase">Label EN</Label>
                                                <Input value={opt.labelEn || ''} onChange={(e) => { const n = [...data.step4.options]; n[idx].labelEn = e.target.value; updateStep4({ ...data.step4, options: n }); }} className="bg-neutral-900 border-neutral-800 h-10 text-xs text-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[9px] font-bold text-neutral-600 uppercase">Label BN</Label>
                                                <Input value={opt.label || ''} onChange={(e) => { const n = [...data.step4.options]; n[idx].label = e.target.value; updateStep4({ ...data.step4, options: n }); }} className="bg-neutral-900 border-neutral-800 h-10 text-xs text-white" />
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <Label className="text-[9px] font-bold text-neutral-600 uppercase">Description EN</Label>
                                                <Input value={opt.descriptionEn || ''} onChange={(e) => { const n = [...data.step4.options]; n[idx].descriptionEn = e.target.value; updateStep4({ ...data.step4, options: n }); }} className="bg-neutral-900 border-neutral-800 h-10 text-xs text-white" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </>
                )}
            </div>
        );
    };



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

            {/* TOP LEVEL NAVIGATION */}
            <div className="flex gap-4 p-2 bg-neutral-950 border border-neutral-800 rounded-3xl w-fit">
                {['home', 'design-landing', 'workflows'].map((area) => (
                    <button
                        key={area}
                        onClick={() => {
                            setMainArea(area);
                            if (area === 'home') setActiveTab('layout');
                            if (area === 'design-landing') setActiveTab('layout'); // Changed to 'layout'
                            if (area === 'workflows') setActiveTab('workflow-structural');
                        }}
                        className={`px-6 h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${mainArea === area ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-neutral-500 hover:text-white'}`}
                    >
                        {area.replace('-', ' ')}
                    </button>
                ))}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                {mainArea === 'home' && (
                    <TabsList className="bg-neutral-950 p-1.5 rounded-3xl h-auto flex-wrap shadow-sm border border-neutral-800">
                        <TabsTrigger value="layout" className="flex-1 h-12 px-6 rounded-2xl font-bold text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest gap-2">
                            <GripVertical className="w-4 h-4" />
                            Layout Controller
                        </TabsTrigger>
                        <TabsTrigger value="hero" className="flex-1 h-12 px-6 rounded-2xl font-bold text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest gap-2">
                            <LayoutTemplate className="w-4 h-4" />
                            Hero Section
                        </TabsTrigger>
                        <TabsTrigger value="categories" className="flex-1 h-12 px-6 rounded-2xl font-bold text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest gap-2">
                            <Tag className="w-4 h-4" />
                            Categories
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
                        <TabsTrigger value="reviews" className="flex-1 h-12 px-6 rounded-2xl font-bold text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            User Reviews
                        </TabsTrigger>
                        <TabsTrigger value="custom" className="flex-1 h-12 px-6 rounded-2xl font-bold text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest gap-2">
                            <Plus className="w-4 h-4" />
                            Custom Segments
                        </TabsTrigger>
                    </TabsList>
                )}

                {mainArea === 'design-landing' && (
                    <TabsList className="grid w-full grid-cols-5 bg-neutral-950 p-1 rounded-2xl border border-neutral-800 mb-8 sticky top-0 z-50 shadow-2xl">
                        <TabsTrigger
                            value="layout"
                            onClick={() => setActiveTab('layout')}
                            className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] py-3 italic transition-all"
                        >
                            Layout
                        </TabsTrigger>
                        <TabsTrigger
                            value="hero"
                            onClick={() => setActiveTab('hero')}
                            className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] py-3 italic transition-all"
                        >
                            Hero
                        </TabsTrigger>
                        <TabsTrigger
                            value="workflows"
                            onClick={() => setActiveTab('workflows')}
                            className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] py-3 italic transition-all"
                        >
                            Workflows
                        </TabsTrigger>
                        <TabsTrigger
                            value="showcase"
                            onClick={() => setActiveTab('showcase')}
                            className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] py-3 italic transition-all"
                        >
                            Showcase
                        </TabsTrigger>
                        <TabsTrigger
                            value="reviews"
                            onClick={() => setActiveTab('reviews')}
                            className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] py-3 italic transition-all"
                        >
                            Reviews
                        </TabsTrigger>
                    </TabsList>
                )}

                {mainArea === 'workflows' && (
                    <TabsList className="bg-neutral-950 p-1.5 rounded-3xl h-auto flex-wrap shadow-sm border border-neutral-800">
                        <TabsTrigger value="workflow-structural" className="flex-1 h-12 px-6 rounded-2xl font-bold text-neutral-500 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest gap-2">
                            <Building2 className="w-4 h-4" />
                            Structural & Architectural
                        </TabsTrigger>
                        <TabsTrigger value="workflow-interior" className="flex-1 h-12 px-6 rounded-2xl font-bold text-neutral-500 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest gap-2">
                            <Layers className="w-4 h-4" />
                            Interior Design
                        </TabsTrigger>
                    </TabsList>
                )}

                {mainArea === 'home' && (
                    <>
                        <TabsContent value="layout" className="space-y-6">
                            {renderLayoutController()}
                        </TabsContent>
                        <TabsContent value="hero" className="space-y-6">
                            {renderHeroEditor()}
                        </TabsContent>
                        <TabsContent value="categories" className="space-y-6">
                            {renderCategoriesEditor()}
                        </TabsContent>
                        <TabsContent value="products" className="space-y-6">
                            {renderProductsEditor()}
                        </TabsContent>
                        <TabsContent value="promos" className="space-y-6">
                            {renderPromosEditor()}
                        </TabsContent>
                        <TabsContent value="services" className="space-y-6">
                            {renderServicesEditor()}
                        </TabsContent>
                        <TabsContent value="reviews" className="space-y-6">
                            {renderReviewsEditor()}
                        </TabsContent>
                        <TabsContent value="custom" className="space-y-6">
                            {renderCustomSegmentsEditor()}
                        </TabsContent>
                    </>
                )}

                {mainArea === 'design-landing' && (
                    <>
                        <TabsContent value="layout" className="mt-0">
                            {renderDesignLayoutController()}
                        </TabsContent>
                        <TabsContent value="hero" className="mt-0">
                            {renderDesignLandingEditor()}
                        </TabsContent>
                        <TabsContent value="workflows" className="mt-0">
                            {renderWorkflowEditor('design_workflow', 'HOW IT WORKS SLIDER')}
                        </TabsContent>
                        <TabsContent value="showcase" className="mt-0">
                            {renderDesignShowcaseEditor()}
                        </TabsContent>
                        <TabsContent value="reviews" className="mt-0">
                            {renderReviewsEditor()}
                        </TabsContent>
                    </>
                )}

                {mainArea === 'workflows' && (
                    <>
                        <TabsContent value="workflow-structural" className="space-y-6">
                            {renderStructuralWizardEditor()}
                        </TabsContent>
                        <TabsContent value="workflow-interior" className="space-y-6">
                            {renderWorkflowEditor('design_workflow_interior', 'Interior Design Workflow')}
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div >
    )
}

