'use client'

import { useState } from 'react'
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
    CheckCircle2
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default function UserManagementPage() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)

    async function handleCreateUser(e: React.FormEvent<HTMLFormElement>, role: 'customer' | 'seller') {
        e.preventDefault()
        setLoading(true)
        setSuccess(null)

        // Simulating user creation logic
        // In reality, this would call a server action that creates auth user and profile
        await new Promise(r => setTimeout(r, 1500))

        setLoading(false)
        setSuccess(`${role === 'seller' ? 'Retailer' : 'Consumer'} account created successfully!`)
        const form = e.target as HTMLFormElement
        form.reset()
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                    <UserPlus className="w-3 h-3" />
                    Identity Management
                </div>
                <h1 className="text-5xl font-black text-neutral-900 tracking-tighter uppercase italic">
                    User <span className="text-blue-600">Hub</span>
                </h1>
                <p className="text-neutral-500 font-medium">Provision new accounts for partners and customers.</p>
            </div>

            {success && (
                <div className="p-6 bg-green-50 border border-green-100 rounded-3xl flex items-center gap-4 text-green-700 font-bold animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-6 h-6" />
                    {success}
                </div>
            )}

            <Tabs defaultValue="customer" className="space-y-8">
                <TabsList className="bg-neutral-100 p-1.5 rounded-2xl h-auto">
                    <TabsTrigger value="customer" className="px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Create Consumer</TabsTrigger>
                    <TabsTrigger value="retailer" className="px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Create Retailer</TabsTrigger>
                </TabsList>

                <TabsContent value="customer" className="m-0">
                    <UserCreationForm role="customer" onSubmit={(e) => handleCreateUser(e, 'customer')} loading={loading} />
                </TabsContent>

                <TabsContent value="retailer" className="m-0">
                    <UserCreationForm role="seller" onSubmit={(e) => handleCreateUser(e, 'seller')} loading={loading} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function UserCreationForm({ role, onSubmit, loading }: { role: string, onSubmit: (e: React.FormEvent<HTMLFormElement>) => void, loading: boolean }) {
    return (
        <Card className="border-neutral-100 rounded-[2.5rem] p-10 shadow-2xl shadow-neutral-200/40 bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 blur-3xl -mr-32 -mt-32 rounded-full" />

            <form onSubmit={onSubmit} className="relative z-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                            <Input required name="fullName" className="h-14 pl-12 rounded-2xl border-neutral-100 bg-neutral-50/50 focus:bg-white" placeholder="John Doe" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                            <Input required type="email" name="email" className="h-14 pl-12 rounded-2xl border-neutral-100 bg-neutral-50/50 focus:bg-white" placeholder="john@example.com" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                            <Input required name="phone" className="h-14 pl-12 rounded-2xl border-neutral-100 bg-neutral-50/50 focus:bg-white" placeholder="+8801XXXXXXXXX" />
                        </div>
                    </div>

                    {role === 'seller' ? (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Business Name</label>
                            <div className="relative">
                                <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                                <Input required name="businessName" className="h-14 pl-12 rounded-2xl border-neutral-100 bg-neutral-50/50 focus:bg-white" placeholder="Ghorbari Materials Ltd." />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 pl-1">Default Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-300" />
                                <Input required name="address" className="h-14 pl-12 rounded-2xl border-neutral-100 bg-neutral-50/50 focus:bg-white" placeholder="123 Street, Dhaka" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4 pt-4">
                    <p className="text-[10px] text-neutral-400 font-medium italic">
                        * A temporary password will be generated and emailed to the user.
                    </p>
                    <Button
                        disabled={loading}
                        className="w-full h-16 bg-neutral-900 hover:bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-neutral-900/10 active:scale-[0.98] transition-all"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                provisioning...
                            </div>
                        ) : (
                            `Create ${role === 'seller' ? 'Retailer' : 'Consumer'} Account`
                        )}
                    </Button>
                </div>
            </form>
        </Card>
    )
}
