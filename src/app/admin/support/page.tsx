'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    MessageSquare,
    Search,
    Filter,
    User,
    Store,
    CheckCircle2,
    Clock,
    AlertCircle,
    Palette,
    Wrench,
    Package
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    // For Retailer Tab Filters
    const [retailerTypeFilter, setRetailerTypeFilter] = useState('all') // all, seller, designer, service_provider

    const supabase = createClient()

    async function fetchTickets() {
        setLoading(true)

        // We need to join with profiles to get the role
        const { data, error } = await supabase
            .from('support_tickets')
            .select(`
                *,
                sender:profiles!user_id (
                    id,
                    full_name,
                    email,
                    role,
                    phone_number
                )
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching tickets:', error)
        } else {
            console.log('Fetched tickets:', data)
            setTickets(data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        const loadTickets = async () => {
            await fetchTickets()
        }
        loadTickets()
    }, [])

    // Filter Logic
    const customerTickets = tickets.filter(t => t.sender?.role === 'customer')
    const retailerTickets = tickets.filter(t => ['seller', 'designer', 'service_provider', 'partner'].includes(t.sender?.role))

    const getFilteredTickets = (ticketList: any[]) => {
        return ticketList.filter(ticket => {
            const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus
            const matchesSearch =
                ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ticket.sender?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ticket.sender?.email?.toLowerCase().includes(searchQuery.toLowerCase())

            // Retailer Type Filter (Only applies if looking at retailer list)
            let matchesType = true
            if (retailerTypeFilter !== 'all') {
                if (retailerTypeFilter === 'seller') matchesType = ticket.sender?.role === 'seller'
                if (retailerTypeFilter === 'designer') matchesType = ticket.sender?.role === 'designer'
                if (retailerTypeFilter === 'service_provider') matchesType = ticket.sender?.role === 'service_provider'
            }

            return matchesStatus && matchesSearch && matchesType
        })
    }

    const TicketCard = ({ ticket }: { ticket: any }) => (
        <div key={ticket.id} className="flex items-center justify-between p-4 bg-white border border-neutral-100 rounded-2xl hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg uppercase
                    ${ticket.sender?.role === 'customer' ? 'bg-blue-100 text-blue-600' :
                        ticket.sender?.role === 'seller' ? 'bg-orange-100 text-orange-600' :
                            ticket.sender?.role === 'designer' ? 'bg-purple-100 text-purple-600' :
                                'bg-green-100 text-green-600'
                    }`}>
                    {ticket.sender?.full_name?.[0] || '?'}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-xs text-neutral-400 uppercase tracking-widest">{ticket.ticket_number}</span>
                        <Badge variant="outline" className={`
                            text-[10px] font-bold uppercase tracking-widest border-none
                            ${ticket.status === 'open' ? 'bg-blue-50 text-blue-600' :
                                ticket.status === 'resolved' ? 'bg-green-50 text-green-600' :
                                    'bg-neutral-100 text-neutral-500'}
                        `}>
                            {ticket.status}
                        </Badge>
                        {/* Retailer Type Badge */}
                        {ticket.sender?.role !== 'customer' && (
                            <Badge variant="secondary" className="text-[10px] bg-neutral-100 text-neutral-600">
                                {ticket.sender?.role === 'seller' ? 'Product' :
                                    ticket.sender?.role === 'designer' ? 'Design' :
                                        ticket.sender?.role === 'service_provider' ? 'Service' : ticket.sender?.role}
                            </Badge>
                        )}
                    </div>
                    <h3 className="font-bold text-neutral-900 leading-tight">{ticket.subject}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-neutral-500">{ticket.sender?.full_name} ({ticket.sender?.role})</span>
                        <span className="text-neutral-300">•</span>
                        <span className="text-xs text-neutral-400">{formatDistanceToNow(new Date(ticket.created_at))} ago</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-end gap-2">
                <Badge className={`
                    uppercase text-[10px] font-black tracking-widest
                    ${ticket.priority === 'urgent' ? 'bg-red-100 text-red-600 hover:bg-red-200' :
                        ticket.priority === 'high' ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' :
                            'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}
                `}>
                    {ticket.priority}
                </Badge>
                <Button size="sm" variant="ghost" className="h-8 text-neutral-400 group-hover:text-neutral-900 group-hover:bg-neutral-100">
                    View Details
                </Button>
            </div>
        </div>
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-neutral-900 italic tracking-tighter uppercase">Support Center</h1>
                    <p className="text-neutral-500 font-bold uppercase text-xs tracking-widest mt-2">{tickets.length} Total Tickets • {tickets.filter(t => t.status === 'open').length} Open</p>
                </div>
                {/* Global Actions / Search */}
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                            placeholder="Search tickets..."
                            className="pl-9 bg-white border-none rounded-xl h-11 font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Tabs defaultValue="customers" className="space-y-6">
                <TabsList className="bg-white p-1 rounded-2xl border border-neutral-100 h-14 w-full md:w-auto flex">
                    <TabsTrigger value="customers" className="flex-1 md:flex-none rounded-xl h-12 px-8 font-black uppercase text-xs tracking-widest data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all">
                        <User className="w-4 h-4 mr-2" /> Customers
                        <span className="ml-2 bg-neutral-100 text-neutral-900 data-[state=active]:bg-neutral-700 data-[state=active]:text-white rounded-full px-2 py-0.5 text-[10px]">{customerTickets.length}</span>
                    </TabsTrigger>
                    <TabsTrigger value="retailers" className="flex-1 md:flex-none rounded-xl h-12 px-8 font-black uppercase text-xs tracking-widest data-[state=active]:bg-neutral-900 data-[state=active]:text-white transition-all">
                        <Store className="w-4 h-4 mr-2" /> Retailers & Partners
                        <span className="ml-2 bg-neutral-100 text-neutral-900 data-[state=active]:bg-neutral-700 data-[state=active]:text-white rounded-full px-2 py-0.5 text-[10px]">{retailerTickets.length}</span>
                    </TabsTrigger>
                </TabsList>

                {/* --- CUSTOMERS TAB --- */}
                <TabsContent value="customers" className="space-y-4">
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        {['all', 'open', 'resolved', 'closed'].map(status => (
                            <Button
                                key={status}
                                variant={filterStatus === status ? 'default' : 'outline'}
                                onClick={() => setFilterStatus(status)}
                                className={`rounded-full h-8 text-[10px] font-black uppercase tracking-widest px-4 ${filterStatus === status ? 'bg-neutral-900' : 'border-neutral-200 text-neutral-500'}`}
                            >
                                {status}
                            </Button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        {loading ? (
                            <div className="p-12 text-center text-neutral-400 font-bold uppercase text-xs tracking-widest animate-pulse">Loading tickets...</div>
                        ) : getFilteredTickets(customerTickets).length === 0 ? (
                            <div className="p-12 text-center text-neutral-400 font-bold uppercase text-xs tracking-widest border border-dashed border-neutral-200 rounded-3xl">No tickets found</div>
                        ) : (
                            getFilteredTickets(customerTickets).map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)
                        )}
                    </div>
                </TabsContent>

                {/* --- RETAILERS TAB --- */}
                <TabsContent value="retailers" className="space-y-4">
                    {/* Retailer Specific Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-4 items-start md:items-center justify-between">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {['all', 'open', 'resolved', 'closed'].map(status => (
                                <Button
                                    key={status}
                                    variant={filterStatus === status ? 'default' : 'outline'}
                                    onClick={() => setFilterStatus(status)}
                                    className={`rounded-full h-8 text-[10px] font-black uppercase tracking-widest px-4 ${filterStatus === status ? 'bg-neutral-900' : 'border-neutral-200 text-neutral-500'}`}
                                >
                                    {status}
                                </Button>
                            ))}
                        </div>

                        {/* Type Filters: Product, Service, Design */}
                        <div className="flex gap-2">
                            <Button
                                variant={retailerTypeFilter === 'all' ? 'secondary' : 'ghost'}
                                onClick={() => setRetailerTypeFilter('all')}
                                className="h-9 px-4 rounded-xl text-xs font-bold"
                            >
                                All Types
                            </Button>
                            <Button
                                variant={retailerTypeFilter === 'seller' ? 'secondary' : 'ghost'}
                                onClick={() => setRetailerTypeFilter('seller')}
                                className="h-9 px-4 rounded-xl text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100"
                            >
                                <Package className="w-3 h-3 mr-2" /> Product
                            </Button>
                            <Button
                                variant={retailerTypeFilter === 'service_provider' ? 'secondary' : 'ghost'}
                                onClick={() => setRetailerTypeFilter('service_provider')}
                                className="h-9 px-4 rounded-xl text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100"
                            >
                                <Wrench className="w-3 h-3 mr-2" /> Service
                            </Button>
                            <Button
                                variant={retailerTypeFilter === 'designer' ? 'secondary' : 'ghost'}
                                onClick={() => setRetailerTypeFilter('designer')}
                                className="h-9 px-4 rounded-xl text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100"
                            >
                                <Palette className="w-3 h-3 mr-2" /> Design
                            </Button>
                            <Button
                                variant={retailerTypeFilter === 'other' ? 'secondary' : 'ghost'}
                                onClick={() => setRetailerTypeFilter('other')}
                                className="h-9 px-4 rounded-xl text-xs font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200"
                            >
                                Other
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {loading ? (
                            <div className="p-12 text-center text-neutral-400 font-bold uppercase text-xs tracking-widest animate-pulse">Loading tickets...</div>
                        ) : getFilteredTickets(retailerTickets).length === 0 ? (
                            <div className="p-12 text-center text-neutral-400 font-bold uppercase text-xs tracking-widest border border-dashed border-neutral-200 rounded-3xl">No tickets found</div>
                        ) : (
                            getFilteredTickets(retailerTickets).map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
