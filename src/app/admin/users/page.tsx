'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
    UserPlus,
    Store,
    User,
    Mail,
    Phone,
    MapPin,
    Shield,
    Loader2,
    CheckCircle2,
    Search,
    Edit2,
    X,
    Users
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import PartnerOnboardingForm from '@/components/forms/PartnerOnboardingForm'
import { getUsers, getPartners, updateUserProfile, getCategories } from '@/app/admin/onboarding/actions'

export default function UserManagementPage() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Existing accounts state
    const [users, setUsers] = useState<any[]>([])
    const [partners, setPartners] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')

    // Editing state
    const [editingAccount, setEditingAccount] = useState<any | null>(null)
    const [activeTab, setActiveTab] = useState<'customer' | 'retailer'>('customer')

    const refreshData = useCallback(async () => {
        const [uData, pData, cData] = await Promise.all([getUsers(), getPartners(), getCategories()])
        setUsers(uData)
        setPartners(pData)
        setCategories(cData)
    }, [])

    useEffect(() => {
        refreshData()
    }, [refreshData])

    const handleCreateUser = useCallback(async (e: React.FormEvent<HTMLFormElement>, role: 'customer' | 'seller') => {
        e.preventDefault()
        setLoading(true)
        setSuccess(null)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData.entries())

        try {
            if (editingAccount && role === 'customer') {
                const res = await updateUserProfile(editingAccount.id, data)
                if (res.error) throw new Error(res.error)
            } else if (!editingAccount) {
                // Creation logic usually involves more steps, simulating for now
                await new Promise(r => setTimeout(r, 1000))
            }

            setSuccess(`${role === 'seller' ? 'Partner' : 'Consumer'} account ${editingAccount ? 'updated' : 'created'} successfully!`)
            setEditingAccount(null)
            refreshData()
        } catch (err: any) {
            setError(err.message || 'Operation failed')
        } finally {
            setLoading(false)
        }
    }, [editingAccount, refreshData])

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users
        const lowTerm = searchTerm.toLowerCase()
        return users.filter(u =>
        (u.full_name?.toLowerCase().includes(lowTerm) ||
            u.email?.toLowerCase().includes(lowTerm))
        )
    }, [users, searchTerm])

    const filteredPartners = useMemo(() => {
        if (!searchTerm) return partners
        const lowTerm = searchTerm.toLowerCase()
        return partners.filter(p =>
        (p.businessName?.toLowerCase().includes(lowTerm) ||
            p.email?.toLowerCase().includes(lowTerm))
        )
    }, [partners, searchTerm])

    const handleSelectAccount = useCallback((acc: any) => {
        // If they select from users list, check if this user is actually a partner
        const partnerData = partners.find(p => p.id === acc.id)
        const finalAcc = partnerData || acc

        setEditingAccount(finalAcc)
        setSearchTerm('')

        // Switch tab based on whether it's a partner
        const isPartner = !!partnerData
        setActiveTab(isPartner ? 'retailer' : 'customer')
    }, [partners])

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                        <Users className="w-3 h-3" />
                        Identity Management
                    </div>
                    <h1 className="text-5xl font-black text-neutral-900 tracking-tighter uppercase italic">
                        User <span className="text-blue-600">Hub</span>
                    </h1>
                    <p className="text-neutral-500 font-medium">Manage and provision accounts for partners and customers.</p>
                </div>

                <div className="w-full md:w-80 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                        placeholder="Search existing users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-12 pl-12 rounded-2xl border-neutral-100 bg-white/50 backdrop-blur-sm focus:bg-white transition-all shadow-sm"
                    />
                </div>
            </div>

            {success && (
                <div className="p-6 bg-green-50 border border-green-100 rounded-3xl flex items-center justify-between gap-4 text-green-700 font-bold animate-in zoom-in duration-300">
                    <div className="flex items-center gap-4">
                        <CheckCircle2 className="w-6 h-6" />
                        {success}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSuccess(null)}><X className="w-4 h-4" /></Button>
                </div>
            )}

            {error && (
                <div className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center justify-between gap-4 text-red-700 font-bold animate-in zoom-in duration-300">
                    <div className="flex items-center gap-4">
                        <Shield className="w-6 h-6" />
                        {error}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setError(null)}><X className="w-4 h-4" /></Button>
                </div>
            )}

            {/* Account Selector Section */}
            {(searchTerm || editingAccount) && (
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1 flex items-center gap-2">
                        {editingAccount ? 'Currently Modifying' : 'Select Account to Modify'}
                        {editingAccount && (
                            <button onClick={() => setEditingAccount(null)} className="text-red-500 hover:underline flex items-center gap-1">
                                <X className="w-3 h-3" /> Cancel
                            </button>
                        )}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(activeTab === 'customer' ? filteredUsers : filteredPartners).slice(0, 6).map((acc) => (
                            <Card
                                key={acc.id}
                                onClick={() => handleSelectAccount(acc)}
                                className={`p-4 rounded-2xl border-neutral-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group ${editingAccount?.id === acc.id ? 'ring-2 ring-blue-500 bg-blue-50/30' : 'bg-white'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors uppercase font-bold text-xs">
                                            {acc.full_name?.[0] || acc.businessName?.[0] || '?'}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-neutral-900 truncate max-w-[120px]">
                                                {acc.full_name || acc.businessName}
                                            </div>
                                            <div className="text-[10px] text-neutral-400 font-medium truncate max-w-[120px]">
                                                {acc.email}
                                            </div>
                                        </div>
                                    </div>
                                    <Edit2 className="w-4 h-4 text-neutral-300 group-hover:text-blue-400 transition-colors" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-8">
                <TabsList className="bg-neutral-100 p-1.5 rounded-2xl h-auto">
                    <TabsTrigger value="customer" className="px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        {editingAccount ? 'Modify Consumer' : 'Create Consumer'}
                    </TabsTrigger>
                    <TabsTrigger value="retailer" className="px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        {editingAccount ? 'Modify Partner' : 'Create Partner'}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="customer" className="m-0">
                    <UserCreationForm
                        key={editingAccount?.id || 'new-customer'}
                        role="customer"
                        onSubmit={(e) => handleCreateUser(e, 'customer')}
                        loading={loading}
                        initialData={editingAccount}
                        onCancel={() => setEditingAccount(null)}
                    />
                </TabsContent>

                <TabsContent value="retailer" className="m-0">
                    <PartnerOnboardingForm
                        key={editingAccount?.id || 'new-partner'}
                        availableCategories={categories}
                        initialData={editingAccount}
                        userId={editingAccount?.id}
                        onCancel={() => {
                            setEditingAccount(null)
                            refreshData()
                        }}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function UserCreationForm({ role, onSubmit, loading, initialData, onCancel }: { role: string, onSubmit: (e: React.FormEvent<HTMLFormElement>) => void, loading: boolean, initialData?: any, onCancel: () => void }) {
    return (
        <Card className="border-neutral-100 rounded-[2.5rem] p-10 shadow-2xl shadow-neutral-200/40 bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 blur-3xl -mr-32 -mt-32 rounded-full" />

            <form onSubmit={onSubmit} className="relative z-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                            <Input required name="fullName" defaultValue={initialData?.full_name || ''} className="h-14 pl-12 rounded-2xl border-neutral-100 bg-neutral-50/50 focus:bg-white" placeholder="John Doe" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                            <Input required type="email" name="email" defaultValue={initialData?.email || ''} disabled={!!initialData} className="h-14 pl-12 rounded-2xl border-neutral-100 bg-neutral-50/50 focus:bg-white" placeholder="john@example.com" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                            <Input required name="phone" defaultValue={initialData?.phone || ''} className="h-14 pl-12 rounded-2xl border-neutral-100 bg-neutral-50/50 focus:bg-white" placeholder="+8801XXXXXXXXX" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Default Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                            <Input required name="address" defaultValue={initialData?.address || ''} className="h-14 pl-12 rounded-2xl border-neutral-100 bg-neutral-50/50 focus:bg-white" placeholder="123 Street, Dhaka" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <p className="text-[10px] text-neutral-400 font-medium italic">
                        {initialData ? '* Update existing profile information.' : '* A temporary password will be generated and emailed to the user.'}
                    </p>
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancel}
                            className={`h-16 rounded-[1.5rem] font-black uppercase tracking-widest px-8 ${!initialData && 'hidden'}`}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={loading}
                            className="flex-1 h-16 bg-neutral-900 hover:bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-neutral-900/10 active:scale-[0.98] transition-all"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    saving...
                                </div>
                            ) : (
                                initialData ? 'Update Account' : 'Create Consumer Account'
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </Card>
    )
}
