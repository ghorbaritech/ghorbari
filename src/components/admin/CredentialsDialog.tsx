import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Clipboard, Mail, ShieldAlert } from 'lucide-react'
import { sendCredentialsEmail } from '@/app/admin/onboarding/actions'

interface CredentialsDialogProps {
    credentials: {
        email: string
        fullName: string
        password: string
        id: string
    } | null
    onClose: () => void
}

export function CredentialsDialog({ credentials, onClose }: CredentialsDialogProps) {
    const [emailSending, setEmailSending] = useState(false)

    if (!credentials) return null

    const handleCopy = () => {
        const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`
        navigator.clipboard.writeText(text)
        toast.success('Credentials copied to clipboard!')
    }

    const handleSendEmail = async () => {
        setEmailSending(true)
        try {
            const res = await sendCredentialsEmail(
                credentials.email,
                credentials.fullName,
                credentials.password
            )
            if (res.error) {
                toast.error(res.error)
            } else if (res.simulated) {
                toast.warning('SMTP not configured (Simulated sending in server logs)')
            } else {
                toast.success(`Credentials successfully emailed to ${credentials.email}!`)
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to send email')
        } finally {
            setEmailSending(false)
        }
    }

    return (
        <Dialog open={!!credentials} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-800 text-white rounded-3xl p-6">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-lg font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-blue-400" />
                        Account Created
                    </DialogTitle>
                    <DialogDescription className="text-neutral-400 text-xs font-medium leading-relaxed">
                        The account has been created successfully. Below are the auto-generated temporary login credentials. Please copy them or send them to the user's email address.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Name</Label>
                        <Input readOnly value={credentials.fullName} className="bg-neutral-950 border-neutral-800 text-white rounded-xl h-11 text-sm font-semibold" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Email / Login Username</Label>
                        <Input readOnly value={credentials.email} className="bg-neutral-950 border-neutral-800 text-white rounded-xl h-11 text-sm font-semibold" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-neutral-500">Temporary Password</Label>
                        <Input readOnly type="text" value={credentials.password} className="bg-neutral-950 border-neutral-800 text-emerald-400 font-mono rounded-xl h-11 text-sm font-bold" />
                    </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                    <div className="flex gap-2">
                        <Button type="button" onClick={handleCopy} className="flex-1 h-11 bg-white hover:bg-neutral-200 text-black rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-2">
                            <Clipboard className="w-4 h-4" />
                            Copy Credentials
                        </Button>
                        <Button type="button" disabled={emailSending} onClick={handleSendEmail} className="flex-1 h-11 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-2">
                            <Mail className="w-4 h-4" />
                            {emailSending ? 'Sending...' : 'Send to Email'}
                        </Button>
                    </div>
                    <Button type="button" variant="outline" onClick={onClose} className="h-11 border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 hover:text-white rounded-xl font-bold uppercase tracking-wider text-[10px]">
                        Close & Proceed
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
