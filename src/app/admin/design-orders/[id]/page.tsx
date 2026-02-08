"use client"

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Sidebar } from "@/components/admin/Sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, UserPlus, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Label } from "@/components/ui/label";

export default function DesignOrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (id) fetchBooking();
    }, [id]);

    async function fetchBooking() {
        const { data, error } = await supabase
            .from('design_bookings')
            .select(`
                *,
                profiles:user_id (full_name, phone_number, email)
            `)
            .eq('id', id)
            .single();

        if (error) console.error(error);
        else setBooking(data);
        setLoading(false);
    }

    async function updateStatus(newStatus: string) {
        const { error } = await supabase
            .from('design_bookings')
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            setBooking({ ...booking, status: newStatus });
        }
    }

    if (loading) return <div className="p-8">Loading...</div>;
    if (!booking) return <div className="p-8">Order not found.</div>;

    const details = booking.details || {};

    return (
        <div className="flex bg-neutral-50 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-8">
                <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary-600" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
                </Button>

                <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm p-8 max-w-4xl">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8 border-b border-neutral-100 pb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-black text-neutral-900">Order #{booking.id.slice(0, 8)}</h1>
                                <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-bold uppercase tracking-widest">
                                    {booking.status}
                                </span>
                            </div>
                            <p className="text-neutral-500 font-bold text-sm">
                                Submitted {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })} via {booking.service_type} wizard
                            </p>
                        </div>

                        <div className="flex gap-3">
                            {booking.status === 'pending' && (
                                <>
                                    <Button onClick={() => updateStatus('verified')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                                        <Check className="w-4 h-4 mr-2" /> Verify Order
                                    </Button>
                                    <Button onClick={() => updateStatus('cancelled')} variant="destructive" className="font-bold">
                                        <XCircle className="w-4 h-4 mr-2" /> Reject
                                    </Button>
                                </>
                            )}
                            {booking.status === 'verified' && (
                                <Button onClick={() => updateStatus('assigned')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold">
                                    <UserPlus className="w-4 h-4 mr-2" /> Assign Engineer
                                </Button>
                            )}
                            {booking.status === 'assigned' && (
                                <Button onClick={() => updateStatus('completed')} className="bg-green-600 hover:bg-green-700 text-white font-bold">
                                    <Check className="w-4 h-4 mr-2" /> Mark Completed
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 bg-neutral-50 rounded-2xl p-6 mb-8 gap-8">
                        <div>
                            <Label className="text-xs font-black text-neutral-400 uppercase tracking-widest block mb-2">Customer Name</Label>
                            <p className="font-bold text-lg text-neutral-900">{booking.profiles?.full_name}</p>
                        </div>
                        <div>
                            <Label className="text-xs font-black text-neutral-400 uppercase tracking-widest block mb-2">Contact</Label>
                            <p className="font-bold text-lg text-neutral-900">{booking.profiles?.phone_number}</p>
                            <p className="text-sm text-neutral-500 font-medium">{booking.profiles?.email}</p>
                        </div>
                    </div>

                    {/* Order Details Grid */}
                    <div>
                        <h3 className="text-lg font-black text-neutral-900 mb-6 border-l-4 border-primary-600 pl-4 uppercase tracking-tight">Project Requirements</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {Object.entries(details).map(([key, value]) => {
                                // Format key
                                const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                                // Format value
                                let displayValue: any = value;
                                if (typeof value === 'boolean') displayValue = value ? 'Yes' : 'No';
                                if (Array.isArray(value)) displayValue = value.join(', ');
                                if (!value) displayValue = '-';

                                return (
                                    <div key={key} className="bg-white border rounded-xl p-4">
                                        <Label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">{formattedKey}</Label>
                                        <p className="font-bold text-neutral-800">{displayValue}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
