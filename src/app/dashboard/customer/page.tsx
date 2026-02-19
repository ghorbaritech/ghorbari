'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    Clock,
    Package,
    Video,
    FileText,
    ChevronRight,
    MapPin,
    Calendar,
    ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'

export default function CustomerDashboard() {
    const [requests, setRequests] = useState<any[]>([])
    const [designBookings, setDesignBookings] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [profile, setProfile] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            setProfile(prof)

            // Get service requests
            const { data: reqs } = await supabase.from('service_requests').select('*').eq('customer_id', user.id)
            setRequests(reqs || [])

            // Get design bookings
            const { data: designs } = await supabase.from('design_bookings').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
            setDesignBookings(designs || [])

            // Get orders
            const { data: ords } = await supabase.from('orders').select('*').eq('customer_id', user.id)
            setOrders(ords || [])
        }
        fetchData()
    }, [])

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <header className="mb-12">
                    <h1 className="text-5xl font-black text-neutral-900 tracking-tighter mb-2 italic">Dashboard</h1>
                    <p className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest pl-1">Member ID: {profile?.id?.slice(0, 8).toUpperCase()}</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Section: Service Requests */}
                    <div className="lg:col-span-8 space-y-8">
                        <section className="space-y-6">
                            <div className="flex justify-between items-center px-2">
                                <h2 className="text-xl font-black text-neutral-900 tracking-tight uppercase italic flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-neutral-400" /> Active Design Journeys
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {designBookings.map((booking) => (
                                    <Card key={booking.id} className="p-8 border-none bg-white rounded-[40px] shadow-sm hover:shadow-md transition-shadow group">
                                        <div className="flex flex-col md:flex-row justify-between gap-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                                        booking.status === 'verified' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                    <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">ID #{booking.id.slice(0, 8)}</span>
                                                </div>
                                                <h3 className="text-2xl font-black text-neutral-900 italic tracking-tight capitalize group-hover:text-primary-600 transition-colors">
                                                    {booking.service_type} Design
                                                </h3>
                                                <div className="flex flex-wrap gap-6">
                                                    <div className="flex items-center gap-2 text-neutral-500 font-bold text-xs uppercase">
                                                        <Calendar className="w-4 h-4" /> Booked {new Date(booking.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col justify-end gap-3 min-w-[200px]">
                                                <Link href={`/dashboard/customer/design/${booking.id}`}>
                                                    <Button variant="outline" className="w-full border-2 border-neutral-100 font-black uppercase text-[10px] tracking-widest h-14 rounded-3xl group-hover:border-neutral-200">
                                                        View Status
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            <div className="h-px bg-neutral-200/50 my-8" />

                            <div className="flex justify-between items-center px-2">
                                <h2 className="text-xl font-black text-neutral-900 tracking-tight uppercase italic flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-neutral-400" /> Other Service Requests
                                </h2>
                                <Button variant="ghost" className="text-xs font-black uppercase text-neutral-400 hover:text-neutral-900 transition-colors">
                                    View Archive <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {requests.length === 0 && designBookings.length === 0 ? (
                                    <Card className="p-12 border-none bg-white rounded-[40px] text-center shadow-sm">
                                        <p className="text-neutral-400 font-bold uppercase text-xs tracking-widest">No active requests. Start your journey with a design session.</p>
                                        <Button className="mt-6 bg-neutral-900 font-black uppercase text-[10px] tracking-widest h-12 px-8 rounded-2xl">Book Expert now</Button>
                                    </Card>
                                ) : (
                                    requests.map((req) => (
                                        <Card key={req.id} className="p-8 border-none bg-white rounded-[40px] shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${req.status === 'pending_assignment' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                                            }`}>
                                                            {req.status.replace('_', ' ')}
                                                        </span>
                                                        <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">SR #{req.request_number}</span>
                                                    </div>
                                                    <h3 className="text-2xl font-black text-neutral-900 italic tracking-tight capitalize group-hover:text-primary-600 transition-colors">
                                                        {req.service_type.replace('_', ' ')}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-6">
                                                        <div className="flex items-center gap-2 text-neutral-500 font-bold text-xs uppercase">
                                                            <MapPin className="w-4 h-4" /> {req.requirements.location}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-neutral-500 font-bold text-xs uppercase">
                                                            <Calendar className="w-4 h-4" /> Submitted {new Date(req.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col justify-end gap-3 min-w-[200px]">
                                                    {req.consultation_scheduled_at ? (
                                                        <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black uppercase text-[10px] tracking-widest h-14 rounded-3xl shadow-lg shadow-primary-100">
                                                            <Video className="w-4 h-4 mr-2" /> Join Meeting
                                                        </Button>
                                                    ) : (
                                                        <Button variant="outline" className="w-full border-2 border-neutral-100 font-black uppercase text-[10px] tracking-widest h-14 rounded-3xl group-hover:border-neutral-200">
                                                            Manage Session
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" className="w-full font-black uppercase text-[10px] tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors">
                                                        <FileText className="w-4 h-4 mr-2" /> View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Section: Orders & Metrics */}
                    <div className="lg:col-span-4 space-y-8">
                        <section className="space-y-6">
                            <h2 className="text-xl font-black text-neutral-900 tracking-tight uppercase italic flex items-center gap-2 px-2">
                                <Package className="w-5 h-5 text-neutral-400" /> Recent Purchases
                            </h2>
                            <div className="space-y-4">
                                {orders.length === 0 ? (
                                    <div className="p-8 bg-neutral-200/30 rounded-[40px] border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-center">
                                        <p className="text-neutral-400 font-black uppercase text-[10px] tracking-widest">No order history found</p>
                                    </div>
                                ) : (
                                    orders.map((order) => (
                                        <Card key={order.id} className="p-6 border-none bg-white rounded-3xl shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">ORD #{order.order_number}</p>
                                                    <p className="text-sm font-black text-neutral-900">৳{order.total_amount}</p>
                                                </div>
                                                <span className="text-[10px] font-black bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase">
                                                    {order.order_status}
                                                </span>
                                            </div>
                                            <Link href={`/dashboard/customer/orders/${order.id}`} className="w-full">
                                                <Button variant="outline" className="w-full h-10 rounded-xl border-neutral-100 font-bold text-xs uppercase tracking-tight hover:bg-neutral-50 hover:border-neutral-200 transition-all">
                                                    Track Shipment
                                                </Button>
                                            </Link>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Marketplace Quick Link */}
                        <Link href="/products" className="block">
                            <Card className="p-8 border-none bg-neutral-900 text-white rounded-[40px] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700" />
                                <div className="space-y-4 relative">
                                    <h3 className="text-3xl font-black italic tracking-tighter leading-none">Need <br />Materials?</h3>
                                    <p className="text-neutral-400 font-bold text-[10px] uppercase tracking-widest">Browse the shop Marketplace</p>
                                    <ArrowUpRight className="w-8 h-8 text-primary-500" />
                                </div>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
