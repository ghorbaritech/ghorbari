'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { getContractById, updateContractData } from '@/app/admin/legal/actions'
import { Loader2, FileSignature, Save, Printer, ExternalLink, CheckCircle2 } from 'lucide-react'

interface ContractReviewDialogProps {
    contractId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdated: () => void;
    onVerify?: () => void;
}

export default function ContractReviewDialog({ contractId, open, onOpenChange, onUpdated, onVerify }: ContractReviewDialogProps) {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [contract, setContract] = useState<any>(null)
    const [signature, setSignature] = useState<any>(null)
    const [formData, setFormData] = useState<any>({})

    useEffect(() => {
        if (open && contractId) {
            setLoading(true)
            getContractById(contractId).then(res => {
                if (res.success) {
                    setContract(res.contract)
                    setSignature(res.signature)
                    setFormData(res.contract.variable_data || {})
                } else {
                    toast.error(res.error || "Failed to load contract details")
                    onOpenChange(false)
                }
                setLoading(false)
            })
        }
    }, [open, contractId])

    const updateField = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
        if (!contractId) return
        setSaving(true)
        const res = await updateContractData(contractId, formData)
        setSaving(false)
        if (res.success) {
            toast.success("Contract details updated successfully")
            onUpdated()
            onOpenChange(false)
        } else {
            toast.error(res.error || "Failed to update contract details")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-neutral-950 border-neutral-800 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-black">
                        <FileSignature className="w-5 h-5 text-primary-500" />
                        Contract Review & Edit
                    </DialogTitle>
                    <DialogDescription className="text-neutral-400">
                        Review the partner's recorded details below. You can modify these values before generating the final PDF.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                    </div>
                ) : contract && (
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black text-neutral-500">Partner Name</Label>
                                <Input value={formData.partnerName || ''} onChange={e => updateField('partnerName', e.target.value)} className="bg-neutral-900 border-neutral-800 h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black text-neutral-500">NID/Passport</Label>
                                <Input value={formData.nidPassport || ''} onChange={e => updateField('nidPassport', e.target.value)} className="bg-neutral-900 border-neutral-800 h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black text-neutral-500">Phone</Label>
                                <Input value={formData.phone || ''} onChange={e => updateField('phone', e.target.value)} className="bg-neutral-900 border-neutral-800 h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black text-neutral-500">Email</Label>
                                <Input value={formData.email || ''} onChange={e => updateField('email', e.target.value)} className="bg-neutral-900 border-neutral-800 h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black text-neutral-500">Business Name</Label>
                                <Input value={formData.businessName || ''} onChange={e => updateField('businessName', e.target.value)} className="bg-neutral-900 border-neutral-800 h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black text-neutral-500">Trade License</Label>
                                <Input value={formData.tradeLicense || ''} onChange={e => updateField('tradeLicense', e.target.value)} className="bg-neutral-900 border-neutral-800 h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black text-neutral-500">Bank Account</Label>
                                <Input value={formData.bankAccount || ''} onChange={e => updateField('bankAccount', e.target.value)} className="bg-neutral-900 border-neutral-800 h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black text-neutral-500">Bank Name</Label>
                                <Input value={formData.bankName || ''} onChange={e => updateField('bankName', e.target.value)} className="bg-neutral-900 border-neutral-800 h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black text-neutral-500">Mobile MFS Payment</Label>
                                <Input value={formData.mobilePayment || ''} onChange={e => updateField('mobilePayment', e.target.value)} className="bg-neutral-900 border-neutral-800 h-10" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black text-neutral-500">Witness Name</Label>
                                <Input value={formData.witnessName || ''} onChange={e => updateField('witnessName', e.target.value)} className="bg-neutral-900 border-neutral-800 h-10" />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-neutral-800 space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] uppercase font-black text-primary-500 tracking-widest">Dalankotha Representative (First Party)</Label>
                                {formData.repSignature && (
                                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-primary-500/10 text-primary-500 border border-primary-500/20">
                                        <CheckCircle2 className="w-2.5 h-2.5" />
                                        Provisionally Sealed
                                    </span>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black text-neutral-500">Representative Name</Label>
                                    <Input 
                                        placeholder="Enter official name..."
                                        value={formData.repName || ''} 
                                        onChange={e => updateField('repName', e.target.value)} 
                                        className="bg-neutral-900 border-neutral-800 h-10 focus:border-primary-500 transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black text-neutral-500">Official Signature (PNG/SVG)</Label>
                                    <div className="relative h-10">
                                        <Input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={e => {
                                                const file = e.target.files?.[0]
                                                if (file) {
                                                    const reader = new FileReader()
                                                    reader.onloadend = () => {
                                                        updateField('repSignature', reader.result)
                                                    }
                                                    reader.readAsDataURL(file)
                                                }
                                            }}
                                            className="bg-neutral-900 border-neutral-800 h-full text-xs px-2 py-1 opacity-0 absolute inset-0 z-10 cursor-pointer" 
                                        />
                                        <div className="absolute inset-0 border border-neutral-800 rounded-md bg-neutral-900 flex items-center px-4 pointer-events-none group">
                                            <span className="text-neutral-500 text-[10px] font-bold uppercase overflow-hidden whitespace-nowrap overflow-ellipsis">
                                                {formData.repSignature ? "Signature Loaded ✓" : "Choose official file..."}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {formData.repSignature && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <Label className="text-[10px] uppercase font-black text-neutral-500">Preview (DALANKOTHA AUTHENTICATED)</Label>
                                    <div className="bg-white rounded-2xl p-6 flex items-center justify-center border-4 border-primary-500/10 shadow-inner group relative overflow-hidden h-32">
                                        {/* Watermark effect */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] rotate-12 pointer-events-none uppercase font-black text-4xl">DALANKOTHA</div>
                                        <img src={formData.repSignature} alt="Rep Signature" className="max-h-full max-w-full object-contain relative z-10" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 border-t border-neutral-800">
                            <Label className="text-[10px] uppercase font-black text-neutral-500 mb-2 block">Partner Signature (Second Party)</Label>
                            {signature?.signature_svg ? (
                                <div className="bg-white rounded-xl p-4 flex items-center justify-center border-4 border-neutral-800 max-w-[400px] h-32">
                                    <img src={signature.signature_svg} alt="Partner Signature" className="max-h-full max-w-full object-contain pointer-events-none" />
                                </div>
                            ) : (
                                <div className="text-neutral-500 text-xs italic">No signature data found.</div>
                            )}
                            <div className="mt-2 text-[10px] text-neutral-500 uppercase tracking-widest flex items-center space-x-2">
                                <span>Signed: {new Date(contract.signed_at).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter className="border-t border-neutral-800 pt-4 flex flex-col md:flex-row gap-2">
                    <div className="flex-1 flex gap-2">
                        {contract && (
                            <Button 
                                variant="outline" 
                                onClick={() => window.open(`/legal/print/${contract.id}`, '_blank')}
                                className="border-neutral-800 text-neutral-300 hover:bg-neutral-900"
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Generate Agreement
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-neutral-400">Cancel</Button>
                        <Button onClick={handleSave} disabled={saving || loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Edits
                        </Button>
                        {onVerify && (
                            <Button 
                                onClick={async () => {
                                    await handleSave()
                                    onVerify()
                                }} 
                                disabled={saving || loading || !formData.repSignature} 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] px-6"
                            >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Sign & Approve
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
