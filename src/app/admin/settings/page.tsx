'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
    Settings as SettingsIcon,
    Shield,
    Plus,
    Save,
    Percent,
    CreditCard,
    CircleDollarSign,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Package,
    Wrench,
    Palette
} from 'lucide-react'
import { getPlatformConfigs, updatePlatformConfig } from '@/services/orderService'

export default function PlatformSettingsPage() {
    const [configs, setConfigs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadConfigs()
    }, [])

    async function loadConfigs() {
        try {
            const data = await getPlatformConfigs()
            setConfigs(data || [])
        } catch (err) {
            console.error('Failed to load configs', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleUpdate(id: string, updates: any) {
        setSaving(true)
        setSuccess(null)
        setError(null)
        try {
            await updatePlatformConfig(id, updates)
            setSuccess('Rate successfully synchronized!')
            loadConfigs()
        } catch (err: any) {
            setError(err.message || 'Failed to update configuration.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-neutral-300 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary-200" />
                <p className="font-black uppercase tracking-widest text-xs tracking-[0.2em]">Syncing Master Data...</p>
            </div>
        )
    }

    const globalConfig = configs.find(c => c.category_id === null)
    const productConfigs = configs.filter(c => c.category?.type === 'product')
    const serviceConfigs = configs.filter(c => c.category?.type === 'service')
    const designConfigs = configs.filter(c => c.category?.type === 'design')

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest">
                        <SettingsIcon className="w-3 h-3" />
                        System Governance
                    </div>
                    <h1 className="text-5xl font-black text-neutral-900 tracking-tighter uppercase italic">
                        Control <span className="text-primary-600">Center</span>
                    </h1>
                    <p className="text-neutral-500 font-medium">Manage platform rates, tax thresholds, and category overrides.</p>
                </div>
            </div>

            {(success || error) && (
                <div className={cn(
                    "p-6 rounded-3xl flex items-center gap-4 font-bold border animate-in zoom-in duration-300",
                    success ? "bg-green-50 border-green-100 text-green-700" : "bg-rose-50 border-rose-100 text-rose-700"
                )}>
                    {success ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                    {success || error}
                </div>
            )}

            <Tabs defaultValue="global" className="space-y-10">
                <TabsList className="bg-neutral-100/50 p-1.5 rounded-[2rem] border border-neutral-100 flex flex-wrap h-auto gap-2">
                    <TabsTrigger value="global" className="px-8 py-3 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-neutral-900 data-[state=active]:text-white flex items-center gap-2">
                        <Shield className="w-3 h-3" /> Global Settings
                    </TabsTrigger>
                    <TabsTrigger value="products" className="px-8 py-3 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-neutral-900 data-[state=active]:text-white flex items-center gap-2">
                        <Package className="w-3 h-3" /> Product Rates
                    </TabsTrigger>
                    <TabsTrigger value="services" className="px-8 py-3 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-neutral-900 data-[state=active]:text-white flex items-center gap-2">
                        <Wrench className="w-3 h-3" /> Service Rates
                    </TabsTrigger>
                    <TabsTrigger value="design" className="px-8 py-3 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-neutral-900 data-[state=active]:text-white flex items-center gap-2">
                        <Palette className="w-3 h-3" /> Design Rates
                    </TabsTrigger>
                </TabsList>

                {/* Global Tab */}
                <TabsContent value="global" className="m-0 space-y-8">
                    {globalConfig && <RateCard title="Master Parameters" subtitle="Base rates for all platform activities" config={globalConfig} onSave={handleUpdate} saving={saving} />}
                </TabsContent>

                {/* Products Tab */}
                <TabsContent value="products" className="m-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {productConfigs.map(config => (
                            <RateCard key={config.id} title={config.category?.name} subtitle="Product Category Override" config={config} onSave={handleUpdate} saving={saving} compact />
                        ))}
                    </div>
                </TabsContent>

                {/* Services Tab */}
                <TabsContent value="services" className="m-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {serviceConfigs.map(config => (
                            <RateCard key={config.id} title={config.category?.name} subtitle="Service Category Override" config={config} onSave={handleUpdate} saving={saving} compact />
                        ))}
                    </div>
                </TabsContent>

                {/* Design Tab */}
                <TabsContent value="design" className="m-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {designConfigs.map(config => (
                            <RateCard key={config.id} title={config.category?.name} subtitle="Design Category Override" config={config} onSave={handleUpdate} saving={saving} compact />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function RateCard({ title, subtitle, config, onSave, saving, compact = false }: any) {
    return (
        <Card className={cn(
            "border-neutral-100 rounded-[3rem] shadow-2xl shadow-neutral-200/40 bg-white overflow-hidden relative",
            compact ? "p-8" : "p-12"
        )}>
            <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-4 border-b border-neutral-50 pb-6">
                    <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className={cn("font-black italic uppercase tracking-tighter", compact ? "text-lg" : "text-xl")}>{title}</h3>
                        <p className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">{subtitle}</p>
                    </div>
                </div>

                <form onSubmit={(e) => {
                    e.preventDefault()
                    const fd = new FormData(e.currentTarget)
                    onSave(config.id, {
                        vat_rate: parseFloat(fd.get('vat') as string),
                        platform_fee_rate: parseFloat(fd.get('fee') as string),
                        advance_payment_rate: parseFloat(fd.get('advance') as string),
                    })
                }} className="space-y-6">
                    <div className={cn("grid gap-6", compact ? "grid-cols-3" : "grid-cols-1 md:grid-cols-3")}>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">VAT (%)</label>
                            <Input name="vat" type="number" step="0.01" defaultValue={config.vat_rate} className="h-12 rounded-xl bg-neutral-50 font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Fee (%)</label>
                            <Input name="fee" type="number" step="0.01" defaultValue={config.platform_fee_rate} className="h-12 rounded-xl bg-neutral-50 font-bold" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Adv. (%)</label>
                            <Input name="advance" type="number" step="0.01" defaultValue={config.advance_payment_rate} className="h-12 rounded-xl bg-neutral-50 font-bold" />
                        </div>
                    </div>

                    <Button
                        disabled={saving}
                        className="w-full h-14 bg-neutral-900 hover:bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply Rates'}
                    </Button>
                </form>
            </div>
        </Card>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
