'use client'

import { useState } from 'react'
import { createPartner, updatePartner } from '@/app/admin/onboarding/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useEffect } from 'react'

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

interface PartnerOnboardingFormProps {
    availableCategories?: { id: string, name: string, type?: string }[]
    initialData?: any
    userId?: string
    onCancel?: () => void
}

export default function PartnerOnboardingForm({
    availableCategories = [],
    initialData,
    userId,
    onCancel
}: PartnerOnboardingFormProps) {
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

    // Populate from initialData - ONLY depend on initialData
    useEffect(() => {
        if (initialData) {
            setIsSeller(!!initialData.roles?.seller)
            setIsDesigner(!!initialData.roles?.designer)
            setIsServiceProvider(!!initialData.roles?.service_provider)
            setSelectedCategories(initialData.seller_data?.primary_categories || [])
            setSelectedSpecializations(initialData.designer_data?.specializations || [])
            setSelectedServices(initialData.service_data?.service_types || [])
        } else {
            // Reset for new
            setIsSeller(false)
            setIsDesigner(false)
            setIsServiceProvider(false)
            setSelectedCategories([])
            setSelectedSpecializations([])
            setSelectedServices([])
        }
    }, [initialData])

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
            const result = userId
                ? await updatePartner(userId, data)
                : await createPartner(data)

            if (result?.error) {
                console.error("Action error result:", result.error);
                setError(result.error)
            } else {
                setSuccess(true)
            }
        } catch (e: any) {
            console.error("Partner Action Caught Error:", e);
            setError(`Failed: ${e.message || JSON.stringify(e)}`)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="p-8 text-center bg-green-50 rounded-xl border border-green-100 italic transition-all animate-in zoom-in duration-300">
                <h3 className="text-xl font-bold text-green-800">
                    {userId ? 'Partner Account Updated!' : 'Partner Account Created!'}
                </h3>
                <p className="text-green-600 mt-2">The partner information has been successfully {userId ? 'updated' : 'provisioned'}.</p>
                <Button onClick={() => {
                    setSuccess(false);
                    if (onCancel) onCancel();
                }} className="mt-6 font-bold uppercase tracking-widest text-[10px]">Close</Button>
            </div>
        )
    }

    // Categories to display: either passed props (DB) or fallback hardcoded (if fetch failed or empty)
    const productCategories = Array.from(new Set(availableCategories.filter(c => !c.type || c.type === 'product').map(c => c.name)));
    const categoriesToDisplay = productCategories.length > 0
        ? productCategories
        : [
            'Cement & Concrete', 'Steel & Metal', 'Tiles & Flooring',
            'Paint & Finishes', 'Electrical & Plumbing', 'Doors & Windows',
            'Sanitary & Fixtures', 'Tools & Equipment'
        ];

    const designCategories = Array.from(new Set(availableCategories.filter(c => c.type === 'design').map(c => c.name)));
    const specializationsToDisplay = designCategories.length > 0
        ? designCategories
        : DESIGN_SPECIALIZATIONS;

    const serviceCategories = Array.from(new Set(availableCategories.filter(c => c.type === 'service').map(c => c.name)));
    const servicesToDisplay = serviceCategories.length > 0
        ? serviceCategories
        : SERVICE_TYPES;

    return (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)); }} className="space-y-8 max-w-5xl mx-auto">
            {/* Account & Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Business Name</Label>
                            <Input name="businessName" required defaultValue={initialData?.businessName || ''} placeholder="BuildMaterials Ltd." />
                        </div>
                        <div className="space-y-2">
                            <Label>Business Email (Login)</Label>
                            <Input name="email" type="email" required disabled={!!userId} defaultValue={initialData?.email || ''} placeholder="partner@ghorbari.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>Temporary Password</Label>
                            <Input name="temporaryPassword" type="text" required={!userId} disabled={!!userId} placeholder={userId ? "********" : ""} />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input name="phoneNumber" type="tel" required defaultValue={initialData?.profile?.phone || ''} placeholder="+8801XXXXXXXXX" />
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
                                <Checkbox
                                    checked={isSeller}
                                    onCheckedChange={(c) => setIsSeller(!!c)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <div>
                                    <div className="font-bold text-neutral-900">Product Supplier</div>
                                    <div className="text-xs text-neutral-500 mt-1">Sells materials & products</div>
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 border rounded-xl cursor-pointer transition-all ${isDesigner ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-neutral-200 hover:border-primary-200 bg-white'}`}
                            onClick={() => setIsDesigner(!isDesigner)}>
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    checked={isDesigner}
                                    onCheckedChange={(c) => setIsDesigner(!!c)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <div>
                                    <div className="font-bold text-neutral-900">Design Provider</div>
                                    <div className="text-xs text-neutral-500 mt-1">Architectural/Interior services</div>
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 border rounded-xl cursor-pointer transition-all ${isServiceProvider ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-neutral-200 hover:border-primary-200 bg-white'}`}
                            onClick={() => setIsServiceProvider(!isServiceProvider)}>
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    checked={isServiceProvider}
                                    onCheckedChange={(c) => setIsServiceProvider(!!c)}
                                    onClick={(e) => e.stopPropagation()}
                                />
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
                                {categoriesToDisplay.map(cat => (
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
                                <select
                                    name="businessType"
                                    defaultValue={initialData?.seller_data?.business_type || 'manufacturer'}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="manufacturer">Manufacturer</option>
                                    <option value="distributor">Distributor</option>
                                    <option value="retailer">Retailer</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Commission Rate (%)</Label>
                                <Input name="commissionRate" type="number" step="0.5" defaultValue={initialData?.seller_data?.commission_rate || "10"} />
                            </div>
                            <div className="space-y-2">
                                <Label>Payment Terms</Label>
                                <select
                                    name="paymentTerms"
                                    defaultValue={initialData?.seller_data?.payment_terms || 'net7'}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
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
                                {specializationsToDisplay.map(spec => (
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
                                <Input name="designExperience" type="number" defaultValue={initialData?.designer_data?.experience_years || "0"} />
                            </div>
                            <div className="space-y-2">
                                <Label>Portfolio URL</Label>
                                <Input name="portfolioUrl" defaultValue={initialData?.designer_data?.portfolio_url || ""} placeholder="https://behance.net/..." />
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
                                {servicesToDisplay.map(svc => (
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
                                <Input name="serviceExperience" type="number" defaultValue={initialData?.service_data?.experience_years || "0"} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {error && <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">{error}</div>}

            <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={loading || (!isSeller && !isDesigner && !isServiceProvider)} size="lg" className="px-8 font-bold">
                    {loading ? (userId ? 'Updating...' : 'Creating...') : (userId ? 'Update Partner' : 'Create Partner Account')}
                </Button>
            </div>
        </form>
    )
}
