"use client"

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Phone, Lock, Save, Loader2, MapPin } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export function CustomerSidebarHeader({ profile, email }: { profile: any, email: string | undefined }) {
    const [open, setOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const supabase = createClient()
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        phone_number: profile?.phone_number || '',
        address: profile?.address || '',
        oldPassword: '',
        password: '',
        confirmPassword: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password) {
            if (!formData.oldPassword) {
                toast({
                    title: "Old password required",
                    description: "Please enter your current password to set a new one.",
                    variant: "destructive"
                })
                return
            }
            if (formData.password !== formData.confirmPassword) {
                toast({
                    title: "Passwords do not match",
                    variant: "destructive"
                })
                return
            }
        }

        setSaving(true)

        // Capture previous info as historical log
        const changeLogEntry = {
            timestamp: new Date().toISOString(),
            previous_full_name: profile?.full_name,
            previous_phone_number: profile?.phone_number,
            previous_address: profile?.address,
            updated_fields: [] as string[]
        }

        if (profile?.full_name !== formData.full_name) changeLogEntry.updated_fields.push('full_name')
        if (profile?.phone_number !== formData.phone_number) changeLogEntry.updated_fields.push('phone_number')
        if ((profile?.address || '') !== formData.address) changeLogEntry.updated_fields.push('address')

        const currentLogs = profile?.change_log || []
        const newLogs = changeLogEntry.updated_fields.length > 0 ? [...currentLogs, changeLogEntry] : currentLogs

        // Update profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: formData.full_name,
                phone_number: formData.phone_number,
                address: formData.address,
                change_log: newLogs
            })
            .eq('id', profile.id)

        if (profileError) {
            toast({
                title: "Error updating profile",
                variant: "destructive"
            })
            setSaving(false)
            return
        }

        // Update password if provided
        if (formData.password) {
            // First verify the old password by attempting a sign in
            const { error: verifyError } = await supabase.auth.signInWithPassword({
                email: email || '',
                password: formData.oldPassword
            })

            if (verifyError) {
                toast({
                    title: "Incorrect current password",
                    description: "Please check your old password and try again.",
                    variant: "destructive"
                })
                setSaving(false)
                return
            }

            const { error: authError } = await supabase.auth.updateUser({
                password: formData.password
            })

            if (authError) {
                toast({
                    title: "Error updating password",
                    description: authError.message,
                    variant: "destructive"
                })
                setSaving(false)
                return
            }
        }

        toast({
            title: "Profile updated",
            description: "Your changes have been saved successfully."
        })

        setSaving(false)
        setOpen(false)

        // Optional: reload the page to immediately reflect changes in server components
        window.location.reload()
    }

    const initial = formData.full_name ? formData.full_name.charAt(0).toUpperCase() : 'C';

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="p-6 border-b border-neutral-100 bg-neutral-900 text-white cursor-pointer hover:bg-neutral-800 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center font-bold text-lg">
                            {initial}
                        </div>
                        <div>
                            <div className="font-bold">{formData.full_name || 'Customer'}</div>
                            <div className="text-xs opacity-70">Customer Account</div>
                        </div>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white text-neutral-900 border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Update Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="full_name" className="font-semibold text-neutral-700">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <Input
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="pl-9 bg-neutral-50 border-neutral-200"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="font-semibold text-neutral-700">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <Input
                                id="email"
                                value={email || ''}
                                disabled
                                className="pl-9 bg-neutral-100/50 border-neutral-200 text-neutral-500 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone_number" className="font-semibold text-neutral-700">Phone Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <Input
                                id="phone_number"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className="pl-9 bg-neutral-50 border-neutral-200"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address" className="font-semibold text-neutral-700">Delivery Address</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <Input
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="House, Road, Area, City"
                                className="pl-9 bg-neutral-50 border-neutral-200"
                            />
                        </div>
                    </div>

                    <div className="pt-2 border-t border-neutral-100 mt-4">
                        <h4 className="text-sm font-semibold mb-3 text-neutral-800">Change Password (Optional)</h4>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="oldPassword" className="font-semibold text-neutral-700">Current Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <Input
                                        id="oldPassword"
                                        name="oldPassword"
                                        type="password"
                                        value={formData.oldPassword}
                                        onChange={handleChange}
                                        placeholder="Required to change password"
                                        className="pl-9 bg-neutral-50 border-neutral-200"
                                    />
                                </div>
                            </div>

                            {formData.oldPassword && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="font-semibold text-neutral-700">New Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                            <Input
                                                id="password"
                                                name="password"
                                                type="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Enter new password"
                                                className="pl-9 bg-neutral-50 border-neutral-200"
                                            />
                                        </div>
                                    </div>
                                    {formData.password && (
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword" className="font-semibold text-neutral-700">Confirm New Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                                <Input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type="password"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    placeholder="Must match new password"
                                                    className="pl-9 bg-neutral-50 border-neutral-200"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end">
                        <Button type="submit" disabled={saving} className="bg-[#1e3a8a] hover:bg-[#1e3a8a]/90 text-white rounded-lg px-6 font-semibold">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
