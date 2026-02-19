'use client'

import { useState } from 'react'
import { checkUserStatus, manualFixProfile } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

export default function DebugAuthPage() {
    const [email, setEmail] = useState('auspicious@gmail.com')
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    async function handleCheck() {
        setLoading(true)
        try {
            const data = await checkUserStatus(email)
            setResult(data)
        } catch (e: any) {
            setResult({ error: e.message })
        }
        setLoading(false)
    }

    async function handleFix() {
        setLoading(true)
        try {
            const data = await manualFixProfile(email)
            setResult({ ...result, fix_attempt: data })
        } catch (e: any) {
            setResult({ ...result, fix_error: e.message })
        }
        setLoading(false)
    }

    async function handleSellerFix() {
        setLoading(true)
        try {
            const { fixSellerRecord } = await import('./actions')
            const data = await fixSellerRecord(email)
            setResult({ ...result, seller_fix_attempt: data })
        } catch (e: any) {
            setResult({ ...result, seller_fix_error: e.message })
        }
        setLoading(false)
    }


    return (
        <div className="p-8 max-w-2xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold">Auth Debugger</h1>

            <div className="flex gap-4">
                <Input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="User Email"
                />
                <Button onClick={handleCheck} disabled={loading}>
                    {loading ? 'Checking...' : 'Check Status'}
                </Button>
            </div>

            {result && (
                <div className="space-y-4">
                    <Card className="p-4 bg-gray-50 overflow-auto">
                        <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
                    </Card>

                    {result.auth_user && !result.profile_record && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
                            <strong>CRITICAL:</strong> User exists in Auth but has NO Profile record.
                            <br />
                            <Button onClick={handleFix} variant="destructive" className="mt-2">
                                Force Create Profile
                            </Button>
                        </div>
                    )}

                    {result.auth_user && result.profile_record && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded text-green-700">
                            <p>Profile Record Found! Role: <strong>{result.profile_record.role}</strong></p>

                            {result.profile_record.role !== 'customer' && (
                                <div className="mt-4 pt-4 border-t border-green-200">
                                    <p className="text-sm text-neutral-600 mb-2">If Dashboard is empty/broken, click this to ensure Seller/Designer data exists:</p>
                                    <Button onClick={handleSellerFix} className="bg-green-700 hover:bg-green-800 text-white">
                                        Fix Dashboard Data
                                    </Button>
                                    {result.seller_fix_attempt && (
                                        <pre className="mt-2 text-xs bg-white p-2 rounded border">{JSON.stringify(result.seller_fix_attempt, null, 2)}</pre>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
