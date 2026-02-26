'use client'

import { useState, useEffect } from 'react'
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
    Trash2
} from 'lucide-react'
import { getHomeContent, updateHomeSection, getCMSDependencies } from './actions'

export default function CMSPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saveAlert, setSaveAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [content, setContent] = useState<any>({})
    const [dependencies, setDependencies] = useState<any>({ categories: [], designPackages: [], servicePackages: [] })
    const [activeTab, setActiveTab] = useState('categories')

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
                                icon: latest.icon || latest.icon_url || ''
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
        <div className="min-h-screen pb-20 space-y-8 animate-in fade-in">
            <header>
                <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight italic">CMS Manager</h1>
                <p className="text-neutral-500 font-medium">Control dynamic content on the home page.</p>
            </header>

            {/* Save Alert Banner */}
            {saveAlert && (
                <div className={`px-5 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 ${saveAlert.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    <span>{saveAlert.type === 'success' ? '✅' : '❌'}</span>
                    {saveAlert.message}
                </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="bg-white p-1 rounded-2xl h-auto flex-wrap shadow-sm border border-neutral-100">
                    <TabsTrigger value="categories" className="flex-1 h-12 px-6 rounded-xl font-bold text-neutral-500 data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest gap-2">
                        <Tag className="w-4 h-4" />
                        Categories
                    </TabsTrigger>
                    <TabsTrigger value="design" className="flex-1 h-12 px-6 rounded-xl font-bold text-neutral-500 data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest gap-2">
                        <Layers className="w-4 h-4" />
                        Design & Planning
                    </TabsTrigger>
                    <TabsTrigger value="products" className="flex-1 h-12 px-6 rounded-xl font-bold text-neutral-500 data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest gap-2">
                        <LayoutTemplate className="w-4 h-4" />
                        Product Sections
                    </TabsTrigger>
                    <TabsTrigger value="promos" className="flex-1 h-12 px-6 rounded-xl font-bold text-neutral-500 data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Promos
                    </TabsTrigger>
                    <TabsTrigger value="services" className="flex-1 h-12 px-6 rounded-xl font-bold text-neutral-500 data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest gap-2">
                        <Briefcase className="w-4 h-4" />
                        Services
                    </TabsTrigger>
                    <TabsTrigger value="hero" className="flex-1 h-12 px-6 rounded-xl font-bold text-neutral-500 data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all text-xs uppercase tracking-widest gap-2">
                        <LayoutTemplate className="w-4 h-4" />
                        Hero Section
                    </TabsTrigger>
                </TabsList>

                {/* 1. CATEGORIES TAB */}
                <TabsContent value="categories" className="space-y-6">
                    <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black uppercase text-neutral-900">Featured Categories</h2>
                            <Button
                                onClick={() => handleSave('featured_categories', content['featured_categories'])}
                                disabled={saving}
                                className="bg-black text-white rounded-xl font-bold uppercase text-xs"
                            >
                                {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Changes'}
                            </Button>
                        </div>
                        <div className="mb-8 max-w-md space-y-2">
                            <label className="text-xs font-bold uppercase text-neutral-500">Section Title</label>
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
                                className="font-bold border-neutral-200"
                            />
                        </div>

                        <div className="space-y-8">
                            {/* Products Group */}
                            <div>
                                <h3 className="text-sm font-black uppercase text-neutral-400 mb-4 border-b pb-2">Product Categories</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {dependencies.categories.filter((c: any) => c.type === 'product').map((cat: any) => {
                                        const formattedCat = { id: cat.id, name: cat.name, icon: cat.icon || cat.icon_url || '', type: cat.type }
                                        const isSelected = content['featured_categories']?.items?.some((c: any) => c.id === cat.id)
                                        return (
                                            <label key={cat.id} className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-neutral-100 hover:border-neutral-200'}`}>
                                                <div className="flex items-center gap-3">
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
                                <h3 className="text-sm font-black uppercase text-neutral-400 mb-4 border-b pb-2">Service Categories</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {dependencies.categories.filter((c: any) => c.type === 'service').map((cat: any) => {
                                        const formattedCat = { id: cat.id, name: cat.name, icon: cat.icon || cat.icon_url || '', type: cat.type }
                                        const isSelected = content['featured_categories']?.items?.some((c: any) => c.id === cat.id)
                                        return (
                                            <label key={cat.id} className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-neutral-100 hover:border-neutral-200'}`}>
                                                <div className="flex items-center gap-3">
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
                                <h3 className="text-sm font-black uppercase text-neutral-400 mb-4 border-b pb-2">Design Categories</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {dependencies.categories.filter((c: any) => c.type === 'design').map((cat: any) => {
                                        const formattedCat = { id: cat.id, name: cat.name, icon: cat.icon || cat.icon_url || '', type: cat.type }
                                        const isSelected = content['featured_categories']?.items?.some((c: any) => c.id === cat.id)
                                        return (
                                            <label key={cat.id} className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-neutral-100 hover:border-neutral-200'}`}>
                                                <div className="flex items-center gap-3">
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
                    <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black uppercase text-neutral-900">Product Showcases</h2>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        const currentSections = content['product_sections'] || []
                                        setContent({ ...content, product_sections: [...currentSections, { id: Date.now(), title: '', category_id: '', bg_style: 'bg-white' }] })
                                    }}
                                    variant="outline"
                                    className="rounded-xl font-bold uppercase text-xs"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Section
                                </Button>
                                <Button
                                    onClick={() => handleSave('product_sections', content['product_sections'])}
                                    disabled={saving}
                                    className="bg-black text-white rounded-xl font-bold uppercase text-xs"
                                >
                                    {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Changes'}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {(content['product_sections'] || []).map((section: any, index: number) => (
                                <div key={section.id} className="p-6 border-2 border-dashed border-neutral-200 rounded-2xl space-y-4 relative group hover:border-blue-200 transition-all">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-4 right-4 text-neutral-300 hover:text-red-500 hover:bg-red-50"
                                        onClick={async () => {
                                            const newSections = content['product_sections'].filter((s: any) => s.id !== section.id)
                                            setContent({ ...content, product_sections: newSections })
                                            await handleSave('product_sections', newSections)
                                        }}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>

                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                                            {index + 1}
                                        </div>
                                        <span className="font-black text-neutral-300 uppercase tracking-widest text-xs">Showcase Section</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-neutral-500">Section Title</label>
                                            <Input
                                                value={section.title}
                                                onChange={(e) => {
                                                    const newSections = content['product_sections'].map((s: any, i: number) =>
                                                        i === index ? { ...s, title: e.target.value } : s
                                                    )
                                                    setContent({ ...content, product_sections: newSections })
                                                }}
                                                className="font-bold"
                                                placeholder="e.g. Building Materials"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-neutral-500">Category Source</label>
                                            <select
                                                value={section.category_id}
                                                onChange={(e) => {
                                                    const newSections = content['product_sections'].map((s: any, i: number) =>
                                                        i === index ? { ...s, category_id: e.target.value } : s
                                                    )
                                                    setContent({ ...content, product_sections: newSections })
                                                }}
                                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-bold focus:outline-none focus:ring-2 focus:ring-ring"
                                            >
                                                <option value="">Select Category...</option>
                                                {dependencies.categories.map((c: any) => (
                                                    <option key={c.id} value={c.name}>{c.name}</option> // Storing Name for now to match component prop, or should use ID? Component uses name for filtering.
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-neutral-500">Background Style</label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        const newSections = content['product_sections'].map((s: any, i: number) =>
                                                            i === index ? { ...s, bg_style: 'bg-white' } : s
                                                        )
                                                        setContent({ ...content, product_sections: newSections })
                                                    }}
                                                    className={`flex-1 h-10 rounded-lg border-2 font-bold text-xs uppercase ${section.bg_style === 'bg-white' ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-100'}`}
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
                                                    className={`flex-1 h-10 rounded-lg border-2 font-bold text-xs uppercase ${section.bg_style === 'bg-neutral-50' ? 'border-neutral-900 bg-neutral-100' : 'border-neutral-100'}`}
                                                >
                                                    Grey
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {(!content['product_sections'] || content['product_sections'].length === 0) && (
                                <div className="text-center py-10 text-neutral-400 font-medium bg-neutral-50 rounded-2xl">
                                    No product showcases added. Click "Add Section" to begin.
                                </div>
                            )}
                        </div>
                    </Card>
                </TabsContent>

                {/* 4. PROMOS TAB */}
                <TabsContent value="promos" className="space-y-6">
                    <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black uppercase text-neutral-900">Promotional Banners</h2>
                            <Button
                                onClick={() => handleSave('promo_banners', content['promo_banners'])}
                                disabled={saving}
                                className="bg-black text-white rounded-xl font-bold uppercase text-xs"
                            >
                                {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Changes'}
                            </Button>
                        </div>

                        <div className="mb-8 max-w-md space-y-2">
                            <label className="text-xs font-bold uppercase text-neutral-500">Section Title</label>
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
                                className="font-bold border-neutral-200"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[0, 1, 2].map((i) => {
                                // Handle both array key and object structure for backward compatibility during dev
                                const currentData = content['promo_banners'] || {}
                                const banners = Array.isArray(currentData) ? currentData : (currentData.items || [])
                                const banner = banners[i] || { image_url: '', link_url: '' }

                                return (
                                    <div key={i} className="space-y-4 p-4 border rounded-2xl bg-neutral-50/50">
                                        <div className="aspect-[2/1] bg-[#3F4E75] rounded-xl overflow-hidden relative group flex items-center justify-center">
                                            {banner.image_url ? (
                                                <img src={banner.image_url} alt="Promo" className="h-[80%] w-auto object-contain" />
                                            ) : (
                                                <div className="text-white/50 font-bold uppercase text-[10px]">No Image</div>
                                            )}
                                            <div className="absolute inset-0 flex flex-col justify-center p-4">
                                                <p className="text-white font-black text-lg leading-tight line-clamp-2 w-2/3">{banner.title || 'Title Here'}</p>
                                                <p className="text-blue-200 text-xs font-medium w-2/3">{banner.subtitle || 'Subtitle'}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Title</label>
                                                <Input
                                                    value={banner.title || ''}
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
                                                    className="h-8 text-xs font-bold"
                                                    placeholder="Main Title"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Subtitle</label>
                                                <Input
                                                    value={banner.subtitle || ''}
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
                                                    className="h-8 text-xs"
                                                    placeholder="Subtitle"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Image URL</label>
                                            <Input
                                                value={banner.image_url || ''}
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
                                                className="h-8 text-xs"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Link URL</label>
                                            <Input
                                                value={banner.link_url || ''}
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
                                                className="h-8 text-xs"
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
                    <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black uppercase text-neutral-900">Design Section Config</h2>
                            <Button
                                onClick={() => handleSave('design_services', content['design_services'])}
                                disabled={saving}
                                className="bg-black text-white rounded-xl font-bold uppercase text-xs"
                            >
                                {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Changes'}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-neutral-500">Section Title</label>
                                <Input
                                    value={content['design_services']?.title || 'Design & Planning'}
                                    onChange={(e) => setContent({ ...content, design_services: { ...content['design_services'], title: e.target.value } })}
                                    className="font-bold border-neutral-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-neutral-500">Slider Display Count</label>
                                <Input
                                    type="number"
                                    value={content['design_services']?.slider_count || 4}
                                    onChange={(e) => setContent({ ...content, design_services: { ...content['design_services'], slider_count: parseInt(e.target.value) } })}
                                    className="font-bold border-neutral-200"
                                />
                            </div>
                        </div>

                        <h3 className="text-sm font-black uppercase text-neutral-400 mb-4">Select Packages to Display</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 h-96 overflow-y-auto pr-2">
                            {dependencies.designPackages.map((pkg: any) => {
                                const isSelected = content['design_services']?.items?.some((i: any) => i.id === pkg.id)
                                return (
                                    <label key={pkg.id} className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-neutral-100 hover:border-neutral-200'}`}>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-start justify-between">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={(checked) => {
                                                        const currentItems = content['design_services']?.items || []
                                                        let newItems
                                                        if (checked) {
                                                            newItems = [...currentItems, { id: pkg.id, title: pkg.title, image: pkg.images?.[0] }]
                                                        } else {
                                                            newItems = currentItems.filter((i: any) => i.id !== pkg.id)
                                                        }
                                                        setContent({
                                                            ...content,
                                                            design_services: { ...content['design_services'], items: newItems }
                                                        })
                                                    }}
                                                />
                                                {isSelected && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-xs line-clamp-2">{pkg.title}</p>
                                            </div>
                                        </div>
                                    </label>
                                )
                            })}
                        </div>
                    </Card>
                </TabsContent>

                {/* 5. SERVICES TAB */}
                <TabsContent value="services" className="space-y-6">
                    <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black uppercase text-neutral-900">Service Showcases</h2>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        const currentSections = content['service_sections'] || []
                                        setContent({ ...content, service_sections: [...currentSections, { id: Date.now(), title: '', category_id: '', bg_style: 'bg-blue-50' }] })
                                    }}
                                    variant="outline"
                                    className="rounded-xl font-bold uppercase text-xs"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add Section
                                </Button>
                                <Button
                                    onClick={() => handleSave('service_sections', content['service_sections'])}
                                    disabled={saving}
                                    className="bg-black text-white rounded-xl font-bold uppercase text-xs"
                                >
                                    {saving ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Changes'}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {(content['service_sections'] || []).map((section: any, index: number) => (
                                <div key={section.id} className="p-6 border-2 border-dashed border-neutral-200 rounded-2xl space-y-4 relative group hover:border-blue-200 transition-all">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-4 right-4 text-neutral-300 hover:text-red-500 hover:bg-red-50"
                                        onClick={async () => {
                                            const newSections = content['service_sections'].filter((s: any) => s.id !== section.id)
                                            setContent({ ...content, service_sections: newSections })
                                            await handleSave('service_sections', newSections)
                                        }}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>

                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                                            {index + 1}
                                        </div>
                                        <span className="font-black text-neutral-300 uppercase tracking-widest text-xs">Service Showcase</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-neutral-500">Section Title</label>
                                            <Input
                                                value={section.title}
                                                onChange={(e) => {
                                                    const newSections = content['service_sections'].map((s: any, i: number) =>
                                                        i === index ? { ...s, title: e.target.value } : s
                                                    )
                                                    setContent({ ...content, service_sections: newSections })
                                                }}
                                                className="font-bold"
                                                placeholder="e.g. Repair Services"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-neutral-500">Category Source</label>
                                            <select
                                                value={section.category_id}
                                                onChange={(e) => {
                                                    const newSections = content['service_sections'].map((s: any, i: number) =>
                                                        i === index ? { ...s, category_id: e.target.value } : s
                                                    )
                                                    setContent({ ...content, service_sections: newSections })
                                                }}
                                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-bold focus:outline-none focus:ring-2 focus:ring-ring"
                                            >
                                                <option value="">Select Category...</option>
                                                {dependencies.categories.filter((c: any) => c.type === 'service').map((c: any) => (
                                                    <option key={c.id} value={c.name}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-neutral-500">Background Style</label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        const newSections = content['service_sections'].map((s: any, i: number) =>
                                                            i === index ? { ...s, bg_style: 'bg-white' } : s
                                                        )
                                                        setContent({ ...content, service_sections: newSections })
                                                    }}
                                                    className={`flex-1 h-10 rounded-lg border-2 font-bold text-xs uppercase ${section.bg_style === 'bg-white' ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-100'}`}
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
                                                    className={`flex-1 h-10 rounded-lg border-2 font-bold text-xs uppercase ${section.bg_style === 'bg-blue-50' ? 'border-neutral-900 bg-blue-100' : 'border-neutral-100'}`}
                                                >
                                                    Blue
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {(!content['service_sections'] || content['service_sections'].length === 0) && (
                                <div className="text-center py-10 text-neutral-400 font-medium bg-neutral-50 rounded-2xl">
                                    No service showcases added. Click "Add Section" to begin.
                                </div>
                            )}
                        </div>
                    </Card>
                </TabsContent>
                {/* 6. HERO TAB */}
                <TabsContent value="hero" className="space-y-6">
                    <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black uppercase text-neutral-900">Hero Section Config</h2>
                            <Button
                                onClick={() => handleSave('hero_section', content['hero_section'])}
                                disabled={saving}
                                className="bg-black text-white rounded-xl font-bold uppercase text-xs"
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
                                    <div key={slot} className="p-6 border border-neutral-200 rounded-2xl bg-neutral-50/30">
                                        <h3 className="font-black text-sm uppercase text-neutral-500 mb-4 border-b pb-2">{slotName}</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Title</label>
                                                    <Input
                                                        value={item.title || ''}
                                                        onChange={(e) => {
                                                            const newItems = [...items.filter((i: any) => i.id !== slot), { ...item, title: e.target.value }];
                                                            setContent({ ...content, hero_section: { ...currentData, items: newItems } });
                                                        }}
                                                        className="font-bold text-sm"
                                                        placeholder="Title"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Subtitle</label>
                                                    <Input
                                                        value={item.subtitle || ''}
                                                        onChange={(e) => {
                                                            const newItems = [...items.filter((i: any) => i.id !== slot), { ...item, subtitle: e.target.value }];
                                                            setContent({ ...content, hero_section: { ...currentData, items: newItems } });
                                                        }}
                                                        className="text-xs"
                                                        placeholder="Subtitle"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Description</label>
                                                    <Input
                                                        value={item.desc || ''}
                                                        onChange={(e) => {
                                                            const newItems = [...items.filter((i: any) => i.id !== slot), { ...item, desc: e.target.value }];
                                                            setContent({ ...content, hero_section: { ...currentData, items: newItems } });
                                                        }}
                                                        className="text-xs"
                                                        placeholder="Short description"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Image URL</label>
                                                    <Input
                                                        value={item.image || ''}
                                                        onChange={(e) => {
                                                            const newItems = [...items.filter((i: any) => i.id !== slot), { ...item, image: e.target.value }];
                                                            setContent({ ...content, hero_section: { ...currentData, items: newItems } });
                                                        }}
                                                        className="text-xs"
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Link URL</label>
                                                    <Input
                                                        value={item.href || ''}
                                                        onChange={(e) => {
                                                            const newItems = [...items.filter((i: any) => i.id !== slot), { ...item, href: e.target.value }];
                                                            setContent({ ...content, hero_section: { ...currentData, items: newItems } });
                                                        }}
                                                        className="text-xs"
                                                        placeholder="/..."
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Overlay Color</label>
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
                                                            <span className="text-xs font-mono">{item.overlay_color}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Opacity (%)</label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={item.overlay_opacity || 50}
                                                            onChange={(e) => {
                                                                const newItems = [...items.filter((i: any) => i.id !== slot), { ...item, overlay_opacity: parseInt(e.target.value) }];
                                                                setContent({ ...content, hero_section: { ...currentData, items: newItems } });
                                                            }}
                                                            className="text-xs"
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


