"use client"

import { useState, useEffect } from "react";
import { FolderOpen, Eye, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function DesignerProjectsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        async function fetchProjects() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: designer } = await supabase.from('designers').select('id').eq('user_id', user.id).single();

            if (designer) {
                const { data } = await supabase
                    .from('service_requests')
                    .select('*, customer:profiles(full_name)')
                    .eq('assigned_designer_id', designer.id)
                    .order('created_at', { ascending: false });
                setProjects(data || []);
            }
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
                                <td className="p-4 font-mono font-medium">{proj.request_number}</td>
                                <td className="p-4 capitalize font-bold text-neutral-800">{proj.service_type?.replace(/_/g, ' ')}</td>
                                <td className="p-4">{proj.customer?.full_name || 'N/A'}</td>
                                <td className="p-4">{proj.requirements?.location || '-'}</td>
                                <td className="p-4">
                                    <Badge variant="outline" className="capitalize">
                                        {proj.status?.replace(/_/g, ' ')}
                                    </Badge>
                                </td>
                                <td className="p-4 text-neutral-500">{format(new Date(proj.created_at), 'MMM d, yyyy')}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="outline">
                                            <MessageSquare className="w-4 h-4" />
                                        </Button>
                                        <Button size="sm">
                                            <Eye className="w-4 h-4 mr-2" /> View
                                        </Button>
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
