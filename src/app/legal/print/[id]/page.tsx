'use client'

import { getContractById } from '@/app/admin/legal/actions'
import { notFound } from 'next/navigation'
import { FileText, Printer, Loader2 } from 'lucide-react'
import { useState, useEffect, use } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function PrintContractPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const [loading, setLoading] = useState(true)
    const [contractData, setContractData] = useState<any>(null)
    const [categories, setCategories] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            const contractRes = await getContractById(resolvedParams.id)
            if (contractRes.success) {
                setContractData(contractRes)
                
                // Fetch categories to resolve names if needed
                const supabase = createClient()
                const { data: catData } = await supabase
                    .from('product_categories')
                    .select('id, name, name_bn, type')
                
                if (catData) setCategories(catData)

                // Auto-print after a short delay to allow fonts/images to render
                setTimeout(() => {
                    if (window.matchMedia) {
                        const mediaQueryList = window.matchMedia('print');
                        if (!mediaQueryList.matches) {
                            window.print();
                        }
                    } else {
                        window.print();
                    }
                }, 1500)
            } else {
                setError(contractRes.error || "The requested agreement could not be found.")
            }
            setLoading(false)
        }
        
        fetchData()
    }, [resolvedParams.id])

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">Fetching Document Assets...</p>
            </div>
        )
    }
    
    if (error || !contractData) {
        return (
            <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-rose-500" />
                </div>
                <h1 className="text-2xl font-black uppercase tracking-widest mb-4 italic">Document Error</h1>
                <p className="text-neutral-500 mb-8 max-w-md font-medium">{error || "The requested agreement could not be found or retrieved from the database."}</p>
                <div className="text-[10px] font-mono bg-black/40 border border-white/5 p-4 rounded-xl text-neutral-500 mb-8 flex flex-col gap-1">
                    <span className="uppercase tracking-widest text-neutral-600">Reference ID</span>
                    <span className="text-rose-400 font-bold">{resolvedParams.id}</span>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => window.location.reload()} className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl transition-all border border-white/5">Retry</button>
                    <button onClick={() => window.close()} className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl transition-all shadow-lg shadow-primary-900/20">Close Page</button>
                </div>
            </div>
        )
    }

    const { contract, signature } = contractData
    const data = contract.variable_data

    // Helper to resolve service names
    const resolveServiceNames = (services: string[]) => {
        if (!services) return []
        return services.map(svc => {
            // Try to find by ID first
            const cat = categories.find(c => c.id === svc)
            if (cat) return cat.name_bn || cat.name
            // If not found, it might already be a name
            return svc
        })
    }

    const resolvedServices = resolveServiceNames(data.selectedServices || [])

    return (
        <div className="bg-white min-h-screen text-black w-full" style={{ fontFamily: 'Siyam Rupali, Hind Siliguri, system-ui, sans-serif' }}>
            <div className="max-w-4xl mx-auto p-12 bg-white printable-area">
                
                {/* Header */}
                <div className="text-center mb-10 border-b-2 border-primary-500 pb-6">
                    <h1 className="text-4xl font-black uppercase tracking-widest mb-2 text-primary-600">দালানকোঠা (DALANKOTHA)</h1>
                    <h2 className="text-xl font-bold text-neutral-800">পার্টনার অনবোর্ডিং এবং সেবার সাধারণ চুক্তিপত্র</h2>
                    <p className="text-xs text-neutral-500 mt-2 font-mono uppercase tracking-widest">Document Ref: {contract.id.split('-')[0].toUpperCase()}</p>
                </div>

                {/* Date & Parties in Bengali */}
                <div className="mb-10 text-justify leading-loose text-sm">
                    <p className="mb-4">
                        এই চুক্তিটি <strong>{new Date(contract.signed_at).toLocaleDateString('bn-BD')}</strong> তারিখে সম্পাদিত হইলো, নিম্নোক্ত পক্ষগণের মধ্যে:
                    </p>
                    <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-100 mb-6">
                        <p className="mb-4 flex items-start gap-2">
                            <span className="font-black text-primary-600">১.</span>
                            <span><strong>দালানকোঠা টেকনোলজিস লিমিটেড (Dalankotha)</strong>, একটি কোম্পানি যা দালানকোঠা অনলাইন প্ল্যাটফর্ম পরিচালনা করে (যাহা এরপর হইতে "কোম্পানি" বা "প্রথম পক্ষ" হিসেবে অভিহিত হইবে)।</span>
                        </p>
                        <p className="text-center italic my-4 text-neutral-400">এবং</p>
                        <p className="mb-0 flex items-start gap-2">
                            <span className="font-black text-primary-600">২.</span>
                            <span><strong>{data.partnerName?.toUpperCase() || '[Partner Name]'}</strong>, এনআইডি/পাসপোর্ট নং: <strong>{data.nidPassport}</strong>, ঠিকানা: <strong>{data.address}</strong> (যাহা এরপর হইতে "পার্টনার" বা "দ্বিতীয় পক্ষ" হিসেবে অভিহিত হইবে)।</span>
                        </p>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="mb-10">
                    <h3 className="font-black border-b-2 border-neutral-900 mb-6 text-lg uppercase tracking-wider pb-2">তফসিল ক: পার্টনারের তথ্য</h3>
                    <div className="grid grid-cols-2 gap-px bg-neutral-200 border border-neutral-200 rounded-xl overflow-hidden shadow-sm mb-8">
                        <div className="bg-neutral-50 p-4 font-bold text-neutral-600 text-xs uppercase tracking-widest">ব্যবসায়ের নাম</div>
                        <div className="bg-white p-4 text-sm">{data.businessName || 'ব্যক্তিগত সেবা'}</div>
                        <div className="bg-neutral-50 p-4 font-bold text-neutral-600 text-xs uppercase tracking-widest">ট্রেড লাইসেন্স নং</div>
                        <div className="bg-white p-4 text-sm font-mono">{data.tradeLicense || 'প্রযোজ্য নয়'}</div>
                        <div className="bg-neutral-50 p-4 font-bold text-neutral-600 text-xs uppercase tracking-widest">মোবাইল নম্বর</div>
                        <div className="bg-white p-4 text-sm font-mono">{data.phone}</div>
                        <div className="bg-neutral-50 p-4 font-bold text-neutral-600 text-xs uppercase tracking-widest">ইমেইল ঠিকানা</div>
                        <div className="bg-white p-4 text-sm font-mono">{data.email}</div>
                        <div className="bg-neutral-50 p-4 font-bold text-neutral-600 text-xs uppercase tracking-widest">নিবন্ধিত সেবাসমূহ</div>
                        <div className="bg-white p-4 text-sm">
                            {resolvedServices.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1">
                                    {resolvedServices.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            ) : (
                                'সাধারণ সেবা'
                            )}
                        </div>
                    </div>

                    <h3 className="font-black border-b-2 border-neutral-900 mb-6 text-lg uppercase tracking-wider pb-2">তফসিল খ: পেমেন্ট ও লেনদেনের তথ্য</h3>
                    <div className="grid grid-cols-2 gap-px bg-neutral-200 border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-neutral-50 p-4 font-bold text-neutral-600 text-xs uppercase tracking-widest">ব্যাংক অ্যাকাউন্ট নম্বর</div>
                        <div className="bg-white p-4 text-sm font-mono">{data.bankAccount || 'প্রদত্ত নয়'}</div>
                        <div className="bg-neutral-50 p-4 font-bold text-neutral-600 text-xs uppercase tracking-widest">ব্যাংকের নাম ও শাখা</div>
                        <div className="bg-white p-4 text-sm">{data.bankName || 'প্রদত্ত নয়'}</div>
                        <div className="bg-neutral-50 p-4 font-bold text-neutral-600 text-xs uppercase tracking-widest">মোবাইল ব্যাংকিং (MFS)</div>
                        <div className="bg-white p-4 text-sm font-mono">{data.mobilePayment || 'প্রদত্ত নয়'}</div>
                    </div>
                </div>

                {/* Core Terms */}
                <div className="mb-14 text-justify leading-loose text-[13px] text-neutral-800">
                    <h3 className="font-black text-lg mb-4 text-primary-600">সাধারণ শর্তাবলী (General Terms)</h3>
                    <div className="space-y-4">
                        <p>১. <strong>গুণগত মান:</strong> পার্টনার দালানকোঠা প্ল্যাটফর্মের মাধ্যমে প্রদত্ত সকল সেবার গুণগত মান এবং স্বচ্ছতা বজায় রাখতে বাধ্য থাকিবেন। নির্মাণ কাজের ক্ষেত্রে পার্টনার বাংলাদেশ ন্যাশনাল বিল্ডিং কোড (BNBC) এবং স্থানীয় আইন মেনে চলিতে দায়বদ্ধ।</p>
                        <p>২. <strong>গোপনীয়তা:</strong> উভয় পক্ষ একে অপরের ব্যবসায়িক পদ্ধতি, গ্রাহকের তথ্য এবং অন্যান্য গোপনীয় ডাটা সুরক্ষিত রাখিতে অঙ্গীকারবদ্ধ।</p>
                        <p>৩. <strong>অর্থ পরিশোধ:</strong> সেবার মূল্য পরিশোধ এবং কমিশন দালানকোঠা প্ল্যাটফর্মের নির্ধারিত নীতি এবং সময়সূচী অনুযায়ী সম্পন্ন হইবে।</p>
                    </div>
                </div>

                {/* Dual Signatures */}
                <div className="mt-20 flex justify-between items-start gap-12 border-t-4 border-neutral-900 pt-12">
                    <div className="w-1/2">
                        <h4 className="font-black mb-6 text-xs uppercase tracking-widest text-neutral-500">পক্ষ ১: দালানকোঠা (Dalankotha)</h4>
                        {data.repSignature ? (
                            <div className="h-24 mb-4 flex items-center justify-start border-b border-neutral-200 pb-2">
                                <img src={data.repSignature} alt="Internal Rep Signature" className="max-h-full object-contain" />
                            </div>
                        ) : (
                            <div className="h-24 border-b border-neutral-200 mb-4 flex flex-col justify-end">
                                <span className="text-[10px] text-neutral-300 italic mb-1 uppercase tracking-tighter">System Generated Placeholder</span>
                            </div>
                        )}
                        <p className="font-black text-sm uppercase">{data.repName || 'Authorized Signatory'}</p>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-widest">অনুমোদিত প্রতিনিধি</p>
                    </div>

                    <div className="w-1/2">
                        <h4 className="font-black mb-6 text-xs uppercase tracking-widest text-neutral-500">পক্ষ ২: পার্টনার (The Partner)</h4>
                        {signature?.signature_svg ? (
                            <div className="h-24 mb-4 flex items-center justify-start border-b border-neutral-200 pb-2">
                                <img src={signature.signature_svg} alt="Partner Signature" className="max-h-full object-contain" />
                            </div>
                        ) : (
                            <div className="h-24 border-b border-neutral-200 mb-4 flex flex-col justify-end">
                                <span className="text-[10px] text-neutral-300 italic mb-1">Signed Member Verified</span>
                            </div>
                        )}
                        <p className="font-black text-sm uppercase">{data.partnerName}</p>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-widest">ডিজিটাল স্বাক্ষর ও তারিখ</p>
                        <div className="mt-2 opacity-50">
                            <p className="text-[8px] font-mono tracking-tighter uppercase">IP: {signature?.ip_address}</p>
                            <p className="text-[8px] font-mono tracking-tighter uppercase">TIME: {new Date(contract.signed_at).toLocaleString('bn-BD')}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 text-center border-t border-neutral-100 italic text-[10px] text-neutral-400 leading-relaxed">
                    <p>© 2026 দালানকোঠা টেকনোলজিস লিমিটেড | সকল স্বত্ব সংরক্ষিত।</p>
                    <p>এটি একটি সিস্টেম জেনারেটেড ডিজিটাল চুক্তিপত্র, কোনো ম্যানুয়াল স্বাক্ষরের প্রয়োজন নাই।</p>
                    <div className="mt-2 text-[8px] font-mono text-neutral-300">DOC_UID: {contract.id}</div>
                </div>
            </div>

            {/* Action Bar (Not Printed) */}
            <div className="fixed top-6 right-6 no-print flex gap-3 z-50">
                <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary-900/40 transition-all active:scale-95"
                >
                    <Printer className="w-4 h-4" />
                    Print Agreement
                </button>
                <button 
                    onClick={() => window.close()}
                    className="flex items-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
                >
                    Close
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                    @media print {
                        body { background: white !important; -webkit-print-color-adjust: exact; }
                        .no-print { display: none !important; }
                        @page { 
                            margin: 1.5cm; 
                            size: A4;
                        }
                        .printable-area {
                            padding: 0 !important;
                            max-width: none !important;
                        }
                    }
                    @page {
                        margin: 2cm;
                    }
                `
            }} />
        </div>
    )
}
