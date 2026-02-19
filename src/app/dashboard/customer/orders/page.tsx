"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, ChevronRight, Search, PenTool, Wrench, Filter } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type OrderType = 'product' | 'design' | 'service'

interface CombinedOrder {
    id: string
    type: OrderType
    number: string
    date: string
    status: string
    amount?: number
    title: string
    link: string
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<CombinedOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState<string>('all')
    const supabase = createClient()

    useEffect(() => {
        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            setLoading(true)

            // 1. Fetch Product Orders
            const { data: productOrders } = await supabase
                .from('orders')
                .select('*')
                .eq('customer_id', user.id)
                .order('created_at', { ascending: false })

            // 2. Fetch Design Bookings
            const { data: designBookings } = await supabase
                .from('design_bookings')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            // 3. Fetch Service Requests
            const { data: serviceRequests } = await supabase
                .from('service_requests')
                .select('*')
                .eq('customer_id', user.id)
                .order('created_at', { ascending: false })

            // Normalize and Combine Data
            const normalizedProducts: CombinedOrder[] = (productOrders || []).map((o: any) => ({
                id: o.id,
                type: 'product',
                number: o.order_number,
                date: o.created_at,
                status: o.status || o.order_status, // Handle potentially different status field names
                amount: o.total_amount,
                title: 'Product Purchase',
                link: `/dashboard/customer/orders/${o.id}`
            }))

            const normalizedDesigns: CombinedOrder[] = (designBookings || []).map((d: any) => ({
                id: d.id,
                type: 'design',
                number: d.id.slice(0, 8).toUpperCase(),
                date: d.created_at,
                status: d.status,
                // amount: d.details?.budget, // Optional: if budget is available
                title: `${d.service_type} Design`,
                link: `/dashboard/customer/design/${d.id}`
            }))

            const normalizedServices: CombinedOrder[] = (serviceRequests || []).map((s: any) => ({
                id: s.id,
                type: 'service',
                number: s.request_number,
                date: s.created_at,
                status: s.status,
                title: s.service_type.replace(/_/g, ' '),
                link: `/dashboard/customer/requests` // Direct to requests page or specific detail if exists
            }))

            const combined = [...normalizedProducts, ...normalizedDesigns, ...normalizedServices].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )

            setOrders(combined)
            setLoading(false)
        }
        fetchData()
    }, [])

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.title.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesTab = activeTab === 'all' || order.type === activeTab

        return matchesSearch && matchesTab
    })

    const getIcon = (type: OrderType) => {
        switch (type) {
            case 'product': return <Package className="w-6 h-6" />;
            case 'design': return <PenTool className="w-6 h-6" />;
            case 'service': return <Wrench className="w-6 h-6" />;
        }
    }

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase()
        if (['delivered', 'completed', 'verified'].includes(s)) return 'bg-green-100 text-green-700'
        if (['cancelled', 'rejected'].includes(s)) return 'bg-red-100 text-red-700'
        if (['processing', 'in_progress', 'assigned'].includes(s)) return 'bg-blue-100 text-blue-700'
        return 'bg-yellow-100 text-yellow-700' // pending, etc.
    }

    if (loading) return <div className="p-12 text-center text-neutral-400 font-medium">Loading orders...</div>

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-neutral-900 tracking-tighter italic mb-2">My Orders</h1>
                    <p className="text-neutral-500 font-bold uppercase text-xs tracking-widest">Track Products, Designs & Services</p>
                </div>
            </header>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={setActiveTab}>
                    <TabsList className="bg-neutral-100 p-1 rounded-2xl h-12">
                        <TabsTrigger value="all" className="rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">All</TabsTrigger>
                        <TabsTrigger value="product" className="rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Products</TabsTrigger>
                        <TabsTrigger value="design" className="rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Designs</TabsTrigger>
                        <TabsTrigger value="service" className="rounded-xl px-6 font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Services</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative w-full md:w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        placeholder="Search ID or Status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 rounded-2xl border-neutral-200 bg-white"
                    />
                </div>
            </div>

            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <Card className="p-12 text-center bg-white rounded-[40px] border-none shadow-sm">
                        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Filter className="w-8 h-8 text-neutral-400" />
                        </div>
                        <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tight mb-2">No Records Found</h3>
                        <p className="text-neutral-500 mb-6">Try adjusting your filters or search terms.</p>
                        <Link href="/products">
                            <Button className="bg-neutral-900 text-white font-black uppercase tracking-widest rounded-2xl px-8 h-12">
                                Browse Marketplace
                            </Button>
                        </Link>
                    </Card>
                ) : (
                    filteredOrders.map((order) => (
                        <Card key={`${order.type}-${order.id}`} className="p-6 bg-white border-neutral-100 shadow-sm hover:shadow-md transition-all rounded-[32px] group">
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${order.type === 'product' ? 'bg-orange-50 text-orange-500' :
                                        order.type === 'design' ? 'bg-purple-50 text-purple-500' :
                                            'bg-blue-50 text-blue-500'
                                    }`}>
                                    {getIcon(order.type)}
                                </div>

                                <div className="flex-1 text-center md:text-left space-y-1">
                                    <div className="flex items-center justify-center md:justify-start gap-3">
                                        <h3 className="font-black text-lg text-neutral-900 uppercase tracking-tight">#{order.number}</h3>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                            {order.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-neutral-900 capitalize">{order.title}</p>
                                    <p className="text-xs text-neutral-500 font-medium">{new Date(order.date).toLocaleDateString()}</p>
                                </div>

                                <div className="text-center md:text-right px-4 min-w-[120px]">
                                    {order.amount ? (
                                        <>
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total</p>
                                            <p className="text-xl font-black text-neutral-900 italic">৳{order.amount.toLocaleString()}</p>
                                        </>
                                    ) : (
                                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Pricing TBD</span>
                                    )}
                                </div>

                                <Link href={order.link}>
                                    <Button variant="outline" className="w-[140px] h-12 rounded-2xl border-2 border-neutral-100 hover:border-neutral-200 font-black uppercase tracking-widest text-[10px]">
                                        View Details <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
