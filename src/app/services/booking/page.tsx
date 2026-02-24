"use client"

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useServiceCart } from "@/context/ServiceCartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, User, UserCheck, CalendarDays, Loader2, ShieldCheck, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { placeServiceRequest } from "./actions";

// Custom Scheduler with Date Picker and 3-Column Time Slots
function ServiceScheduler({ value, onChange }: { value: any, onChange: (v: any) => void }) {
    // Generate 1-hour slots from 9am to 11pm
    const slots = [
        "09:00 AM", "10:00 AM", "11:00 AM",
        "12:00 PM", "01:00 PM", "02:00 PM",
        "03:00 PM", "04:00 PM", "05:00 PM",
        "06:00 PM", "07:00 PM", "08:00 PM",
        "09:00 PM", "10:00 PM", "11:00 PM"
    ];

    const formatDate = (isoStr: string) => {
        if (!isoStr) return "";
        const d = new Date(isoStr);
        return d.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="max-w-xl mx-auto space-y-12">
            <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight">
                    Schedule a Consultation
                </h2>
                <p className="text-neutral-500 font-bold text-lg">
                    When should the designer or our admin contact you?
                </p>
            </div>

            {/* Date Selection */}
            <div className="space-y-4">
                <label className="text-lg font-black text-neutral-900 block">
                    Preferred Date
                </label>
                <div className="relative">
                    <Input
                        type="date"
                        className="h-16 px-6 rounded-2xl bg-white border-neutral-100 font-bold text-lg shadow-sm focus:ring-primary-100"
                        value={value.date ? new Date(value.date).toLocaleDateString('en-CA') : ''}
                        onChange={(e) => {
                            if (e.target.value) {
                                const [y, m, d] = e.target.value.split('-').map(Number);
                                const date = new Date(y, m - 1, d);
                                onChange({ ...value, date: date.toISOString() });
                            }
                        }}
                        min={new Date().toLocaleDateString('en-CA')}
                    />
                </div>
            </div>

            {/* Time Slot Selection */}
            <div className="space-y-4">
                <label className="text-lg font-black text-neutral-900 block">
                    Preferred Time Slot
                </label>
                <div className="grid grid-cols-3 gap-4">
                    {slots.map((slot) => {
                        const isSelected = value.slot === slot;
                        return (
                            <button
                                key={slot}
                                onClick={() => onChange({ ...value, slot: slot })}
                                className={`h-14 rounded-2xl border font-bold text-sm transition-all shadow-sm ${isSelected
                                    ? 'bg-[#1e3a8a] border-[#1e3a8a] text-white shadow-lg scale-[1.02]'
                                    : 'bg-white border-neutral-100 text-neutral-900 hover:border-primary-200'
                                    }`}
                            >
                                {slot}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default function BookingWizardPage() {
    const { items, totalAmount, clearCart } = useServiceCart();
    const { t, language } = useLanguage();
    const [step, setStep] = useState(1);
    const [assignmentType, setAssignmentType] = useState<'ghorbari_assign' | 'user_choose'>('ghorbari_assign');
    const [selectedProvider, setSelectedProvider] = useState<any>(null);
    const [schedule, setSchedule] = useState({ date: '', slot: '' });
    const [providers, setProviders] = useState<any[]>([]);
    const [requestNumber, setRequestNumber] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (items.length === 0 && step < 5) {
            router.push('/services');
        }
    }, [items, router, step]);

    useEffect(() => {
        if (assignmentType === 'user_choose' && providers.length === 0) {
            setLoading(true);
            const supabase = createClient();
            supabase.from('partner_profiles')
                .select('*, profile:profiles(avatar_url)')
                .eq('is_verified', true)
                .limit(10)
                .then(({ data }) => {
                    setProviders(data || []);
                    setLoading(false);
                });
        }
    }, [assignmentType, providers.length]);

    const handleNext = () => {
        if (step === 1) {
            if (assignmentType === 'ghorbari_assign') setStep(3);
            else setStep(2);
        } else if (step === 2) {
            if (!selectedProvider) {
                toast.error("Please select a provider or switch to Ghorbari Assign");
                return;
            }
            setStep(3);
        } else if (step === 3) {
            if (!schedule.date || !schedule.slot) {
                toast.error("Please select a preferred schedule");
                return;
            }
            setStep(4);
        } else if (step === 4) {
            handlePlaceRequest();
        }
    };

    const handlePlaceRequest = async () => {
        setLoading(true);
        try {
            const res = await placeServiceRequest({
                items,
                assignmentType,
                providerId: selectedProvider?.id,
                schedule,
                totalAmount
            });

            if (res.error) {
                toast.error(res.error);
                setLoading(false);
                return;
            }

            setStep(5);
            setRequestNumber(res.requestNumber || "");
            clearCart();
            toast.success("Service request placed successfully!");
        } catch (e) {
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-neutral-50/50 flex flex-col">
            <Navbar />

            <div className="flex-1 container mx-auto px-8 py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Stepper Header */}
                    <div className="flex justify-between items-center mb-12 px-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`flex items-center gap-3 ${step === i ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step >= i ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                                    {i === 1 && <User className="w-4 h-4" />}
                                    {i === 2 && <UserCheck className="w-4 h-4" />}
                                    {i === 3 && <CalendarDays className="w-4 h-4" />}
                                    {i === 4 && <CheckCircle2 className="w-4 h-4" />}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">
                                    {i === 1 && "Assignment"}
                                    {i === 2 && "Selection"}
                                    {i === 3 && "Schedule"}
                                    {i === 4 && "Review"}
                                </span>
                            </div>
                        ))}
                    </div>

                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center space-y-3">
                                <h1 className="text-3xl font-black tracking-tighter text-neutral-900 italic uppercase">Service Assignment</h1>
                                <p className="text-neutral-500 font-medium">How would you like to assign this service?</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card
                                    className={`cursor-pointer transition-all rounded-[32px] overflow-hidden border-2 ${assignmentType === 'ghorbari_assign' ? 'border-primary-600 bg-white ring-8 ring-primary-50' : 'border-neutral-100 hover:border-primary-200'}`}
                                    onClick={() => setAssignmentType('ghorbari_assign')}
                                >
                                    <CardContent className="p-8 space-y-6">
                                        <div className="w-16 h-16 rounded-[24px] bg-primary-100 flex items-center justify-center">
                                            <ShieldCheck className="w-8 h-8 text-primary-600" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-bold">Ghorbari Assigns</h3>
                                            <p className="text-sm text-neutral-500 leading-relaxed">Let Ghorbari experts find the best verified professional for your specific needs. Fast & secure.</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card
                                    className={`cursor-pointer transition-all rounded-[32px] overflow-hidden border-2 ${assignmentType === 'user_choose' ? 'border-primary-600 bg-white ring-8 ring-primary-50' : 'border-neutral-100 hover:border-primary-200'}`}
                                    onClick={() => setAssignmentType('user_choose')}
                                >
                                    <CardContent className="p-8 space-y-6">
                                        <div className="w-16 h-16 rounded-[24px] bg-blue-100 flex items-center justify-center">
                                            <UserCheck className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-bold">I will Choose</h3>
                                            <p className="text-sm text-neutral-500 leading-relaxed">Browse through our directory of top-rated service providers and pick one yourself based on reviews.</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h1 className="text-2xl font-black tracking-tighter text-neutral-900 uppercase italic">Select Provider</h1>
                                    <p className="text-neutral-500 text-sm font-medium">Choose from our verified experts</p>
                                </div>
                                <Button variant="ghost" onClick={() => { setAssignmentType('ghorbari_assign'); setStep(3); }} className="text-[10px] font-black uppercase tracking-widest text-primary-600 underline">Switch to Ghorbari Assign</Button>
                            </div>

                            {loading ? (
                                <div className="py-20 flex flex-col items-center">
                                    <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
                                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Fetching Experts...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {providers.map(p => (
                                        <Card
                                            key={p.id}
                                            className={`cursor-pointer transition-all rounded-2xl border ${selectedProvider?.id === p.id ? 'border-primary-600 bg-primary-50' : 'hover:border-primary-200'}`}
                                            onClick={() => setSelectedProvider(p)}
                                        >
                                            <CardContent className="p-4 flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-neutral-200 overflow-hidden">
                                                    <img src={p.profile?.avatar_url || `https://ui-avatars.com/api/?name=${p.business_name}`} alt={p.business_name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-sm">{p.business_name}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[9px] font-black uppercase tracking-tighter bg-yellow-400 px-1.5 py-0.5 rounded text-black">TOP RATED</span>
                                                        <span className="text-[10px] text-neutral-400 font-medium">★ 4.9 (120+ reviews)</span>
                                                    </div>
                                                </div>
                                                {selectedProvider?.id === p.id && <CheckCircle2 className="w-5 h-5 text-primary-600" />}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="w-full space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <ServiceScheduler value={schedule} onChange={setSchedule} />
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-center space-y-3">
                                <h1 className="text-2xl font-black tracking-tighter text-neutral-900 uppercase italic">Review & Confirm Booking</h1>
                                <p className="text-neutral-500 text-sm font-medium">Please review your details. The price shown is tentative and awaits admin verification.</p>
                            </div>

                            <Card className="rounded-[40px] border border-neutral-100 overflow-hidden shadow-sm">
                                <div className="bg-[#f3fbfa] p-8 border-b border-neutral-100">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-2xl font-black text-neutral-900">Tentative Quotation</h3>
                                            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">Status: Waiting for Admin Verification upon submission</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-4xl font-black text-neutral-900">৳{totalAmount.toLocaleString()}</div>
                                            <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Starting Price</div>
                                        </div>
                                    </div>
                                </div>
                                <CardContent className="p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Service Items</div>
                                            <div className="space-y-2 mt-2">
                                                {items.map(item => (
                                                    <div key={item.id} className="text-sm font-bold flex justify-between">
                                                        <span>{language === 'BN' ? item.name_bn : item.name}</span>
                                                        <span className="text-neutral-400">৳{item.unit_price.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Assigned Provider</div>
                                                <div className="text-sm font-black text-neutral-900">
                                                    {assignmentType === 'ghorbari_assign' ? 'Ghorbari Assigned Expert' : (selectedProvider?.business_name || 'Not Selected')}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Preferred Schedule</div>
                                                <div className="text-sm font-black text-neutral-900">
                                                    {new Date(schedule.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} | {schedule.slot}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-neutral-100">
                                        <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex gap-4">
                                            <ShieldCheck className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                                            <p className="text-xs text-yellow-800 leading-relaxed font-medium">
                                                <strong>Note:</strong> Final cost may vary based on actual measurements and scope defined during site visit by our professional. No upfront payment required to place this request.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="max-w-2xl mx-auto text-center py-20 space-y-10 animate-in zoom-in slide-in-from-bottom-8 duration-700">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                                <div className="relative w-28 h-28 rounded-[38px] bg-white border-2 border-green-500/10 flex items-center justify-center mx-auto shadow-2xl shadow-green-500/10 rotate-3 transition-transform hover:rotate-0">
                                    <div className="w-20 h-20 rounded-[30px] bg-green-500 flex items-center justify-center">
                                        <CheckCircle2 className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="inline-block px-4 py-1.5 bg-green-50 rounded-full border border-green-100 mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Booking Confirmed</span>
                                </div>
                                <h1 className="text-5xl font-black tracking-tighter text-neutral-900 uppercase italic">
                                    Request Placed!
                                </h1>
                                <div className="max-w-sm mx-auto p-6 bg-white rounded-[32px] border border-neutral-100 shadow-sm space-y-2">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Your Request Number</p>
                                    <p className="text-xl font-black tracking-tighter text-neutral-900 font-mono">{requestNumber || "SRV-PENDING"}</p>
                                </div>
                                <p className="text-neutral-500 max-w-sm mx-auto font-bold text-lg leading-relaxed">
                                    Your service booking request is now under admin verification. We will notify you once approved.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-10">
                                <Link href="/services">
                                    <Button variant="outline" className="rounded-2xl px-12 font-black uppercase tracking-widest text-[11px] h-14 border-neutral-200 hover:bg-neutral-50 transition-all">
                                        More Services
                                    </Button>
                                </Link>
                                <Link href="/customer/profile">
                                    <Button className="rounded-2xl px-12 font-black uppercase tracking-widest text-[11px] h-14 bg-neutral-900 text-white shadow-xl shadow-neutral-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                        Track Progress
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}

                    {step < 5 && (
                        <div className="mt-16 flex justify-between items-center bg-white p-6 rounded-[32px] border border-neutral-100 shadow-xl">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Total Estimate</span>
                                <span className="text-xl font-black">৳{totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="ghost" className="rounded-xl px-6 font-bold text-neutral-400" onClick={() => step > 1 && setStep(step === 3 && assignmentType === 'ghorbari_assign' ? 1 : step - 1)}>
                                    <ArrowLeft className="mr-2 w-4 h-4" />
                                    Back
                                </Button>
                                <Button onClick={handleNext} disabled={loading} className="rounded-2xl bg-neutral-900 text-white px-10 font-black uppercase tracking-widest text-[10px] h-14 group shadow-lg">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (step === 4 ? 'Complete Booking' : 'Continue')}
                                    {!loading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
