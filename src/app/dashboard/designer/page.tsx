'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    Layout,
    Image as ImageIcon,
    MessageSquare,
    FileCheck,
    Bell,
    Star,
    ExternalLink,
    Upload
} from 'lucide-react'

export default function DesignerDashboard() {
    const [designer, setDesigner] = useState<any>(null)
    const [projects, setProjects] = useState<any[]>([])
    const [notifications, setNotifications] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Get designer profile
            const { data: des } = await supabase.from('designers').select('*').eq('user_id', user.id).single()
            setDesigner(des)

            if (des) {
                // Get assigned projects
                const { data: projs } = await supabase.from('service_requests').select('*').eq('assigned_designer_id', des.id)
                setProjects(projs || [])

                // Get notifications
                const { data: notifs } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
                setNotifications(notifs || [])
            }
        }
        fetchData()
    }, [])

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-8 py-12">
                <header className="flex justify-between items-start mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black text-neutral-900 tracking-tight">{designer?.company_name || 'Design Professional'}</h1>
                            <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
                                <Star className="w-4 h-4 text-yellow-600 fill-current" />
                                <span className="text-sm font-black text-yellow-700">{designer?.rating}</span>
                            </div>
                        </div>
                        <p className="text-neutral-500 font-bold uppercase text-xs tracking-[0.2em]">{designer?.specializations?.join(' • ') || 'Verification Pending'}</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="rounded-2xl h-14 px-8 border-2 font-black uppercase text-xs tracking-wider">
                            <Upload className="w-4 h-4 mr-2" /> Upload Portfolio
                        </Button>
                        <Button className="rounded-2xl h-14 px-8 bg-neutral-900 font-black uppercase text-xs tracking-wider shadow-xl shadow-neutral-200">
                            Professional Profile
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Left Main Content */}
                    <div className="lg:col-span-3 space-y-12">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="p-8 border-none bg-neutral-50 rounded-[32px]">
                                <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest mb-2">Active Projects</p>
                                <p className="text-4xl font-black text-neutral-900">{projects.length}</p>
                            </Card>
                            <Card className="p-8 border-none bg-neutral-50 rounded-[32px]">
                                <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest mb-2">Total Completed</p>
                                <p className="text-4xl font-black text-neutral-900">{designer?.completed_projects || 0}</p>
                            </Card>
                            <Card className="p-8 border-none bg-neutral-50 rounded-[32px]">
                                <p className="text-neutral-400 font-bold uppercase text-[10px] tracking-widest mb-2">Platform Rank</p>
                                <p className="text-4xl font-black text-neutral-900">#12</p>
                            </Card>
                        </div>

                        {/* Project Feed */}
                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-neutral-900 flex items-center gap-3">
                                <Layout className="w-6 h-6 text-neutral-300" /> Current Assignments
                            </h2>
                            <div className="space-y-4">
                                {projects.length === 0 ? (
                                    <div className="py-20 text-center bg-neutral-50 rounded-[40px] border-2 border-dashed border-neutral-100">
                                        <p className="text-neutral-400 font-black uppercase text-xs tracking-widest">No active assignments yet. Admin will notify you when matched.</p>
                                    </div>
                                ) : (
                                    projects.map((proj) => (
                                        <Card key={proj.id} className="p-8 border-2 border-neutral-50 rounded-[40px] hover:border-neutral-200 transition-all cursor-pointer group">
                                            <div className="flex justify-between items-center">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">SR #{proj.request_number}</span>
                                                    <h3 className="text-xl font-black text-neutral-900 group-hover:text-primary-600 transition-colors uppercase italic">{proj.service_type.replace('_', ' ')}</h3>
                                                    <p className="text-neutral-500 font-bold text-sm">{proj.requirements.plotSize} SQFT • {proj.requirements.location} • {proj.requirements.floors} FLOORS</p>
                                                </div>
                                                <div className="flex gap-3">
                                                    <Button variant="ghost" className="rounded-2xl h-12 w-12 p-0 border-2 border-neutral-100 hover:bg-neutral-50">
                                                        <MessageSquare className="w-5 h-5 text-neutral-400" />
                                                    </Button>
                                                    <Button variant="outline" className="rounded-2xl h-12 px-6 border-2 font-black uppercase text-[10px] tracking-wider">
                                                        View Requirements
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Portfolio Grid Preview */}
                        <section className="space-y-6">
                            <h2 className="text-2xl font-black text-neutral-900 flex items-center gap-3">
                                <ImageIcon className="w-6 h-6 text-neutral-300" /> Portfolio Showcase
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {designer?.portfolio_images?.map((img: string, i: number) => (
                                    <div key={i} className="aspect-square bg-neutral-100 rounded-3xl overflow-hidden group relative">
                                        <img src={img} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                        <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <ExternalLink className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                ))}
                                <div className="aspect-square border-2 border-dashed border-neutral-200 rounded-3xl flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-neutral-400">
                                    <Upload className="w-6 h-6 text-neutral-300 group-hover:text-neutral-500" />
                                    <span className="text-[10px] font-black text-neutral-300 group-hover:text-neutral-500 tracking-widest">ADD NEW</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-8">
                        {/* Notifications */}
                        <section className="space-y-6">
                            <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                <Bell className="w-4 h-4" /> Activity Feed
                            </h3>
                            <div className="space-y-4">
                                {notifications.map((n) => (
                                    <div key={n.id} className="p-4 bg-neutral-50 rounded-2xl relative overflow-hidden group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-neutral-200 group-hover:bg-primary-500 transition-colors" />
                                        <p className="text-[10px] font-black text-neutral-400 uppercase mb-1">{new Date(n.created_at).toLocaleDateString()}</p>
                                        <p className="font-bold text-neutral-900 text-sm mb-1">{n.title}</p>
                                        <p className="text-xs text-neutral-500 leading-relaxed">{n.message}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Professional Metrics */}
                        <Card className="p-8 border-none bg-neutral-900 text-white rounded-[40px]">
                            <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-6">Service Levels</h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black tracking-widest uppercase">
                                        <span>Response Time</span>
                                        <span>98%</span>
                                    </div>
                                    <div className="h-1 bg-neutral-800 rounded-full">
                                        <div className="h-full bg-primary-500 w-[98%] rounded-full" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black tracking-widest uppercase">
                                        <span>Revision Rate</span>
                                        <span>1.2 Avg</span>
                                    </div>
                                    <div className="h-1 bg-neutral-800 rounded-full">
                                        <div className="h-full bg-green-500 w-[85%] rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
