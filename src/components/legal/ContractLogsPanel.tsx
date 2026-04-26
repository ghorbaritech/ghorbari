'use client'

import { useEffect, useState } from 'react'
import { getContracts } from '@/app/admin/legal/actions'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Loader2, FileText, CheckCircle2 } from 'lucide-react'
import ContractReviewDialog from './ContractReviewDialog'
import { Input } from '@/components/ui/input'

export default function ContractLogsPanel() {
    const [contracts, setContracts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const fetchContracts = () => {
        setLoading(true)
        getContracts().then(data => {
            setContracts(data)
            setLoading(false)
        })
    }

    useEffect(() => {
        fetchContracts()
    }, [])

    const filteredContracts = contracts.filter(c => {
        const name = c.profile?.full_name || ''
        const type = c.contract_type || ''
        return name.toLowerCase().includes(search.toLowerCase()) || type.toLowerCase().includes(search.toLowerCase())
    })

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-neutral-900/50 backdrop-blur-xl p-4 rounded-2xl border border-white/5">
                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
                    <Input 
                        placeholder="Search by partner name or agreement type..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-neutral-950 border-neutral-800 text-white rounded-xl focus:border-primary-500 transition-colors"
                    />
                </div>
                <Button variant="outline" onClick={fetchContracts} className="bg-neutral-950 border-neutral-800 hover:bg-neutral-800 text-white shadow-xl">
                    Refresh Logs
                </Button>
            </div>

            <Card className="bg-neutral-900/50 backdrop-blur-xl border-white/5 shadow-2xl relative overflow-hidden min-h-[400px]">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center p-20 flex-col gap-4">
                            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                            <span className="text-neutral-500 text-xs font-black tracking-widest uppercase">Loading Agreements...</span>
                        </div>
                    ) : filteredContracts.length === 0 ? (
                        <div className="flex items-center justify-center p-20 flex-col gap-4 text-center">
                            <FileText className="w-12 h-12 text-neutral-800" />
                            <span className="text-neutral-500 text-sm font-medium">No contracts found. Generate an agreement first.</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/[0.02] border-b border-white/5 text-[10px] uppercase font-black tracking-widest text-neutral-500">
                                        <th className="p-4 rounded-tl-xl">Partner Name</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Date Signed</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right rounded-tr-xl">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredContracts.map((c) => (
                                        <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-4 text-white font-medium flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-900/30 border border-primary-500/20 flex items-center justify-center text-primary-400 font-black">
                                                    {(c.profile?.full_name || 'U')[0].toUpperCase()}
                                                </div>
                                                {c.profile?.full_name || 'Unknown Partner'}
                                            </td>
                                            <td className="p-4 text-neutral-400 text-xs">{c.contract_type.replace('_', ' ')}</td>
                                            <td className="p-4 text-neutral-400 text-xs">
                                                {new Date(c.signed_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                                                        c.variable_data?.repSignature 
                                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    }`}>
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        {c.variable_data?.repSignature ? 'SEALED' : 'AWAITING REP'}
                                                    </span>
                                                    {!c.variable_data?.repSignature && (
                                                        <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter animate-pulse px-1">
                                                            Action Required
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right flex justify-end gap-2">
                                                <Button 
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => window.open(`/legal/print/${c.id}`, '_blank')}
                                                    className="bg-transparent border-neutral-700 text-neutral-300 hover:text-white transition-colors"
                                                >
                                                    <FileText className="w-4 h-4 mr-2 text-red-400" />
                                                    PDF
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => {
                                                        setSelectedContractId(c.id)
                                                        setIsDialogOpen(true)
                                                    }}
                                                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors"
                                                >
                                                    Inspect
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ContractReviewDialog 
                contractId={selectedContractId} 
                open={isDialogOpen} 
                onOpenChange={setIsDialogOpen}
                onUpdated={fetchContracts}
            />
        </div>
    )
}
