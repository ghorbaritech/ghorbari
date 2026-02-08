'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    User,
    Search,
    Plus,
    Minus,
    ShoppingCart,
    CreditCard,
    CheckCircle2,
    Loader2,
    Package,
    ArrowRightCircle,
    Phone,
    MapPin
} from 'lucide-react'
import { getProducts } from '@/services/productService'
import { createOrder } from '@/services/orderService'
import { createClient } from '@/utils/supabase/client'

export default function ConciergeOrderPage() {
    const [loading, setLoading] = useState(false)
    const [products, setProducts] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [cart, setCart] = useState<any[]>([])
    const [searchCustomer, setSearchCustomer] = useState('')
    const [customer, setCustomer] = useState<any>(null)
    const [success, setSuccess] = useState<string | null>(null)

    useEffect(() => {
        loadProducts()
    }, [searchTerm])

    async function loadProducts() {
        const data = await getProducts({ query: searchTerm })
        setProducts(data || [])
    }

    async function handleSearchCustomer() {
        if (!searchCustomer) return
        setLoading(true)
        const supabase = createClient()
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .or(`email.eq.${searchCustomer},phone_number.eq.${searchCustomer}`)
            .single()

        setCustomer(data)
        setLoading(false)
    }

    function addToCart(product: any) {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
            }
            return [...prev, { ...product, quantity: 1 }]
        })
    }

    function updateQuantity(id: string, delta: number) {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(0, item.quantity + delta)
                return { ...item, quantity: newQty }
            }
            return item
        }).filter(item => item.quantity > 0))
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.base_price * item.quantity), 0)
    const vat = subtotal * 0.075 // 7.5%
    const total = subtotal + vat

    async function handlePlaceOrder() {
        if (!customer) return alert('Select a customer first.')
        if (cart.length === 0) return alert('Cart is empty.')

        setLoading(true)
        try {
            // Group by seller for order splitting
            const sellers = Array.from(new Set(cart.map(i => i.seller_id)))

            for (const sellerId of sellers) {
                const sellerItems = cart.filter(i => i.seller_id === sellerId)
                const sellerTotal = sellerItems.reduce((sum, i) => sum + (i.base_price * i.quantity), 0) * 1.075

                const orderData = {
                    seller_id: sellerId,
                    order_number: `ADMIN-${Date.now()}`,
                    items: sellerItems,
                    total_amount: sellerTotal,
                    advance_amount: sellerTotal * 0.1, // 10%
                    remaining_amount: sellerTotal * 0.9,
                    customer_id: customer.id,
                    status: 'pending'
                }

                const customerDetails = {
                    name: customer.full_name,
                    email: customer.email,
                    phone: customer.phone_number,
                    address: customer.address || 'Ghorbari Concierge Service'
                }

                await createOrder(orderData, customerDetails, false)
            }

            setSuccess('Order placed successfully via admin!')
            setCart([])
            setCustomer(null)
            setSearchCustomer('')
        } catch (err) {
            alert('Failed to place order.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-700">
            {/* Left: Product Selection & Customer Search */}
            <div className="lg:col-span-8 space-y-10">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                        <ArrowRightCircle className="w-3 h-3" />
                        Platform Fulfillment
                    </div>
                    <h1 className="text-5xl font-black text-neutral-900 tracking-tighter uppercase italic">
                        Place <span className="text-indigo-600">Order</span>
                    </h1>
                    <p className="text-neutral-500 font-medium">Create transactions on behalf of customers.</p>
                </div>

                {/* Customer Selector */}
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

                {/* Product Browser */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Inventory Browser</p>
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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
                                            onClick={() => addToCart(product)}
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
            </div>

            {/* Right: Cart Summary & Checkout */}
            <div className="lg:col-span-4 space-y-8">
                <Card className="bg-neutral-900 border-none rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col h-[800px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/30 blur-3xl -mr-32 -mt-32 rounded-full" />

                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-10 border-b border-white/10 pb-6">
                            <ShoppingCart className="w-6 h-6 text-indigo-400" />
                            <h3 className="text-2xl font-black italic tracking-tighter uppercase">Order Summary</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin">
                            {cart.length === 0 ? (
                                <div className="text-center py-20 text-neutral-500 font-black italic uppercase tracking-widest text-xs">
                                    Cart is empty
                                </div>
                            ) : cart.map((item, idx) => (
                                <div key={idx} className="flex flex-col gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                                    <div className="flex items-center justify-between">
                                        <h5 className="font-black text-sm italic uppercase truncate max-w-[150px]">{item.title}</h5>
                                        <p className="font-black text-xs text-indigo-400">৳{(item.base_price * item.quantity).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 bg-white/10 rounded-xl p-1 px-3">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-indigo-400"><Minus className="w-3 h-3" /></button>
                                            <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-indigo-400"><Plus className="w-3 h-3" /></button>
                                        </div>
                                        <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">{item.seller?.business_name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 pt-10 border-t border-white/10 space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-neutral-400">
                                    <span>Subtotal</span>
                                    <span>৳{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-neutral-400">
                                    <span>VAT (Est. 7.5%)</span>
                                    <span>৳{vat.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-end pt-4 border-t border-white/10">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Total Payable</p>
                                        <p className="text-4xl font-black italic tracking-tighter">৳{total.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {success ? (
                                <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-3xl flex items-center gap-4 text-green-500 font-bold">
                                    <CheckCircle2 className="w-6 h-6" />
                                    Order Placed!
                                </div>
                            ) : (
                                <Button
                                    disabled={loading || !customer || cart.length === 0}
                                    onClick={handlePlaceOrder}
                                    className="w-full h-20 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[12px] shadow-2xl shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Execute Transaction'}
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
