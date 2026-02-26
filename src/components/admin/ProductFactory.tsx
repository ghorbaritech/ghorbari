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
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest">
                        <Package className="w-3 h-3" />
                        Inventory Control
                    </div>
                    <h1 className="text-5xl font-black text-neutral-900 tracking-tighter uppercase italic">
                        Product <span className="text-orange-600">Factory</span>
                    </h1>
                    <p className="text-neutral-500 font-medium">Manage marketplace stock and retailer offerings.</p>
                </div>

                <div className="flex items-center gap-4">
                    <label className="cursor-pointer">
                        <Input type="file" className="hidden" accept=".json" onChange={handleBulkUpload} />
                        <div className="flex items-center gap-2 bg-neutral-900 text-white px-8 h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-neutral-200 hover:bg-neutral-800 transition-all active:scale-95">
                            <Upload className="w-4 h-4" />
                            Bulk JSON Upload
                        </div>
                    </label>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Form Section */}
                <Card className="lg:col-span-2 border-neutral-100 rounded-[3rem] p-10 shadow-2xl shadow-neutral-200/40 bg-white overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-orange-50/50 blur-3xl -ml-32 -mt-32 rounded-full" />

                    <form onSubmit={handleSingleUpload} className="relative z-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Product Title</label>
                                <Input required name="title" className="h-14 rounded-2xl border-neutral-100 bg-neutral-50/50" placeholder="e.g. 50kg Seven Rings Cement" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Unique SKU</label>
                                <Input required name="sku" className="h-14 rounded-2xl border-neutral-100 bg-neutral-50/50 uppercase" placeholder="SRC-50-WH" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Target Retailer</label>
                                <select required name="sellerId" className="w-full h-14 px-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-600">
                                    <option value="">Select Seller</option>
                                    {sellers.map(s => <option key={s.id} value={s.id}>{s.business_name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Listing Category</label>
                                <select required name="categoryId" className="w-full h-14 px-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-orange-600">
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Base Price (BDT)</label>
                                <Input required name="price" type="number" step="0.01" className="h-14 rounded-2xl border-neutral-100 bg-neutral-50/50" placeholder="0.00" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Initial Stock</label>
                                <Input required name="stock" type="number" className="h-14 rounded-2xl border-neutral-100 bg-neutral-50/50" placeholder="100" />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Cover Image URL</label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                                    <Input required name="imageUrl" className="h-14 pl-12 rounded-2xl border-neutral-100 bg-neutral-50/50" placeholder="https://..." />
                                </div>
                            </div>
                        </div>

                        <Button
                            disabled={loading}
                            className="w-full h-20 bg-neutral-900 hover:bg-orange-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[12px] shadow-2xl shadow-neutral-900/10 transition-all active:scale-95"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Deploy Product to Marketplace'}
                        </Button>
                    </form>
                </Card>

                {/* Guide Section */}
                <div className="space-y-6">
                    <Card className="border-none rounded-[2.5rem] p-8 bg-neutral-900 text-white space-y-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/30 blur-3xl -mr-16 -mt-16" />
                        <h4 className="text-xl font-black italic tracking-tighter uppercase mb-4 flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-orange-500" />
                            Bulk Upload Rules
                        </h4>
                        <div className="space-y-4 text-xs font-bold text-neutral-400 leading-relaxed uppercase tracking-widest">
                            <p className="flex gap-3"><ChevronRight className="w-4 h-4 text-orange-500 flex-shrink-0" /> Format: Valid JSON Array</p>
                            <p className="flex gap-3"><ChevronRight className="w-4 h-4 text-orange-500 flex-shrink-0" /> Required: title, sku, seller_id, base_price</p>
                            <p className="flex gap-3"><ChevronRight className="w-4 h-4 text-orange-500 flex-shrink-0" /> Images: Must be array of URLs</p>
                        </div>
                        <Button variant="outline" className="w-full h-12 border-neutral-700 bg-transparent text-white border-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-neutral-900">
                            Download JSON Template
                        </Button>
                    </Card>

                    <Card className="border-neutral-100 rounded-[2.5rem] p-8 bg-white space-y-4 shadow-sm border">
                        <h4 className="font-black text-neutral-900 uppercase italic">Admin Insight</h4>
                        <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                            Uploading as an administrator bypasses typical retailer approval workflows. Use this carefully for manual onboarding.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    )
}
