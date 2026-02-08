'use client'

import { useState } from 'react'
import DesignerOnboardingForm from '@/components/forms/DesignerOnboardingForm'
import SellerOnboardingForm from '@/components/forms/SellerOnboardingForm'
import { Button } from '@/components/ui/button'

export default function AdminOnboardingPage() {
    const [tab, setTab] = useState<'designer' | 'seller'>('designer')

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 italic">Platform Orchestrator</h1>
                    <p className="text-gray-500">Manage the Ghorbari Ecosystem - Onboard New Partners</p>
                </header>

                <div className="flex space-x-4 mb-8">
                    <Button
                        variant={tab === 'designer' ? 'default' : 'outline'}
                        onClick={() => setTab('designer')}
                        className="rounded-full px-8"
                    >
                        Designers & Agencies
                    </Button>
                    <Button
                        variant={tab === 'seller' ? 'default' : 'outline'}
                        onClick={() => setTab('seller')}
                        className="rounded-full px-8"
                    >
                        Material Sellers
                    </Button>
                </div>

                <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100">
                    {tab === 'designer' ? (
                        <div className="p-4">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold">Add Professional Designer</h2>
                                <p className="text-sm text-gray-500">Register new architects, structural engineers, or interior design agencies.</p>
                            </div>
                            <DesignerOnboardingForm />
                        </div>
                    ) : (
                        <div className="p-4">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold">Add Material Supplier</h2>
                                <p className="text-sm text-gray-500">Onboard manufacturers, distributors, or local retail hardware stores.</p>
                            </div>
                            <SellerOnboardingForm />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
