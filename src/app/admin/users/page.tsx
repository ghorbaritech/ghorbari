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
    Users,
    FileCheck,
    FileSignature,
    Save,
    Printer,
    ExternalLink
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import PartnerOnboardingForm from '@/components/forms/PartnerOnboardingForm'
import UserCreationForm from '@/components/forms/UserCreationForm'
import { getUsers, getPartners, updateUserProfile, getCategories, verifyPartner, rejectPartner } from '@/app/admin/onboarding/actions'
import { getContractByPartnerId } from '@/app/admin/legal/actions'
import ContractReviewDialog from '@/components/legal/ContractReviewDialog'
import { createClient } from '@/utils/supabase/client'

export default function UserManagementPage() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Existing accounts state
    const [users, setUsers] = useState<any[]>([])
    const [partners, setPartners] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState('')

    // Editing & Creation state
    const [editingAccount, setEditingAccount] = useState<any | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [createRole, setCreateRole] = useState<'customer' | 'partner'>('customer')
    const [activeTab, setActiveTab] = useState<'customer' | 'retailer'>('customer')

    const [adminId, setAdminId] = useState<string | null>(null)
    const [activeContractId, setActiveContractId] = useState<string | null>(null)
    const [isContractDialogOpen, setIsContractDialogOpen] = useState(false)

    const refreshData = useCallback(async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setAdminId(user.id)

        const [uData, pData, cData] = await Promise.all([getUsers(), getPartners(), getCategories()])
        setUsers(uData)
        setPartners(pData)
        setCategories(cData)
    }, [])

    useEffect(() => {
        refreshData()
    }, [refreshData])

    useEffect(() => {
        if (editingAccount && activeTab === 'retailer') {
            getContractByPartnerId(editingAccount.id).then(id => {
                setActiveContractId(id)
            })
        } else {
            setActiveContractId(null)
        }
    }, [editingAccount, activeTab])

    const handleVerify = async (userId: string) => {
        if (!adminId) return
        setLoading(true)
        const res = await verifyPartner(userId, adminId)
        if (res.success) {
            setSuccess('Partner verified successfully!')
            refreshData()
            setEditingAccount(null)
        } else {
            setError(res.error || 'Verification failed')
        }
        setLoading(false)
    }

    const handleReject = async (userId: string) => {
        if (!adminId) return
        const reason = prompt('Enter rejection reason:')
        if (!reason) return
        
        setLoading(true)
        const res = await rejectPartner(userId, adminId, reason)
        if (res.success) {
            setSuccess('Partner application rejected.')
            refreshData()
            setEditingAccount(null)
        } else {
            setError(res.error || 'Operation failed')
        }
        setLoading(false)
    }

    const handleCreateUser = useCallback(async (arg: React.FormEvent<HTMLFormElement> | any, role: 'customer' | 'seller') => {
        if (arg?.preventDefault) arg.preventDefault()
        setLoading(true)
        setSuccess(null)
        setError(null)

        let data: any = {}
        if (arg?.currentTarget) {
            const formData = new FormData(arg.currentTarget)
            data = Object.fromEntries(formData.entries())
        } else {
            data = arg
        }

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
        // Find existing partner data if available
        const partnerData = partners.find(p => p.id === acc.id)
        const finalAcc = partnerData || acc

        // Switch tab first to prepare the UI container
        const isPartner = !!partnerData
        setActiveTab(isPartner ? 'retailer' : 'customer')
        
        // Then set the account to trigger the form mount/load
        // Use a small timeout if needed to let the Tab transition start
        setEditingAccount(finalAcc)
        setSearchTerm('')
    }, [partners])

    // Memoize the onCancel handler to be stable across renders
    const handleCancelEdit = useCallback(() => {
        setEditingAccount(null)
    }, [])

    const handleCancelCreate = useCallback(() => {
        setIsCreating(false)
    }, [])

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest">
                        <Users className="w-3 h-3" />
                        Identity Management
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">
                        User <span className="text-blue-500">Hub</span>
                    </h1>
                    <p className="text-neutral-400 font-medium">Manage and provision accounts for partners and customers.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="w-full md:w-80 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
                        <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-12 pl-12 rounded-2xl border-neutral-800 bg-neutral-900/50 backdrop-blur-sm focus:bg-neutral-900 text-white placeholder:text-neutral-500 transition-all shadow-xl"
                        />
                    </div>
                    <Button 
                        onClick={() => {
                            setIsCreating(true)
                            setEditingAccount(null)
                        }}
                        className="h-12 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-900/20 active:scale-95 transition-all whitespace-nowrap"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Profile
                    </Button>
                </div>
            </div>

            {success && (
                <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-3xl flex items-center justify-between gap-4 text-green-400 font-bold animate-in zoom-in duration-300">
                    <div className="flex items-center gap-4">
                        <CheckCircle2 className="w-6 h-6" />
                        {success}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-300 hover:bg-green-500/20"><X className="w-4 h-4" /></Button>
                </div>
            )}

            {error && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-between gap-4 text-red-400 font-bold animate-in zoom-in duration-300">
                    <div className="flex items-center gap-4">
                        <Shield className="w-6 h-6" />
                        {error}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setError(null)} className="text-red-400 hover:text-red-300 hover:bg-red-500/20"><X className="w-4 h-4" /></Button>
                </div>
            )}

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-8">
                <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                    <TabsList className="bg-neutral-900 border border-neutral-800 p-1.5 rounded-2xl h-auto">
                        <TabsTrigger value="customer" className="text-neutral-400 px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:text-white data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm transition-all">
                            Consumers
                        </TabsTrigger>
                        <TabsTrigger value="retailer" className="text-neutral-400 px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:text-white data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm transition-all">
                            Partners
                        </TabsTrigger>
                    </TabsList>

                    {editingAccount && (
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400 pl-1 flex items-center gap-2">
                            Modifying Account
                            <button onClick={() => setEditingAccount(null)} className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
                                <X className="w-3 h-3" /> Cancel
                            </button>
                        </h3>
                    )}
                </div>

                {isCreating && !editingAccount && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 bg-neutral-900/30 p-8 rounded-[2.5rem] border border-neutral-800/50">
                        <div className="flex flex-col gap-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 px-1">Select Account Type</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setCreateRole('customer')}
                                    className={`p-6 rounded-3xl border transition-all text-left flex items-center gap-4 ${createRole === 'customer' ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/20' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'}`}
                                >
                                    <div className={`p-4 rounded-2xl ${createRole === 'customer' ? 'bg-blue-500' : 'bg-neutral-800'}`}>
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-black uppercase tracking-widest text-[11px]">Consumer</div>
                                        <div className={`text-[10px] font-medium ${createRole === 'customer' ? 'text-blue-100' : 'text-neutral-500'}`}>Personal account for individual customers</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setCreateRole('partner')}
                                    className={`p-6 rounded-3xl border transition-all text-left flex items-center gap-4 ${createRole === 'partner' ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/20' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'}`}
                                >
                                    <div className={`p-4 rounded-2xl ${createRole === 'partner' ? 'bg-blue-500' : 'bg-neutral-800'}`}>
                                        <Store className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-black uppercase tracking-widest text-[11px]">Partner</div>
                                        <div className={`text-[10px] font-medium ${createRole === 'partner' ? 'text-blue-100' : 'text-neutral-500'}`}>Business account for sellers & providers</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {createRole === 'customer' ? (
                            <UserCreationForm
                                role="customer"
                                onSubmit={(data) => {
                                    handleCreateUser(data, 'customer')
                                    setIsCreating(false)
                                }}
                                loading={loading}
                                onCancel={handleCancelCreate}
                            />
                        ) : (
                            <PartnerOnboardingForm
                                availableCategories={categories}
                                onCancel={handleCancelCreate}
                            />
                        )}
                    </div>
                )}

                {!editingAccount && !isCreating ? (
                    <div className="overflow-x-auto bg-neutral-900 rounded-3xl border border-neutral-800 shadow-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-800 bg-neutral-900/50">
                                    <th className="px-6 py-5 text-xs font-black uppercase text-neutral-500 tracking-widest">User Profile</th>
                                    <th className="px-6 py-5 text-xs font-black uppercase text-neutral-500 tracking-widest hidden md:table-cell">Contact</th>
                                    <th className="px-6 py-5 text-xs font-black uppercase text-neutral-500 tracking-widest">Role</th>
                                    <th className="px-6 py-5 text-xs font-black uppercase text-neutral-500 tracking-widest">Status</th>
                                    <th className="px-6 py-5 text-xs font-black uppercase text-neutral-500 tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                                 {(activeTab === 'customer' ? filteredUsers : filteredPartners).map((acc) => (
                                    <tr
                                        key={acc.id}
                                        onClick={() => handleSelectAccount(acc)}
                                        className="group hover:bg-neutral-800/50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-colors uppercase font-bold text-sm shrink-0">
                                                    {acc.full_name?.[0] || acc.businessName?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white truncate max-w-[150px] md:max-w-xs">
                                                        {acc.full_name || acc.businessName}
                                                        {acc.profile?.onboarding_status === 'pending' && <span className="ml-2 text-[8px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-full ring-1 ring-amber-500/30 uppercase tracking-widest font-black">Unverified</span>}
                                                    </div>
                                                    <div className="text-xs text-neutral-500 hidden sm:block">
                                                        ID: {acc.id.substring(0, 8)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div className="text-sm text-neutral-300">{acc.email}</div>
                                            {acc.profile?.phone && <div className="text-xs text-neutral-500">{acc.profile.phone}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs font-semibold">
                                                {activeTab === 'customer' ? <User className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}
                                                {activeTab === 'customer' ? 'Consumer' : 'Partner'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                acc.profile?.onboarding_status === 'verified' 
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                    : acc.profile?.onboarding_status === 'pending'
                                                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                        : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${acc.profile?.onboarding_status === 'verified' ? 'bg-emerald-500' : acc.profile?.onboarding_status === 'pending' ? 'bg-amber-500' : 'bg-neutral-500'}`} />
                                                {acc.profile?.onboarding_status === 'verified' ? 'Verified' : acc.profile?.onboarding_status === 'pending' ? 'Unverified' : 'Registration Open'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-neutral-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl"
                                                onClick={(e) => { e.stopPropagation(); handleSelectAccount(acc); }}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(activeTab === 'customer' ? filteredUsers : filteredPartners).length === 0 && (
                            <div className="p-16 text-center text-neutral-500 flex flex-col items-center justify-center gap-4">
                                <Search className="w-8 h-8 text-neutral-700" />
                                <div>No users found matching your search.</div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-12">
                        {editingAccount && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                {/* Left Side: Documents & Verification */}
                                <div className="lg:col-span-4 space-y-8">
                                    {activeTab === 'retailer' && editingAccount.profile?.onboarding_status === 'pending' && (
                                        <Card className="p-8 border-amber-500/20 bg-amber-500/5 rounded-[2.5rem] space-y-6">
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-black text-amber-500 uppercase tracking-tighter italic">Review <span className="text-white">Registration</span></h3>
                                                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest leading-relaxed">Review the attached legal documents before approving partner status.</p>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">NID Document</span>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <a href={editingAccount.profile?.nid_front_url} target="_blank" className="aspect-video bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden hover:border-blue-500 transition-colors">
                                                            <img src={editingAccount.profile?.nid_front_url} className="w-full h-full object-cover opacity-50 hover:opacity-100" />
                                                        </a>
                                                        <a href={editingAccount.profile?.nid_back_url} target="_blank" className="aspect-video bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden hover:border-blue-500 transition-colors">
                                                            <img src={editingAccount.profile?.nid_back_url} className="w-full h-full object-cover opacity-50 hover:opacity-100" />
                                                        </a>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">Trade License</span>
                                                    <a href={editingAccount.profile?.trade_license_url} target="_blank" className="block p-4 bg-neutral-950 rounded-2xl border border-neutral-800 hover:border-blue-500 flex items-center justify-between group">
                                                        <div className="flex items-center gap-3">
                                                            <FileCheck className="w-4 h-4 text-blue-500" />
                                                            <span className="text-[10px] font-bold text-neutral-400 group-hover:text-white">View License PDF/Image</span>
                                                        </div>
                                                        <Edit2 className="w-3 h-3 text-neutral-700" />
                                                    </a>
                                                </div>
                                            </div>

                                            <div className="pt-6 flex flex-col gap-3">
                                                <Button 
                                                    onClick={() => setIsContractDialogOpen(true)}
                                                    className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-blue-900/40"
                                                >
                                                    <FileSignature className="w-3 h-3 mr-2" />
                                                    Review & Sign Agreement
                                                </Button>
                                                
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Button 
                                                        onClick={() => handleReject(editingAccount.id)}
                                                        disabled={loading}
                                                        variant="outline" 
                                                        className="h-12 border-red-500/20 hover:bg-red-500/10 text-red-500 rounded-xl font-black uppercase tracking-widest text-[9px]"
                                                    >
                                                        Reject
                                                    </Button>
                                                    <Button 
                                                        onClick={() => handleVerify(editingAccount.id)}
                                                        disabled={loading}
                                                        className="h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg shadow-emerald-900/40"
                                                    >
                                                        {loading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <CheckCircle2 className="w-3 h-3 mr-2" />}
                                                        Approve
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    )}

                                    <Card className="p-8 border-neutral-800 bg-neutral-900/50 backdrop-blur-xl rounded-[2.5rem] space-y-6">
                                        <div className="space-y-1">
                                            <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Account <span className="text-white">Status</span></h3>
                                            <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">System level flags and verification metadata.</p>
                                        </div>
                                        <div className="space-y-4 font-mono text-[10px]">
                                            <div className="flex justify-between py-2 border-b border-neutral-800">
                                                <span className="text-neutral-500 uppercase">Onboarding Step</span>
                                                <span className="text-blue-400 font-black">{editingAccount.profile?.onboarding_step || '0'}/4</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-neutral-800">
                                                <span className="text-neutral-500 uppercase">Phone Verified</span>
                                                <span className={editingAccount.profile?.phone_verified ? 'text-emerald-500' : 'text-red-500'}>
                                                    {editingAccount.profile?.phone_verified ? 'YES' : 'NO'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="text-neutral-500 uppercase">Last Updated</span>
                                                <span className="text-neutral-400">{new Date(editingAccount.profile?.updated_at || Date.now()).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Right Side: Profile Forms */}
                                <div className="lg:col-span-8">
                                    <div>
                                        <p className="text-neutral-400 font-medium mb-6">Update profile details and account settings for <span className="text-white font-bold italic">@{editingAccount.email.split('@')[0]}</span></p>
                                        {activeTab === 'customer' ? (
                                            <UserCreationForm
                                                role="customer"
                                                initialData={editingAccount}
                                                onSubmit={(data) => {
                                                    handleCreateUser(data, 'customer')
                                                    handleCancelEdit()
                                                }}
                                                loading={loading}
                                                onCancel={handleCancelEdit}
                                            />
                                        ) : (
                                            <PartnerOnboardingForm
                                                userId={editingAccount.id}
                                                initialData={editingAccount}
                                                availableCategories={categories}
                                                onCancel={handleCancelEdit}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Tabs>

            <ContractReviewDialog
                contractId={activeContractId}
                open={isContractDialogOpen}
                onOpenChange={setIsContractDialogOpen}
                onUpdated={() => {
                    refreshData()
                    setSuccess("Contract updated and signed!")
                }}
                onVerify={() => {
                    if (editingAccount) {
                        handleVerify(editingAccount.id)
                        setIsContractDialogOpen(false)
                    }
                }}
            />
        </div>
    )
}
