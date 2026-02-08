'use client'

import { useState } from 'react'
import { submitServiceRequest } from '@/app/services/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

const SERVICE_TYPES = [
    { id: 'structural_design', label: 'Structural Design', description: 'Complete building plans and engineering' },
    { id: 'interior_design', label: 'Interior Design', description: 'Transform your indoor spaces' },
    { id: 'health_check', label: 'Structural Health Check', description: 'Assessment of existing structures' },
    { id: 'renovation', label: 'Renovation', description: 'Updates and repairs' }
]

export default function ServiceRequestForm() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        serviceType: '',
        projectType: 'residential',
        requirements: {
            plotSize: '',
            floors: '1',
            bedrooms: '2',
            budget: '5000',
            location: '',
            timeline: '3 months',
            style: [] as string[],
            specialRequirements: '',
        }
    })

    const nextStep = () => setStep(step + 1)
    const prevStep = () => setStep(step - 1)

    async function handleSubmit() {
        setLoading(true)
        const result = await submitServiceRequest(formData)
        if (result.success) {
            alert('Request submitted successfully! Number: ' + result.request.request_number)
            window.location.href = '/dashboard'
        } else {
            alert('Error: ' + result.error)
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-2 flex-1 rounded-full mx-1 ${step >= i ? 'bg-orange-600' : 'bg-gray-200'}`} />
                    ))}
                </div>
                <p className="text-sm font-medium text-gray-500">Step {step} of 4</p>
            </div>

            {step === 1 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">What service do you need?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {SERVICE_TYPES.map(type => (
                            <Card
                                key={type.id}
                                className={`p-4 cursor-pointer border-2 transition-all ${formData.serviceType === type.id ? 'border-orange-600 bg-orange-50' : 'border-transparent hover:border-orange-200'}`}
                                onClick={() => setFormData({ ...formData, serviceType: type.id })}
                            >
                                <h3 className="font-bold">{type.label}</h3>
                                <p className="text-sm text-gray-500">{type.description}</p>
                            </Card>
                        ))}
                    </div>
                    <div className="flex justify-end">
                        <Button disabled={!formData.serviceType} onClick={nextStep}>Continue</Button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Project Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Building Type</label>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={formData.projectType}
                                onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                            >
                                <option value="residential">Residential</option>
                                <option value="commercial">Commercial</option>
                                <option value="industrial">Industrial</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Plot Size (sqft)</label>
                            <Input
                                type="number"
                                value={formData.requirements.plotSize}
                                onChange={(e) => setFormData({ ...formData, requirements: { ...formData.requirements, plotSize: e.target.value } })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Number of Floors</label>
                            <Input
                                type="number"
                                value={formData.requirements.floors}
                                onChange={(e) => setFormData({ ...formData, requirements: { ...formData.requirements, floors: e.target.value } })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <Button variant="outline" onClick={prevStep}>Back</Button>
                        <Button onClick={nextStep}>Continue</Button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Location & Preferences</h2>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Project Location (City, State)</label>
                            <Input
                                value={formData.requirements.location}
                                onChange={(e) => setFormData({ ...formData, requirements: { ...formData.requirements, location: e.target.value } })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Special Requirements</label>
                            <textarea
                                className="w-full p-2 border rounded-md min-h-[100px]"
                                placeholder="Describe your vision..."
                                value={formData.requirements.specialRequirements}
                                onChange={(e) => setFormData({ ...formData, requirements: { ...formData.requirements, specialRequirements: e.target.value } })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <Button variant="outline" onClick={prevStep}>Back</Button>
                        <Button onClick={nextStep}>Review Request</Button>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Review Your Request</h2>
                    <Card className="p-6 bg-gray-50 space-y-4">
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Service</p>
                            <p className="font-medium">{SERVICE_TYPES.find(t => t.id === formData.serviceType)?.label}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Type</p>
                                <p className="font-medium">{formData.projectType}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Location</p>
                                <p className="font-medium">{formData.requirements.location}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Notes</p>
                            <p className="text-sm italic">{formData.requirements.specialRequirements || 'No additional notes'}</p>
                        </div>
                    </Card>
                    <div className="flex justify-between">
                        <Button variant="outline" onClick={prevStep}>Back</Button>
                        <Button className="bg-orange-600 hover:bg-orange-700 font-semibold" disabled={loading} onClick={handleSubmit}>
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

