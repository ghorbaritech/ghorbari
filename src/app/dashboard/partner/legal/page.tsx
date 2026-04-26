'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, ShieldCheck, Download, ExternalLink, Scale, Clock } from 'lucide-react'

export default function PartnerLegalPage() {
    const [contracts, setContracts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchContracts() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('contracts')
                .select('*')
                .eq('partner_id', user.id)
                .order('created_at', { ascending: false })

            if (!error) {
                setContracts(data || [])
            }
            setLoading(false)
        }
        fetchContracts()
    }, [])

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-8">
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tighter flex items-center">
                        <Scale className="w-8 h-8 mr-3 text-primary-600" />
                        Legal Hub
                    </h1>
                    <p className="text-neutral-500 font-medium mt-1">Review your signed agreements and legal compliance status.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="px-3 py-1 bg-green-50 text-green-700 border-green-100 font-bold uppercase text-[10px] tracking-widest">
                        Status: Compliant
                    </Badge>
                </div>
            </div>

            {loading ? (
                <div className="p-20 text-center text-neutral-300 font-black uppercase text-xs tracking-[0.2em] animate-pulse">
                    Synchronizing Legal Records...
                </div>
            ) : contracts.length === 0 ? (
                <Card className="border-2 border-dashed border-neutral-200 bg-neutral-50/50">
                    <CardContent className="py-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <FileText className="w-8 h-8 text-neutral-300" />
                        </div>
                        <div className="max-w-xs mx-auto">
                            <h3 className="text-lg font-black text-neutral-900 italic uppercase">No Signed Contracts</h3>
                            <p className="text-sm text-neutral-500 mt-2 font-medium">Your onboarding agreement hasn't been generated yet. Please contact support if you believe this is an error.</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {contracts.map(contract => (
                        <Card key={contract.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all group">
                            <div className="flex flex-col md:flex-row">
                                <div className="p-8 flex-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-neutral-900 text-white font-black text-[9px] tracking-widest uppercase">
                                                    {contract.contract_type.replace(/_/g, ' ')}
                                                </Badge>
                                                <Badge variant="secondary" className="font-bold text-[9px] tracking-widest uppercase">
                                                    ID: {contract.id.slice(0, 8).toUpperCase()}
                                                </Badge>
                                            </div>
                                            <h3 className="text-xl font-black text-neutral-900 italic uppercase tracking-tight mt-3">
                                                Onboarding Service Agreement
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-1 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            {contract.status}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-neutral-50">
                                        <div>
                                            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Signed Date</p>
                                            <p className="text-sm font-bold text-neutral-900">{contract.signed_at ? new Date(contract.signed_at).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Partner Entity</p>
                                            <p className="text-sm font-bold text-neutral-900 truncate">{contract.variable_data?.businessName || 'Personal Entity'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Tax ID / BIN</p>
                                            <p className="text-sm font-bold text-neutral-900">{contract.variable_data?.tinNumber || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Expiration</p>
                                            <p className="text-sm font-bold text-neutral-500 italic">None (Life Tenure)</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-6">
                                        {contract.variable_data?.selectedServices?.map((svc: string) => (
                                            <span key={svc} className="px-2 py-1 bg-neutral-100 text-neutral-600 text-[10px] font-bold rounded uppercase tracking-tighter">
                                                {svc.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="bg-neutral-50 p-8 flex flex-col justify-center gap-3 border-l border-neutral-100 min-w-[200px]">
                                    <Button 
                                        onClick={() => window.open(`/legal/print/${contract.id}`, '_blank')}
                                        className="w-full bg-neutral-900 text-white font-black uppercase text-[10px] tracking-widest gap-2 py-6 rounded-2xl shadow-lg shadow-neutral-200"
                                    >
                                        <Download className="w-4 h-4" /> Download PDF
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        onClick={() => window.open(`/legal/print/${contract.id}`, '_blank')}
                                        className="w-full bg-white text-neutral-600 border-neutral-200 font-black uppercase text-[10px] tracking-widest gap-2 py-6 rounded-2xl"
                                    >
                                        <ExternalLink className="w-4 h-4" /> View Full
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Compliance Sidebar/Note */}
            <Card className="bg-blue-600 text-white border-none rounded-[40px] shadow-2xl shadow-blue-200">
                <CardContent className="p-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center shrink-0">
                        <Clock className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">Legal Requirement Checklist</h3>
                        <p className="text-blue-100 font-medium">Please ensure your trade license and NID are updated in the profile section to keep your Dalankotha partnership status active.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
