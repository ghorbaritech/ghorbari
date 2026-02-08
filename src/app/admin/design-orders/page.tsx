"use client"

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Sidebar } from "@/components/admin/Sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, Search, Filter } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function DesignOrdersPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, verified
    const supabase = createClient();

    useEffect(() => {
        fetchBookings();
    }, [filter]);

    async function fetchBookings() {
        setLoading(true);
        let query = supabase
            .from('design_bookings')
            .select(`
                *,
                profiles:user_id (full_name, phone_number, email)
            `)
            .order('created_at', { ascending: false });

        if (filter !== 'all') {
            query = query.eq('status', filter);
        }

        const { data, error } = await query;
        if (error) console.error(error);
        else setBookings(data || []);

        setLoading(false);
    }

    return (
        <div className="flex bg-neutral-50 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-neutral-900">Design Orders</h1>
                        <p className="text-neutral-500 font-bold text-sm">Manage architectural and interior design requests</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm mb-6 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                        <Input placeholder="Search orders..." className="pl-10 h-10 bg-neutral-50 border-none" />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'pending', 'verified', 'completed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border ${filter === status
                                        ? 'bg-neutral-900 text-white border-neutral-900'
                                        : 'bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-100">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs font-black text-neutral-400 uppercase tracking-widest">Order ID</th>
                                <th className="text-left py-4 px-6 text-xs font-black text-neutral-400 uppercase tracking-widest">Customer</th>
                                <th className="text-left py-4 px-6 text-xs font-black text-neutral-400 uppercase tracking-widest">Service</th>
                                <th className="text-left py-4 px-6 text-xs font-black text-neutral-400 uppercase tracking-widest">Date</th>
                                <th className="text-left py-4 px-6 text-xs font-black text-neutral-400 uppercase tracking-widest">Status</th>
                                <th className="text-right py-4 px-6 text-xs font-black text-neutral-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-neutral-400 font-bold">Loading orders...</td></tr>
                            ) : bookings.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-neutral-400 font-bold">No orders found.</td></tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="py-4 px-6 font-mono text-xs text-neutral-500">
                                            {booking.id.slice(0, 8)}...
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-bold text-sm text-neutral-900">{booking.profiles?.full_name || 'Guest'}</div>
                                            <div className="text-xs text-neutral-400 font-medium">{booking.profiles?.phone_number}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-tight
                                                ${booking.service_type === 'architectural' ? 'bg-blue-50 text-blue-600' :
                                                    booking.service_type === 'structural' ? 'bg-orange-50 text-orange-600' :
                                                        'bg-purple-50 text-purple-600'}
                                             `}>
                                                {booking.service_type}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm font-bold text-neutral-600">
                                            {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}
                                        </td>
                                        <td className="py-4 px-6">
                                            <StatusBadge status={booking.status} />
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Link href={`/admin/design-orders/${booking.id}`}>
                                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg">
                                                    <Eye className="w-4 h-4 text-neutral-600" />
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-700",
        verified: "bg-blue-100 text-blue-700",
        assigned: "bg-purple-100 text-purple-700",
        completed: "bg-green-100 text-green-700",
        cancelled: "bg-red-100 text-red-700",
    };

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status] || "bg-gray-100 text-gray-700"}`}>
            {status}
        </span>
    );
}
