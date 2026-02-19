'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
    User,
    Search,
    Plus,
    Minus,
    ShoppingCart,
    CheckCircle2,
    Loader2,
    Package,
    ArrowRightCircle,
    Hammer,
    PenTool,
    Trash2,
    FileText
} from 'lucide-react'
import { getProducts } from '@/services/productService'
import { createOrder } from '@/services/orderService'
import { createServiceRequestAdmin } from './actions'
import { getConciergeData } from './data'
import { createClient } from '@/utils/supabase/client'

// Design Categories
const DESIGN_CATEGORIES = [
    { id: 'interior', label: 'Interior Design', fields: ['room_count', 'style_preference', 'budget_range'] },
    { id: 'architecture', label: 'Architectural Design', fields: ['plot_size', 'floors', 'occupancy_type'] },
    { id: 'structural', label: 'Structural Design', fields: ['soil_test_ref', 'load_requirement', 'building_type'] }
]

export default function ConciergeOrderPage() {
    const [loading, setLoading] = useState(false)
    const [products, setProducts] = useState<any[]>([])
    const [servicePackages, setServicePackages] = useState<any[]>([])
    const [providers, setProviders] = useState<any[]>([])
    const [productsSearch, setProductsSearch] = useState('')

    // Carts
    const [productCart, setProductCart] = useState<any[]>([])
    const [serviceCart, setServiceCart] = useState<any[]>([])

    const [searchCustomer, setSearchCustomer] = useState('')
    const [customer, setCustomer] = useState<any>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Forms
    const [designForm, setDesignForm] = useState({
        category: '',
        requirements: {} as any
    })

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        loadProducts()
    }, [productsSearch])

    async function loadData() {
        const { servicePackages, providers } = await getConciergeData() as any
        setServicePackages(servicePackages)
        setProviders(providers)
    }

    async function loadProducts() {
        const data = await getProducts({ query: productsSearch })
        setProducts(data || [])
    }

    async function handleSearchCustomer() {
        if (!searchCustomer) return
        setLoading(true)
        const supabase = createClient()

        let query = supabase.from('profiles').select('*')

        // Smart Search Logic
        if (searchCustomer.includes('@')) {
            query = query.eq('email', searchCustomer)
        } else if (/^\+?\d+$/.test(searchCustomer)) {
            query = query.eq('phone_number', searchCustomer)
        } else {
            // Name search (partial match)
            query = query.ilike('full_name', `%${searchCustomer}%`).limit(1)
        }

        const { data, error } = await query.maybeSingle()

        if (!data) {
            alert('Customer not found. Please try exact email or phone number.')
            setCustomer(null)
        } else {
            setCustomer(data)
        }
        setLoading(false)
    }

    // --- Product Logic ---
    function addToProductCart(product: any) {
        setProductCart(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
            }
            return [...prev, { ...product, quantity: 1 }]
        })
    }

    function updateProductQuantity(id: string, delta: number) {
        setProductCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta)
                return { ...item, quantity: newQty }
            }
            return item
        }).filter(item => item.quantity > 0))
    }

    async function handlePlaceProductOrder() {
        if (!customer) return alert('Select a customer first.')
        if (productCart.length === 0) return alert('Cart is empty.')

        setLoading(true)
        try {
            const sellers = Array.from(new Set(productCart.map(i => i.seller_id)))
            for (const sellerId of sellers) {
                const sellerItems = productCart.filter(i => i.seller_id === sellerId)
                const sellerTotal = sellerItems.reduce((sum, i) => sum + (i.base_price * i.quantity), 0) * 1.075 // VAT fix if needed

                const orderData = {
                    seller_id: sellerId,
                    order_number: `ADMIN-${Date.now()}`,
                    items: sellerItems,
                    total_amount: sellerTotal,
                    advance_amount: sellerTotal * 0.1,
                    remaining_amount: sellerTotal * 0.9,
                    customer_id: customer.id,
                    status: 'pending'
                }

                await createOrder(orderData, {
                    name: customer.full_name,
                    email: customer.email,
                    phone: customer.phone_number,
                    address: customer.address || 'Ghorbari Concierge'
                }, false)
            }
            setSuccess('Product Order placed successfully!')
            setProductCart([])
        } catch (err) {
            alert('Failed to place order.')
        } finally {
            setLoading(false)
        }
    }

    // --- Service Logic (Invoice Builder) ---
    function addToServiceCart(pkg: any) {
        setServiceCart(prev => [
            ...prev,
            {
                id: pkg.id || `custom-${Date.now()}`,
                title: pkg.title || 'Custom Service',
                description: pkg.description || '',
                price: pkg.price || 0,
                isCustom: !pkg.id
            }
        ])
    }

    function updateServiceItem(index: number, field: string, value: any) {
        setServiceCart(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
    }

    function removeServiceItem(index: number) {
        setServiceCart(prev => prev.filter((_, i) => i !== index))
    }

    async function handleServiceSubmit() {
        if (!customer) return alert('Select a customer first.')
        if (serviceCart.length === 0) return alert('Add at least one service item.')

        const totalAmount = serviceCart.reduce((sum, item) => sum + Number(item.price), 0)

        setLoading(true)
        const res = await createServiceRequestAdmin({
            customerId: customer.id,
            serviceType: serviceCart.length === 1 ? serviceCart[0].title : 'Updates & Repairs Bundle',
            requirements: {
                summary: 'Admin generated service invoice',
                location: customer.address || 'Not specified'
            },
            lineItems: serviceCart,
            totalAmount: totalAmount
        })
        setLoading(false)

        if (res.error) alert(res.error)
        else {
            setSuccess(`Service Invoice Generated (SR-${res.request?.request_number})`)
            setServiceCart([])
        }
    }

    // --- Design Logic ---
    async function handleDesignSubmit() {
        if (!customer) return alert('Select a customer first.')
        if (!designForm.category) return alert('Select a category.')

        setLoading(true)
        const res = await createServiceRequestAdmin({
            customerId: customer.id,
            serviceType: `Design - ${DESIGN_CATEGORIES.find(c => c.id === designForm.category)?.label}`,
            requirements: {
                ...designForm.requirements,
                category: designForm.category,
                location: customer.address || 'Not specified'
            },
            // Design requests typically start as consultations without line items, or a fixed consultation fee
            lineItems: [{ title: 'Design Consultation Fee', price: 0, description: 'Initial consultation' }],
            totalAmount: 0
        })
        setLoading(false)

        if (res.error) alert(res.error)
        else {
            setSuccess('Design consultation booked!')
            setDesignForm({ category: '', requirements: {} })
        }
    }

    const productSubtotal = productCart.reduce((sum, item) => sum + (item.base_price * item.quantity), 0)
    const productTotal = productSubtotal * 1.075

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-20">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                        <ArrowRightCircle className="w-3 h-3" />
                        Platform Fulfillment
                    </div>
                    <h1 className="text-5xl font-black text-neutral-900 tracking-tighter uppercase italic">
                        Place <span className="text-indigo-600">Order</span>
                    </h1>
                    <p className="text-neutral-500 font-medium">Create transactions & bookings on behalf of customers.</p>
                </div>

                {/* Customer Search */}
                <Card className="border-neutral-100 rounded-[2.5rem] p-8 shadow-xl bg-white space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                            <Input
                                value={searchCustomer}
                                onChange={(e) => setSearchCustomer(e.target.value)}
                                placeholder="Search customer by email or phone..."
                                className="h-14 pl-12 rounded-2xl border-neutral-100 bg-neutral-50/50"
                            />
                        </div>
                        <Button onClick={handleSearchCustomer} className="h-14 px-8 bg-neutral-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs">
                            Find Customer
                        </Button>
                    </div>

                    {customer && (
                        <div className="flex items-center justify-between bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 animate-in zoom-in duration-300">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-black shadow-sm">
                                    <User className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-black text-neutral-900 italic uppercase">{customer.full_name}</h4>
                                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{customer.email} | {customer.phone_number}</p>
                                </div>
                            </div>
                            <Button variant="ghost" onClick={() => setCustomer(null)} className="text-rose-600 text-[10px] font-black uppercase">Switch</Button>
                        </div>
                    )}
                </Card>

                {success && (
                    <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-3xl flex items-center gap-4 text-green-600 font-bold animate-in slide-in-from-top-4">
                        <CheckCircle2 className="w-6 h-6" />
                        {success}
                        <Button variant="ghost" size="sm" onClick={() => setSuccess(null)} className="ml-auto text-xs uppercase">Dismiss</Button>
                    </div>
                )}

                <Tabs defaultValue="products" className="space-y-8">
                    <TabsList className="bg-neutral-100 p-1 rounded-2xl h-14 w-full justify-start gap-2 max-w-md">
                        <TabsTrigger value="products" className="rounded-xl flex-1 h-12 text-xs uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg">
                            <Package className="w-4 h-4 mr-2" /> Product
                        </TabsTrigger>
                        <TabsTrigger value="services" className="rounded-xl flex-1 h-12 text-xs uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg">
                            <Hammer className="w-4 h-4 mr-2" /> Service Invoice
                        </TabsTrigger>
                        <TabsTrigger value="designs" className="rounded-xl flex-1 h-12 text-xs uppercase font-black tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg">
                            <PenTool className="w-4 h-4 mr-2" /> Design
                        </TabsTrigger>
                    </TabsList>

                    {/* PRODUCT TAB */}
                    <TabsContent value="products" className="mt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            <div className="lg:col-span-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Inventory Browser</p>
                                    <Input
                                        value={productsSearch}
                                        onChange={(e) => setProductsSearch(e.target.value)}
                                        placeholder="Filter products..."
                                        className="w-64 h-10 rounded-xl text-xs"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {products.map(product => (
                                        <Card key={product.id} className="p-4 border-neutral-100 rounded-3xl hover:border-indigo-200 transition-all group">
                                            <div className="flex gap-4">
                                                <div className="w-20 h-20 rounded-2xl bg-neutral-100 overflow-hidden flex-shrink-0">
                                                    <img src={product.images?.[0]} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between py-1">
                                                    <div>
                                                        <h4 className="font-black text-neutral-900 text-sm line-clamp-1 italic uppercase">{product.title}</h4>
                                                        <p className="text-xs font-bold text-indigo-600">৳{product.base_price.toLocaleString()}</p>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => addToProductCart(product)}
                                                        className="h-8 bg-neutral-900 text-white rounded-xl font-bold uppercase text-[9px] tracking-widest self-end group-hover:bg-indigo-600"
                                                    >
                                                        <Plus className="w-3 h-3 mr-1" /> Add
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-4 space-y-8">
                                <Card className="bg-neutral-900 border-none rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col h-[600px]">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/30 blur-3xl -mr-32 -mt-32 rounded-full" />
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex items-center gap-3 mb-10 border-b border-white/10 pb-6">
                                            <ShoppingCart className="w-6 h-6 text-indigo-400" />
                                            <h3 className="text-2xl font-black italic tracking-tighter uppercase">Cart</h3>
                                        </div>
                                        <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin">
                                            {productCart.length === 0 ? (
                                                <div className="text-center py-20 text-neutral-500 font-black italic uppercase tracking-widest text-xs">
                                                    Cart is empty
                                                </div>
                                            ) : productCart.map((item, idx) => (
                                                <div key={idx} className="flex flex-col gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                                                    <div className="flex items-center justify-between">
                                                        <h5 className="font-black text-sm italic uppercase truncate max-w-[150px]">{item.title}</h5>
                                                        <p className="font-black text-xs text-indigo-400">৳{(item.base_price * item.quantity).toLocaleString()}</p>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3 bg-white/10 rounded-xl p-1 px-3">
                                                            <button onClick={() => updateProductQuantity(item.id, -1)} className="hover:text-indigo-400"><Minus className="w-3 h-3" /></button>
                                                            <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                                            <button onClick={() => updateProductQuantity(item.id, 1)} className="hover:text-indigo-400"><Plus className="w-3 h-3" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-white/10">
                                            <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-neutral-400 mb-4">
                                                <span>Total (Inc. VAT)</span>
                                                <span>৳{productTotal.toLocaleString()}</span>
                                            </div>
                                            <Button
                                                disabled={loading || !customer || productCart.length === 0}
                                                onClick={handlePlaceProductOrder}
                                                className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-indigo-600/20"
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Checkout'}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* SERVICES TAB - Invoice Builder */}
                    <TabsContent value="services" className="mt-0">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Service Picker */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-black text-neutral-900 uppercase italic">Service Catalog</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {servicePackages.map(pkg => (
                                        <Card
                                            key={pkg.id}
                                            onClick={() => addToServiceCart(pkg)}
                                            className="p-6 cursor-pointer border-neutral-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
                                        >
                                            <div className="flex flex-col h-full justify-between">
                                                <div>
                                                    <h4 className="font-bold text-neutral-900 mb-1">{pkg.title}</h4>
                                                    <p className="text-xs text-neutral-500 line-clamp-2">{pkg.description}</p>
                                                </div>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <span className="font-black text-indigo-600">৳{pkg.price}</span>
                                                    <Plus className="w-4 h-4 text-neutral-300 group-hover:text-indigo-600" />
                                                </div>
                                            </div>
                                        </Card>
                                    ))}

                                    <Card
                                        onClick={() => addToServiceCart({})}
                                        className="p-6 cursor-pointer border-dashed border-2 border-neutral-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center text-neutral-400 hover:text-indigo-600"
                                    >
                                        <span className="font-black uppercase text-xs">+ Add Custom Item</span>
                                    </Card>
                                </div>
                            </div>

                            {/* Quotation / Invoice Builder */}
                            <Card className="p-8 border-none shadow-lg rounded-[2.5rem] bg-white h-fit sticky top-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <FileText className="w-6 h-6 text-indigo-600" />
                                    <h3 className="text-2xl font-black text-neutral-900 italic uppercase">Draft <span className="text-indigo-600">Invoice</span></h3>
                                </div>

                                <div className="space-y-4 mb-8">
                                    {serviceCart.length === 0 ? (
                                        <div className="py-10 text-center text-neutral-400 text-sm font-medium italic border-2 border-dashed border-neutral-100 rounded-2xl">
                                            Add services from catalog to build invoice.
                                        </div>
                                    ) : serviceCart.map((item, idx) => (
                                        <div key={idx} className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 space-y-3 relative group">
                                            <button
                                                onClick={() => removeServiceItem(idx)}
                                                className="absolute top-2 right-2 text-neutral-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                            <Input
                                                value={item.title}
                                                onChange={(e) => updateServiceItem(idx, 'title', e.target.value)}
                                                className="font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0 placeholder:text-neutral-300"
                                                placeholder="Service Name"
                                            />
                                            <Input
                                                value={item.description}
                                                onChange={(e) => updateServiceItem(idx, 'description', e.target.value)}
                                                className="text-xs text-neutral-500 bg-transparent border-none p-0 h-auto focus-visible:ring-0 placeholder:text-neutral-300"
                                                placeholder="Key deliverables..."
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-black text-neutral-400">৳</span>
                                                <Input
                                                    type="number"
                                                    value={item.price}
                                                    onChange={(e) => updateServiceItem(idx, 'price', e.target.value)}
                                                    className="w-32 bg-white h-8 text-sm font-bold"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center bg-indigo-50 p-6 rounded-2xl mb-6">
                                    <span className="font-bold uppercase text-xs tracking-widest text-indigo-900">Total Estimate</span>
                                    <span className="font-black text-2xl text-indigo-600">
                                        ৳{serviceCart.reduce((sum, item) => sum + Number(item.price || 0), 0).toLocaleString()}
                                    </span>
                                </div>

                                <Button
                                    onClick={handleServiceSubmit}
                                    disabled={loading || !customer || serviceCart.length === 0}
                                    className="w-full h-14 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl font-black uppercase tracking-widest"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Submit Order'}
                                </Button>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* DESIGN TAB - Strict Categories & Provider Selection */}
                    <TabsContent value="designs" className="mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <Card className="p-8 border-none shadow-lg rounded-[2.5rem] bg-white h-fit">
                                <h3 className="text-2xl font-black text-neutral-900 italic uppercase mb-6">Design <span className="text-purple-600">Brief</span></h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Design Category</label>
                                        <div className="relative">
                                            <select
                                                value={designForm.category}
                                                onChange={(e) => setDesignForm({ category: e.target.value, requirements: {} })}
                                                className="w-full h-14 pl-4 pr-10 rounded-2xl border-neutral-200 bg-white font-bold text-neutral-900 appearance-none focus:ring-2 focus:ring-purple-600 focus:outline-none"
                                            >
                                                <option value="">Select Category...</option>
                                                <option value="structural">Structural Design</option>
                                                <option value="architectural">Architectural Design</option>
                                                <option value="interior">Interior Design</option>
                                            </select>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none"><path d="m6 9 6 6 6-6" /></svg>
                                        </div>
                                    </div>

                                    {designForm.category === 'structural' && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Has Soil Test been conducted?</label>
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => setDesignForm({ ...designForm, requirements: { ...designForm.requirements, soil_test: true } })}
                                                        className={`flex-1 h-12 rounded-xl font-bold text-sm ${designForm.requirements.soil_test === true ? 'bg-purple-600 text-white' : 'bg-neutral-50 text-neutral-600'}`}
                                                    >Yes</button>
                                                    <button
                                                        onClick={() => setDesignForm({ ...designForm, requirements: { ...designForm.requirements, soil_test: false } })}
                                                        className={`flex-1 h-12 rounded-xl font-bold text-sm ${designForm.requirements.soil_test === false ? 'bg-purple-600 text-white' : 'bg-neutral-50 text-neutral-600'}`}
                                                    >No</button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Total Intended Floors (Future)</label>
                                                <Input
                                                    placeholder="e.g. 6"
                                                    className="h-12 rounded-xl bg-neutral-50"
                                                    onChange={(e) => setDesignForm({ ...designForm, requirements: { ...designForm.requirements, intended_floors: e.target.value } })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Rooftop Plans</label>
                                                <div className="flex gap-4">
                                                    {['Roof Garden', 'Swimming Pool'].map(opt => (
                                                        <button
                                                            key={opt}
                                                            onClick={() => {
                                                                const current = designForm.requirements.rooftop_plans || []
                                                                const exists = current.includes(opt)
                                                                setDesignForm({
                                                                    ...designForm,
                                                                    requirements: {
                                                                        ...designForm.requirements,
                                                                        rooftop_plans: exists ? current.filter((i: any) => i !== opt) : [...current, opt]
                                                                    }
                                                                })
                                                            }}
                                                            className={`flex-1 h-12 rounded-xl font-bold text-xs border-2 transition-all ${designForm.requirements.rooftop_plans?.includes(opt) ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-neutral-100 bg-white text-neutral-400'}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {designForm.category === 'architectural' && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Land Area (Katha)</label>
                                                    <Input placeholder="e.g. 5" className="h-12 rounded-xl bg-neutral-50" onChange={(e) => setDesignForm({ ...designForm, requirements: { ...designForm.requirements, land_area: e.target.value } })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Floors</label>
                                                    <Input placeholder="e.g. 4" className="h-12 rounded-xl bg-neutral-50" onChange={(e) => setDesignForm({ ...designForm, requirements: { ...designForm.requirements, floors: e.target.value } })} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Plot Orientation</label>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {['North', 'South', 'East', 'West'].map(opt => (
                                                        <button
                                                            key={opt}
                                                            onClick={() => setDesignForm({ ...designForm, requirements: { ...designForm.requirements, orientation: opt } })}
                                                            className={`h-10 rounded-lg font-bold text-[10px] uppercase border ${designForm.requirements.orientation === opt ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-neutral-200 text-neutral-400'}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Vibe</label>
                                                <select
                                                    className="w-full h-12 px-4 rounded-xl bg-neutral-50 border-none text-sm font-bold"
                                                    onChange={(e) => setDesignForm({ ...designForm, requirements: { ...designForm.requirements, vibe: e.target.value } })}
                                                >
                                                    <option value="">Select Vibe...</option>
                                                    <option value="modern">Modern / Minimalist</option>
                                                    <option value="traditional">Traditional / Brick</option>
                                                    <option value="duplex">Duplex Luxury</option>
                                                    <option value="green">Green / Eco-Friendly</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {designForm.category === 'interior' && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Project Type</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {['Full Apt', 'Single Room', 'Office'].map(opt => (
                                                        <button
                                                            key={opt}
                                                            onClick={() => setDesignForm({ ...designForm, requirements: { ...designForm.requirements, project_type: opt } })}
                                                            className={`h-12 rounded-xl font-bold text-[10px] uppercase border ${designForm.requirements.project_type === opt ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-neutral-200 text-neutral-400'}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Size (Sq. Ft)</label>
                                                    <Input placeholder="e.g. 1200" className="h-12 rounded-xl bg-neutral-50" onChange={(e) => setDesignForm({ ...designForm, requirements: { ...designForm.requirements, size_sqft: e.target.value } })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">Budget (Lakh)</label>
                                                    <Input placeholder="e.g. 15" className="h-12 rounded-xl bg-neutral-50" onChange={(e) => setDesignForm({ ...designForm, requirements: { ...designForm.requirements, budget_lakh: e.target.value } })} />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Admin Extras */}
                                    {designForm.category && (
                                        <div className="pt-6 border-t border-neutral-100 space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Assign Service Provider</label>
                                                <select
                                                    className="w-full h-12 px-4 rounded-xl bg-indigo-50 border-indigo-100 text-sm font-bold text-indigo-900 focus:ring-indigo-500"
                                                    onChange={(e) => setDesignForm({ ...designForm, requirements: { ...designForm.requirements, provider_id: e.target.value } })}
                                                >
                                                    <option value="">Select Provider...</option>

                                                    {providers?.map((p: any) => (
                                                        <option key={p.id} value={p.id}>{p.business_name} ({p.contact_person})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Quote Price (Tk)</label>
                                                <Input
                                                    placeholder="Enter verified quote..."
                                                    className="h-12 rounded-xl bg-indigo-50 border-indigo-100 font-bold text-indigo-900"
                                                    onChange={(e) => setDesignForm({ ...designForm, requirements: { ...designForm.requirements, admin_price: e.target.value } })}
                                                />
                                            </div>

                                            <Button
                                                onClick={handleDesignSubmit}
                                                disabled={loading || !customer}
                                                className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black uppercase tracking-widest"
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Order & Assign'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <div className="bg-purple-50 rounded-[2.5rem] p-10 flex flex-col justify-center items-center text-center space-y-4 border border-purple-100">
                                <PenTool className="w-16 h-16 text-purple-300" />
                                <h4 className="text-xl font-black text-neutral-900 uppercase">Design Studio</h4>
                                <p className="text-neutral-500 max-w-xs text-sm">
                                    Initiate complex design projects for Structure, Architecture, or Interiors. These are routed to specialized teams.
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

