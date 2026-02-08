'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
    Plus,
    Package,
    DollarSign,
    TrendingUp,
    Truck,
    FileText,
    Search,
    MoreVertical,
    CheckCircle2,
    XCircle
} from 'lucide-react'

export default function SellerDashboard() {
    const [products, setProducts] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [showAddForm, setShowAddForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [seller, setSeller] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: sel } = await supabase
                .from('sellers')
                .select('*')
                .eq('user_id', user.id)
                .single()
            setSeller(sel)

            if (sel) {
                // Fetch products
                const { data: prods } = await supabase.from('products').select('*').eq('seller_id', sel.id)
                setProducts(prods || [])

                // Fetch orders (mocking some for the shop)
                const { data: ords } = await supabase.from('orders').select('*').eq('seller_id', sel.id)
                setOrders(ords || [])
            }
        }
        fetchData()
    }, [])

    async function handleAddProduct(formData: FormData) {
        setLoading(true)
        const newProduct = {
            seller_id: seller.id,
            sku: 'SKU-' + Math.random().toString(36).substring(7).toUpperCase(),
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            base_price: parseFloat(formData.get('price') as string),
            stock_quantity: parseInt(formData.get('stock') as string),
            images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800'],
            status: 'active'
        }

        const { data, error } = await supabase.from('products').insert(newProduct).select().single()

        if (!error) {
            setProducts([...products, data])
            setShowAddForm(false)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-[#F0F2F5]">
            <div className="max-w-[1600px] mx-auto p-8">
                {/* Header Area */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-4xl font-black text-neutral-900 tracking-tight italic">{seller?.business_name || 'Merchant Console'}</h1>
                            <span className="bg-neutral-900 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">PRO SELLER</span>
                        </div>
                        <p className="text-neutral-500 font-bold uppercase text-xs tracking-widest">Business ID: {seller?.id?.slice(0, 8).toUpperCase()} • Active in {seller?.primary_categories?.join(', ')}</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Input className="pl-10 h-12 w-64 bg-white border-none rounded-2xl shadow-sm font-bold text-xs" placeholder="Search orders, products..." />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        </div>
                        <Button onClick={() => setShowAddForm(true)} className="h-12 px-6 bg-primary-600 hover:bg-primary-700 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-primary-200">
                            <Plus className="w-4 h-4 mr-2" /> Add Inventory
                        </Button>
                    </div>
                </header>

                {/* Top Metrics Area */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <Card className="p-8 border-none bg-white rounded-[40px] shadow-sm">
                        <div className="flex justify-between items-start">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl">
                                <Package className="w-6 h-6" />
                            </div>
                            <span className="text-green-500 text-[10px] font-black">+12%</span>
                        </div>
                        <p className="mt-6 text-neutral-400 font-black uppercase text-[10px] tracking-widest">Live Inventory</p>
                        <p className="text-4xl font-black text-neutral-900">{products.length} SKUs</p>
                    </Card>
                    <Card className="p-8 border-none bg-white rounded-[40px] shadow-sm">
                        <div className="flex justify-between items-start">
                            <div className="p-4 bg-green-50 text-green-600 rounded-3xl">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <span className="text-green-500 text-[10px] font-black">+24%</span>
                        </div>
                        <p className="mt-6 text-neutral-400 font-black uppercase text-[10px] tracking-widest">Settled Revenue</p>
                        <p className="text-4xl font-black text-neutral-900">৳0</p>
                    </Card>
                    <Card className="p-8 border-none bg-neutral-900 text-white rounded-[40px] shadow-xl">
                        <div className="flex justify-between items-start">
                            <div className="p-4 bg-primary-600 text-white rounded-3xl">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="mt-6 text-neutral-400 font-black uppercase text-[10px] tracking-widest">Active Orders</p>
                        <p className="text-4xl font-black">{orders.length}</p>
                    </Card>
                    <Card className="p-8 border-none bg-white rounded-[40px] shadow-sm">
                        <div className="flex justify-between items-start">
                            <div className="p-4 bg-orange-50 text-orange-600 rounded-3xl">
                                <Truck className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="mt-6 text-neutral-400 font-black uppercase text-[10px] tracking-widest">In Transit</p>
                        <p className="text-4xl font-black text-neutral-900">0</p>
                    </Card>
                </div>

                {/* Main Content Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Orders Management */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex justify-between items-center px-4">
                            <h2 className="text-xl font-black text-neutral-900 italic tracking-tight uppercase flex items-center gap-2">
                                <FileText className="w-5 h-5 text-neutral-400" /> Incoming Order Flow
                            </h2>
                            <div className="flex gap-2">
                                <Button variant="ghost" className="text-[10px] font-black uppercase text-neutral-400">Waitlist</Button>
                                <Button variant="link" className="text-[10px] font-black uppercase text-primary-600">History</Button>
                            </div>
                        </div>

                        <div className="bg-white rounded-[40px] shadow-sm overflow-hidden border border-neutral-100">
                            <table className="w-full">
                                <thead className="bg-neutral-50/50">
                                    <tr>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">Order Details</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">Payment</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">Delivery Partner</th>
                                        <th className="px-8 py-6 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">Merchant Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center text-neutral-400 font-bold uppercase text-xs tracking-widest italic">
                                                Monitoring sales channels... <br />No orders detected for this period.
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-neutral-300 uppercase tracking-tighter">REF: {order.order_number}</p>
                                                        <p className="font-black text-neutral-900 uppercase text-sm">Design Batch #001</p>
                                                        <p className="text-xs text-neutral-500 font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="space-y-1">
                                                        <p className="font-black text-neutral-900 text-sm italic">৳{order.total_amount}</p>
                                                        <div className="flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                            <span className="text-[10px] font-black text-green-600 uppercase">Settled</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-neutral-100 rounded-2xl flex items-center justify-center font-black text-neutral-400">
                                                            P
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-neutral-900 text-xs">Pathao Logistics</p>
                                                            <p className="text-[10px] font-bold text-neutral-400 uppercase">INTEGRATED</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex gap-2">
                                                        <Button className="bg-neutral-900 hover:bg-neutral-800 text-white font-black uppercase text-[10px] tracking-widest h-10 px-4 rounded-xl">Process</Button>
                                                        <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-neutral-200">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Inventory & Stock Monitoring */}
                    <div className="lg:col-span-4 space-y-8">
                        <h2 className="text-xl font-black text-neutral-900 italic tracking-tight uppercase px-2">Warehouse Inventory</h2>
                        <div className="space-y-4">
                            {products.map((product) => (
                                <Card key={product.id} className="p-6 border-none bg-white rounded-3xl shadow-sm group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-neutral-100 rounded-2xl overflow-hidden shadow-inner">
                                            <img src={product.images[0]} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">{product.sku}</p>
                                            <h3 className="font-black text-neutral-900 truncate uppercase italic">{product.title}</h3>
                                            <div className="flex justify-between items-center mt-2">
                                                <p className="text-sm font-black text-neutral-900 italic">৳{product.base_price}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-black ${product.stock_quantity < 10 ? 'text-rose-500' : 'text-neutral-400'} uppercase tracking-tighter`}>
                                                        {product.stock_quantity} UNIT LEFT
                                                    </span>
                                                    <div className="w-1 h-1 bg-neutral-200 rounded-full" />
                                                    <span className="text-[10px] font-black border border-neutral-100 px-2 py-0.5 rounded uppercase tracking-tighter text-neutral-400">
                                                        {product.category}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Add Product Modal (Re-using logic from previously) */}
                {showAddForm && (
                    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
                        <Card className="w-full max-w-xl bg-white rounded-[40px] p-12 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8">
                                <Button variant="ghost" onClick={() => setShowAddForm(false)} className="rounded-full w-12 h-12 hover:bg-neutral-100">
                                    <XCircle className="w-6 h-6 text-neutral-300" />
                                </Button>
                            </div>
                            <h2 className="text-4xl font-black text-neutral-900 mb-2 italic tracking-tighter uppercase">List Inventory</h2>
                            <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-[0.2em] mb-10 border-b pb-6">Global Catalog Entry</p>

                            <form action={handleAddProduct} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Commercial Title</label>
                                    <Input name="title" required className="h-14 rounded-2xl bg-neutral-50 border-none font-bold placeholder:text-neutral-300" placeholder="e.g. HIGH-TENSILE STEEL ROD" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Industry Group</label>
                                        <Input name="category" required className="h-14 rounded-2xl bg-neutral-50 border-none font-bold" placeholder="STEEL" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">List Price (৳)</label>
                                        <Input name="price" type="number" required className="h-14 rounded-2xl bg-neutral-50 border-none font-black" placeholder="0.00" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Opening Volume</label>
                                    <Input name="stock" type="number" required className="h-14 rounded-2xl bg-neutral-50 border-none font-bold" placeholder="100" />
                                </div>
                                <Button type="submit" disabled={loading} className="w-full h-16 bg-neutral-900 text-white font-black uppercase tracking-widest rounded-3xl mt-6 shadow-2xl shadow-neutral-200">
                                    {loading ? 'SYNCING DATA...' : 'PUSH TO MARKETPLACE'}
                                </Button>
                            </form>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
