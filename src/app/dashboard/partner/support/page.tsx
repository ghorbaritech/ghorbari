'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Filter, MessageSquare, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { toast } from 'sonner' // Or standard alert replacement

import { useSearchParams } from 'next/navigation'

export default function SupportPage() {
    const searchParams = useSearchParams()
    const prefillOrderId = searchParams.get('order_id')

    const [tickets, setTickets] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(!!prefillOrderId)
    const [submitting, setSubmitting] = useState(false)

    const supabase = createClient()

    async function fetchData() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // 1. Fetch Tiickets
        const { data: tix } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
        setTickets(tix || [])

        // 2. Fetch Orders (for dropdown)
        // Need seller ID first
        const { data: seller } = await supabase.from('sellers').select('id').eq('user_id', user.id).single()
        if (seller) {
            const { data: ords } = await supabase
                .from('orders') // Assuming 'orders' table. The user mentioned "orders" page exists.
                .select('id, order_number, created_at') // Adjust columns based on actual schema
                .eq('seller_id', seller.id)
                .order('created_at', { ascending: false })
                .limit(20) // Just recent orders
            setOrders(ords || [])
        }

        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [prefillOrderId])

    async function handleCreateTicket(formData: FormData) {
        setSubmitting(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const ticketData = {
            user_id: user.id,
            ticket_number: `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            subject: formData.get('subject'),
            description: formData.get('description'),
            category: formData.get('category'),
            priority: formData.get('priority'),
            order_id: formData.get('order_id') === 'none' ? null : formData.get('order_id'),
            status: 'open'
        }

        const { error } = await supabase.from('support_tickets').insert(ticketData)

        if (error) {
            alert('Failed to create ticket: ' + error.message)
        } else {
            alert('Support Ticket Created Successfully!')
            setShowCreateForm(false)
            fetchData()
        }
        setSubmitting(false)
    }

    return (
        <div className="min-h-screen bg-[#F0F2F5] pb-20">
            <div className="max-w-[1600px] mx-auto p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-neutral-900 tracking-tight italic uppercase">Support Center</h1>
                        <p className="text-neutral-500 font-bold uppercase text-xs tracking-widest mt-2">Get help with orders, payments, and account issues</p>
                    </div>
                    <Button onClick={() => setShowCreateForm(true)} className="h-12 px-8 bg-neutral-900 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl hover:bg-black transition-all">
                        <Plus className="w-4 h-4 mr-2" /> Create Ticket
                    </Button>
                </div>

                {/* Ticket List */}
                <Card className="bg-white rounded-[40px] shadow-sm overflow-hidden border border-neutral-100 min-h-[400px]">
                    {loading ? (
                        <div className="p-20 text-center font-bold text-neutral-400 animate-pulse">Loading Tickets...</div>
                    ) : tickets.length === 0 ? (
                        <div className="p-20 text-center flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-300">
                                <MessageSquare className="w-10 h-10" />
                            </div>
                            <p className="font-black text-neutral-900 uppercase">No Support Tickets</p>
                            <p className="text-neutral-500 text-sm font-medium">Have an issue? Create a new ticket to get started.</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-neutral-50/50">
                                <tr>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">Ticket ID</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">Subject</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-neutral-400 uppercase tracking-widest">Category</th>
                                    <th className="px-8 py-6 text-center text-[10px] font-black text-neutral-400 uppercase tracking-widest">Priority</th>
                                    <th className="px-8 py-6 text-center text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-6 text-right text-[10px] font-black text-neutral-400 uppercase tracking-widest">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {tickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-neutral-50/50 transition-colors cursor-pointer" onClick={() => alert('View ticket details feature coming soon!')}>
                                        <td className="px-8 py-4 font-bold text-neutral-900">{ticket.ticket_number}</td>
                                        <td className="px-8 py-4">
                                            <div className="font-medium text-neutral-900">{ticket.subject}</div>
                                            {ticket.order_id && <div className="text-xs text-neutral-500 mt-1">Order #{ticket.order_id.substring(0, 8)}...</div>}
                                        </td>
                                        <td className="px-8 py-4">
                                            <Badge variant="secondary" className="bg-neutral-100 text-neutral-600 font-bold border-none capitalize">
                                                {ticket.category}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <span className={`text-xs font-black uppercase ${ticket.priority === 'urgent' ? 'text-red-600' :
                                                ticket.priority === 'high' ? 'text-orange-500' : 'text-neutral-500'
                                                }`}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase ${ticket.status === 'open' ? 'bg-blue-50 text-blue-600' :
                                                ticket.status === 'resolved' ? 'bg-green-50 text-green-600' :
                                                    'bg-neutral-100 text-neutral-600'
                                                }`}>
                                                {ticket.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-right text-xs font-bold text-neutral-400">
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Card>

                {/* Create Modal */}
                {showCreateForm && (
                    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
                        <Card className="w-full max-w-lg bg-white rounded-[40px] p-8 shadow-2xl relative">
                            <h2 className="text-2xl font-black text-neutral-900 italic tracking-tighter uppercase mb-6">New Support Ticket</h2>
                            <form action={handleCreateTicket} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Subject</label>
                                    <Input name="subject" required className="h-12 rounded-xl bg-neutral-50 border-none font-bold" placeholder="Brief summary of issue" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Category</label>
                                        <Select name="category" defaultValue="general">
                                            <SelectTrigger className="h-12 rounded-xl bg-neutral-50 border-none font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="z-[9999]">
                                                <SelectItem value="general">General Inquiry</SelectItem>
                                                <SelectItem value="order">Order Issue</SelectItem>
                                                <SelectItem value="payment">Payment/Payout</SelectItem>
                                                <SelectItem value="technical">Technical Problem</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Priority</label>
                                        <Select name="priority" defaultValue="normal">
                                            <SelectTrigger className="h-12 rounded-xl bg-neutral-50 border-none font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="z-[9999]">
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="normal">Normal</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="urgent">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Related Order (Optional)</label>
                                    <Select name="order_id" defaultValue={prefillOrderId || "none"}>
                                        <SelectTrigger className="h-12 rounded-xl bg-neutral-50 border-none font-bold">
                                            <SelectValue placeholder="Select an order..." />
                                        </SelectTrigger>
                                        <SelectContent className="z-[9999]">
                                            <SelectItem value="none">None / General Question</SelectItem>
                                            {orders.map(order => (
                                                <SelectItem key={order.id} value={order.id}>
                                                    Order #{order.order_number || order.id.substring(0, 8)} ({new Date(order.created_at).toLocaleDateString()})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Description</label>
                                    <textarea name="description" required className="w-full h-32 p-4 rounded-xl bg-neutral-50 border-none font-medium resize-none focus:outline-none focus:ring-2 focus:ring-neutral-200" placeholder="Please describe your issue in detail..." />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)} className="rounded-xl font-bold uppercase text-xs tracking-widest text-neutral-500">Cancel</Button>
                                    <Button type="submit" disabled={submitting} className="bg-neutral-900 text-white font-bold uppercase text-xs tracking-widest rounded-xl px-6">
                                        {submitting ? 'Creating...' : 'Submit Ticket'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
