'use client'

import { useState } from 'react'
import { createDesigner } from '@/app/admin/onboarding/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

const SPECIALIZATIONS = [
    'Residential Design',
    'Commercial Design',
    'Interior Design',
    'Structural Engineering',
    'Landscape Architecture'
]

export default function DesignerOnboardingForm() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([])

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const rawData = Object.fromEntries(formData.entries())
        const data = {
            ...rawData,
            specializations: selectedSpecializations,
            // In a real app, you'd handle file uploads here
        }

        const result = await createDesigner(data)

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
            <div className="p-8 text-center bg-green-50 rounded-xl">
                <h3 className="text-xl font-bold text-green-800">Designer Created Successfully!</h3>
                <p className="text-green-600 mt-2">An invitation email has been sent to the designer.</p>
                <Button onClick={() => setSuccess(false)} className="mt-4">Create Another</Button>
            </div>
        )
    }

    return (
        <form action={handleSubmit} className="space-y-8 max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Authentication */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Authentication</h3>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Designer Email</label>
                        <Input name="email" type="email" required placeholder="email@example.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Temporary Password</label>
                        <Input name="temporaryPassword" type="text" required placeholder="Temp1234!" />
                    </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Company Name</label>
                        <Input name="companyName" required placeholder="Studio Design Inc." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Contact Person Name</label>
                        <Input name="contactPersonName" required placeholder="John Smith" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Phone Number</label>
                        <Input name="phoneNumber" required placeholder="+1234567890" />
                    </div>
                </div>

                {/* Professional Details */}
                <div className="space-y-4 md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Details</h3>
                    <div className="space-y-3">
                        <label className="text-sm font-medium">Specializations</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {SPECIALIZATIONS.map(spec => (
                                <div key={spec} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={spec}
                                        onCheckedChange={(checked) => {
                                            if (checked) setSelectedSpecializations([...selectedSpecializations, spec])
                                            else setSelectedSpecializations(selectedSpecializations.filter(s => s !== spec))
                                        }}
                                    />
                                    <label htmlFor={spec} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        {spec}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Years of Experience</label>
                            <Input name="yearsOfExperience" type="number" placeholder="5" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">License Number</label>
                            <Input name="professionalLicenseNumber" placeholder="ABC-123456" />
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4 md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Service Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Hourly Rate ($)</label>
                            <Input name="hourlyRate" type="number" placeholder="100" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Minimum Project Size ($)</label>
                            <Input name="minimumProjectSize" type="number" placeholder="1000" />
                        </div>
                    </div>
                </div>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

            <div className="flex justify-end space-x-4 pt-6 border-t font-semibold">
                <Button variant="outline" type="reset">Reset Form</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Creating Designer...' : 'Create Designer Account'}
                </Button>
            </div>
        </form>
    )
}

