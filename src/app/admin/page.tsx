'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { assignDesigner, scheduleConsultation } from '@/app/services/actions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    Users,
    Briefcase,
    ShoppingBag,
    AlertCircle,
    CheckCircle2,
    Clock,
    ArrowRight,
    UserPlus,
    Video,
    Calendar,
    X
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
    const [requests, setRequests] = useState<any[]>([])
    const [designers, setDesigners] = useState<any[]>([])
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeProjects: 0,
        pendingRequests: 0,
        totalSales: 0
    })
    const [selectedRequest, setSelectedRequest] = useState<any>(null)
    const [schedulingRequest, setSchedulingRequest] = useState<any>(null)
    const [isAssigning, setIsAssigning] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        let isMounted = true;
        async function fetchData() {
            try {
                // Fetch service requests
                const { data: reqs, error: reqError } = await supabase.from('service_requests').select('*').order('created_at', { ascending: false })
                if (reqError && Object.keys(reqError).length > 0) {
                    console.error('Service Requests Fetch Error:', reqError)
                }

                // Fetch designers for assignment
                const { data: des, error: desError } = await supabase.from('designers').select('*').eq('verification_status', 'verified')
                if (desError && Object.keys(desError).length > 0) {
                    console.error('Designers Fetch Error:', desError)
                }

                // Fetch general stats
                const { count: userCount, error: countError } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
                if (countError && Object.keys(countError).length > 0) {
                    console.error('Profiles Count Error:', countError)
                }

                if (!isMounted) return

                setRequests(reqs || [])
                setDesigners(des || [])

                const activeProjects = (reqs || []).filter((r: any) => r.status === 'in_progress').length
                const pendingReqs = (reqs || []).filter((r: any) => r.status === 'pending_assignment').length

                setStats({
                    totalUsers: userCount || 0,
                    activeProjects,
                    pendingRequests: pendingReqs,
                    totalSales: 0
                })
            } catch (err: any) {
                if (err && Object.keys(err).length > 0) {
                    console.error('CRITICAL FETCH ERROR:', err);
                }
            }
        }
        fetchData()
        return () => { isMounted = false }
    }, [])

    const handleAssign = async (designerId: string) => {
        setIsAssigning(true)
        const result = await assignDesigner(selectedRequest.id, designerId)
        if (result.success) {
            // Refresh requests
            const { data: updatedReqs } = await supabase.from('service_requests').select('*').order('created_at', { ascending: false })
            setRequests(updatedReqs || [])
            setSelectedRequest(null)
        }
        setIsAssigning(false)
    }

    return (
        <div className="bg-transparent animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="max-w-7xl mx-auto space-y-10">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight italic">Platform Orchestrator</h1>
                        <p className="text-neutral-400 font-medium">Monitoring the Ghorbari ecosystem & service workflows</p>
                    </div>
                    {/* Only show for Admin role */}
                    <div className="flex gap-4">
                        <Link href="/admin/onboarding">
                            <Button variant="outline" className="rounded-xl font-bold border-neutral-800 text-white bg-neutral-900 hover:bg-neutral-800 hover:text-white">
                                <UserPlus className="w-4 h-4 mr-2" /> Onboard Partner
                            </Button>
                        </Link>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <Card className="p-6 border-neutral-800 bg-neutral-900/50 shadow-sm rounded-3xl backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Total Users</p>
                                <p className="text-2xl font-black text-white">{stats.totalUsers}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 border-neutral-800 bg-neutral-900/50 shadow-sm rounded-3xl backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Active Projects</p>
                                <p className="text-2xl font-black text-white">{stats.activeProjects}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 border-orange-500/20 bg-orange-500/5 shadow-sm rounded-3xl backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-500/10 text-orange-400 rounded-2xl border border-orange-500/20">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-orange-400/80 uppercase tracking-wider">Pending Tasks</p>
                                <p className="text-2xl font-black text-orange-400">{stats.pendingRequests}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 border-neutral-800 bg-neutral-900/50 shadow-sm rounded-3xl backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Total Revenue</p>
                                <p className="text-2xl font-black text-white">৳{stats.totalSales}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Active Service Requests */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-neutral-500" /> Recent Service Requests
                        </h2>
                        <div className="space-y-4">
                            {requests.map((req) => (
                                <Card key={req.id} className="p-6 border-neutral-800 bg-neutral-900/50 shadow-sm rounded-3xl hover:border-neutral-700 transition-all group backdrop-blur-sm">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[10px] font-black bg-neutral-800 px-2 py-0.5 rounded text-neutral-400 uppercase tracking-tighter border border-neutral-700">REQ #{req.request_number}</span>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter border ${req.status === 'pending_assignment' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    }`}>
                                                    {req.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white capitalize">{req.service_type?.replace('_', ' ')}</h3>
                                            <p className="text-sm text-neutral-500 font-medium">{req.requirements?.location || 'Unknown Location'} • {req.requirements?.plotSize || 0} sqft • {req.requirements?.floors || 0} Floors</p>
                                        </div>
                                        {req.status === 'pending_assignment' && (
                                            <Button
                                                onClick={() => setSelectedRequest(req)}
                                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 border-none pt-2"
                                            >
                                                Assign Designer <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        )}
                                        {req.status === 'assigned' && (
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-neutral-500 uppercase">Assigned To</p>
                                                    <p className="text-sm font-bold text-white">Sarah Chen Studio</p>
                                                </div>
                                                <Button
                                                    onClick={() => setSchedulingRequest(req)}
                                                    variant="outline"
                                                    className="border-blue-500/30 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 font-bold rounded-xl"
                                                >
                                                    <Video className="w-4 h-4 mr-2" /> Schedule Call
                                                </Button>
                                            </div>
                                        )}
                                        {req.status === 'consultation_scheduled' && (
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-emerald-400 uppercase">Call Scheduled</p>
                                                <p className="text-xs font-bold text-neutral-400">{new Date(req.consultation_scheduled_at).toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                            {requests.length === 0 && (
                                <div className="p-10 border border-neutral-800 border-dashed rounded-3xl text-center">
                                    <p className="text-neutral-500 font-bold">No recent service requests found.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar - Platform Health/Notifications */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white">Ecosystem Status</h2>
                        <Card className="p-6 border-neutral-800 bg-neutral-900/50 shadow-sm rounded-3xl backdrop-blur-sm">
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-1 h-12 bg-emerald-500 rounded-full" />
                                    <div>
                                        <p className="font-bold text-white">Sarah Chen Design</p>
                                        <p className="text-xs text-neutral-500 font-medium">Completed SR-2024-0005</p>
                                        <p className="text-[10px] font-bold text-emerald-400 uppercase mt-1">Status: Active</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-1 h-12 bg-orange-500 rounded-full" />
                                    <div>
                                        <p className="font-bold text-white">Build Materials Co.</p>
                                        <p className="text-xs text-neutral-500 font-medium">New product listing pending</p>
                                        <p className="text-xs font-bold text-orange-400 uppercase mt-1">Status: Action Required</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Assignment Modal */}
                {selectedRequest && (
                    <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
                        <Card className="w-full max-w-2xl bg-neutral-900 border-neutral-800 rounded-[40px] p-10 shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8">
                                <Button variant="ghost" onClick={() => setSelectedRequest(null)} className="rounded-full w-12 h-12 text-neutral-400 hover:text-white hover:bg-neutral-800">
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>

                            <h2 className="text-3xl font-black text-white mb-2">Assign Architect</h2>
                            <p className="text-neutral-500 font-medium mb-8 uppercase text-xs tracking-widest border-b border-neutral-800 pb-4">Request #{selectedRequest.request_number}</p>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {designers.map((designer) => (
                                    <div
                                        key={designer.id}
                                        className="p-6 border-2 border-neutral-800 bg-neutral-950/50 rounded-3xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer flex justify-between items-center group"
                                        onClick={() => handleAssign(designer.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-neutral-800 rounded-2xl flex items-center justify-center font-black text-neutral-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 border border-neutral-700 group-hover:border-blue-500/30">
                                                {designer.company_name?.[0] || 'D'}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-white group-hover:text-blue-400 transition-colors">{designer.company_name}</h3>
                                                <p className="text-xs text-neutral-500 font-bold uppercase">{designer.specializations?.join(' • ') || 'General'}</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                    <span className="text-[10px] font-extrabold text-neutral-500">VERIFIED PARTNER • ★ {designer.rating || '5.0'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            disabled={isAssigning}
                                            className="bg-neutral-800 hover:bg-blue-600 text-white font-bold rounded-xl group-hover:shadow-lg group-hover:shadow-blue-900/20"
                                        >
                                            Assign
                                        </Button>
                                    </div>
                                ))}
                                {designers.length === 0 && (
                                    <p className="text-center text-neutral-500 font-bold py-10">No verified designers available.</p>
                                )}
                            </div>
                        </Card>
                    </div>
                )}

                {/* Consultation Modal */}
                {schedulingRequest && (
                    <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
                        <Card className="w-full max-w-lg bg-neutral-900 border-neutral-800 rounded-[40px] p-10 shadow-2xl relative">
                            <h2 className="text-3xl font-black text-white mb-6 italic">Set Consultation</h2>
                            <form action={async (formData) => {
                                const result = await scheduleConsultation(schedulingRequest.id, {
                                    meetingLink: formData.get('link'),
                                    scheduledAt: formData.get('date')
                                })
                                if (result.success) {
                                    const { data: updatedReqs } = await supabase.from('service_requests').select('*').order('created_at', { ascending: false })
                                    setRequests(updatedReqs || [])
                                    setSchedulingRequest(null)
                                }
                            }} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Meeting Date & Time</label>
                                    <Input name="date" type="datetime-local" required className="h-12 rounded-xl bg-neutral-950 border-neutral-800 text-white css-invert-calendar-icon md:text-white dark:[color-scheme:dark]" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Video Link (Zoom/Meet)</label>
                                    <Input name="link" required className="h-12 rounded-xl bg-neutral-950 border-neutral-800 text-white" defaultValue="https://meet.google.com/abc-defg-hij" />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button variant="ghost" type="button" onClick={() => setSchedulingRequest(null)} className="flex-1 font-bold text-neutral-400 hover:text-white hover:bg-neutral-800">Cancel</Button>
                                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-900/20">Confirm & Invite</Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
