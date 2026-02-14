"use client"

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Flag, Calendar, ClipboardList } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

export default function PartnerTaskDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (id) fetchBooking();
    }, [id]);

    async function fetchBooking() {
        try {
            const { data: booking, error } = await supabase
                .from('design_bookings')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setBooking(booking);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function updateMilestoneStatus(index: number, newStatus: string) {
        const updatedMilestones = [...booking.milestones];
        updatedMilestones[index].status = newStatus;

        const { error } = await supabase
            .from('design_bookings')
            .update({ milestones: updatedMilestones })
            .eq('id', id);

        if (!error) {
            setBooking({ ...booking, milestones: updatedMilestones });
        } else {
            alert('Failed to update milestone');
        }
    }

    if (loading) return <div className="p-8">Loading...</div>;
    if (!booking) return <div className="p-8">Task not found.</div>;

    const details = booking.details || {};
    const milestones = booking.milestones || [];

    return (
        <div className="min-h-screen bg-[#F0F2F5] p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <Link href="/dashboard/seller">
                    <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary-600">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Button>
                </Link>

                <div className="bg-white rounded-[40px] shadow-sm p-8 md:p-12">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-black text-neutral-900 tracking-tight italic uppercase">Work Order #{booking.id.slice(0, 8)}</h1>
                                <Badge className="bg-neutral-900 text-white">{booking.service_type}</Badge>
                            </div>
                            <p className="text-neutral-500 font-bold text-sm uppercase tracking-widest">
                                Assigned Task
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Milestones (Editable) */}
                        <div className="space-y-8">
                            <h2 className="text-xl font-black text-neutral-900 tracking-tight uppercase flex items-center gap-2">
                                <Flag className="w-5 h-5 text-neutral-400" /> Milestone Tracker
                            </h2>
                            <div className="space-y-4">
                                {milestones.map((milestone: any, idx: number) => {
                                    const isCompleted = milestone.status === 'completed';

                                    return (
                                        <Card key={idx} className={`p-6 border-none bg-neutral-50 rounded-3xl ${isCompleted ? 'opacity-50' : ''}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-black text-lg text-neutral-900">{milestone.name}</h3>
                                                    {milestone.due_date && (
                                                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1 mt-1">
                                                            <Calendar className="w-3 h-3" /> Due: {new Date(milestone.due_date).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge className={isCompleted ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                                                    {milestone.status}
                                                </Badge>
                                            </div>

                                            {!isCompleted && (
                                                <Button
                                                    onClick={() => updateMilestoneStatus(idx, 'completed')}
                                                    className="w-full bg-neutral-900 text-white font-bold uppercase text-xs tracking-widest h-10 rounded-xl hover:bg-green-600 transition-colors"
                                                >
                                                    Mark as Completed
                                                </Button>
                                            )}
                                        </Card>
                                    );
                                })}
                                {milestones.length === 0 && <p className="text-neutral-400 italic">No milestones set by Admin.</p>}
                            </div>
                        </div>

                        {/* Project Details (Read Only) */}
                        <div className="space-y-6">
                            <Card className="p-8 border-none bg-neutral-50 rounded-[32px]">
                                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4" /> Requirements
                                </h3>
                                <div className="space-y-4">
                                    {Object.entries(details).map(([key, value]) => {
                                        const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                        let displayValue: any = value;
                                        if (typeof value === 'boolean') displayValue = value ? 'Yes' : 'No';
                                        if (Array.isArray(value)) displayValue = value.join(', ');
                                        if (!value) displayValue = '-';

                                        return (
                                            <div key={key} className="flex justify-between py-3 border-b border-neutral-200 last:border-0">
                                                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{formattedKey}</span>
                                                <span className="font-bold text-neutral-900 text-right">{displayValue}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>

                            <Card className="p-6 border-2 border-dashed border-red-200 bg-red-50/50 rounded-3xl">
                                <p className="text-xs font-bold text-red-500 uppercase tracking-widest text-center">
                                    Confidential: Do not share these details.
                                </p>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
