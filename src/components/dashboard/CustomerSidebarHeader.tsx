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
import { User, Mail, Phone, Lock, Save, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export function CustomerSidebarHeader({ profile, email }: { profile: any, email: string | undefined }) {
    const [open, setOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const supabase = createClient()
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        phone_number: profile?.phone_number || '',
        password: '',
        confirmPassword: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password && formData.password !== formData.confirmPassword) {
            toast({
                title: "Passwords do not match",
                variant: "destructive"
            })
            return
        }

        setSaving(true)

        // Update profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: formData.full_name,
                phone_number: formData.phone_number,
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <Input
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="pl-9"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <Input
                                id="email"
                                value={email || ''}
                                disabled
                                className="pl-9 bg-neutral-100 opacity-70 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone_number">Phone Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <Input
                                id="phone_number"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="pt-2 border-t mt-4">
                        <h4 className="text-sm font-semibold mb-3">Change Password (Optional)</h4>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Leave blank to keep current"
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            {formData.password && (
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={saving}>
                            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
