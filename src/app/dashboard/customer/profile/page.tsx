"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Phone, MapPin, Save, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const supabase = createClient()
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        address: ''
    })

    useEffect(() => {
        async function fetchProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (data) {
                setProfile(data)
                setFormData({
                    full_name: data.full_name || '',
                    email: data.email || user.email || '',
                    phone_number: data.phone_number || '',
                    address: data.address || '' // Assuming address column exists or we add it
                })
            }
            setLoading(false)
        }
        fetchProfile()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: formData.full_name,
                phone_number: formData.phone_number,
                // address: formData.address // Only if column exists
            })
            .eq('id', profile.id)

        if (error) {
            toast({
                title: "Error updating profile",
                variant: "destructive"
            })
        } else {
            toast({
                title: "Profile updated",
                description: "Your changes have been saved."
            })
        }
        setSaving(false)
    }

    if (loading) return <div className="p-8 text-center">Loading profile...</div>

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <header>
                <h1 className="text-4xl font-black text-neutral-900 tracking-tighter italic mb-2">Profile Settings</h1>
                <p className="text-neutral-500 font-bold uppercase text-xs tracking-widest">Manage your personal information</p>
            </header>

            <Card className="p-8 border-none bg-white rounded-[40px] shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <Input
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="pl-10 h-12 rounded-2xl bg-neutral-50 border-transparent focus:bg-white transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <Input
                                id="email"
                                name="email"
                                value={formData.email}
                                disabled
                                className="pl-10 h-12 rounded-2xl bg-neutral-100 border-transparent opacity-70 cursor-not-allowed"
                            />
                        </div>
                        <p className="text-xs text-neutral-400 pl-1">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone_number">Phone Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <Input
                                id="phone_number"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className="pl-10 h-12 rounded-2xl bg-neutral-50 border-transparent focus:bg-white transition-colors"
                            />
                        </div>
                    </div>

                    {/* Address Field - If needed */}
                    {/* 
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <Input 
                                id="address" 
                                name="address" 
                                value={formData.address} 
                                onChange={handleChange}
                                className="pl-10 h-12 rounded-2xl bg-neutral-50 border-transparent focus:bg-white transition-colors"
                            />
                        </div>
                    </div>
                     */}

                    <div className="pt-4">
                        <Button type="submit" disabled={saving} className="w-full bg-neutral-900 text-white font-black uppercase tracking-widest h-12 rounded-2xl hover:bg-black transition-colors">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}
