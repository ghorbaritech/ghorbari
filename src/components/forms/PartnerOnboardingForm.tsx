'use client'

import { useState } from 'react'
import { createPartner } from '@/app/admin/onboarding/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

const PRODUCT_CATEGORIES = [
    'Cement & Concrete', 'Steel & Metal', 'Tiles & Flooring',
    'Paint & Finishes', 'Electrical & Plumbing', 'Doors & Windows',
    'Sanitary & Fixtures', 'Tools & Equipment'
]

const DESIGN_SPECIALIZATIONS = [
    'Architectural Design', 'Interior Design', 'Structural Engineering',
    'Landscape Design', 'Urban Planning', '3D Visualization'
]

const SERVICE_TYPES = [
    'Construction Work', 'Plumbing Service', 'Electrical Work',
    'Painting Service', 'Carpentry', 'Masonry', 'HVAC Installation'
]

export default function PartnerOnboardingForm() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    // Role States
    const [isSeller, setIsSeller] = useState(false)
    const [isDesigner, setIsDesigner] = useState(false)
    const [isServiceProvider, setIsServiceProvider] = useState(false)

    // Selection States
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([])
    const [selectedServices, setSelectedServices] = useState<string[]>([])

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const rawData = Object.fromEntries(formData.entries())

        // Prepare data payload
        const data = {
            ...rawData,
            roles: {
                seller: isSeller,
                designer: isDesigner,
                service_provider: isServiceProvider
            },
            seller_data: isSeller ? {
                primaryCategories: selectedCategories,
                commissionRate: rawData.commissionRate,
                paymentTerms: rawData.paymentTerms,
                businessType: rawData.businessType
            } : null,
            designer_data: isDesigner ? {
                specializations: selectedSpecializations,
                portfolioUrl: rawData.portfolioUrl,
                experienceYears: rawData.designExperience
            } : null,
            service_data: isServiceProvider ? {
                serviceTypes: selectedServices,
                experienceYears: rawData.serviceExperience
            } : null
        }

        try {
            const result = await createPartner(data)
            if (result?.error) {
                setError(result.error)
            } else {
                setSuccess(true)
            }
        } catch (e) {
            setError("Failed to create partner account")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="p-8 text-center bg-green-50 rounded-xl border border-green-100">
                <h3 className="text-xl font-bold text-green-800">Partner Account Created!</h3>
                <p className="text-green-600 mt-2">The partner can now log in with the provided credentials.</p>
                <div className="mt-4 flex justify-center gap-2">
                    <span className="text-xs font-bold uppercase px-2 py-1 bg-white rounded border border-green-200 text-green-700">
                        {isSeller && 'Seller'}
                    </span>
                    <span className="text-xs font-bold uppercase px-2 py-1 bg-white rounded border border-green-200 text-green-700">
                        {isDesigner && 'Designer'}
                    </span>
                    <span className="text-xs font-bold uppercase px-2 py-1 bg-white rounded border border-green-200 text-green-700">
                        {isServiceProvider && 'Service Provider'}
                    </span>
                </div>
                <Button onClick={() => {
                    setSuccess(false);
                    // Reset form
                    setIsSeller(false); setIsDesigner(false); setIsServiceProvider(false);
                }} className="mt-6">Add Another Partner</Button>
            </div>
        )
    }

    return (
        <form action={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
            {/* Account & Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Business Name</Label>
                            <Input name="businessName" required placeholder="BuildMaterials Ltd." />
                        </div>
                        <div className="space-y-2">
                            <Label>Business Email (Login)</Label>
                            <Input name="email" type="email" required placeholder="partner@ghorbari.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>Temporary Password</Label>
                            <Input name="temporaryPassword" type="text" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input name="phoneNumber" type="tel" required />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Role Selection */}
            <Card className="border-primary-100 bg-primary-50/30">
                <CardHeader>
                    <CardTitle className="text-primary-900">Partner Roles</CardTitle>
                    <p className="text-sm text-neutral-500">Select all roles that apply to this partner.</p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className={`p-4 border rounded-xl cursor-pointer transition-all ${isSeller ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-neutral-200 hover:border-primary-200 bg-white'}`}
                            onClick={() => setIsSeller(!isSeller)}>
                            <div className="flex items-center space-x-3">
                                <Checkbox checked={isSeller} onCheckedChange={(c) => setIsSeller(!!c)} />
                                <div>
                                    <div className="font-bold text-neutral-900">Product Supplier</div>
                                    <div className="text-xs text-neutral-500 mt-1">Sells materials & products</div>
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 border rounded-xl cursor-pointer transition-all ${isDesigner ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-neutral-200 hover:border-primary-200 bg-white'}`}
                            onClick={() => setIsDesigner(!isDesigner)}>
                            <div className="flex items-center space-x-3">
                                <Checkbox checked={isDesigner} onCheckedChange={(c) => setIsDesigner(!!c)} />
                                <div>
                                    <div className="font-bold text-neutral-900">Design Provider</div>
                                    <div className="text-xs text-neutral-500 mt-1">Architectural/Interior services</div>
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 border rounded-xl cursor-pointer transition-all ${isServiceProvider ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-neutral-200 hover:border-primary-200 bg-white'}`}
                            onClick={() => setIsServiceProvider(!isServiceProvider)}>
                            <div className="flex items-center space-x-3">
                                <Checkbox checked={isServiceProvider} onCheckedChange={(c) => setIsServiceProvider(!!c)} />
                                <div>
                                    <div className="font-bold text-neutral-900">Service Provider</div>
                                    <div className="text-xs text-neutral-500 mt-1">Contractors & Technicians</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dynamic Sections based on Role */}

            {/* SELLER SECTION */}
            {isSeller && (
                <Card className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <CardHeader className="border-b bg-neutral-50/50">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-neutral-500">Product Supplier Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-4">
                            <Label>Product Categories</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {PRODUCT_CATEGORIES.map(cat => (
                                    <div key={cat} className="flex items-center space-x-2">
                                        <Checkbox id={`cat-${cat}`}
                                            checked={selectedCategories.includes(cat)}
                                            onCheckedChange={(c) => c ? setSelectedCategories([...selectedCategories, cat]) : setSelectedCategories(selectedCategories.filter(x => x !== cat))}
                                        />
                                        <label htmlFor={`cat-${cat}`} className="text-sm cursor-pointer">{cat}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Business Type</Label>
                                <select name="businessType" className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                    <option value="manufacturer">Manufacturer</option>
                                    <option value="distributor">Distributor</option>
                                    <option value="retailer">Retailer</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Commission Rate (%)</Label>
                                <Input name="commissionRate" type="number" step="0.5" defaultValue="10" />
                            </div>
                            <div className="space-y-2">
                                <Label>Payment Terms</Label>
                                <select name="paymentTerms" className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                    <option value="net7">Net 7 Days</option>
                                    <option value="net15">Net 15 Days</option>
                                    <option value="net30">Net 30 Days</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* DESIGNER SECTION */}
            {isDesigner && (
                <Card className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <CardHeader className="border-b bg-neutral-50/50">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-neutral-500">Design Provider Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-4">
                            <Label>Specializations</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {DESIGN_SPECIALIZATIONS.map(spec => (
                                    <div key={spec} className="flex items-center space-x-2">
                                        <Checkbox id={`spec-${spec}`}
                                            checked={selectedSpecializations.includes(spec)}
                                            onCheckedChange={(c) => c ? setSelectedSpecializations([...selectedSpecializations, spec]) : setSelectedSpecializations(selectedSpecializations.filter(x => x !== spec))}
                                        />
                                        <label htmlFor={`spec-${spec}`} className="text-sm cursor-pointer">{spec}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Experience (Years)</Label>
                                <Input name="designExperience" type="number" defaultValue="0" />
                            </div>
                            <div className="space-y-2">
                                <Label>Portfolio URL</Label>
                                <Input name="portfolioUrl" placeholder="https://behance.net/..." />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* SERVICE PROVIDER SECTION */}
            {isServiceProvider && (
                <Card className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <CardHeader className="border-b bg-neutral-50/50">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-neutral-500">Service Provider Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-4">
                            <Label>Service Offerings</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {SERVICE_TYPES.map(svc => (
                                    <div key={svc} className="flex items-center space-x-2">
                                        <Checkbox id={`svc-${svc}`}
                                            checked={selectedServices.includes(svc)}
                                            onCheckedChange={(c) => c ? setSelectedServices([...selectedServices, svc]) : setSelectedServices(selectedServices.filter(x => x !== svc))}
                                        />
                                        <label htmlFor={`svc-${svc}`} className="text-sm cursor-pointer">{svc}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Experience (Years)</Label>
                                <Input name="serviceExperience" type="number" defaultValue="0" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {error && <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">{error}</div>}

            <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button variant="ghost" type="reset">Reset Form</Button>
                <Button type="submit" disabled={loading || (!isSeller && !isDesigner && !isServiceProvider)} size="lg" className="px-8 font-bold">
                    {loading ? 'Creating...' : 'Create Partner Account'}
                </Button>
            </div>
        </form>
    )
}
