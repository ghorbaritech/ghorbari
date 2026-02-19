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
        async function fetchData() {
            console.log('Admin Dashboard: Starting fetch...');
            try {
                // Fetch service requests
                const { data: reqs, error: reqError } = await supabase.from('service_requests').select('*').order('created_at', { ascending: false })
                if (reqError) {
                    console.error('Service Requests Fetch Error DETAILS:', JSON.stringify(reqError, null, 2))
                    console.error('Service Requests Fetch Error RAW:', reqError)
                }
                setRequests(reqs || [])

                // Fetch designers for assignment
                const { data: des, error: desError } = await supabase.from('designers').select('*').eq('verification_status', 'verified')
                if (desError) console.error('Designers Fetch Error:', desError)
                setDesigners(des || [])

                // Fetch general stats (mocking the counts for now)
                const { count: userCount, error: countError } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
                if (countError) console.error('Profiles Count Error:', countError)

                const activeProjects = (reqs || []).filter((r: any) => r.status === 'in_progress').length
                const pendingReqs = (reqs || []).filter((r: any) => r.status === 'pending_assignment').length

                setStats({
                    totalUsers: userCount || 0,
                    activeProjects,
                    pendingRequests: pendingReqs,
                    totalSales: 0
                })
                console.log('Admin Dashboard: Fetch complete.');
            } catch (err: any) {
                console.error('CRITICAL FETCH ERROR:', err);
                console.error('CRITICAL FETCH ERROR MSG:', err.message);
            }
        }
        fetchData()
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
        <div className="min-h-screen bg-[#FDFDFD]">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight italic">Platform Orchestrator</h1>
                        <p className="text-neutral-500 font-medium">Monitoring the Ghorbari ecosystem & service workflows</p>
                    </div>
                    {/* Only show for Admin role */}
                    <div className="flex gap-4">
                        <Link href="/admin/onboarding">
                            <Button variant="outline" className="rounded-xl font-bold border-2">
                                <UserPlus className="w-4 h-4 mr-2" /> Onboard Partner
                            </Button>
                        </Link>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <Card className="p-6 border-none shadow-sm bg-white rounded-3xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Total Users</p>
                                <p className="text-2xl font-black text-neutral-900">{stats.totalUsers}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 border-none shadow-sm bg-white rounded-3xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Active Projects</p>
                                <p className="text-2xl font-black text-neutral-900">{stats.activeProjects}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 border-none shadow-sm bg-white rounded-3xl text-orange-600 border-2 border-orange-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-2xl">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold opacity-70 uppercase tracking-wider">Pending Tasks</p>
                                <p className="text-2xl font-black">{stats.pendingRequests}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 border-none shadow-sm bg-white rounded-3xl">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Total Revenue</p>
                                <p className="text-2xl font-black text-neutral-900">৳{stats.totalSales}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Main Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Active Service Requests */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-neutral-400" /> Recent Service Requests
                        </h2>
                        <div className="space-y-4">
                            {requests.map((req) => (
                                <Card key={req.id} className="p-6 border-none shadow-sm bg-white rounded-3xl hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black bg-neutral-100 px-2 py-0.5 rounded text-neutral-500 uppercase tracking-tighter">REQ #{req.request_number}</span>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${req.status === 'pending_assignment' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                                                    }`}>
                                                    {req.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-neutral-900 capitalize">{req.service_type.replace('_', ' ')}</h3>
                                            <p className="text-sm text-neutral-500 font-medium">{req.requirements.location} • {req.requirements.plotSize} sqft • {req.requirements.floors} Floors</p>
                                        </div>
                                        {req.status === 'pending_assignment' && (
                                            <Button
                                                onClick={() => setSelectedRequest(req)}
                                                className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl"
                                            >
                                                Assign Designer <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        )}
                                        {req.status === 'assigned' && (
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-neutral-400 uppercase">Assigned To</p>
                                                    <p className="text-sm font-bold text-neutral-900">Sarah Chen Studio</p>
                                                </div>
                                                <Button
                                                    onClick={() => setSchedulingRequest(req)}
                                                    variant="outline"
                                                    className="border-primary-600 text-primary-600 font-bold rounded-xl"
                                                >
                                                    <Video className="w-4 h-4 mr-2" /> Schedule Call
                                                </Button>
                                            </div>
                                        )}
                                        {req.status === 'consultation_scheduled' && (
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-green-600 uppercase">Call Scheduled</p>
                                                <p className="text-xs font-bold text-neutral-500">{new Date(req.consultation_scheduled_at).toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Right Sidebar - Platform Health/Notifications */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-neutral-900">Ecosystem Status</h2>
                        <Card className="p-6 border-none shadow-sm bg-white rounded-3xl">
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-1 h-12 bg-green-500 rounded-full" />
                                    <div>
                                        <p className="font-bold text-neutral-900">Sarah Chen Design</p>
                                        <p className="text-xs text-neutral-500 font-medium">Completed SR-2024-0005</p>
                                        <p className="text-[10px] font-bold text-green-600 uppercase mt-1">Status: Active</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-1 h-12 bg-orange-500 rounded-full" />
                                    <div>
                                        <p className="font-bold text-neutral-900">Build Materials Co.</p>
                                        <p className="text-xs text-neutral-500 font-medium">New product listing pending</p>
                                        <p className="text-xs font-bold text-orange-600 uppercase mt-1">Status: Action Required</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Assignment Modal */}
                {selectedRequest && (
                    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
                        <Card className="w-full max-w-2xl bg-white rounded-[40px] p-10 shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8">
                                <Button variant="ghost" onClick={() => setSelectedRequest(null)} className="rounded-full w-12 h-12 hover:bg-neutral-100">
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>

                            <h2 className="text-3xl font-black text-neutral-900 mb-2">Assign Architect</h2>
                            <p className="text-neutral-500 font-medium mb-8 uppercase text-xs tracking-widest border-b pb-4">Request #{selectedRequest.request_number}</p>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {designers.map((designer) => (
                                    <div
                                        key={designer.id}
                                        className="p-6 border-2 border-neutral-100 rounded-3xl hover:border-primary-600 hover:bg-primary-50 transition-all cursor-pointer flex justify-between items-center group"
                                        onClick={() => handleAssign(designer.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center font-black text-neutral-400 group-hover:bg-primary-200 group-hover:text-primary-600">
                                                {designer.company_name[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-neutral-900 group-hover:text-primary-700">{designer.company_name}</h3>
                                                <p className="text-xs text-neutral-500 font-bold uppercase">{designer.specializations.join(' • ')}</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                    <span className="text-[10px] font-extrabold text-neutral-400">VERIFIED PARTNER • ★ {designer.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            disabled={isAssigning}
                                            className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl group-hover:bg-primary-600"
                                        >
                                            Assign
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}

                {/* Consultation Modal */}
                {schedulingRequest && (
                    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
                        <Card className="w-full max-w-lg bg-white rounded-[40px] p-10 shadow-2xl relative">
                            <h2 className="text-3xl font-black text-neutral-900 mb-6 italic">Set Consultation</h2>
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
                                    <label className="text-[10px] font-black uppercase text-neutral-400">Meeting Date & Time</label>
                                    <Input name="date" type="datetime-local" required className="h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-neutral-400">Video Link (Zoom/Meet)</label>
                                    <Input name="link" required className="h-12 rounded-xl" defaultValue="https://meet.google.com/abc-defg-hij" />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button variant="ghost" type="button" onClick={() => setSchedulingRequest(null)} className="flex-1 font-bold">Cancel</Button>
                                    <Button type="submit" className="flex-1 bg-primary-600 text-white font-bold h-12 rounded-xl">Confirm & Invite</Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
