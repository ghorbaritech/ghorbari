"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, UserPlus } from "lucide-react"

export function AssignPartnerDialog({ onAssign }: { onAssign: (id: string) => void }) {
    const [open, setOpen] = useState(false)
    const [partners, setPartners] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("")

    const supabase = createClient()

    useEffect(() => {
        async function fetchPartners() {
            setLoading(true)
            // Fetch verified sellers (retailers/freelancers)
            // In a real app, you might want to join with profiles to get names if business_name isn't enough
            const { data } = await supabase
                .from('sellers')
                .select('*')
                .eq('verification_status', 'verified')
                .ilike('business_name', `%${search}%`)
                .limit(10)

            setPartners(data || [])
            setLoading(false)
        }

        if (open) fetchPartners()
    }, [open, search, supabase])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-neutral-900 text-white font-bold uppercase text-xs tracking-widest h-10 rounded-xl">
                    <UserPlus className="w-4 h-4 mr-2" /> Assign Partner
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl p-8">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black italic uppercase">Select Partner</DialogTitle>
                    <DialogDescription className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                        Assign a verified retailer or freelancer to this project.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="relative">
                        <Input
                            placeholder="Search by name..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); }}
                            className="pl-10 h-12 rounded-xl bg-neutral-50 border-none font-bold"
                        />
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {partners.map(partner => (
                            <div key={partner.id} className="flex justify-between items-center p-3 hover:bg-neutral-50 rounded-xl transition-colors border border-transparent hover:border-neutral-100 cursor-pointer" onClick={() => { onAssign(partner.id); setOpen(false); }}>
                                <div>
                                    <p className="font-bold text-sm text-neutral-900">{partner.business_name}</p>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{partner.business_type || 'Retailer'}</p>
                                </div>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full bg-neutral-100">
                                    <UserPlus className="w-4 h-4 text-neutral-600" />
                                </Button>
                            </div>
                        ))}
                        {partners.length === 0 && !loading && (
                            <p className="text-center text-xs text-neutral-400 py-4 italic">No verified partners found.</p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
