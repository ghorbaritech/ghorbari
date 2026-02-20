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
    XCircle,
    User,
    ExternalLink
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function SellerDashboard() {
    const [products, setProducts] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [assignedTasks, setAssignedTasks] = useState<any[]>([])
    const [showAddForm, setShowAddForm] = useState(false)
    const [showEditProfile, setShowEditProfile] = useState(false)
    const [profileSaving, setProfileSaving] = useState(false)
    const [profileSaved, setProfileSaved] = useState(false)
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

                // Fetch Assigned Design Tasks
                const { data: tasks } = await supabase
                    .from('design_bookings')
                    .select('*')
                    .eq('assigned_seller_id', sel.id)
                setAssignedTasks(tasks || [])
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

    async function handleSaveProfile(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!seller) return
        setProfileSaving(true)
        const form = e.currentTarget
        const fd = new FormData(form)
        const updates: any = {
            bio: fd.get('bio'),
            shop_photo_url: fd.get('shop_photo_url'),
            gallery_urls: (fd.get('gallery_urls') as string)?.split('\n').map((u: string) => u.trim()).filter(Boolean),
            terms_and_conditions: fd.get('terms_and_conditions'),
            location: fd.get('location'),
            phone: fd.get('phone'),
            email: fd.get('email'),
            website: fd.get('website'),
            founded_year: parseInt(fd.get('founded_year') as string) || null,
        }
        const { error } = await supabase.from('sellers').update(updates).eq('id', seller.id)
        if (!error) {
            setSeller({ ...seller, ...updates })
            setProfileSaved(true)
            setTimeout(() => { setProfileSaved(false); setShowEditProfile(false) }, 1500)
        }
        setProfileSaving(false)
    }

    return (
        <div className="min-h-screen bg-[#F0F2F5]">
            <div className="max-w-[1600px] mx-auto p-8">
                {/* Header Area */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-4xl font-black text-neutral-900 tracking-tight italic">{seller?.business_name || 'Merchant Console'}</h1>
                            <span className="bg-neutral-900 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">{seller?.business_type || 'Retailer'}</span>
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
                        {/* Profile Summary / Store Health */}
                        <Card className="p-8 border-none bg-white rounded-[40px] shadow-sm mb-8">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center font-black text-3xl text-neutral-300">
                                    {seller?.business_name?.charAt(0) || 'S'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-2xl font-black text-neutral-900 italic uppercase">My Store Health</h2>
                                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Status: <span className="text-green-600">{seller?.is_active ? 'ONLINE' : 'OFFLINE'}</span> • Verification: <span className="text-blue-600">{seller?.verification_status || 'Pending'}</span></p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={() => setShowEditProfile(true)} className="rounded-xl border-neutral-200 uppercase text-[10px] font-black tracking-widest gap-1">
                                                <User className="w-3 h-3" /> Edit Profile
                                            </Button>
                                            {seller?.id && (
                                                <Link href={`/partner/${seller.id}`} target="_blank">
                                                    <Button variant="ghost" className="rounded-xl uppercase text-[10px] font-black tracking-widest gap-1 text-neutral-400">
                                                        <ExternalLink className="w-3 h-3" /> View Public Page
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-6 grid grid-cols-3 gap-4">
                                        <div className="p-4 bg-neutral-50 rounded-2xl">
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Rating</p>
                                            <p className="text-xl font-black text-neutral-900">4.9/5.0</p>
                                        </div>
                                        <div className="p-4 bg-neutral-50 rounded-2xl">
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Response Time</p>
                                            <p className="text-xl font-black text-neutral-900">~2 Hrs</p>
                                        </div>
                                        <div className="p-4 bg-neutral-50 rounded-2xl">
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Completion</p>
                                            <p className="text-xl font-black text-neutral-900">98%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

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
                        <div>
                            <h2 className="text-xl font-black text-neutral-900 italic tracking-tight uppercase px-2 mb-6">Assigned Projects</h2>
                            {assignedTasks.length === 0 ? (
                                <Card className="p-8 border-none bg-white rounded-[32px] shadow-sm text-center">
                                    <p className="text-neutral-400 font-bold uppercase text-xs tracking-widest italic py-4">No active design projects assigned.</p>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {assignedTasks.map(task => (
                                        <Card key={task.id} className="p-6 border-none bg-white rounded-3xl shadow-sm group hover:shadow-md transition-all cursor-pointer" onClick={() => window.location.href = `/dashboard/seller/design/${task.id}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge className="bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-widest">{task.service_type}</Badge>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${task.status === 'completed' ? 'text-green-600' : 'text-amber-500'}`}>
                                                    {task.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <h3 className="font-black text-neutral-900 uppercase italic text-lg mb-1">Project #{task.id.slice(0, 6)}</h3>
                                            <p className="text-xs text-neutral-500 font-bold mb-4">Due: {task.milestones?.find((m: any) => m.status !== 'completed')?.due_date ? new Date(task.milestones.find((m: any) => m.status !== 'completed').due_date).toLocaleDateString() : 'TBD'}</p>

                                            <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-primary-600 h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${(task.milestones?.filter((m: any) => m.status === 'completed').length / (task.milestones?.length || 1)) * 100}%` }}
                                                />
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        <h2 className="text-xl font-black text-neutral-900 italic tracking-tight uppercase px-2 mt-8">Warehouse Inventory</h2>
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

                {/* Edit Profile Modal */}
                {showEditProfile && (
                    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
                        <Card className="w-full max-w-2xl bg-white rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-8 border-b border-neutral-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <div>
                                    <h2 className="text-3xl font-black text-neutral-900 italic uppercase tracking-tighter">Edit Public Profile</h2>
                                    <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest">Visible on your seller page</p>
                                </div>
                                <Button variant="ghost" onClick={() => setShowEditProfile(false)} className="rounded-full w-12 h-12 hover:bg-neutral-100">
                                    <XCircle className="w-6 h-6 text-neutral-300" />
                                </Button>
                            </div>
                            <div className="overflow-y-auto p-8">
                                <form id="profile-form" onSubmit={handleSaveProfile} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1 col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Business Summary / Bio</label>
                                            <textarea name="bio" defaultValue={seller?.bio || ''} rows={4} className="w-full p-4 rounded-2xl bg-neutral-50 border-none font-medium resize-none focus:outline-none focus:ring-2 focus:ring-neutral-200 text-sm" placeholder="Tell customers about your business, experience, and values..." />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Location / City</label>
                                            <Input name="location" defaultValue={seller?.location || ''} className="h-12 rounded-2xl bg-neutral-50 border-none" placeholder="e.g. Mirpur, Dhaka" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Founded Year</label>
                                            <Input name="founded_year" type="number" defaultValue={seller?.founded_year || ''} className="h-12 rounded-2xl bg-neutral-50 border-none" placeholder="e.g. 2015" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Phone</label>
                                            <Input name="phone" defaultValue={seller?.phone || ''} className="h-12 rounded-2xl bg-neutral-50 border-none" placeholder="+880 17XX XXXXXX" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Email</label>
                                            <Input name="email" type="email" defaultValue={seller?.email || ''} className="h-12 rounded-2xl bg-neutral-50 border-none" placeholder="contact@yourbusiness.com" />
                                        </div>
                                        <div className="space-y-1 col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Website URL</label>
                                            <Input name="website" defaultValue={seller?.website || ''} className="h-12 rounded-2xl bg-neutral-50 border-none" placeholder="https://yourbusiness.com" />
                                        </div>
                                        <div className="space-y-1 col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Shop / Banner Photo URL</label>
                                            <Input name="shop_photo_url" defaultValue={seller?.shop_photo_url || ''} className="h-12 rounded-2xl bg-neutral-50 border-none" placeholder="https://link-to-your-shop-photo.jpg" />
                                        </div>
                                        <div className="space-y-1 col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Gallery Image URLs (one per line)</label>
                                            <textarea name="gallery_urls" defaultValue={seller?.gallery_urls?.join('\n') || ''} rows={4} className="w-full p-4 rounded-2xl bg-neutral-50 border-none font-medium resize-none focus:outline-none focus:ring-2 focus:ring-neutral-200 text-sm font-mono" placeholder="https://photo1.jpg&#10;https://photo2.jpg&#10;..." />
                                            <p className="text-xs text-neutral-400">Paste URLs of delivered order photos, one per line. Max 6 shown.</p>
                                        </div>
                                        <div className="space-y-1 col-span-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Terms &amp; Conditions</label>
                                            <textarea name="terms_and_conditions" defaultValue={seller?.terms_and_conditions || ''} rows={5} className="w-full p-4 rounded-2xl bg-neutral-50 border-none font-medium resize-none focus:outline-none focus:ring-2 focus:ring-neutral-200 text-sm" placeholder="Enter your return policy, delivery terms, etc..." />
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="p-8 border-t border-neutral-100 bg-white sticky bottom-0">
                                <Button
                                    onClick={() => (document.getElementById('profile-form') as HTMLFormElement)?.requestSubmit()}
                                    disabled={profileSaving}
                                    className="w-full h-14 bg-neutral-900 text-white font-black uppercase tracking-widest rounded-2xl"
                                >
                                    {profileSaved ? '✓ Profile Saved!' : profileSaving ? 'Saving...' : 'Save Public Profile'}
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

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
