import PartnerOnboardingForm from '@/components/forms/PartnerOnboardingForm'
import { Button } from '@/components/ui/button'
import { generateDemoPartners } from './actions'
import { createClient } from '@/utils/supabase/server'

export default async function AdminOnboardingPage() {
    const supabase = await createClient()

    const { data: categories } = await supabase
        .from('product_categories')
        .select('id, name, type')
        .is('parent_id', null)
        .order('name')

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 italic">Platform Orchestrator</h1>
                    <p className="text-gray-500">Manage the Ghorbari Ecosystem - Onboard New Partners</p>
                </header>

                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                    <div className="mb-8 border-b pb-6 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Universal Partner Onboarding</h2>
                            <p className="text-gray-500 mt-2">
                                Register a new partner with any combination of roles:
                                <span className="font-bold text-primary-600 ml-1">Product Supplier</span>,
                                <span className="font-bold text-primary-600 ml-1">Design Provider</span>, or
                                <span className="font-bold text-primary-600 ml-1">Service Provider</span>.
                            </p>
                        </div>
                        <form action={async () => {
                            'use server'
                            await generateDemoPartners()
                        }}>
                            <Button variant="outline" size="sm" className="border-dashed border-red-300 text-red-500 hover:bg-red-50 hover:text-red-700">
                                🛠️ Generate Demo Data (Dev Only)
                            </Button>
                        </form>
                    </div>

                    <PartnerOnboardingForm availableCategories={categories || []} />
                </div>
            </div>
        </div>
    )
}
