'use client'

import { useState } from 'react'
import { createSeller } from '@/app/admin/onboarding/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

const PRODUCT_CATEGORIES = [
    'Cement & Concrete',
    'Steel & Metal',
    'Tiles & Flooring',
    'Paint & Finishes',
    'Electrical & Plumbing',
    'Doors & Windows',
    'Sanitary & Fixtures',
    'Tools & Equipment'
]

export default function SellerOnboardingForm() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const rawData = Object.fromEntries(formData.entries())
        const data = {
            ...rawData,
            primaryCategories: selectedCategories,
        }

        const result = await createSeller(data)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            setSuccess(true)
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="p-8 text-center bg-blue-50 rounded-xl">
                <h3 className="text-xl font-bold text-blue-800">Seller Account Created!</h3>
                <p className="text-blue-600 mt-2">The seller can now log in and add products.</p>
                <Button onClick={() => setSuccess(false)} className="mt-4">Add Another Seller</Button>
            </div>
        )
    }

    return (
        <form action={handleSubmit} className="space-y-8 max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Auth */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Account Access</h3>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Business Email</label>
                        <Input name="email" type="email" required placeholder="business@example.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Temporary Password</label>
                        <Input name="temporaryPassword" type="text" required />
                    </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Business Information</h3>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Business Name</label>
                        <Input name="businessName" required placeholder="BuildMaterials Ltd." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Business Type</label>
                        <select name="businessType" className="w-full p-2 border rounded-md" required>
                            <option value="manufacturer">Manufacturer</option>
                            <option value="distributor">Distributor</option>
                            <option value="retailer">Retailer</option>
                        </select>
                    </div>
                </div>

                {/* Categories */}
                <div className="space-y-4 md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Product Categories</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-semibold">
                        {PRODUCT_CATEGORIES.map(cat => (
                            <div key={cat} className="flex items-center space-x-2">
                                <Checkbox
                                    id={cat}
                                    onCheckedChange={(checked) => {
                                        if (checked) setSelectedCategories([...selectedCategories, cat])
                                        else setSelectedCategories(selectedCategories.filter(s => s !== cat))
                                    }}
                                />
                                <label htmlFor={cat} className="text-xs font-medium">{cat}</label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Commission */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Commission & Terms</h3>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Commission Rate (%)</label>
                        <Input name="commissionRate" type="number" step="0.5" required placeholder="10" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Payment Terms</label>
                        <select name="paymentTerms" className="w-full p-2 border rounded-md" required>
                            <option value="net7">Net 7 Days</option>
                            <option value="net15">Net 15 Days</option>
                            <option value="net30">Net 30 Days</option>
                        </select>
                    </div>
                </div>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

            <div className="flex justify-end space-x-4 pt-6 border-t font-semibold">
                <Button variant="outline" type="reset">Reset Form</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Creating Seller...' : 'Register Seller'}
                </Button>
            </div>
        </form>
    )
}

