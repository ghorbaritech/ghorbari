'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    CheckCircle2,
    Package,
    Truck,
    MapPin,
    Calendar,
    ChevronLeft,
    MessageSquare,
    Star
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { RateOrderModal } from '@/components/reviews/RateOrderModal'

export default function OrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchOrder() {
            if (!params.id) return

            const { data: orderData, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    seller:sellers!seller_id (
                        business_name
                    )
                `)
                .eq('id', params.id)
                .single()

            if (error) {
                console.error('Error fetching order:', JSON.stringify(error, null, 2))
            } else {
                setOrder(orderData)
            }
            setLoading(false)
        }
        fetchOrder()
    }, [params.id])

    const updateStatus = async (newStatus: string) => {
        if (!order) return
        const { error } = await supabase
            .from('orders')
            .update({ order_status: newStatus })
            .eq('id', order.id)

        if (!error) {
            setOrder({ ...order, order_status: newStatus })
        }
    }

    if (loading) return <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">Loading...</div>
    if (!order) return <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">Order not found</div>

    const steps = [
        { status: 'pending', label: 'Order Placed', icon: Package },
        { status: 'processing', label: 'Processing', icon: CheckCircle2 },
        { status: 'shipped', label: 'Shipped', icon: Truck },
        { status: 'delivered', label: 'Delivered', icon: MapPin },
    ]

    const currentStepIndex = steps.findIndex(s => s.status === order.order_status)
    // If status is not in the list (e.g. cancelled), handle gracefully or assume pending for now
    const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-white rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6 text-neutral-600" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-neutral-900 tracking-tight italic uppercase">Order #{order.order_number}</h1>
                        <p className="text-neutral-500 font-bold text-xs uppercase tracking-widest">
                            Placed on {new Date(order.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Timeline */}
                <Card className="p-8 border-none bg-white rounded-[40px] shadow-sm">
                    <h2 className="text-lg font-black text-neutral-900 uppercase tracking-widest mb-8">Order Status</h2>
                    <div className="relative flex justify-between">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-neutral-100 -translate-y-1/2 z-0"></div>
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-primary-600 -translate-y-1/2 z-0 transition-all duration-500"
                            style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                        ></div>

                        {steps.map((step, index) => {
                            const isCompleted = index <= activeIndex
                            const Icon = step.icon
                            return (
                                <div key={step.status} className="relative z-10 flex flex-col items-center gap-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors duration-300 ${isCompleted ? 'bg-primary-600 border-primary-100 text-white' : 'bg-white border-neutral-100 text-neutral-300'
                                        }`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${isCompleted ? 'text-neutral-900' : 'text-neutral-300'
                                        }`}>
                                        {step.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Items & Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Items */}
                        <Card className="p-8 border-none bg-white rounded-[40px] shadow-sm">
                            <h2 className="text-lg font-black text-neutral-900 uppercase tracking-widest mb-6">Items</h2>
                            <div className="space-y-6">
                                {order.items && Array.isArray(order.items) && order.items.map((item: any, i: number) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <div className="relative w-20 h-20 bg-neutral-50 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-100">
                                            {item.image ? (
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            ) : (
                                                <Package className="w-8 h-8 text-neutral-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-neutral-900">{item.name}</h3>
                                            <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                                            <p className="text-sm font-bold text-primary-600 mt-1">৳{item.price?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Delivery Info */}
                        <Card className="p-8 border-none bg-white rounded-[40px] shadow-sm">
                            <h2 className="text-lg font-black text-neutral-900 uppercase tracking-widest mb-6">Delivery Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Shipping Address</p>
                                    <p className="font-bold text-neutral-800 text-sm">
                                        {/* Display shipping address from order JSONB or fallback */}
                                        {typeof order.shipping_address === 'string'
                                            ? order.shipping_address
                                            : (order.shipping_address?.address || order.shipping_address?.fullAddress || "Address not provided")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Estimated Delivery</p>
                                    <p className="font-bold text-neutral-800 text-sm flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary-600" /> 3-5 Business Days
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right: Actions & Summary */}
                    <div className="space-y-8">
                        <Card className="p-8 border-none bg-neutral-900 text-white rounded-[40px] shadow-xl">
                            <h2 className="text-lg font-black uppercase tracking-widest mb-6 opacity-80">Summary</h2>
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">Subtotal</span>
                                    <span className="font-bold">৳{order.total_amount?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-400">Delivery</span>
                                    <span className="font-bold text-primary-400">Free</span>
                                </div>
                                <div className="h-px bg-white/10 my-4" />
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-black uppercase text-neutral-400">Total</span>
                                    <span className="text-2xl font-black italic">৳{order.total_amount?.toLocaleString()}</span>
                                </div>
                            </div>

                            {order.order_status === 'delivered' ? (
                                <div className="space-y-3">
                                    <div className="bg-green-500/20 text-green-400 p-4 rounded-2xl text-center font-bold text-sm border border-green-500/30">
                                        <CheckCircle2 className="w-5 h-5 mx-auto mb-1" />
                                        Order Completed
                                    </div>
                                    <RateOrderModal
                                        orderId={order.id}
                                        sellerId={order.seller_id}
                                        items={order.items || []}
                                    >
                                        <Button className="w-full bg-white text-neutral-900 hover:bg-neutral-100 font-black uppercase tracking-widest rounded-2xl h-12">
                                            <Star className="w-4 h-4 mr-2" /> Rate Seller
                                        </Button>
                                    </RateOrderModal>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {order.order_status === 'shipped' && (
                                        <Button
                                            onClick={() => updateStatus('delivered')}
                                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest rounded-2xl h-12 shadow-lg shadow-primary-900/50"
                                        >
                                            Confirm Receipt
                                        </Button>
                                    )}
                                    <Link href={`/dashboard/customer/messages?partnerId=${order.seller_id}`} className="w-full">
                                        <Button variant="outline" className="w-full border-neutral-700 hover:bg-neutral-800 text-white font-black uppercase tracking-widest rounded-2xl h-12">
                                            <MessageSquare className="w-4 h-4 mr-2" /> Chat with Seller
                                        </Button>
                                    </Link>
                                    <Button variant="ghost" className="w-full text-neutral-400 hover:text-white font-bold uppercase tracking-widest text-xs">
                                        Need Help?
                                    </Button>
                                </div>
                            )}
                        </Card>

                        {/* Seller Info */}
                        {order.seller && (
                            <Card className="p-6 border-none bg-white rounded-[32px] shadow-sm">
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Sold By</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center font-black text-lg text-neutral-400">
                                        {order.seller.business_name?.[0] || 'S'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-neutral-900">{order.seller.business_name || 'Retailer'}</h3>
                                        <p className="text-xs text-neutral-500">Verified Partner</p>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
