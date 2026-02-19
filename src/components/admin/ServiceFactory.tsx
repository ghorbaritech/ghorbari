'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Briefcase,
    CheckCircle2,
    Loader2,
    Wrench,
    Save
} from 'lucide-react'
import { getServiceFactoryData, updateProviderServices } from '@/app/admin/services/actions'

export function ServiceFactory() {
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [providers, setProviders] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])

    const [selectedProviderId, setSelectedProviderId] = useState<string>('')
    const [selectedServices, setSelectedServices] = useState<string[]>([])
    const [success, setSuccess] = useState<string | null>(null)

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true)
                console.log('ServiceFactory: Loading data...')
                const { providers, categories } = await getServiceFactoryData()

                setProviders(providers)
                setCategories(categories)
            } catch (err) {
                console.error('ServiceFactory: loadData failed:', err)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    // When provider changes, update the selected services state
    useEffect(() => {
        if (!selectedProviderId) {
            setSelectedServices([])
            return
        }

        const provider = providers.find(p => p.id === selectedProviderId)
        if (provider) {
            setSelectedServices(provider.service_types || [])
        }
    }, [selectedProviderId, providers])

    const handleServiceToggle = (serviceName: string) => {
        if (selectedServices.includes(serviceName)) {
            setSelectedServices(selectedServices.filter(s => s !== serviceName))
        } else {
            setSelectedServices([...selectedServices, serviceName])
        }
    }

    const handleSave = async () => {
        if (!selectedProviderId) return

        setUpdating(true)
        setSuccess(null)

        const result = await updateProviderServices(selectedProviderId, selectedServices)

        if (result.success) {
            setSuccess('Provider services updated successfully!')
            // Update local state to reflect saved changes (so if we switch back and forth it persists)
            setProviders(providers.map(p =>
                p.id === selectedProviderId
                    ? { ...p, service_types: selectedServices }
                    : p
            ))
            setTimeout(() => setSuccess(null), 3000)
        } else {
            alert('Failed to update: ' + result.message)
        }

        setUpdating(false)
    }

    if (loading) {
        return <div className="min-h-[400px] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-neutral-400" /></div>
    }

    function updatedProvider(id: string) {
        return providers.find(p => p.id === id)
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                        <Wrench className="w-3 h-3" />
                        Service Logistics
                    </div>
                    <h1 className="text-5xl font-black text-neutral-900 tracking-tighter uppercase italic">
                        Service <span className="text-blue-600">Factory</span>
                    </h1>
                    <p className="text-neutral-500 font-medium">Manage service provider capabilities and enlistments.</p>
                </div>
            </div>

            {success && (
                <div className="p-6 rounded-3xl flex items-center gap-4 font-bold border bg-green-50 border-green-100 text-green-700 animate-in zoom-in duration-300">
                    <CheckCircle2 className="w-6 h-6" />
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Controller Panel */}
                <div className="space-y-6">
                    <Card className="p-8 border-none shadow-xl rounded-[2.5rem] bg-white">
                        <h3 className="text-xl font-black text-neutral-900 uppercase italic mb-6">Select Provider</h3>
                        <div className="space-y-4">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Service Provider</label>
                            <select
                                value={selectedProviderId}
                                onChange={(e) => setSelectedProviderId(e.target.value)}
                                className="w-full h-14 px-4 rounded-2xl border-2 border-neutral-100 bg-neutral-50/50 font-bold text-neutral-900 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer hover:border-blue-200"
                            >
                                <option value="">Select a Partner...</option>
                                {providers.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.business_name} {p.verification_status === 'verified' ? '✓' : ''}
                                    </option>
                                ))}
                            </select>

                            {selectedProviderId && (
                                <div className="pt-6 animate-in slide-in-from-top-4 fade-in">
                                    <div className="p-4 bg-blue-50 rounded-2xl space-y-2">
                                        <p className="text-xs font-bold text-blue-400 uppercase">Current Status</p>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${updatedProvider(selectedProviderId)?.verification_status === 'verified' ? 'bg-green-500' : 'bg-orange-500'}`} />
                                            <span className="font-bold text-blue-900 capitalize">
                                                {updatedProvider(selectedProviderId)?.verification_status || 'Unknown'}
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-blue-700/60">
                                            Contact: {updatedProvider(selectedProviderId)?.contact_person || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="p-8 border-none shadow-sm rounded-[2.5rem] bg-neutral-900 text-white">
                        <h3 className="text-xl font-black uppercase italic mb-4">Quick Guide</h3>
                        <ul className="space-y-3 text-xs font-medium text-neutral-400 leading-relaxed list-disc list-inside marker:text-blue-500">
                            <li>Select a provider from the dropdown.</li>
                            <li>Check all services they are qualified to perform.</li>
                            <li>Click 'Save Capabilities' to update their profile instantly.</li>
                            <li>These services will appear in the customer Concierge flow.</li>
                        </ul>
                    </Card>
                </div>

                {/* Services Grid */}
                <Card className="lg:col-span-2 border-none shadow-2xl rounded-[3rem] p-10 bg-white relative overflow-hidden min-h-[600px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 blur-3xl -mr-32 -mt-32 rounded-full pointer-events-none" />

                    {!selectedProviderId ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                            <Briefcase className="w-16 h-16 text-neutral-300" />
                            <p className="text-xl font-black text-neutral-300 uppercase">Select a provider to begin</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 relative z-10">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-black text-neutral-900 uppercase">Service <span className="text-blue-600">Enlistment</span></h2>
                                <span className="bg-neutral-100 text-neutral-500 px-3 py-1 rounded-full text-xs font-bold">
                                    {selectedServices.length} Selected
                                </span>
                            </div>

                            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                                {categories.filter(c => !c.parent_id).map(parent => {
                                    const subcategories = categories.filter(c => c.parent_id === parent.id)

                                    return (
                                        <div key={parent.id} className="space-y-4">
                                            <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                                                <h3 className="font-extrabold text-lg text-neutral-900 uppercase tracking-tight">{parent.name}</h3>
                                                <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-2 py-1 rounded-full">{subcategories.length} Sub-services</span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Parent Checkbox (General) */}
                                                <label
                                                    className={`
                                                        flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all group
                                                        ${selectedServices.includes(parent.name)
                                                            ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md shadow-blue-100'
                                                            : 'border-neutral-100 hover:border-blue-200 hover:bg-neutral-50 text-neutral-500'
                                                        }
                                                    `}
                                                >
                                                    <Checkbox
                                                        checked={selectedServices.includes(parent.name)}
                                                        onCheckedChange={() => handleServiceToggle(parent.name)}
                                                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 w-5 h-5 border-neutral-300"
                                                    />
                                                    <span className="font-bold flex-1">General {parent.name}</span>
                                                    {selectedServices.includes(parent.name) && <CheckCircle2 className="w-5 h-5 text-blue-500 animate-in zoom-in" />}
                                                </label>

                                                {/* Subcategories */}
                                                {subcategories.map((sub) => (
                                                    <label
                                                        key={sub.id}
                                                        className={`
                                                            flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all group ml-4 md:ml-0
                                                            ${selectedServices.includes(sub.name)
                                                                ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md shadow-blue-100'
                                                                : 'border-neutral-100 hover:border-blue-200 hover:bg-neutral-50 text-neutral-500'
                                                            }
                                                        `}
                                                    >
                                                        <Checkbox
                                                            checked={selectedServices.includes(sub.name)}
                                                            onCheckedChange={() => handleServiceToggle(sub.name)}
                                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 w-5 h-5 border-neutral-300"
                                                        />
                                                        <span className="font-bold flex-1">{sub.name}</span>
                                                        {selectedServices.includes(sub.name) && <CheckCircle2 className="w-5 h-5 text-blue-500 animate-in zoom-in" />}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}

                                {categories.every(c => !!c.parent_id) && categories.length > 0 && (
                                    <div className="text-center p-10 bg-orange-50 rounded-3xl text-orange-600 font-bold">
                                        Warning: No Root Categories found. Showing flat list.
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-left">
                                            {categories.map((cat) => (
                                                <label
                                                    key={cat.id}
                                                    className="flex items-center gap-4 p-4 rounded-2xl border-2 bg-white border-orange-100 cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={selectedServices.includes(cat.name)}
                                                        onCheckedChange={() => handleServiceToggle(cat.name)}
                                                        className="w-5 h-5"
                                                    />
                                                    <span className="font-bold flex-1">{cat.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {categories.length === 0 && (
                                    <div className="col-span-2 text-center py-10 text-neutral-400 font-medium">
                                        No categories found. Please add product categories first.
                                    </div>
                                )}
                            </div>

                            <div className="pt-8 border-t border-neutral-100 flex justify-end sticky bottom-0 bg-white/80 backdrop-blur-sm p-4 -mx-4 -mb-4 rounded-b-[3rem]">
                                <Button
                                    onClick={handleSave}
                                    disabled={updating}
                                    className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 transition-all hover:scale-105 active:scale-95"
                                >
                                    {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    {updating ? 'Saving...' : 'Save Capabilities'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
