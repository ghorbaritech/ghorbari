'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { User, Mail, Phone, MapPin, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface UserCreationFormProps {
    role: 'customer' | 'admin' | 'partner'
    onSubmit: (data: any) => void
    loading: boolean
    onCancel: () => void
    initialData?: any
}

export default function UserCreationForm({
    role,
    onSubmit,
    loading,
    onCancel,
    initialData
}: UserCreationFormProps) {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        temporaryPassword: ''
    })

    // Populate if editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                fullName: initialData.full_name || initialData.fullName || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                address: initialData.address || '',
                temporaryPassword: ''
            })
        }
    }, [initialData])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.email || !formData.fullName) {
            toast.error('Name and Email are required')
            return
        }
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-neutral-800 bg-neutral-900 rounded-[2rem] overflow-hidden shadow-2xl">
                <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <User className="w-4 h-4 text-blue-500" />
                                <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-400">Personal Details</Label>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-[11px] font-bold text-neutral-500 ml-1">Full Name</Label>
                                    <Input 
                                        id="fullName"
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                                        className="h-12 bg-neutral-950 border-neutral-800 rounded-xl focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-[11px] font-bold text-neutral-500 ml-1">Phone Number</Label>
                                    <Input 
                                        id="phone"
                                        placeholder="+8801XXXXXXXXX"
                                        value={formData.phone}
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                        className="h-12 bg-neutral-950 border-neutral-800 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <Mail className="w-4 h-4 text-blue-500" />
                                <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-400">Account Access</Label>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[11px] font-bold text-neutral-500 ml-1">Email Address</Label>
                                    <Input 
                                        id="email"
                                        type="email"
                                        placeholder="user@example.com"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        className="h-12 bg-neutral-950 border-neutral-800 rounded-xl disabled:opacity-50"
                                        disabled={!!initialData}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-[11px] font-bold text-neutral-500 ml-1">
                                        {initialData ? 'New Password (keep blank to skip)' : 'Temporary Password'}
                                    </Label>
                                    <Input 
                                        id="password"
                                        type="text"
                                        placeholder={initialData ? 'Required only for password reset' : 'Set initial password'}
                                        value={formData.temporaryPassword}
                                        onChange={e => setFormData({...formData, temporaryPassword: e.target.value})}
                                        className="h-12 bg-neutral-950 border-neutral-800 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-2 px-1">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-400">Residential Address</Label>
                        </div>
                        <Input 
                            placeholder="Street, City, Bangladesh"
                            value={formData.address}
                            onChange={e => setFormData({...formData, address: e.target.value})}
                            className="h-12 bg-neutral-950 border-neutral-800 rounded-xl"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center px-4">
                <Button variant="ghost" type="button" onClick={onCancel} className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] text-neutral-500 hover:text-white transition-all">
                    Cancel
                </Button>
                <Button type="submit" disabled={loading} className="h-14 px-12 bg-white hover:bg-neutral-200 text-black rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 transition-all">
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                        </div>
                    ) : (
                        initialData ? 'Update Profile' : 'Create Consumer Profile'
                    )}
                </Button>
            </div>
        </form>
    )
}
