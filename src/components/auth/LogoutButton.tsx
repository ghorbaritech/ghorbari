"use client"

import { createClient } from '@/utils/supabase/client'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoutButtonProps {
    className?: string
    showLabel?: boolean
    label?: string
    redirectPath?: string
}

export function LogoutButton({
    className,
    showLabel = true,
    label = "Sign Out",
    redirectPath = "/"
}: LogoutButtonProps) {
    const supabase = createClient()

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut()
        } catch (err) {
            console.error("Sign out error:", err)
        } finally {
            window.location.href = redirectPath
        }
    }

    return (
        <button
            onClick={handleLogout}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors",
                className
            )}
        >
            <LogOut className="w-5 h-5" />
            {showLabel && <span>{label}</span>}
        </button>
    )
}
