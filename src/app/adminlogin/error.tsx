'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an analytics service or console
        console.error('Admin Login Client Error:', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-900 px-4">
            <div className="text-center space-y-4">
                <h2 className="text-xl font-bold text-white">Something went wrong!</h2>
                <p className="text-neutral-400 text-sm max-w-md mx-auto">
                    {error.message || 'An unexpected error occurred while loading the admin console.'}
                </p>
                <button
                    onClick={() => reset()}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-bold uppercase text-xs tracking-widest"
                >
                    Try again
                </button>
            </div>
        </div>
    )
}
