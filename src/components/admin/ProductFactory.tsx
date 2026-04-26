'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Package,
    Upload,
    AlertCircle,
    CheckCircle2,
    Loader2,
    Image as ImageIcon,
    Info,
    ChevronRight
} from 'lucide-react'
import { getCategories, createProduct } from '@/services/productService'
import { createClient } from '@/utils/supabase/client'
import { cn } from '@/lib/utils'

export function ProductFactory() {
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<any[]>([])
    const [sellers, setSellers] = useState<any[]>([])
    const [success, setSuccess] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadInitialData() {
            try {
                console.log('ProductFactory: Loading data...')
                const cats = await getCategories()
                setCategories(cats)

                const supabase = createClient()
                const { data: slrs, error: sellerError } = await supabase.from('sellers').select('id, business_name')

                if (sellerError) {
                    console.error('ProductFactory: Seller fetch error:', sellerError)
                    throw sellerError
                }

                setSellers(slrs || [])
            } catch (err) {
                console.error('ProductFactory: loadInitialData failed:', err)
                setError('Failed to load initial data. Check console.')
            }
        }
        loadInitialData()
    }, [])

    async function handleSingleUpload(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setSuccess(null)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const productData: any = {
            title: formData.get('title') as string,
            sku: formData.get('sku') as string,
            base_price: parseFloat(formData.get('price') as string),
            stock_quantity: parseInt(formData.get('stock') as string),
            category_id: formData.get('categoryId') as string,
            seller_id: formData.get('sellerId') as string,
            description: formData.get('description') as string,
            images: [formData.get('imageUrl') as string],
            status: 'active'
        }

        try {
            await createProduct(productData)
            setSuccess('Product uploaded successfully!')
            const form = e.target as HTMLFormElement
            form.reset()
        } catch (err: any) {
            setError(err.message || 'Failed to upload product.')
        } finally {
            setLoading(false)
        }
    }

    async function handleBulkUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        setSuccess(null)
        setError(null)

        const reader = new FileReader()
        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string
                const json = JSON.parse(text) // Assuming JSON for bulk to avoid CSV parsing complexity now

                if (!Array.isArray(json)) throw new Error('Invalid format. Please upload a JSON array.')

                // Sequential upload for simplicity
                for (const prod of json) {
                    await createProduct(prod)
                }

                setSuccess(`${json.length} products uploaded in bulk!`)
            } catch (err: any) {
                setError(err.message || 'Failed to process bulk upload. Ensure it is valid JSON.')
            } finally {
                setLoading(false)
            }
        }
        reader.readAsText(file)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-800 pb-8">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                        <Package className="w-3 h-3" />
                        Inventory Control
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                        Product <span className="text-blue-500">Factory</span>
                    </h1>
                    <p className="text-neutral-500 font-medium">Manage marketplace stock and retailer offerings.</p>
                </div>

                <div className="flex items-center gap-4">
                    <label className="cursor-pointer">
                        <Input type="file" className="hidden" accept=".json" onChange={handleBulkUpload} />
                        <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 text-white px-6 h-12 rounded-xl font-black uppercase tracking-widest text-xs shadow-sm hover:bg-neutral-800 transition-all active:scale-95">
                            <Upload className="w-4 h-4 text-blue-500" />
                            Bulk JSON Upload
                        </div>
                    </label>
                </div>
            </div>

            {(success || error) && (
                <div className={cn(
                    "p-6 rounded-2xl flex items-start gap-4 font-bold border animate-in zoom-in duration-300",
                    success ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                )}>
                    {success ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                    <span className="text-sm">{success || error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Form Section */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="border-neutral-800 rounded-3xl overflow-hidden shadow-2xl bg-neutral-900/50">
                        <div className="p-8 border-b border-neutral-800 bg-neutral-900">
                            <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-3">
                                <Package className="w-5 h-5 text-blue-500" /> Single Product Entry
                            </h3>
                            <p className="text-sm text-neutral-500 font-medium mt-1">Manually onboard a new SKU directly to the marketplace catalog.</p>
                        </div>
                        <div className="p-8">
                            <form onSubmit={handleSingleUpload} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Product Title</label>
                                        <Input required name="title" className="h-12 rounded-xl border border-neutral-800 bg-neutral-950 text-white focus:ring-1 focus:ring-blue-500 placeholder:text-neutral-600 font-medium" placeholder="e.g. 50kg Seven Rings Cement" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Unique SKU</label>
                                        <Input required name="sku" className="h-12 rounded-xl border border-neutral-800 bg-neutral-950 text-white uppercase focus:ring-1 focus:ring-blue-500 placeholder:text-neutral-600 font-medium" placeholder="SRC-50-WH" />
                                    </div>
                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Target Retailer</label>
                                        <div className="relative">
                                            <select required name="sellerId" className="w-full h-12 px-4 pr-10 rounded-xl border border-neutral-800 bg-neutral-950 text-white font-bold text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none">
                                                <option value="">Select Seller / Retailer...</option>
                                                {sellers.map(s => <option key={s.id} value={s.id}>{s.business_name}</option>)}
                                            </select>
                                            <ChevronRight className="absolute right-4 top-[14px] w-4 h-4 text-neutral-500 pointer-events-none rotate-90" />
                                        </div>
                                    </div>
                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Listing Category</label>
                                        <div className="relative">
                                            <select required name="categoryId" className="w-full h-12 px-4 pr-10 rounded-xl border border-neutral-800 bg-neutral-950 text-white font-bold text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none">
                                                <option value="">Select Category...</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                            <ChevronRight className="absolute right-4 top-[14px] w-4 h-4 text-neutral-500 pointer-events-none rotate-90" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Base Price (BDT)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-[14px] text-xs font-black text-neutral-500">৳</span>
                                            <Input required name="price" type="number" step="0.01" className="h-12 pl-8 rounded-xl border border-neutral-800 bg-neutral-950 text-white font-black tracking-widest focus:ring-1 focus:ring-blue-500" placeholder="0.00" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Initial Stock</label>
                                        <Input required name="stock" type="number" className="h-12 rounded-xl border border-neutral-800 bg-neutral-950 text-white font-black tracking-widest focus:ring-1 focus:ring-blue-500" placeholder="100" />
                                    </div>

                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Cover Image URL</label>
                                        <div className="relative">
                                            <ImageIcon className="absolute left-4 top-[14px] w-4 h-4 text-neutral-500" />
                                            <Input required name="imageUrl" className="h-12 pl-11 rounded-xl border border-neutral-800 bg-neutral-950 text-white focus:ring-1 focus:ring-blue-500 placeholder:text-neutral-600 font-medium" placeholder="https://source.unsplash.com/..." />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-neutral-800 flex justify-end">
                                    <Button
                                        disabled={loading}
                                        className="h-12 px-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Deploy Product'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>

                {/* Guide Section */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border border-neutral-800 rounded-3xl p-8 bg-neutral-900 text-white space-y-6 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 border-b border-neutral-800 pb-4 mb-4">
                            <AlertCircle className="w-5 h-5 text-blue-400" />
                            <h4 className="text-sm font-black italic tracking-widest uppercase">
                                Bulk Config
                            </h4>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Upload Format</p>
                                <p className="text-xs font-medium text-white">Valid JSON Array Document.</p>
                            </div>
                            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Required Schema</p>
                                <p className="text-xs font-mono text-blue-400 bg-blue-500/10 p-2 rounded-lg break-all">title, sku, seller_id, category_id, base_price, stock_quantity</p>
                            </div>
                            <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Media</p>
                                <p className="text-xs font-medium text-white">images field must be an array of string URLs.</p>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full h-10 border-neutral-800 bg-neutral-950 text-neutral-400 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-neutral-800 hover:border-neutral-700 hover:text-white transition-all mt-4">
                            JSON Target Schema
                        </Button>
                    </Card>

                    <Card className="border border-neutral-800 rounded-3xl p-6 bg-neutral-950 flex gap-4 shadow-sm items-start">
                        <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center flex-shrink-0">
                            <Info className="w-4 h-4 text-neutral-500" />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">Admin Privilege</h4>
                            <p className="text-[10px] text-neutral-500 font-medium leading-relaxed">
                                Uploading items as an administrator bypasses typical retailer approval workflows entirely. Use this specific portal for manual high-priority onboarding only.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}

