"use client"

import { useState, useEffect } from "react";
import { FolderOpen, Eye, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function DesignerProjectsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        async function fetchProjects() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch service requests (for construction assignments)
            // Also fetch by user_id in case there's no designer profile yet
            let designerId: string | null = null;
            const { data: designer } = await supabase.from('designers').select('id').eq('user_id', user.id).maybeSingle();
            if (designer) designerId = designer.id;

            // Fetch service requests
            const sRequestsQuery = supabase
                .from('service_requests')
                .select('*, customer:profiles(full_name)')
                .order('created_at', { ascending: false });
            if (designerId) {
                sRequestsQuery.eq('assigned_designer_id', designerId);
            } else {
                // No designer id, skip by using an impossible condition
                sRequestsQuery.eq('id', '00000000-0000-0000-0000-000000000000');
            }
            const { data: sRequests } = await sRequestsQuery;

            // Fetch ALL design bookings and filter in-memory by user_id OR designer.id
            const { data: dBookings } = await supabase
                .from('design_bookings')
                .select('*')
                .order('created_at', { ascending: false });

            const myDesignBookings = (dBookings || []).filter((b: any) => {
                // Direct assignment match
                const isDirectlyAssigned = (designerId && (b.assigned_designer_id === designerId || b.assigned_seller_id === designerId));
                
                // Survey request match - check by partner_user_id (most reliable) OR partner_id
                const hasSurveyInvite = b.details?.survey_requests?.some((r: any) => 
                    r.partner_user_id === user.id || 
                    (designerId && r.partner_id === designerId)
                );
                
                return isDirectlyAssigned || hasSurveyInvite;
            });

            // Fetch customer profiles for design bookings
            const bookingUserIds = [...new Set(myDesignBookings.map((b: any) => b.user_id).filter(Boolean))];
            let customerMap: Record<string, any> = {};
            if (bookingUserIds.length > 0) {
                const { data: customers } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .in('id', bookingUserIds);
                (customers || []).forEach((c: any) => { customerMap[c.id] = c; });
            }

            // Merge lists
            const mergedProjects = [
                ...(sRequests || []).map(p => ({
                    ...p,
                    isDesignBooking: false,
                    displayName: p.request_number || `SR-${p.id.slice(0, 6)}`,
                    location: p.requirements?.location || '-',
                    displayStatus: p.status,
                    link: `/dashboard/designer/projects/${p.id}`,
                    displayType: p.service_type?.replace(/_/g, ' '),
                    customerName: p.customer?.full_name
                })),
                ...myDesignBookings.map(b => {
                    const surveyReq = b.details?.survey_requests?.find((r: any) => 
                        r.partner_user_id === user.id || (designerId && r.partner_id === designerId)
                    );
                    const surveyStatus = surveyReq?.status;
                    
                    return {
                        ...b,
                        isDesignBooking: true,
                        displayName: `DB-${b.id.slice(0, 8).toUpperCase()}`,
                        location: b.details?.location || b.details?.preferredSchedule?.location || '-',
                        displayStatus: surveyStatus === 'pending' ? 'survey pending' : 
                                       surveyStatus === 'accepted' ? 'survey accepted' : b.status,
                        link: `/dashboard/designer/survey/${b.id}`,
                        displayType: `${b.service_type || 'Interior'} Design`,
                        customerName: customerMap[b.user_id]?.full_name || 'N/A',
                        surveySchedule: surveyReq?.schedule
                    };
                })
            ];

            setProjects(mergedProjects);
            setLoading(false);
        }
        fetchProjects();
    }, []);

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-neutral-900">My Projects</h1>
                <p className="text-neutral-500 mt-1">Manage all your design assignments and track progress.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-neutral-50 text-neutral-500 font-medium">
                        <tr>
                            <th className="p-4">Project ID</th>
                            <th className="p-4">Service Type</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Location</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {projects.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-12 text-center text-neutral-400">
                                    <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    No projects assigned yet.
                                </td>
                            </tr>
                        ) : projects.map((proj) => (
                            <tr key={proj.id} className="hover:bg-neutral-50 transition-colors">
                                <td className="p-4 font-mono font-medium">{proj.displayName || proj.request_number}</td>
                                <td className="p-4 capitalize font-bold text-neutral-800">{proj.displayType || proj.service_type?.replace(/_/g, ' ')}</td>
                                <td className="p-4">{proj.customerName || proj.customer?.full_name || 'N/A'}</td>
                                <td className="p-4">{proj.location || '-'}</td>
                                <td className="p-4">
                                    <Badge variant="outline" className="capitalize">
                                        {(proj.displayStatus || proj.status)?.replace(/_/g, ' ')}
                                    </Badge>
                                </td>
                                <td className="p-4 text-neutral-500">{format(new Date(proj.created_at), 'MMM d, yyyy')}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="outline">
                                            <MessageSquare className="w-4 h-4" />
                                        </Button>
                                        {proj.link ? (
                                            <Link href={proj.link}>
                                                <Button size="sm">
                                                    <Eye className="w-4 h-4 mr-2" /> View
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Button size="sm">
                                                <Eye className="w-4 h-4 mr-2" /> View
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
