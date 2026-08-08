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

interface AssignPartnerDialogProps {
    orderType?: 'design' | 'service'
    serviceType?: string
    onAssign: (id: string, role: 'designer' | 'seller' | 'service_provider', userId: string) => void
}

export function AssignPartnerDialog({ orderType, serviceType, onAssign }: AssignPartnerDialogProps) {
    const [open, setOpen] = useState(false)
    const [partners, setPartners] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("")

    const supabase = createClient()

    useEffect(() => {
        async function fetchPartners() {
            setLoading(true)
            
            // Helper to normalize and check string matching
            const isMatch = (tags: string[], query: string) => {
                if (!query) return true;
                const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
                const normQuery = normalize(query);
                return tags.some(t => {
                    const normT = normalize(t);
                    return normT.includes(normQuery) || normQuery.includes(normT);
                });
            };

            if (orderType === 'design') {
                // Fetch verified or pending designers
                const { data, error } = await supabase
                    .from('designers')
                    .select('*')
                    .in('verification_status', ['verified', 'pending'])
                    .ilike('company_name', `%${search}%`)
                
                if (!error && data) {
                    // Fetch categories to resolve specialization UUIDs
                    const { data: categories } = await supabase
                        .from('product_categories')
                        .select('id, name, slug')

                    const getDesignerTags = (specializationIds: string[]) => {
                        return (specializationIds || []).map(id => {
                            const cat = categories?.find(c => c.id === id);
                            return cat ? cat.name : '';
                        }).filter(Boolean);
                    };

                    const getDesignerLabels = (specializationIds: string[]) => {
                        return (specializationIds || []).map(id => {
                            const cat = categories?.find(c => c.id === id);
                            return cat ? cat.name : id;
                        }).filter(Boolean).join(' • ');
                    };

                    let filtered = data;

                    setPartners(filtered.map(d => ({
                        id: d.id,
                        userId: d.user_id,
                        businessName: d.company_name,
                        typeLabel: getDesignerLabels(d.specializations || []) || 'Designer',
                        role: 'designer'
                    })));
                } else {
                    setPartners([]);
                }
            } else if (orderType === 'service') {
                // Fetch verified or pending service providers
                const { data, error } = await supabase
                    .from('service_providers')
                    .select('*')
                    .in('verification_status', ['verified', 'pending'])
                    .ilike('business_name', `%${search}%`)
                
                if (!error && data) {
                    let filtered = data;
                    setPartners(filtered.map(sp => ({
                        id: sp.id,
                        userId: sp.user_id,
                        businessName: sp.business_name,
                        typeLabel: (sp.service_types || []).join(' • ') || 'Service Provider',
                        role: 'service_provider'
                    })));
                } else {
                    setPartners([]);
                }
            } else {
                // Fetch verified or pending sellers
                const { data, error } = await supabase
                    .from('sellers')
                    .select('*')
                    .in('verification_status', ['verified', 'pending'])
                    .ilike('business_name', `%${search}%`)
                
                if (!error && data) {
                    let filtered = data;
                    setPartners(filtered.map(s => ({
                        id: s.id,
                        userId: s.user_id,
                        businessName: s.business_name,
                        typeLabel: s.business_type || 'Retailer',
                        role: 'seller'
                    })));
                } else {
                    setPartners([]);
                }
            }

            setLoading(false)
        }

        if (open) fetchPartners()
    }, [open, search, supabase, orderType, serviceType])

    const getTriggerText = () => {
        if (orderType === 'design') return 'Assign Designer';
        if (orderType === 'service') return 'Assign Provider';
        return 'Assign Partner';
    };

    const getTitleText = () => {
        if (orderType === 'design') return 'Select Designer';
        if (orderType === 'service') return 'Select Service Provider';
        return 'Select Partner';
    };

    const getDescriptionText = () => {
        if (orderType === 'design') return 'Assign a verified architect or designer to this project.';
        if (orderType === 'service') return 'Assign a verified service provider to this project.';
        return 'Assign a verified retailer or freelancer to this project.';
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-neutral-900 text-white font-bold uppercase text-xs tracking-widest h-10 rounded-xl">
                    <UserPlus className="w-4 h-4 mr-2" /> {getTriggerText()}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl p-8 bg-neutral-900 border-neutral-800 text-white shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black italic uppercase text-white">{getTitleText()}</DialogTitle>
                    <DialogDescription className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                        {getDescriptionText()}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="relative">
                        <Input
                            placeholder="Search by name..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); }}
                            className="pl-10 h-12 rounded-xl bg-neutral-950 border-neutral-800 text-white font-bold placeholder-neutral-500 focus-visible:ring-emerald-500"
                        />
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {partners.map(partner => (
                            <div 
                                key={partner.id} 
                                className="flex justify-between items-center p-3 hover:bg-neutral-800/50 rounded-xl transition-colors border border-transparent hover:border-neutral-800 cursor-pointer" 
                                onClick={() => { onAssign(partner.id, partner.role, partner.userId); setOpen(false); }}
                            >
                                <div>
                                    <p className="font-bold text-sm text-neutral-100">{partner.businessName}</p>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{partner.typeLabel}</p>
                                </div>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700">
                                    <UserPlus className="w-4 h-4" />
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
